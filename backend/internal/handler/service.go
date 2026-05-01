package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type ServiceHandler struct {
	DB *gorm.DB
}

func (h *ServiceHandler) List(c *gin.Context) {
	var services []model.Service
	query := h.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if runtime := c.Query("runtime"); runtime != "" {
		query = query.Where("runtime = ?", runtime)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.Service{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&services)

	c.JSON(http.StatusOK, gin.H{
		"data":      services,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *ServiceHandler) Get(c *gin.Context) {
	id := c.Param("id")
	var service model.Service
	if err := h.DB.First(&service, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
	}
	c.JSON(http.StatusOK, service)
}

func (h *ServiceHandler) Create(c *gin.Context) {
	var service model.Service
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	service.Status = "pending"
	if err := h.DB.Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create service"})
		return
	}
	c.JSON(http.StatusCreated, service)
}

func (h *ServiceHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var service model.Service
	if err := h.DB.First(&service, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
	}
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&service)
	c.JSON(http.StatusOK, service)
}

func (h *ServiceHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.Service{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete service"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "service deleted"})
}
