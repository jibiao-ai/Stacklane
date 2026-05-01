package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/config"
	"github.com/stacklane/stacklane/internal/gpustack"
	"github.com/stacklane/stacklane/internal/model"
	"github.com/stacklane/stacklane/internal/router"
	"github.com/stacklane/stacklane/internal/ws"
)

func main() {
	cfg := config.Load()

	// Database connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate all models
	db.AutoMigrate(
		&model.User{},
		&model.Tenant{},
		&model.GPUNode{},
		&model.Cluster{},
		&model.ModelAsset{},
		&model.Service{},
		&model.Deployment{},
		&model.Event{},
		&model.Policy{},
		&model.Alert{},
		// GPU Management Models
		&model.GPUDevice{},
		&model.GPUMetric{},
		&model.Runtime{},
		&model.ModelVersion{},
		&model.ModelDeployment{},
		&model.GPUStackConfig{},
	)

	// Seed default data
	seedDefaultData(db)

	// Initialize GPUStack client (optional - based on env config)
	var gpuClient *gpustack.Client
	var syncSvc *gpustack.SyncService

	gpuStackURL := os.Getenv("GPUSTACK_URL")
	gpuStackKey := os.Getenv("GPUSTACK_API_KEY")
	if gpuStackURL != "" {
		gpuClient = gpustack.NewClient(gpuStackURL, gpuStackKey)
		syncSvc = gpustack.NewSyncService(gpuClient, db)
		// Start periodic sync every 30 seconds
		syncSvc.StartPeriodicSync(30 * time.Second)
		log.Printf("[Stacklane] GPUStack integration enabled: %s", gpuStackURL)
	} else {
		log.Println("[Stacklane] GPUStack integration disabled (GPUSTACK_URL not set)")
	}

	// WebSocket hub
	hub := ws.NewHub()
	go hub.Run()

	// Setup router with GPUStack integration
	r := router.Setup(db, cfg.JWTSecret, hub, gpuClient, syncSvc)

	log.Printf("[Stacklane] Server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func seedDefaultData(db *gorm.DB) {
	// Seed default tenant
	var tenantCount int64
	db.Model(&model.Tenant{}).Count(&tenantCount)
	if tenantCount == 0 {
		db.Create(&model.Tenant{Name: "default", Quota: 100, Status: "active"})
	}

	// Seed default runtimes (vLLM, GPUStack, llama.cpp, TensorRT-LLM)
	var runtimeCount int64
	db.Model(&model.Runtime{}).Count(&runtimeCount)
	if runtimeCount == 0 {
		runtimes := []model.Runtime{
			{
				Name:             "vLLM Production",
				Engine:           "vllm",
				Version:          "0.6.4",
				Status:           "active",
				SupportedFormats: "safetensors,awq,gptq",
				SupportedQuant:   "fp16,bf16,awq-4bit,gptq-4bit,gptq-8bit",
				Features:         `["continuous_batching","paged_attention","speculative_decoding","tensor_parallelism"]`,
				GPURequirement:   "16GB+ VRAM, NVIDIA Ampere/Hopper",
			},
			{
				Name:             "GPUStack Native",
				Engine:           "gpustack",
				Version:          "0.4.1",
				Status:           "active",
				SupportedFormats: "safetensors,gguf,awq",
				SupportedQuant:   "fp16,bf16,int8,int4",
				Features:         `["auto_scheduling","multi_node","resource_pooling","auto_scaling","heterogeneous_gpu"]`,
				GPURequirement:   "8GB+ VRAM",
			},
			{
				Name:             "llama.cpp (llama-box)",
				Engine:           "llama.cpp",
				Version:          "b4547",
				Status:           "active",
				SupportedFormats: "gguf",
				SupportedQuant:   "q4_0,q4_1,q5_0,q5_1,q8_0,fp16",
				Features:         `["cpu_inference","metal_acceleration","low_memory","quantization","grammar_sampling"]`,
				GPURequirement:   "4GB+ VRAM (or CPU only)",
			},
			{
				Name:             "TensorRT-LLM",
				Engine:           "tensorrt-llm",
				Version:          "0.12.0",
				Status:           "active",
				SupportedFormats: "safetensors,engine",
				SupportedQuant:   "fp16,int8,int4,fp8",
				Features:         `["tensor_parallelism","inflight_batching","kv_cache_optimization","custom_plugins"]`,
				GPURequirement:   "24GB+ VRAM, NVIDIA only",
			},
		}
		for _, rt := range runtimes {
			db.Create(&rt)
		}
		log.Println("[Stacklane] Seeded default runtimes")
	}

	// Seed sample GPU nodes and devices for demo
	var nodeCount int64
	db.Model(&model.GPUNode{}).Count(&nodeCount)
	if nodeCount == 0 {
		cluster := model.Cluster{Name: "production-cluster-01", Region: "us-east-1", Status: "active", NodeCount: 4}
		db.Create(&cluster)

		nodes := []model.GPUNode{
			{Name: "gpu-worker-01", Host: "10.0.1.101", GPUType: "NVIDIA A100-SXM4-80GB", GPUCount: 8, GPUMemory: 655360, Status: "online", Utilization: 72.5, ClusterID: cluster.ID},
			{Name: "gpu-worker-02", Host: "10.0.1.102", GPUType: "NVIDIA A100-SXM4-80GB", GPUCount: 8, GPUMemory: 655360, Status: "online", Utilization: 65.3, ClusterID: cluster.ID},
			{Name: "gpu-worker-03", Host: "10.0.1.103", GPUType: "NVIDIA H100-SXM5-80GB", GPUCount: 8, GPUMemory: 655360, Status: "online", Utilization: 88.1, ClusterID: cluster.ID},
			{Name: "gpu-worker-04", Host: "10.0.1.104", GPUType: "NVIDIA L40S-48GB", GPUCount: 4, GPUMemory: 196608, Status: "online", Utilization: 45.7, ClusterID: cluster.ID},
		}
		for _, node := range nodes {
			db.Create(&node)
			// Create GPU devices for each node
			for i := 0; i < node.GPUCount; i++ {
				device := model.GPUDevice{
					NodeID:        node.ID,
					GPUIndex:      i,
					Name:          node.GPUType,
					Vendor:        "nvidia",
					GPUType:       extractType(node.GPUType),
					VRAMTotal:     node.GPUMemory / node.GPUCount,
					VRAMUsed:      int(float64(node.GPUMemory/node.GPUCount) * (node.Utilization / 100.0)),
					Utilization:   node.Utilization + float64(i*2-4),
					Temperature:   55 + i*3,
					PowerDraw:     250 + i*10,
					PowerLimit:    400,
					DriverVersion: "550.90.07",
					CUDAVersion:   "12.4",
					Status:        "in_use",
				}
				if node.Utilization < 50 {
					device.Status = "available"
				}
				db.Create(&device)
			}
		}
		log.Println("[Stacklane] Seeded sample GPU nodes and devices")
	}

	// Seed sample models
	var modelCount int64
	db.Model(&model.ModelAsset{}).Count(&modelCount)
	if modelCount == 0 {
		models := []model.ModelAsset{
			{Name: "Llama-3.1-70B-Instruct", Version: "v1.0", Format: "safetensors", Size: 140000000000, Runtime: "vllm", Status: "running", Description: "Meta Llama 3.1 70B instruction-tuned model"},
			{Name: "Qwen-2.5-72B-Chat", Version: "v2.5", Format: "safetensors", Size: 145000000000, Runtime: "vllm", Status: "running", Description: "Alibaba Qwen 2.5 72B chat model"},
			{Name: "DeepSeek-V3-671B", Version: "v3.0", Format: "safetensors", Size: 671000000000, Runtime: "gpustack", Status: "running", Description: "DeepSeek V3 671B MoE model, multi-node deployment via GPUStack"},
			{Name: "Codestral-22B", Version: "v1.0", Format: "gguf", Size: 22000000000, Runtime: "llama.cpp", Status: "running", Description: "Mistral Codestral 22B for code generation"},
			{Name: "Mixtral-8x7B-v0.1", Version: "v0.1", Format: "safetensors", Size: 93000000000, Runtime: "tensorrt-llm", Status: "error", Description: "Mixtral MoE 8x7B"},
			{Name: "Phi-3-Medium-14B", Version: "v1.0", Format: "gguf", Size: 14000000000, Runtime: "gpustack", Status: "running", Description: "Microsoft Phi-3 Medium 14B, deployed via GPUStack"},
		}
		for _, m := range models {
			m.TenantID = 1
			db.Create(&m)
		}
		log.Println("[Stacklane] Seeded sample models")
	}
}

func extractType(fullName string) string {
	types := map[string]string{
		"A100": "A100", "H100": "H100", "L40S": "L40S", "L40": "L40",
		"RTX 4090": "RTX4090", "V100": "V100", "T4": "T4",
	}
	for key, val := range types {
		for i := 0; i <= len(fullName)-len(key); i++ {
			if fullName[i:i+len(key)] == key {
				return val
			}
		}
	}
	return fullName
}
