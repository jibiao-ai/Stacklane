package model

import (
	"time"

	"gorm.io/gorm"
)

// Agent represents an AI agent with its configuration
type Agent struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Avatar      string         `json:"avatar" gorm:"size:500"`
	Description string         `json:"description" gorm:"size:1000"`
	SystemPrompt string        `json:"system_prompt" gorm:"type:text"`
	ModelID     string         `json:"model_id" gorm:"size:100"`
	ModelName   string         `json:"model_name" gorm:"size:200"`
	Provider    string         `json:"provider" gorm:"size:50"` // openai, anthropic, deepseek, qwen, ollama
	Category    string         `json:"category" gorm:"size:50"` // assistant, coding, writing, analysis, creative, customer_service
	Tags        string         `json:"tags" gorm:"size:500"`    // comma-separated
	Temperature float64        `json:"temperature" gorm:"default:0.7"`
	MaxTokens   int            `json:"max_tokens" gorm:"default:4096"`
	TopP        float64        `json:"top_p" gorm:"default:0.9"`
	Tools       string         `json:"tools" gorm:"type:text"`          // JSON array of tool IDs
	Skills      string         `json:"skills" gorm:"type:text"`         // JSON array of skill IDs
	Knowledge   string         `json:"knowledge" gorm:"type:text"`      // JSON array of knowledge base IDs
	Channels    string         `json:"channels" gorm:"type:text"`       // JSON array of channel IDs
	Status      string         `json:"status" gorm:"size:20;default:active"` // active, inactive, draft
	IsBuiltin   bool           `json:"is_builtin" gorm:"default:false"`
	Source      string         `json:"source" gorm:"size:200"`          // github URL or "builtin"
	Version     string         `json:"version" gorm:"size:20"`
	UsageCount  int64          `json:"usage_count" gorm:"default:0"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	TenantID    uint           `json:"tenant_id"`
}

// AgentTemplate represents a pre-built agent template from open source
type AgentTemplate struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Avatar      string         `json:"avatar" gorm:"size:500"`
	Description string         `json:"description" gorm:"size:1000"`
	SystemPrompt string        `json:"system_prompt" gorm:"type:text"`
	Category    string         `json:"category" gorm:"size:50"`
	Tags        string         `json:"tags" gorm:"size:500"`
	Provider    string         `json:"provider" gorm:"size:50"`
	Source      string         `json:"source" gorm:"size:500"`   // github/huggingface URL
	Author      string         `json:"author" gorm:"size:100"`
	Stars       int            `json:"stars" gorm:"default:0"`
	Downloads   int            `json:"downloads" gorm:"default:0"`
	Version     string         `json:"version" gorm:"size:20"`
	IsOfficial  bool           `json:"is_official" gorm:"default:false"`
}

// Channel represents a messaging channel/bot integration
type Channel struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Type        string         `json:"type" gorm:"size:30;not null"` // qq, wecom, feishu, wechat, telegram, discord, slack, dingtalk
	Description string         `json:"description" gorm:"size:500"`
	Icon        string         `json:"icon" gorm:"size:200"`
	Config      string         `json:"config" gorm:"type:text"`      // JSON config (appID, secret, token, etc.)
	AgentID     uint           `json:"agent_id"`                     // bound agent
	AgentName   string         `json:"agent_name" gorm:"size:100"`
	Status      string         `json:"status" gorm:"size:20;default:inactive"` // active, inactive, error, connecting
	WebhookURL  string         `json:"webhook_url" gorm:"size:500"`
	MessageCount int64         `json:"message_count" gorm:"default:0"`
	LastActiveAt *time.Time    `json:"last_active_at"`
	ErrorMsg    string         `json:"error_msg" gorm:"size:500"`
	TenantID    uint           `json:"tenant_id"`
}

// ChannelMessage represents a message log from a channel
type ChannelMessage struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	CreatedAt  time.Time `json:"created_at"`
	ChannelID  uint      `json:"channel_id"`
	Direction  string    `json:"direction" gorm:"size:10"` // inbound, outbound
	SenderID   string    `json:"sender_id" gorm:"size:100"`
	SenderName string    `json:"sender_name" gorm:"size:100"`
	Content    string    `json:"content" gorm:"type:text"`
	MsgType    string    `json:"msg_type" gorm:"size:20"` // text, image, file, voice, card
	Status     string    `json:"status" gorm:"size:20"`   // sent, delivered, failed
}

// Skill represents a reusable automation skill
type Skill struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Icon        string         `json:"icon" gorm:"size:200"`
	Description string         `json:"description" gorm:"size:1000"`
	Category    string         `json:"category" gorm:"size:50"`    // utility, document, data, automation, communication, development
	Type        string         `json:"type" gorm:"size:30"`        // builtin, custom, marketplace
	Config      string         `json:"config" gorm:"type:text"`    // JSON schema for skill parameters
	InputSchema string         `json:"input_schema" gorm:"type:text"`  // JSON schema
	OutputSchema string        `json:"output_schema" gorm:"type:text"` // JSON schema
	Handler     string         `json:"handler" gorm:"size:200"`    // handler function/endpoint
	Source      string         `json:"source" gorm:"size:500"`     // source URL for open-source skills
	Author      string         `json:"author" gorm:"size:100"`
	Version     string         `json:"version" gorm:"size:20"`
	Status      string         `json:"status" gorm:"size:20;default:active"` // active, inactive, error
	IsBuiltin   bool           `json:"is_builtin" gorm:"default:false"`
	UsageCount  int64          `json:"usage_count" gorm:"default:0"`
	AvgDuration float64        `json:"avg_duration" gorm:"default:0"` // milliseconds
	SuccessRate float64        `json:"success_rate" gorm:"default:100"`
	TenantID    uint           `json:"tenant_id"`
}

// SkillExecution represents a skill execution record
type SkillExecution struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	CreatedAt  time.Time `json:"created_at"`
	SkillID    uint      `json:"skill_id"`
	SkillName  string    `json:"skill_name" gorm:"size:100"`
	AgentID    uint      `json:"agent_id"`
	Input      string    `json:"input" gorm:"type:text"`
	Output     string    `json:"output" gorm:"type:text"`
	Status     string    `json:"status" gorm:"size:20"` // success, failed, running, timeout
	Duration   int64     `json:"duration"`              // milliseconds
	Error      string    `json:"error" gorm:"size:500"`
	TriggerBy  string    `json:"trigger_by" gorm:"size:50"` // agent, cron, manual, webhook
}
