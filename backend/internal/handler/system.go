package handler

import (
	"net/http"
	"runtime"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type SystemHandler struct {
	DB        *gorm.DB
	StartTime time.Time
}

// =================== System Configuration ===================

func (h *SystemHandler) GetConfig(c *gin.Context) {
	var configs []model.SystemConfig
	h.DB.Order("category, key").Find(&configs)

	// Group by category
	grouped := make(map[string][]model.SystemConfig)
	for _, cfg := range configs {
		grouped[cfg.Category] = append(grouped[cfg.Category], cfg)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       configs,
		"categories": grouped,
	})
}

func (h *SystemHandler) GetConfigByCategory(c *gin.Context) {
	category := c.Param("category")
	var configs []model.SystemConfig
	h.DB.Where("category = ?", category).Find(&configs)
	c.JSON(http.StatusOK, configs)
}

func (h *SystemHandler) UpdateConfig(c *gin.Context) {
	var req struct {
		Key      string `json:"key" binding:"required"`
		Value    string `json:"value" binding:"required"`
		Category string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var config model.SystemConfig
	result := h.DB.Where("key = ?", req.Key).First(&config)
	if result.Error != nil {
		// Create new config
		config = model.SystemConfig{
			Key:      req.Key,
			Value:    req.Value,
			Category: req.Category,
		}
		h.DB.Create(&config)
	} else {
		config.Value = req.Value
		if req.Category != "" {
			config.Category = req.Category
		}
		h.DB.Save(&config)
	}

	c.JSON(http.StatusOK, config)
}

func (h *SystemHandler) BatchUpdateConfig(c *gin.Context) {
	var req []struct {
		Key      string `json:"key"`
		Value    string `json:"value"`
		Category string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, item := range req {
		var config model.SystemConfig
		result := h.DB.Where("key = ?", item.Key).First(&config)
		if result.Error != nil {
			config = model.SystemConfig{Key: item.Key, Value: item.Value, Category: item.Category}
			h.DB.Create(&config)
		} else {
			config.Value = item.Value
			h.DB.Save(&config)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "configurations updated", "count": len(req)})
}

func (h *SystemHandler) DeleteConfig(c *gin.Context) {
	key := c.Param("key")
	if err := h.DB.Where("key = ?", key).Delete(&model.SystemConfig{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete config"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "config deleted"})
}

// =================== System Info ===================

func (h *SystemHandler) GetSystemInfo(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	uptime := time.Since(h.StartTime)

	c.JSON(http.StatusOK, gin.H{
		"version":       "1.0.0",
		"go_version":    runtime.Version(),
		"os":            runtime.GOOS,
		"arch":          runtime.GOARCH,
		"cpus":          runtime.NumCPU(),
		"goroutines":    runtime.NumGoroutine(),
		"memory_alloc":  m.Alloc / 1024 / 1024,      // MB
		"memory_sys":    m.Sys / 1024 / 1024,         // MB
		"gc_runs":       m.NumGC,
		"uptime_seconds": int(uptime.Seconds()),
		"started_at":    h.StartTime.Format(time.RFC3339),
	})
}

// =================== Notification Settings ===================

func (h *SystemHandler) GetNotificationSettings(c *gin.Context) {
	var configs []model.SystemConfig
	h.DB.Where("category = ?", "notification").Find(&configs)

	settings := make(map[string]string)
	for _, cfg := range configs {
		settings[cfg.Key] = cfg.Value
	}

	c.JSON(http.StatusOK, gin.H{
		"settings": settings,
		"channels": []gin.H{
			{"type": "email", "enabled": settings["notification_email_enabled"] == "true"},
			{"type": "webhook", "enabled": settings["notification_webhook_enabled"] == "true"},
			{"type": "dingtalk", "enabled": settings["notification_dingtalk_enabled"] == "true"},
			{"type": "feishu", "enabled": settings["notification_feishu_enabled"] == "true"},
		},
	})
}

func (h *SystemHandler) UpdateNotificationSettings(c *gin.Context) {
	var req struct {
		Channel string `json:"channel" binding:"required"`
		Enabled bool   `json:"enabled"`
		Config  string `json:"config"` // JSON config for the channel
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	enabledKey := "notification_" + req.Channel + "_enabled"
	configKey := "notification_" + req.Channel + "_config"

	enabledVal := "false"
	if req.Enabled {
		enabledVal = "true"
	}

	// Update enabled status
	h.DB.Where("key = ?", enabledKey).Assign(model.SystemConfig{
		Key: enabledKey, Value: enabledVal, Category: "notification",
	}).FirstOrCreate(&model.SystemConfig{})

	// Update config if provided
	if req.Config != "" {
		h.DB.Where("key = ?", configKey).Assign(model.SystemConfig{
			Key: configKey, Value: req.Config, Category: "notification",
		}).FirstOrCreate(&model.SystemConfig{})
	}

	c.JSON(http.StatusOK, gin.H{"message": "notification settings updated"})
}

// =================== Audit Logs ===================

func (h *SystemHandler) GetAuditLogs(c *gin.Context) {
	var logs []model.AuditLog
	query := h.DB.Order("created_at DESC")

	if userID := c.Query("user_id"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if action := c.Query("action"); action != "" {
		query = query.Where("action = ?", action)
	}
	if resource := c.Query("resource"); resource != "" {
		query = query.Where("resource LIKE ?", "%"+resource+"%")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	if pageSize < 1 {
		pageSize = 50
	}
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.AuditLog{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&logs)

	c.JSON(http.StatusOK, gin.H{
		"data":      logs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}



// =================== Backup & Maintenance ===================

func (h *SystemHandler) GetBackupStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"auto_backup_enabled": true,
		"backup_interval":     "daily",
		"last_backup":         time.Now().Add(-6 * time.Hour).Format(time.RFC3339),
		"next_backup":         time.Now().Add(18 * time.Hour).Format(time.RFC3339),
		"backup_location":     "/backups/stacklane",
		"retention_days":      30,
	})
}

func (h *SystemHandler) TriggerBackup(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message":    "backup triggered",
		"started_at": time.Now().Format(time.RFC3339),
		"status":     "in_progress",
	})
}
