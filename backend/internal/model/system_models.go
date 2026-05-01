package model

import (
	"time"

	"gorm.io/gorm"
)

// SystemConfig represents a system configuration key-value pair
type SystemConfig struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Key       string         `gorm:"uniqueIndex;size:128;not null" json:"key"`
	Value     string         `gorm:"type:text" json:"value"`
	Category  string         `gorm:"size:64;index" json:"category"` // general, notification, security, backup, performance
	Description string       `gorm:"type:text" json:"description"`
}

// AuditLog represents a system audit log entry
type AuditLog struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Username  string    `gorm:"size:64" json:"username"`
	Action    string    `gorm:"size:64;index" json:"action"`    // create, update, delete, login, logout, deploy, etc.
	Resource  string    `gorm:"size:128;index" json:"resource"` // model, service, tenant, system, etc.
	ResourceID string   `gorm:"size:64" json:"resource_id"`
	Detail    string    `gorm:"type:text" json:"detail"`
	IPAddress string    `gorm:"size:45" json:"ip_address"`
	UserAgent string    `gorm:"size:256" json:"user_agent"`
	Status    string    `gorm:"size:16;default:success" json:"status"` // success, failure
}

// DifyConfig represents the Dify integration configuration
type DifyConfig struct {
	ID            uint       `gorm:"primarykey" json:"id"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	Endpoint      string     `gorm:"size:256;not null" json:"endpoint"`
	APIKey        string     `gorm:"size:256;not null" json:"-"`
	Status        string     `gorm:"size:32;default:disconnected" json:"status"` // connected, disconnected, error, auth_failed
	Version       string     `gorm:"size:32" json:"version"`
	LastSyncAt    *time.Time `json:"last_sync_at"`
	AppCount      int        `json:"app_count"`
	WorkflowCount int        `json:"workflow_count"`
}

// DifyApp represents a Dify application synced from Dify platform
type DifyApp struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DifyAppID   string         `gorm:"uniqueIndex;size:64" json:"dify_app_id"`
	Name        string         `gorm:"size:256;not null" json:"name"`
	AppType     string         `gorm:"size:32" json:"app_type"`       // chat, completion, workflow, agent
	Description string         `gorm:"type:text" json:"description"`
	ModelName   string         `gorm:"size:128" json:"model_name"`
	Provider    string         `gorm:"size:64" json:"provider"`       // openai, anthropic, local
	Status      string         `gorm:"size:32;default:active" json:"status"`
	ServiceID   *uint          `gorm:"index" json:"service_id"`       // linked Stacklane service
}

// DifyWorkflow represents a workflow that integrates Dify with Stacklane
type DifyWorkflow struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:128;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	DifyAppID   *uint          `gorm:"index" json:"dify_app_id"`
	ServiceID   *uint          `gorm:"index" json:"service_id"`
	TriggerType string         `gorm:"size:32" json:"trigger_type"`   // manual, scheduled, event, webhook
	Schedule    string         `gorm:"size:64" json:"schedule"`       // cron expression for scheduled
	Config      string         `gorm:"type:text" json:"config"`       // JSON workflow configuration
	Status      string         `gorm:"size:32;default:draft" json:"status"` // draft, active, paused, error
}

// DifyWorkflowExecution represents a workflow execution record
type DifyWorkflowExecution struct {
	ID         uint       `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	WorkflowID uint       `gorm:"index" json:"workflow_id"`
	Status     string     `gorm:"size:32;default:pending" json:"status"` // pending, running, completed, failed
	Inputs     string     `gorm:"type:text" json:"inputs"`
	Outputs    string     `gorm:"type:text" json:"outputs"`
	Error      string     `gorm:"type:text" json:"error"`
	Duration   int        `json:"duration"` // ms
	StartedAt  *time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at"`
}
