package model

import (
	"time"

	"gorm.io/gorm"
)

// User represents a platform user
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Username  string         `gorm:"uniqueIndex;size:64;not null" json:"username"`
	Email     string         `gorm:"uniqueIndex;size:128;not null" json:"email"`
	Password  string         `gorm:"size:256;not null" json:"-"`
	Role      string         `gorm:"size:32;default:viewer" json:"role"` // admin, operator, viewer
	TenantID  uint           `gorm:"index" json:"tenant_id"`
	Locale    string         `gorm:"size:8;default:zh" json:"locale"`
}

// Tenant represents a tenant in multi-tenant system
type Tenant struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"uniqueIndex;size:128;not null" json:"name"`
	Quota     int            `gorm:"default:10" json:"quota"`
	Status    string         `gorm:"size:32;default:active" json:"status"`
}

// GPUNode represents a GPU cluster node
type GPUNode struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Name         string         `gorm:"size:128;not null" json:"name"`
	Host         string         `gorm:"size:256;not null" json:"host"`
	GPUType      string         `gorm:"size:64" json:"gpu_type"`
	GPUCount     int            `json:"gpu_count"`
	GPUMemory    int            `json:"gpu_memory"` // in MB
	Status       string         `gorm:"size:32;default:online" json:"status"`
	Utilization  float64        `json:"utilization"`
	ClusterID    uint           `gorm:"index" json:"cluster_id"`
}

// Cluster represents a GPU cluster
type Cluster struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"size:128;not null" json:"name"`
	Region    string         `gorm:"size:64" json:"region"`
	Status    string         `gorm:"size:32;default:active" json:"status"`
	NodeCount int            `json:"node_count"`
}

// ModelAsset represents an AI model
type ModelAsset struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:256;not null" json:"name"`
	Version     string         `gorm:"size:64" json:"version"`
	Format      string         `gorm:"size:32" json:"format"` // gguf, safetensors, etc.
	Size        int64          `json:"size"`                   // in bytes
	Runtime     string         `gorm:"size:64" json:"runtime"` // vllm, llama.cpp, etc.
	Status      string         `gorm:"size:32;default:available" json:"status"`
	Description string         `gorm:"type:text" json:"description"`
	TenantID    uint           `gorm:"index" json:"tenant_id"`
}

// Service represents a deployed model service
type Service struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:128;not null" json:"name"`
	ModelID     uint           `gorm:"index" json:"model_id"`
	ClusterID   uint           `gorm:"index" json:"cluster_id"`
	Runtime     string         `gorm:"size:64" json:"runtime"`
	Replicas    int            `gorm:"default:1" json:"replicas"`
	Status      string         `gorm:"size:32;default:pending" json:"status"` // pending, running, stopped, error
	Endpoint    string         `gorm:"size:256" json:"endpoint"`
	TenantID    uint           `gorm:"index" json:"tenant_id"`
	P95Latency  float64        `json:"p95_latency"`  // ms
	ErrorRate   float64        `json:"error_rate"`
	Throughput  float64        `json:"throughput"`    // req/s
}

// Deployment represents a deployment record
type Deployment struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	ServiceID  uint           `gorm:"index" json:"service_id"`
	Version    string         `gorm:"size:64" json:"version"`
	Strategy   string         `gorm:"size:32" json:"strategy"` // rolling, canary, blue-green
	Status     string         `gorm:"size:32;default:deploying" json:"status"`
	CreatedBy  uint           `json:"created_by"`
}

// Event represents an audit event
type Event struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Type      string    `gorm:"size:64;index" json:"type"`
	Action    string    `gorm:"size:64" json:"action"`
	Resource  string    `gorm:"size:128" json:"resource"`
	Detail    string    `gorm:"type:text" json:"detail"`
	UserID    uint      `gorm:"index" json:"user_id"`
	TenantID  uint      `gorm:"index" json:"tenant_id"`
	Severity  string    `gorm:"size:16;default:info" json:"severity"` // info, warning, error, critical
}

// Policy represents a governance policy
type Policy struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"size:128;not null" json:"name"`
	Type      string         `gorm:"size:64" json:"type"` // quota, access, scaling, routing
	Rule      string         `gorm:"type:text" json:"rule"`
	Status    string         `gorm:"size:32;default:active" json:"status"`
	TenantID  uint           `gorm:"index" json:"tenant_id"`
}

// Alert represents a system alert
type Alert struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Type      string    `gorm:"size:64" json:"type"`
	Message   string    `gorm:"type:text" json:"message"`
	Severity  string    `gorm:"size:16" json:"severity"` // warning, critical
	Resource  string    `gorm:"size:128" json:"resource"`
	Status    string    `gorm:"size:32;default:active" json:"status"` // active, resolved
	TenantID  uint      `gorm:"index" json:"tenant_id"`
}
