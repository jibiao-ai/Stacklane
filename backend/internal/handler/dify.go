package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type DifyHandler struct {
	DB *gorm.DB
}

// =================== Dify Connection ===================

func (h *DifyHandler) GetConnection(c *gin.Context) {
	var config model.DifyConfig
	if err := h.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"connected": false,
			"message":   "Dify not configured",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"connected":    config.Status == "connected",
		"endpoint":     config.Endpoint,
		"version":      config.Version,
		"status":       config.Status,
		"last_sync":    config.LastSyncAt,
		"app_count":    config.AppCount,
		"workflow_count": config.WorkflowCount,
	})
}

func (h *DifyHandler) ConfigureConnection(c *gin.Context) {
	var req struct {
		Endpoint string `json:"endpoint" binding:"required"`
		APIKey   string `json:"api_key" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Test connection
	client := &http.Client{Timeout: 10 * time.Second}
	httpReq, _ := http.NewRequest("GET", req.Endpoint+"/v1/apps", nil)
	httpReq.Header.Set("Authorization", "Bearer "+req.APIKey)

	var status, version string
	resp, err := client.Do(httpReq)
	if err != nil {
		status = "error"
		version = "unknown"
	} else {
		defer resp.Body.Close()
		if resp.StatusCode == 200 {
			status = "connected"
			version = resp.Header.Get("X-Dify-Version")
			if version == "" {
				version = "0.6+"
			}
		} else {
			status = "auth_failed"
			version = "unknown"
		}
	}

	// Save config
	var config model.DifyConfig
	result := h.DB.First(&config)
	if result.Error != nil {
		config = model.DifyConfig{
			Endpoint: req.Endpoint,
			APIKey:   req.APIKey,
			Status:   status,
			Version:  version,
		}
		h.DB.Create(&config)
	} else {
		config.Endpoint = req.Endpoint
		config.APIKey = req.APIKey
		config.Status = status
		config.Version = version
		h.DB.Save(&config)
	}

	c.JSON(http.StatusOK, gin.H{
		"connected": status == "connected",
		"status":    status,
		"version":   version,
		"endpoint":  req.Endpoint,
	})
}

func (h *DifyHandler) TestConnection(c *gin.Context) {
	var config model.DifyConfig
	if err := h.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dify not configured"})
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", config.Endpoint+"/v1/apps", nil)
	req.Header.Set("Authorization", "Bearer "+config.APIKey)

	resp, err := client.Do(req)
	if err != nil {
		config.Status = "error"
		h.DB.Save(&config)
		c.JSON(http.StatusOK, gin.H{"connected": false, "error": err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		config.Status = "connected"
		h.DB.Save(&config)
		c.JSON(http.StatusOK, gin.H{"connected": true, "status": "connected"})
	} else {
		config.Status = "auth_failed"
		h.DB.Save(&config)
		c.JSON(http.StatusOK, gin.H{"connected": false, "status": "auth_failed", "http_code": resp.StatusCode})
	}
}

func (h *DifyHandler) Disconnect(c *gin.Context) {
	h.DB.Where("1 = 1").Delete(&model.DifyConfig{})
	c.JSON(http.StatusOK, gin.H{"message": "Dify disconnected"})
}

// =================== Dify Apps ===================

func (h *DifyHandler) ListApps(c *gin.Context) {
	var apps []model.DifyApp
	query := h.DB.Order("created_at DESC")

	if appType := c.Query("type"); appType != "" {
		query = query.Where("app_type = ?", appType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.DifyApp{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&apps)

	c.JSON(http.StatusOK, gin.H{
		"data":      apps,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *DifyHandler) GetApp(c *gin.Context) {
	id := c.Param("id")
	var app model.DifyApp
	if err := h.DB.First(&app, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "app not found"})
		return
	}
	c.JSON(http.StatusOK, app)
}

func (h *DifyHandler) SyncApps(c *gin.Context) {
	var config model.DifyConfig
	if err := h.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dify not configured"})
		return
	}

	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequest("GET", config.Endpoint+"/v1/apps?limit=100", nil)
	req.Header.Set("Authorization", "Bearer "+config.APIKey)

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to connect to Dify: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Dify API error: %d - %s", resp.StatusCode, string(body))})
		return
	}

	var result struct {
		Data []struct {
			ID          string `json:"id"`
			Name        string `json:"name"`
			Mode        string `json:"mode"`
			Description string `json:"description"`
			ModelConfig struct {
				Model struct {
					Provider string `json:"provider"`
					Name     string `json:"name"`
				} `json:"model"`
			} `json:"model_config"`
		} `json:"data"`
	}

	body, _ := io.ReadAll(resp.Body)
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse Dify response"})
		return
	}

	synced := 0
	for _, app := range result.Data {
		var existing model.DifyApp
		res := h.DB.Where("dify_app_id = ?", app.ID).First(&existing)
		if res.Error != nil {
			newApp := model.DifyApp{
				DifyAppID:   app.ID,
				Name:        app.Name,
				AppType:     app.Mode,
				Description: app.Description,
				ModelName:   app.ModelConfig.Model.Name,
				Provider:    app.ModelConfig.Model.Provider,
				Status:      "active",
			}
			h.DB.Create(&newApp)
		} else {
			existing.Name = app.Name
			existing.AppType = app.Mode
			existing.Description = app.Description
			existing.ModelName = app.ModelConfig.Model.Name
			existing.Provider = app.ModelConfig.Model.Provider
			h.DB.Save(&existing)
		}
		synced++
	}

	// Update config
	now := time.Now()
	config.LastSyncAt = &now
	config.AppCount = synced
	h.DB.Save(&config)

	c.JSON(http.StatusOK, gin.H{
		"message": "apps synced",
		"synced":  synced,
	})
}

// =================== Dify Workflows ===================

func (h *DifyHandler) ListWorkflows(c *gin.Context) {
	var workflows []model.DifyWorkflow
	query := h.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Find(&workflows)
	c.JSON(http.StatusOK, workflows)
}

func (h *DifyHandler) GetWorkflow(c *gin.Context) {
	id := c.Param("id")
	var workflow model.DifyWorkflow
	if err := h.DB.First(&workflow, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})
		return
	}
	c.JSON(http.StatusOK, workflow)
}

func (h *DifyHandler) CreateWorkflow(c *gin.Context) {
	var workflow model.DifyWorkflow
	if err := c.ShouldBindJSON(&workflow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	workflow.Status = "draft"
	if err := h.DB.Create(&workflow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create workflow"})
		return
	}
	c.JSON(http.StatusCreated, workflow)
}

func (h *DifyHandler) UpdateWorkflow(c *gin.Context) {
	id := c.Param("id")
	var workflow model.DifyWorkflow
	if err := h.DB.First(&workflow, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})
		return
	}
	if err := c.ShouldBindJSON(&workflow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&workflow)
	c.JSON(http.StatusOK, workflow)
}

func (h *DifyHandler) DeleteWorkflow(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.DifyWorkflow{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete workflow"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "workflow deleted"})
}

func (h *DifyHandler) RunWorkflow(c *gin.Context) {
	id := c.Param("id")
	var workflow model.DifyWorkflow
	if err := h.DB.First(&workflow, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})
		return
	}

	var req struct {
		Inputs map[string]interface{} `json:"inputs"`
	}
	c.ShouldBindJSON(&req)

	// Create execution record
	execution := model.DifyWorkflowExecution{
		WorkflowID: workflow.ID,
		Status:     "running",
		Inputs:     toJSON(req.Inputs),
	}
	h.DB.Create(&execution)

	c.JSON(http.StatusOK, gin.H{
		"execution_id": execution.ID,
		"status":       "running",
		"workflow":     workflow.Name,
	})
}

func (h *DifyHandler) ListExecutions(c *gin.Context) {
	workflowID := c.Query("workflow_id")
	var executions []model.DifyWorkflowExecution
	query := h.DB.Order("created_at DESC")

	if workflowID != "" {
		query = query.Where("workflow_id = ?", workflowID)
	}

	query.Limit(50).Find(&executions)
	c.JSON(http.StatusOK, executions)
}

// =================== Dify Stats ===================

func (h *DifyHandler) GetStats(c *gin.Context) {
	var appCount int64
	h.DB.Model(&model.DifyApp{}).Count(&appCount)

	var workflowCount int64
	h.DB.Model(&model.DifyWorkflow{}).Count(&workflowCount)

	var executionCount int64
	h.DB.Model(&model.DifyWorkflowExecution{}).Count(&executionCount)

	var runningCount int64
	h.DB.Model(&model.DifyWorkflowExecution{}).Where("status = ?", "running").Count(&runningCount)

	c.JSON(http.StatusOK, gin.H{
		"apps":              appCount,
		"workflows":         workflowCount,
		"total_executions":  executionCount,
		"running_executions": runningCount,
	})
}

func toJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
