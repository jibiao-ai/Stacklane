package gpustack

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client interfaces with GPUStack API (https://docs.gpustack.ai/)
type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

// NewClient creates a GPUStack API client
func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		BaseURL: baseURL,
		APIKey:  apiKey,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Worker represents a GPUStack worker node
type Worker struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Hostname       string          `json:"hostname"`
	IP             string          `json:"ip"`
	Status         string          `json:"status"`
	StatusMessage  string          `json:"status_message"`
	GPUDevices     []GPUDeviceInfo `json:"gpu_devices"`
	CPUCount       int             `json:"cpu_count"`
	MemoryTotal    int64           `json:"memory_total"`
	MemoryUsed     int64           `json:"memory_used"`
	OS             string          `json:"os"`
	Architecture   string          `json:"architecture"`
	Labels         map[string]string `json:"labels"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// GPUDeviceInfo from GPUStack worker
type GPUDeviceInfo struct {
	ID                string  `json:"id"`
	Name              string  `json:"name"`
	Vendor            string  `json:"vendor"`
	Index             int     `json:"index"`
	MemoryTotal       int64   `json:"memory_total"`
	MemoryUsed        int64   `json:"memory_used"`
	MemoryUtilization float64 `json:"memory_utilization"`
	GPUUtilization    float64 `json:"gpu_utilization"`
	Temperature       int     `json:"temperature"`
	PowerDraw         float64 `json:"power_draw"`
	PowerLimit        float64 `json:"power_limit"`
	DriverVersion     string  `json:"driver_version"`
	CUDAVersion       string  `json:"cuda_version"`
}

// Model from GPUStack
type Model struct {
	ID            string            `json:"id"`
	Name          string            `json:"name"`
	Source        string            `json:"source"`
	SourceURL     string            `json:"source_url"`
	Replicas      int               `json:"replicas"`
	ReadyReplicas int               `json:"ready_replicas"`
	BackendEngine string            `json:"backend"`
	GPUSelector   map[string]string `json:"gpu_selector"`
	Status        string            `json:"status"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
}

// ModelInstance represents a running model instance
type ModelInstance struct {
	ID         string    `json:"id"`
	ModelID    string    `json:"model_id"`
	ModelName  string    `json:"model_name"`
	WorkerID   string    `json:"worker_id"`
	WorkerName string    `json:"worker_name"`
	GPUIndexes []int     `json:"gpu_indexes"`
	Port       int       `json:"port"`
	Status     string    `json:"status"`
	ComputedGPU []string `json:"computed_gpu"`
	CreatedAt  time.Time `json:"created_at"`
}

// ListResponse is a paginated response
type ListResponse[T any] struct {
	Items      []T `json:"items"`
	Pagination struct {
		Page     int `json:"page"`
		PageSize int `json:"perPage"`
		Total    int `json:"total"`
	} `json:"pagination"`
}

func (c *Client) doRequest(method, path string, body io.Reader) (*http.Response, error) {
	url := fmt.Sprintf("%s%s", c.BaseURL, path)
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.APIKey))
	req.Header.Set("Content-Type", "application/json")
	return c.HTTPClient.Do(req)
}

func (c *Client) GetWorkers() ([]Worker, error) {
	resp, err := c.doRequest("GET", "/api/v1/workers", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gpustack API error: %d", resp.StatusCode)
	}
	var result ListResponse[Worker]
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding workers: %w", err)
	}
	return result.Items, nil
}

func (c *Client) GetWorker(id string) (*Worker, error) {
	resp, err := c.doRequest("GET", fmt.Sprintf("/api/v1/workers/%s", id), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gpustack API error: %d", resp.StatusCode)
	}
	var worker Worker
	if err := json.NewDecoder(resp.Body).Decode(&worker); err != nil {
		return nil, err
	}
	return &worker, nil
}

func (c *Client) GetModels() ([]Model, error) {
	resp, err := c.doRequest("GET", "/api/v1/models", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gpustack API error: %d", resp.StatusCode)
	}
	var result ListResponse[Model]
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding models: %w", err)
	}
	return result.Items, nil
}

func (c *Client) GetModelInstances(modelID string) ([]ModelInstance, error) {
	path := "/api/v1/model-instances"
	if modelID != "" {
		path = fmt.Sprintf("%s?model_id=%s", path, modelID)
	}
	resp, err := c.doRequest("GET", path, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gpustack API error: %d", resp.StatusCode)
	}
	var result ListResponse[ModelInstance]
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding instances: %w", err)
	}
	return result.Items, nil
}

type GPUResourceSummary struct {
	TotalGPUs      int     `json:"total_gpus"`
	AvailableGPUs  int     `json:"available_gpus"`
	TotalVRAM      int64   `json:"total_vram_gb"`
	UsedVRAM       int64   `json:"used_vram_gb"`
	AvgUtilization float64 `json:"avg_utilization"`
	TotalWorkers   int     `json:"total_workers"`
	ActiveWorkers  int     `json:"active_workers"`
}

func (c *Client) GetResourceSummary() (*GPUResourceSummary, error) {
	workers, err := c.GetWorkers()
	if err != nil {
		return nil, err
	}
	summary := &GPUResourceSummary{TotalWorkers: len(workers)}
	var totalUtil float64
	var gpuCount int
	for _, w := range workers {
		if w.Status == "active" {
			summary.ActiveWorkers++
		}
		for _, gpu := range w.GPUDevices {
			gpuCount++
			summary.TotalGPUs++
			summary.TotalVRAM += gpu.MemoryTotal / (1024 * 1024 * 1024)
			summary.UsedVRAM += gpu.MemoryUsed / (1024 * 1024 * 1024)
			totalUtil += gpu.GPUUtilization
			if gpu.GPUUtilization < 50 {
				summary.AvailableGPUs++
			}
		}
	}
	if gpuCount > 0 {
		summary.AvgUtilization = totalUtil / float64(gpuCount)
	}
	return summary, nil
}

type HealthStatus struct {
	Status    string `json:"status"`
	Version   string `json:"version"`
	Uptime    int64  `json:"uptime_seconds"`
	Connected bool   `json:"connected"`
}

func (c *Client) GetHealth() (*HealthStatus, error) {
	resp, err := c.doRequest("GET", "/api/v1/health", nil)
	if err != nil {
		return &HealthStatus{Status: "disconnected", Connected: false}, nil
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return &HealthStatus{Status: "error", Connected: false}, nil
	}
	return &HealthStatus{Status: "healthy", Connected: true}, nil
}
