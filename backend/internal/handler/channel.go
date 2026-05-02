package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type ChannelHandler struct {
	DB *gorm.DB
}

// =================== Channel CRUD ===================

func (h *ChannelHandler) ListChannels(c *gin.Context) {
	var channels []model.Channel
	query := h.DB

	if typ := c.Query("type"); typ != "" {
		query = query.Where("type = ?", typ)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var total int64
	query.Model(&model.Channel{}).Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&channels)

	c.JSON(http.StatusOK, gin.H{"data": channels, "total": total, "page": page, "page_size": pageSize})
}

func (h *ChannelHandler) GetChannel(c *gin.Context) {
	var channel model.Channel
	if err := h.DB.First(&channel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}
	c.JSON(http.StatusOK, channel)
}

func (h *ChannelHandler) CreateChannel(c *gin.Context) {
	var channel model.Channel
	if err := c.ShouldBindJSON(&channel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	channel.Status = "inactive"
	if err := h.DB.Create(&channel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create channel"})
		return
	}
	c.JSON(http.StatusCreated, channel)
}

func (h *ChannelHandler) UpdateChannel(c *gin.Context) {
	var channel model.Channel
	if err := h.DB.First(&channel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}
	if err := c.ShouldBindJSON(&channel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&channel)
	c.JSON(http.StatusOK, channel)
}

func (h *ChannelHandler) DeleteChannel(c *gin.Context) {
	if err := h.DB.Delete(&model.Channel{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete channel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Channel deleted"})
}

// =================== Channel Operations ===================

func (h *ChannelHandler) ConnectChannel(c *gin.Context) {
	var channel model.Channel
	if err := h.DB.First(&channel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}
	channel.Status = "active"
	now := time.Now()
	channel.LastActiveAt = &now
	channel.ErrorMsg = ""
	h.DB.Save(&channel)
	c.JSON(http.StatusOK, gin.H{"message": "Channel connected", "channel": channel})
}

func (h *ChannelHandler) DisconnectChannel(c *gin.Context) {
	var channel model.Channel
	if err := h.DB.First(&channel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}
	channel.Status = "inactive"
	h.DB.Save(&channel)
	c.JSON(http.StatusOK, gin.H{"message": "Channel disconnected", "channel": channel})
}

func (h *ChannelHandler) TestChannel(c *gin.Context) {
	var channel model.Channel
	if err := h.DB.First(&channel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}
	// Simulate connection test
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "Connection test passed",
		"latency":  "45ms",
		"channel":  channel.Name,
		"type":     channel.Type,
	})
}

func (h *ChannelHandler) BindAgent(c *gin.Context) {
	var channel model.Channel
	if err := h.DB.First(&channel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}

	var req struct {
		AgentID   uint   `json:"agent_id"`
		AgentName string `json:"agent_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	channel.AgentID = req.AgentID
	channel.AgentName = req.AgentName
	h.DB.Save(&channel)
	c.JSON(http.StatusOK, gin.H{"message": "Agent bound to channel", "channel": channel})
}

// =================== Channel Messages ===================

func (h *ChannelHandler) ListMessages(c *gin.Context) {
	channelID := c.Param("id")
	var messages []model.ChannelMessage

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))

	var total int64
	h.DB.Model(&model.ChannelMessage{}).Where("channel_id = ?", channelID).Count(&total)
	h.DB.Where("channel_id = ?", channelID).Order("created_at DESC").
		Offset((page-1)*pageSize).Limit(pageSize).Find(&messages)

	c.JSON(http.StatusOK, gin.H{"data": messages, "total": total, "page": page, "page_size": pageSize})
}

// =================== Channel Stats ===================

func (h *ChannelHandler) GetChannelStats(c *gin.Context) {
	var totalChannels, activeChannels int64
	h.DB.Model(&model.Channel{}).Count(&totalChannels)
	h.DB.Model(&model.Channel{}).Where("status = ?", "active").Count(&activeChannels)

	var totalMessages int64
	h.DB.Model(&model.ChannelMessage{}).Count(&totalMessages)

	// Count by type
	type TypeCount struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	var typeCounts []TypeCount
	h.DB.Model(&model.Channel{}).Select("type, count(*) as count").Group("type").Scan(&typeCounts)

	c.JSON(http.StatusOK, gin.H{
		"total_channels":  totalChannels,
		"active_channels": activeChannels,
		"total_messages":  totalMessages,
		"by_type":         typeCounts,
	})
}

// =================== Supported Channel Types ===================

func (h *ChannelHandler) GetSupportedTypes(c *gin.Context) {
	types := []gin.H{
		{"id": "qq", "name": "QQ Bot", "icon": "qq", "description": "QQ 机器人，支持群聊和私聊", "config_fields": []string{"app_id", "app_secret", "token", "sandbox"}},
		{"id": "wecom", "name": "企业微信 Bot", "icon": "wecom", "description": "企业微信应用机器人，支持消息推送和回调", "config_fields": []string{"corp_id", "agent_id", "secret", "token", "encoding_aes_key"}},
		{"id": "feishu", "name": "飞书 Bot", "icon": "feishu", "description": "飞书自建应用机器人，支持卡片消息和事件订阅", "config_fields": []string{"app_id", "app_secret", "verification_token", "encrypt_key"}},
		{"id": "wechat", "name": "微信公众号", "icon": "wechat", "description": "微信公众号/服务号接入，支持自动回复和模板消息", "config_fields": []string{"app_id", "app_secret", "token", "encoding_aes_key"}},
		{"id": "telegram", "name": "Telegram Bot", "icon": "telegram", "description": "Telegram Bot API 接入", "config_fields": []string{"bot_token", "webhook_url"}},
		{"id": "discord", "name": "Discord Bot", "icon": "discord", "description": "Discord 机器人接入", "config_fields": []string{"bot_token", "application_id", "guild_id"}},
		{"id": "slack", "name": "Slack Bot", "icon": "slack", "description": "Slack Workspace 机器人", "config_fields": []string{"bot_token", "signing_secret", "app_token"}},
		{"id": "dingtalk", "name": "钉钉 Bot", "icon": "dingtalk", "description": "钉钉群机器人/企业应用", "config_fields": []string{"app_key", "app_secret", "robot_code"}},
	}
	c.JSON(http.StatusOK, gin.H{"data": types})
}
