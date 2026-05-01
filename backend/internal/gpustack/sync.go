package gpustack

import (
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

// SyncService periodically syncs data from GPUStack into local DB
type SyncService struct {
	Client *Client
	DB     *gorm.DB
}

func NewSyncService(client *Client, db *gorm.DB) *SyncService {
	return &SyncService{Client: client, DB: db}
}

// SyncWorkers pulls GPUStack workers and updates local GPU nodes/devices
func (s *SyncService) SyncWorkers() error {
	workers, err := s.Client.GetWorkers()
	if err != nil {
		return fmt.Errorf("fetching workers: %w", err)
	}

	for _, w := range workers {
		// Upsert GPU Node
		node := model.GPUNode{}
		result := s.DB.Where("host = ?", w.IP).First(&node)
		if result.Error != nil {
			node = model.GPUNode{
				Name:      w.Name,
				Host:      w.IP,
				GPUCount:  len(w.GPUDevices),
				Status:    w.Status,
			}
			if len(w.GPUDevices) > 0 {
				node.GPUType = w.GPUDevices[0].Name
				node.GPUMemory = int(w.GPUDevices[0].MemoryTotal / (1024 * 1024)) // to MB
			}
			s.DB.Create(&node)
		} else {
			node.Status = w.Status
			node.GPUCount = len(w.GPUDevices)
			s.DB.Save(&node)
		}

		// Sync GPU devices
		for _, gpu := range w.GPUDevices {
			device := model.GPUDevice{}
			result := s.DB.Where("node_id = ? AND gpu_index = ?", node.ID, gpu.Index).First(&device)
			if result.Error != nil {
				device = model.GPUDevice{
					NodeID:        node.ID,
					GPUIndex:      gpu.Index,
					Name:          gpu.Name,
					Vendor:        gpu.Vendor,
					GPUType:       extractGPUType(gpu.Name),
					VRAMTotal:     int(gpu.MemoryTotal / (1024 * 1024)),
					VRAMUsed:      int(gpu.MemoryUsed / (1024 * 1024)),
					Utilization:   gpu.GPUUtilization,
					Temperature:   gpu.Temperature,
					PowerDraw:     int(gpu.PowerDraw),
					PowerLimit:    int(gpu.PowerLimit),
					DriverVersion: gpu.DriverVersion,
					CUDAVersion:   gpu.CUDAVersion,
					Status:        determineGPUStatus(gpu.GPUUtilization),
				}
				s.DB.Create(&device)
			} else {
				device.VRAMUsed = int(gpu.MemoryUsed / (1024 * 1024))
				device.Utilization = gpu.GPUUtilization
				device.Temperature = gpu.Temperature
				device.PowerDraw = int(gpu.PowerDraw)
				device.Status = determineGPUStatus(gpu.GPUUtilization)
				s.DB.Save(&device)
			}

			// Record metric
			metric := model.GPUMetric{
				NodeID:      node.ID,
				DeviceID:    device.ID,
				Timestamp:   time.Now(),
				Utilization: gpu.GPUUtilization,
				VRAMUsed:    int(gpu.MemoryUsed / (1024 * 1024)),
				Temperature: gpu.Temperature,
				PowerDraw:   int(gpu.PowerDraw),
			}
			s.DB.Create(&metric)
		}
	}
	return nil
}

// SyncModels pulls models from GPUStack and syncs to local model catalog
func (s *SyncService) SyncModels() error {
	models, err := s.Client.GetModels()
	if err != nil {
		return fmt.Errorf("fetching models: %w", err)
	}

	for _, m := range models {
		asset := model.ModelAsset{}
		result := s.DB.Where("name = ? AND runtime = ?", m.Name, m.BackendEngine).First(&asset)
		if result.Error != nil {
			asset = model.ModelAsset{
				Name:        m.Name,
				Runtime:     m.BackendEngine,
				Status:      mapGPUStackStatus(m.Status),
				Description: fmt.Sprintf("Source: %s, URL: %s", m.Source, m.SourceURL),
			}
			s.DB.Create(&asset)
		} else {
			asset.Status = mapGPUStackStatus(m.Status)
			s.DB.Save(&asset)
		}
	}
	return nil
}

// StartPeriodicSync runs sync every interval
func (s *SyncService) StartPeriodicSync(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			if err := s.SyncWorkers(); err != nil {
				log.Printf("[GPUStack Sync] worker sync error: %v", err)
			}
			if err := s.SyncModels(); err != nil {
				log.Printf("[GPUStack Sync] model sync error: %v", err)
			}
			log.Printf("[GPUStack Sync] completed at %v", time.Now().Format(time.RFC3339))
		}
	}()
}

func extractGPUType(name string) string {
	// Extract GPU type from full name e.g. "NVIDIA A100-SXM4-80GB" -> "A100"
	types := []string{"H100", "H200", "A100", "A800", "L40S", "L40", "RTX 4090", "RTX 3090", "V100", "T4"}
	for _, t := range types {
		if len(name) >= len(t) {
			for i := 0; i <= len(name)-len(t); i++ {
				if name[i:i+len(t)] == t {
					return t
				}
			}
		}
	}
	return name
}

func determineGPUStatus(utilization float64) string {
	if utilization > 90 {
		return "in_use"
	} else if utilization > 0 {
		return "in_use"
	}
	return "available"
}

func mapGPUStackStatus(status string) string {
	switch status {
	case "running":
		return "running"
	case "pending", "scheduling":
		return "deploying"
	case "error":
		return "error"
	default:
		return "available"
	}
}
