package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type EventHandler struct {
	DB *gorm.DB
}

func (h *EventHandler) List(c *gin.Context) {
	var events []model.Event
	query := h.DB.Order("created_at DESC")

	if eventType := c.Query("type"); eventType != "" {
		query = query.Where("type = ?", eventType)
	}
	if severity := c.Query("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.Event{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&events)

	c.JSON(http.StatusOK, gin.H{
		"data":      events,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

type PolicyHandler struct {
	DB *gorm.DB
}

func (h *PolicyHandler) List(c *gin.Context) {
	var policies []model.Policy
	query := h.DB.Order("created_at DESC")

	if pType := c.Query("type"); pType != "" {
		query = query.Where("type = ?", pType)
	}

	query.Find(&policies)
	c.JSON(http.StatusOK, policies)
}

func (h *PolicyHandler) Create(c *gin.Context) {
	var policy model.Policy
	if err := c.ShouldBindJSON(&policy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Create(&policy).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create policy"})
		return
	}
	c.JSON(http.StatusCreated, policy)
}

func (h *PolicyHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var policy model.Policy
	if err := h.DB.First(&policy, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "policy not found"})
		return
	}
	if err := c.ShouldBindJSON(&policy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&policy)
	c.JSON(http.StatusOK, policy)
}

func (h *PolicyHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.Policy{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete policy"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "policy deleted"})
}
