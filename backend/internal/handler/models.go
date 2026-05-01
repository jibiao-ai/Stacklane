package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type ModelHandler struct {
	DB *gorm.DB
}

func (h *ModelHandler) List(c *gin.Context) {
	var models []model.ModelAsset
	query := h.DB.Order("created_at DESC")

	if runtime := c.Query("runtime"); runtime != "" {
		query = query.Where("runtime = ?", runtime)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
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

func (h *ModelHandler) Get(c *gin.Context) {
	id := c.Param("id")
	var m model.ModelAsset
	if err := h.DB.First(&m, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *ModelHandler) Create(c *gin.Context) {
	var m model.ModelAsset
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Create(&m).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create model"})
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *ModelHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.ModelAsset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete model"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "model deleted"})
}
