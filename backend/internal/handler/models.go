package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

// ModelHandler manages model lifecycle: import, version, deploy, retire
type ModelHandler struct {
	DB *gorm.DB
}

// List models with filtering and pagination
func (h *ModelHandler) List(c *gin.Context) {
	var models []model.ModelAsset
	query := h.DB.Order("created_at DESC")

	if runtime := c.Query("runtime"); runtime != "" {
		query = query.Where("runtime = ?", runtime)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if format := c.Query("format"); format != "" {
		query = query.Where("format = ?", format)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.ModelAsset{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&models)

	c.JSON(http.StatusOK, gin.H{
		"data":      models,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// Get model details with versions and deployments
func (h *ModelHandler) Get(c *gin.Context) {
	id := c.Param("id")
	var asset model.ModelAsset
	if err := h.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}

	// Get versions
	var versions []model.ModelVersion
	h.DB.Where("model_id = ?", id).Order("created_at DESC").Find(&versions)

	// Get active deployments
	var deployments []model.ModelDeployment
	h.DB.Where("model_id = ?", id).Order("created_at DESC").Limit(10).Find(&deployments)

	c.JSON(http.StatusOK, gin.H{
		"model":       asset,
		"versions":    versions,
		"deployments": deployments,
	})
}

// Create registers a new model asset
func (h *ModelHandler) Create(c *gin.Context) {
	var asset model.ModelAsset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if asset.Status == "" {
		asset.Status = "registered"
	}
	if err := h.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create model"})
		return
	}
	c.JSON(http.StatusCreated, asset)
}

// Update model asset info
func (h *ModelHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var asset model.ModelAsset
	if err := h.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&asset)
	c.JSON(http.StatusOK, asset)
}

// Delete model
func (h *ModelHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	// Check for active deployments
	var activeCount int64
	h.DB.Model(&model.ModelDeployment{}).Where("model_id = ? AND status IN ?", id, []string{"running", "loading"}).Count(&activeCount)
	if activeCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "cannot delete model with active deployments"})
		return
	}
	if err := h.DB.Delete(&model.ModelAsset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete model"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "model deleted"})
}

// ImportFromHuggingFace imports a model from HuggingFace
func (h *ModelHandler) ImportFromHuggingFace(c *gin.Context) {
	var req struct {
		HuggingFaceID string `json:"huggingface_id" binding:"required"`
		Name          string `json:"name"`
		Format        string `json:"format"`
		Quantization  string `json:"quantization"`
		Runtime       string `json:"runtime"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	name := req.Name
	if name == "" {
		name = req.HuggingFaceID
	}

	asset := model.ModelAsset{
		Name:        name,
		Format:      req.Format,
		Runtime:     req.Runtime,
		Status:      "importing",
		Description: "Imported from HuggingFace: " + req.HuggingFaceID,
	}
	h.DB.Create(&asset)

	// Create initial version
	version := model.ModelVersion{
		ModelID:       asset.ID,
		Version:       "v1.0",
		Format:        req.Format,
		Quantization:  req.Quantization,
		HuggingFaceID: req.HuggingFaceID,
		Status:        "downloading",
	}
	h.DB.Create(&version)

	c.JSON(http.StatusCreated, gin.H{
		"model":   asset,
		"version": version,
		"message": "import initiated",
	})
}

// ListVersions returns versions for a model
func (h *ModelHandler) ListVersions(c *gin.Context) {
	modelID := c.Param("id")
	var versions []model.ModelVersion
	h.DB.Where("model_id = ?", modelID).Order("created_at DESC").Find(&versions)
	c.JSON(http.StatusOK, versions)
}

// CreateVersion adds a new version to a model
func (h *ModelHandler) CreateVersion(c *gin.Context) {
	modelID := c.Param("id")
	var version model.ModelVersion
	if err := c.ShouldBindJSON(&version); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, _ := strconv.ParseUint(modelID, 10, 32)
	version.ModelID = uint(id)
	if version.Status == "" {
		version.Status = "registered"
	}
	if err := h.DB.Create(&version).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create version"})
		return
	}
	c.JSON(http.StatusCreated, version)
}

// DeployModel deploys a model version to a runtime
func (h *ModelHandler) DeployModel(c *gin.Context) {
	var req struct {
		ModelID   uint   `json:"model_id" binding:"required"`
		VersionID uint   `json:"version_id" binding:"required"`
		RuntimeID uint   `json:"runtime_id" binding:"required"`
		ClusterID uint   `json:"cluster_id" binding:"required"`
		GPUCount  int    `json:"gpu_count"`
		Strategy  string `json:"strategy"` // rolling, canary, blue-green
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deployment := model.ModelDeployment{
		ModelID:   req.ModelID,
		VersionID: req.VersionID,
		RuntimeID: req.RuntimeID,
		ClusterID: req.ClusterID,
		GPUCount:  req.GPUCount,
		Status:    "loading",
	}
	if err := h.DB.Create(&deployment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create deployment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"deployment": deployment,
		"message":    "deployment initiated",
	})
}

// ListDeployments returns all model deployments
func (h *ModelHandler) ListDeployments(c *gin.Context) {
	var deployments []model.ModelDeployment
	query := h.DB.Order("created_at DESC")

	if modelID := c.Query("model_id"); modelID != "" {
		query = query.Where("model_id = ?", modelID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.ModelDeployment{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&deployments)

	c.JSON(http.StatusOK, gin.H{
		"data":      deployments,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetCompatibilityMatrix returns which models work with which runtimes
func (h *ModelHandler) GetCompatibilityMatrix(c *gin.Context) {
	type CompatEntry struct {
		ModelName string   `json:"model_name"`
		ModelID   uint     `json:"model_id"`
		Format    string   `json:"format"`
		Runtimes  []string `json:"compatible_runtimes"`
	}

	var models []model.ModelAsset
	h.DB.Find(&models)

	matrix := make([]CompatEntry, 0, len(models))
	for _, m := range models {
		runtimes := getCompatibleRuntimes(m.Format)
		matrix = append(matrix, CompatEntry{
			ModelName: m.Name,
			ModelID:   m.ID,
			Format:    m.Format,
			Runtimes:  runtimes,
		})
	}
	c.JSON(http.StatusOK, matrix)
}

func getCompatibleRuntimes(format string) []string {
	switch format {
	case "safetensors":
		return []string{"vllm", "tensorrt-llm", "gpustack"}
	case "gguf":
		return []string{"llama.cpp", "gpustack"}
	case "awq":
		return []string{"vllm", "gpustack"}
	case "gptq":
		return []string{"vllm"}
	default:
		return []string{"gpustack"}
	}
}
