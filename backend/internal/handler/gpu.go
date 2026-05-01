package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/gpustack"
	"github.com/stacklane/stacklane/internal/model"
)

// GPUHandler manages GPU resources and integrates with GPUStack
type GPUHandler struct {
	DB             *gorm.DB
	GPUStackClient *gpustack.Client
	SyncService    *gpustack.SyncService
}

// ListGPUs returns all GPU devices with filtering and pagination
func (h *GPUHandler) ListGPUs(c *gin.Context) {
	var devices []model.GPUDevice
	query := h.DB.Order("created_at DESC")

	if nodeID := c.Query("node_id"); nodeID != "" {
		query = query.Where("node_id = ?", nodeID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if gpuType := c.Query("gpu_type"); gpuType != "" {
		query = query.Where("gpu_type LIKE ?", "%"+gpuType+"%")
	}
	if vendor := c.Query("vendor"); vendor != "" {
		query = query.Where("vendor = ?", vendor)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.GPUDevice{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&devices)

	c.JSON(http.StatusOK, gin.H{
		"data":      devices,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetGPUDetail returns detailed info for a GPU device
func (h *GPUHandler) GetGPUDetail(c *gin.Context) {
	id := c.Param("id")
	var device model.GPUDevice
	if err := h.DB.First(&device, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "GPU device not found"})
		return
	}
	c.JSON(http.StatusOK, device)
}

// GetGPUMetrics returns historical metrics for a GPU device
func (h *GPUHandler) GetGPUMetrics(c *gin.Context) {
	id := c.Param("id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "60"))
	var metrics []model.GPUMetric
	h.DB.Where("device_id = ?", id).Order("timestamp DESC").Limit(limit).Find(&metrics)
	c.JSON(http.StatusOK, metrics)
}

// GetGPUNodes returns all GPU nodes (worker machines)
func (h *GPUHandler) GetGPUNodes(c *gin.Context) {
	var nodes []model.GPUNode
	query := h.DB.Order("created_at DESC")

	if clusterID := c.Query("cluster_id"); clusterID != "" {
		query = query.Where("cluster_id = ?", clusterID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.GPUNode{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&nodes)

	c.JSON(http.StatusOK, gin.H{
		"data":      nodes,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetGPUNodeDetail returns node with all its GPU devices
func (h *GPUHandler) GetGPUNodeDetail(c *gin.Context) {
	id := c.Param("id")
	var node model.GPUNode
	if err := h.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "GPU node not found"})
		return
	}
	var devices []model.GPUDevice
	h.DB.Where("node_id = ?", id).Find(&devices)

	c.JSON(http.StatusOK, gin.H{
		"node":    node,
		"devices": devices,
	})
}

// GetPoolSummary returns aggregated GPU pool statistics
func (h *GPUHandler) GetPoolSummary(c *gin.Context) {
	type PoolStat struct {
		GPUType    string  `json:"gpu_type"`
		TotalCount int     `json:"total_count"`
		Available  int     `json:"available"`
		InUse      int     `json:"in_use"`
		TotalVRAM  int     `json:"total_vram_mb"`
		UsedVRAM   int     `json:"used_vram_mb"`
		AvgUtil    float64 `json:"avg_utilization"`
	}

	var stats []PoolStat
	h.DB.Model(&model.GPUDevice{}).
		Select(`gpu_type, 
			COUNT(*) as total_count, 
			SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available, 
			SUM(CASE WHEN status='in_use' THEN 1 ELSE 0 END) as in_use, 
			SUM(vram_total) as total_vram, 
			SUM(vram_used) as used_vram, 
			AVG(utilization) as avg_util`).
		Group("gpu_type").
		Scan(&stats)

	c.JSON(http.StatusOK, stats)
}

// GetGPUSchedulingInfo provides GPU scheduling information for deployment wizard
func (h *GPUHandler) GetGPUSchedulingInfo(c *gin.Context) {
	requiredVRAM, _ := strconv.Atoi(c.DefaultQuery("required_vram_mb", "0"))
	gpuType := c.Query("gpu_type")

	query := h.DB.Where("status = ?", "available")
	if gpuType != "" {
		query = query.Where("gpu_type = ?", gpuType)
	}
	if requiredVRAM > 0 {
		query = query.Where("(vram_total - vram_used) >= ?", requiredVRAM)
	}

	var available []model.GPUDevice
	query.Find(&available)

	c.JSON(http.StatusOK, gin.H{
		"available_gpus":  available,
		"count":           len(available),
		"required_vram":   requiredVRAM,
		"requested_type":  gpuType,
	})
}

// SyncFromGPUStack triggers manual sync from GPUStack
func (h *GPUHandler) SyncFromGPUStack(c *gin.Context) {
	if h.SyncService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GPUStack integration not configured"})
		return
	}

	go func() {
		h.SyncService.SyncWorkers()
		h.SyncService.SyncModels()
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "sync initiated",
		"source":  "gpustack",
	})
}

// GetGPUStackStatus returns GPUStack connection status
func (h *GPUHandler) GetGPUStackStatus(c *gin.Context) {
	if h.GPUStackClient == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":    "not_configured",
			"connected": false,
		})
		return
	}
	health, _ := h.GPUStackClient.GetHealth()
	c.JSON(http.StatusOK, health)
}

// GetGPUStackWorkers proxies worker list from GPUStack
func (h *GPUHandler) GetGPUStackWorkers(c *gin.Context) {
	if h.GPUStackClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GPUStack not configured"})
		return
	}
	workers, err := h.GPUStackClient.GetWorkers()
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workers)
}

// GetGPUStackModels proxies model list from GPUStack
func (h *GPUHandler) GetGPUStackModels(c *gin.Context) {
	if h.GPUStackClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GPUStack not configured"})
		return
	}
	models, err := h.GPUStackClient.GetModels()
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, models)
}

// GetGPUStackInstances proxies model instances from GPUStack
func (h *GPUHandler) GetGPUStackInstances(c *gin.Context) {
	if h.GPUStackClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GPUStack not configured"})
		return
	}
	modelID := c.Query("model_id")
	instances, err := h.GPUStackClient.GetModelInstances(modelID)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, instances)
}

// GetGPUStackResourceSummary returns resource summary from GPUStack
func (h *GPUHandler) GetGPUStackResourceSummary(c *gin.Context) {
	if h.GPUStackClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GPUStack not configured"})
		return
	}
	summary, err := h.GPUStackClient.GetResourceSummary()
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, summary)
}

// RuntimeHandler manages inference runtimes (vLLM, GPUStack, llama.cpp, TensorRT-LLM)
type RuntimeHandler struct {
	DB *gorm.DB
}

func (h *RuntimeHandler) ListRuntimes(c *gin.Context) {
	var runtimes []model.Runtime
	query := h.DB.Order("created_at DESC")
	if engine := c.Query("engine"); engine != "" {
		query = query.Where("engine = ?", engine)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	query.Find(&runtimes)
	c.JSON(http.StatusOK, runtimes)
}

func (h *RuntimeHandler) GetRuntime(c *gin.Context) {
	id := c.Param("id")
	var runtime model.Runtime
	if err := h.DB.First(&runtime, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "runtime not found"})
		return
	}
	// Get compatible models count
	var modelCount int64
	h.DB.Model(&model.ModelAsset{}).Where("runtime = ?", runtime.Engine).Count(&modelCount)
	// Get active deployments using this runtime
	var deployCount int64
	h.DB.Model(&model.ModelDeployment{}).Where("runtime_id = ? AND status = ?", runtime.ID, "running").Count(&deployCount)

	c.JSON(http.StatusOK, gin.H{
		"runtime":            runtime,
		"compatible_models":  modelCount,
		"active_deployments": deployCount,
	})
}

func (h *RuntimeHandler) CreateRuntime(c *gin.Context) {
	var runtime model.Runtime
	if err := c.ShouldBindJSON(&runtime); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Create(&runtime).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create runtime"})
		return
	}
	c.JSON(http.StatusCreated, runtime)
}

func (h *RuntimeHandler) UpdateRuntime(c *gin.Context) {
	id := c.Param("id")
	var runtime model.Runtime
	if err := h.DB.First(&runtime, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "runtime not found"})
		return
	}
	if err := c.ShouldBindJSON(&runtime); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&runtime)
	c.JSON(http.StatusOK, runtime)
}

func (h *RuntimeHandler) DeleteRuntime(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.Runtime{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete runtime"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "runtime deleted"})
}

// GetRuntimeCompatibility returns compatibility matrix between runtimes and model formats
func (h *RuntimeHandler) GetRuntimeCompatibility(c *gin.Context) {
	compatibility := []map[string]interface{}{
		{
			"engine":            "vllm",
			"display_name":     "vLLM",
			"supported_formats": []string{"safetensors", "awq", "gptq"},
			"supported_quant":  []string{"fp16", "bf16", "awq-4bit", "gptq-4bit", "gptq-8bit"},
			"features":         []string{"continuous_batching", "paged_attention", "speculative_decoding", "tensor_parallelism"},
			"min_gpu":          "16GB VRAM",
			"max_model_params": "405B (with TP)",
		},
		{
			"engine":            "llama.cpp",
			"display_name":     "llama.cpp (llama-box)",
			"supported_formats": []string{"gguf"},
			"supported_quant":  []string{"q4_0", "q4_1", "q5_0", "q5_1", "q8_0", "fp16"},
			"features":         []string{"cpu_inference", "metal_acceleration", "low_memory", "quantization"},
			"min_gpu":          "4GB VRAM (or CPU)",
			"max_model_params": "70B (quantized)",
		},
		{
			"engine":            "tensorrt-llm",
			"display_name":     "TensorRT-LLM",
			"supported_formats": []string{"safetensors", "engine"},
			"supported_quant":  []string{"fp16", "int8", "int4", "fp8"},
			"features":         []string{"tensor_parallelism", "inflight_batching", "kv_cache_optimization", "custom_plugins"},
			"min_gpu":          "24GB VRAM (NVIDIA only)",
			"max_model_params": "530B (with TP)",
		},
		{
			"engine":            "gpustack",
			"display_name":     "GPUStack Native",
			"supported_formats": []string{"safetensors", "gguf", "awq"},
			"supported_quant":  []string{"fp16", "bf16", "int8", "int4"},
			"features":         []string{"auto_scheduling", "multi_node", "resource_pooling", "auto_scaling"},
			"min_gpu":          "8GB VRAM",
			"max_model_params": "405B (multi-node)",
		},
	}
	c.JSON(http.StatusOK, compatibility)
}
