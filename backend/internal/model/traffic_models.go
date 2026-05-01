package model

import (
	"time"

	"gorm.io/gorm"
)

// TrafficRule represents a traffic routing rule
type TrafficRule struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:128;not null" json:"name"`
	Type        string         `gorm:"size:32;index" json:"type"`         // weight, header, cookie, path
	ServiceID   uint           `gorm:"index" json:"service_id"`
	Priority    int            `gorm:"default:100" json:"priority"`
	Condition   string         `gorm:"type:text" json:"condition"`        // JSON condition expression
	Action      string         `gorm:"type:text" json:"action"`           // JSON action config
	TrafficPct  int            `gorm:"default:100" json:"traffic_pct"`    // traffic percentage 0-100
	TargetVersion string       `gorm:"size:64" json:"target_version"`
	Status      string         `gorm:"size:32;default:active" json:"status"` // active, disabled
	Description string         `gorm:"type:text" json:"description"`
}

// ABTest represents an A/B test experiment
type ABTest struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:128;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	ServiceID   uint           `gorm:"index" json:"service_id"`
	MetricType  string         `gorm:"size:64" json:"metric_type"`  // latency, throughput, error_rate, custom
	Status      string         `gorm:"size:32;default:draft" json:"status"` // draft, running, completed, cancelled
	StartedAt   *time.Time     `json:"started_at"`
	EndedAt     *time.Time     `json:"ended_at"`
	WinnerID    *uint          `json:"winner_id"`
	Variants    []ABTestVariant `gorm:"foreignKey:ABTestID" json:"variants"`
}

// ABTestVariant represents a variant in an A/B test
type ABTestVariant struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	ABTestID    uint      `gorm:"index" json:"ab_test_id"`
	Name        string    `gorm:"size:64;not null" json:"name"` // e.g., "Control", "Variant A"
	ModelVersion string   `gorm:"size:64" json:"model_version"`
	TrafficPct  int       `gorm:"default:50" json:"traffic_pct"` // percentage
	RequestCount int64    `json:"request_count"`
	AvgLatency  float64   `json:"avg_latency"`
	ErrorRate   float64   `json:"error_rate"`
	Throughput  float64   `json:"throughput"`
}

// RateLimit represents a rate limiting rule
type RateLimit struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:128;not null" json:"name"`
	Scope       string         `gorm:"size:32" json:"scope"`     // global, service, tenant, user, ip
	ServiceID   *uint          `gorm:"index" json:"service_id"`
	TenantID    *uint          `gorm:"index" json:"tenant_id"`
	MaxRequests int            `json:"max_requests"`              // requests per window
	WindowSize  int            `json:"window_size"`               // window in seconds
	BurstSize   int            `json:"burst_size"`                // max burst
	Strategy    string         `gorm:"size:32;default:sliding_window" json:"strategy"` // fixed_window, sliding_window, token_bucket
	Status      string         `gorm:"size:32;default:active" json:"status"`
	Action      string         `gorm:"size:32;default:reject" json:"action"` // reject, queue, throttle
}

// CircuitBreaker represents a circuit breaker configuration
type CircuitBreaker struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	Name           string         `gorm:"size:128;not null" json:"name"`
	ServiceID      uint           `gorm:"index" json:"service_id"`
	State          string         `gorm:"size:16;default:closed" json:"state"` // closed, open, half_open
	FailureThreshold int          `gorm:"default:5" json:"failure_threshold"`
	SuccessThreshold int          `gorm:"default:3" json:"success_threshold"`
	Timeout        int            `gorm:"default:30" json:"timeout"`          // seconds to stay open
	FailureCount   int            `json:"failure_count"`
	SuccessCount   int            `json:"success_count"`
	LastFailureAt  *time.Time     `json:"last_failure_at"`
	LastStateChange *time.Time    `json:"last_state_change"`
	FallbackAction string         `gorm:"size:64;default:reject" json:"fallback_action"` // reject, fallback_service, cached_response
	FallbackConfig string         `gorm:"type:text" json:"fallback_config"`
}
