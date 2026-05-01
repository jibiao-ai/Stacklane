package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type ClusterHandler struct {
	DB *gorm.DB
}

func (h *ClusterHandler) ListClusters(c *gin.Context) {
	var clusters []model.Cluster
	h.DB.Order("created_at DESC").Find(&clusters)
	c.JSON(http.StatusOK, clusters)
}

func (h *ClusterHandler) GetCluster(c *gin.Context) {
	id := c.Param("id")
	var cluster model.Cluster
	if err := h.DB.First(&cluster, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cluster not found"})
		return
	}
	c.JSON(http.StatusOK, cluster)
}

func (h *ClusterHandler) ListNodes(c *gin.Context) {
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

func (h *ClusterHandler) GetNode(c *gin.Context) {
	id := c.Param("id")
	var node model.GPUNode
	if err := h.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "node not found"})
		return
	}
	c.JSON(http.StatusOK, node)
}
