package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type DashboardHandler struct {
	DB *gorm.DB
}

type DashboardStats struct {
	OnlineServices  int     `json:"online_services"`
	GPUUtilization  float64 `json:"gpu_utilization"`
	P95Latency      float64 `json:"p95_latency"`
	ErrorRate       float64 `json:"error_rate"`
	TotalModels     int     `json:"total_models"`
	TotalNodes      int     `json:"total_nodes"`
	TotalClusters   int     `json:"total_clusters"`
	ActiveAlerts    int     `json:"active_alerts"`
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	var stats DashboardStats

	h.DB.Model(&model.Service{}).Where("status = ?", "running").Count((*int64)(&[]int64{0}[0]))
	var serviceCount int64
	h.DB.Model(&model.Service{}).Where("status = ?", "running").Count(&serviceCount)
	stats.OnlineServices = int(serviceCount)

	var avgUtil float64
	h.DB.Model(&model.GPUNode{}).Where("status = ?", "online").Select("COALESCE(AVG(utilization), 0)").Scan(&avgUtil)
	stats.GPUUtilization = avgUtil

	var avgLatency float64
	h.DB.Model(&model.Service{}).Where("status = ?", "running").Select("COALESCE(AVG(p95_latency), 0)").Scan(&avgLatency)
	stats.P95Latency = avgLatency

	var avgError float64
	h.DB.Model(&model.Service{}).Where("status = ?", "running").Select("COALESCE(AVG(error_rate), 0)").Scan(&avgError)
	stats.ErrorRate = avgError

	var modelCount int64
	h.DB.Model(&model.ModelAsset{}).Count(&modelCount)
	stats.TotalModels = int(modelCount)

	var nodeCount int64
	h.DB.Model(&model.GPUNode{}).Count(&nodeCount)
	stats.TotalNodes = int(nodeCount)

	var clusterCount int64
	h.DB.Model(&model.Cluster{}).Count(&clusterCount)
	stats.TotalClusters = int(clusterCount)

	var alertCount int64
	h.DB.Model(&model.Alert{}).Where("status = ?", "active").Count(&alertCount)
	stats.ActiveAlerts = int(alertCount)

	c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandler) GetRecentEvents(c *gin.Context) {
	var events []model.Event
	h.DB.Order("created_at DESC").Limit(20).Find(&events)
	c.JSON(http.StatusOK, events)
}

func (h *DashboardHandler) GetAlerts(c *gin.Context) {
	var alerts []model.Alert
	h.DB.Where("status = ?", "active").Order("created_at DESC").Limit(10).Find(&alerts)
	c.JSON(http.StatusOK, alerts)
}
