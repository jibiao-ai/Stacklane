package model

import (
	"time"

	"gorm.io/gorm"
)

// GPUDevice represents individual GPU card in a node
type GPUDevice struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	NodeID        uint           `gorm:"index" json:"node_id"`
	GPUIndex      int            `json:"gpu_index"`
	Name          string         `gorm:"size:128" json:"name"`           // NVIDIA A100-SXM4-80GB
	Vendor        string         `gorm:"size:32" json:"vendor"`          // nvidia, amd
	Architecture  string         `gorm:"size:64" json:"architecture"`    // ampere, hopper, ada
	GPUType       string         `gorm:"size:64" json:"gpu_type"`        // A100, H100, RTX4090
	VRAMTotal     int            `json:"vram_total"`                     // MB
	VRAMUsed      int            `json:"vram_used"`                      // MB
	Utilization   float64        `json:"utilization"`                    // 0-100
	Temperature   int            `json:"temperature"`                    // celsius
	PowerDraw     int            `json:"power_draw"`                     // watts
	PowerLimit    int            `json:"power_limit"`                    // watts
	DriverVersion string         `gorm:"size:32" json:"driver_version"`
	CUDAVersion   string         `gorm:"size:32" json:"cuda_version"`
	Status        string         `gorm:"size:32;default:available" json:"status"` // available, in_use, reserved, error, offline
	AssignedModel string         `gorm:"size:256" json:"assigned_model"`
	AssignedSvcID uint           `json:"assigned_service_id"`
}

// GPUMetric represents time-series GPU metrics
type GPUMetric struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	NodeID      uint      `gorm:"index" json:"node_id"`
	DeviceID    uint      `gorm:"index" json:"device_id"`
	Timestamp   time.Time `gorm:"index" json:"timestamp"`
	Utilization float64   `json:"utilization"`
	VRAMUsed    int       `json:"vram_used"`
	Temperature int       `json:"temperature"`
	PowerDraw   int       `json:"power_draw"`
	Throughput  float64   `json:"throughput"` // tokens/s or req/s
}

// Runtime represents a inference runtime engine
type Runtime struct {
	ID                uint           `gorm:"primarykey" json:"id"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
	Name              string         `gorm:"size:128;not null" json:"name"`      // "vLLM Production"
	Engine            string         `gorm:"size:64;not null" json:"engine"`     // vllm, llama.cpp, tensorrt-llm, gpustack
	Version           string         `gorm:"size:32" json:"version"`            // "0.4.1"
	Status            string         `gorm:"size:32;default:active" json:"status"` // active, degraded, offline
	Endpoint          string         `gorm:"size:256" json:"endpoint"`           // runtime service endpoint
	SupportedFormats  string         `gorm:"size:256" json:"supported_formats"`  // safetensors,gguf,awq
	SupportedQuant    string         `gorm:"size:256" json:"supported_quant"`    // fp16,int8,int4,awq,gptq
	MaxModelSize      int64          `json:"max_model_size"`                     // bytes
	Features          string         `gorm:"type:text" json:"features"`          // JSON: continuous_batching, speculative_decoding, etc
	GPURequirement    string         `gorm:"size:128" json:"gpu_requirement"`    // min GPU spec
	HealthCheckURL    string         `gorm:"size:256" json:"health_check_url"`
	ActiveInstances   int            `json:"active_instances"`
	TotalServedModels int            `json:"total_served_models"`
}

// ModelVersion represents versioned model artifacts
type ModelVersion struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	ModelID       uint           `gorm:"index" json:"model_id"`
	Version       string         `gorm:"size:64" json:"version"`
	Format        string         `gorm:"size:32" json:"format"`         // safetensors, gguf, awq, gptq
	Quantization  string         `gorm:"size:32" json:"quantization"`   // fp16, int8, int4, awq-4bit
	Size          int64          `json:"size"`                          // bytes
	Hash          string         `gorm:"size:128" json:"hash"`          // sha256
	StoragePath   string         `gorm:"size:512" json:"storage_path"`
	Status        string         `gorm:"size:32;default:registered" json:"status"` // registered, downloading, ready, error
	DownloadURL   string         `gorm:"size:512" json:"download_url"`
	HuggingFaceID string         `gorm:"size:256" json:"huggingface_id"`
	Compatibility string         `gorm:"type:text" json:"compatibility"` // JSON: compatible runtimes
}

// ModelDeployment tracks model deployment across services
type ModelDeployment struct {
	ID         uint      `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	ModelID    uint      `gorm:"index" json:"model_id"`
	VersionID  uint      `gorm:"index" json:"version_id"`
	ServiceID  uint      `gorm:"index" json:"service_id"`
	RuntimeID  uint      `gorm:"index" json:"runtime_id"`
	ClusterID  uint      `gorm:"index" json:"cluster_id"`
	GPUCount   int       `json:"gpu_count"`
	Status     string    `gorm:"size:32" json:"status"` // loading, running, unloading, error
	LoadTimeMs int       `json:"load_time_ms"`
}

// GPUStackConfig stores GPUStack connection info
type GPUStackConfig struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"size:128" json:"name"`
	Endpoint  string         `gorm:"size:256;not null" json:"endpoint"` // GPUStack API URL
	APIKey    string         `gorm:"size:256" json:"api_key"`
	Status    string         `gorm:"size:32;default:connected" json:"status"`
	Version   string         `gorm:"size:32" json:"version"`
	LastSync  time.Time      `json:"last_sync"`
}
