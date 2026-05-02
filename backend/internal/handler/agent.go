package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type AgentHandler struct {
	DB *gorm.DB
}

// =================== Agent CRUD ===================

func (h *AgentHandler) ListAgents(c *gin.Context) {
	var agents []model.Agent
	query := h.DB

	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var total int64
	query.Model(&model.Agent{}).Count(&total)
	query.Order("usage_count DESC, created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&agents)

	c.JSON(http.StatusOK, gin.H{"data": agents, "total": total, "page": page, "page_size": pageSize})
}

func (h *AgentHandler) GetAgent(c *gin.Context) {
	var agent model.Agent
	if err := h.DB.First(&agent, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}
	c.JSON(http.StatusOK, agent)
}

func (h *AgentHandler) CreateAgent(c *gin.Context) {
	var agent model.Agent
	if err := c.ShouldBindJSON(&agent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	agent.Status = "active"
	if err := h.DB.Create(&agent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create agent"})
		return
	}
	c.JSON(http.StatusCreated, agent)
}

func (h *AgentHandler) UpdateAgent(c *gin.Context) {
	var agent model.Agent
	if err := h.DB.First(&agent, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}
	if err := c.ShouldBindJSON(&agent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&agent)
	c.JSON(http.StatusOK, agent)
}

func (h *AgentHandler) DeleteAgent(c *gin.Context) {
	if err := h.DB.Delete(&model.Agent{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete agent"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Agent deleted"})
}

func (h *AgentHandler) ToggleAgent(c *gin.Context) {
	var agent model.Agent
	if err := h.DB.First(&agent, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}
	if agent.Status == "active" {
		agent.Status = "inactive"
	} else {
		agent.Status = "active"
	}
	h.DB.Save(&agent)
	c.JSON(http.StatusOK, agent)
}

// =================== Agent Templates (from open source) ===================

func (h *AgentHandler) ListTemplates(c *gin.Context) {
	var templates []model.AgentTemplate
	query := h.DB

	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Order("stars DESC, downloads DESC").Find(&templates)
	c.JSON(http.StatusOK, gin.H{"data": templates})
}

func (h *AgentHandler) GetTemplate(c *gin.Context) {
	var template model.AgentTemplate
	if err := h.DB.First(&template, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}
	c.JSON(http.StatusOK, template)
}

func (h *AgentHandler) InstallTemplate(c *gin.Context) {
	var template model.AgentTemplate
	if err := h.DB.First(&template, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	// Create agent from template
	agent := model.Agent{
		Name:         template.Name,
		Avatar:       template.Avatar,
		Description:  template.Description,
		SystemPrompt: template.SystemPrompt,
		Category:     template.Category,
		Tags:         template.Tags,
		Provider:     template.Provider,
		IsBuiltin:    true,
		Source:       template.Source,
		Version:      template.Version,
		Status:       "active",
		Temperature:  0.7,
		MaxTokens:    4096,
		TopP:         0.9,
		TenantID:     1,
	}
	if err := h.DB.Create(&agent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to install agent"})
		return
	}

	// Increment downloads
	h.DB.Model(&template).Update("downloads", template.Downloads+1)

	c.JSON(http.StatusCreated, gin.H{"message": "Agent installed successfully", "agent": agent})
}

func (h *AgentHandler) SyncTemplates(c *gin.Context) {
	// Simulate syncing from open-source repos (in production, this would fetch from GitHub/registry)
	templates := []model.AgentTemplate{
		{Name: "Claude Assistant", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=claude", Description: "A helpful AI assistant powered by Claude's reasoning capabilities. Excels at analysis, writing, and complex problem-solving.", Category: "assistant", Tags: "general,reasoning,analysis", Provider: "anthropic", Source: "https://github.com/anthropics/claude-prompts", Author: "Anthropic", Stars: 15200, Downloads: 89000, Version: "3.5", IsOfficial: true},
		{Name: "DeepSeek Coder", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=deepseek", Description: "Expert code generation and debugging agent. Supports 50+ programming languages with deep understanding of software architecture.", Category: "coding", Tags: "code,debug,review,architecture", Provider: "deepseek", Source: "https://github.com/deepseek-ai/DeepSeek-Coder", Author: "DeepSeek AI", Stars: 12800, Downloads: 67000, Version: "2.5", IsOfficial: true},
		{Name: "Qwen Writer", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=qwen", Description: "Professional content creation agent for articles, copywriting, and creative writing. Supports both English and Chinese.", Category: "writing", Tags: "writing,creative,copywriting,bilingual", Provider: "qwen", Source: "https://github.com/QwenLM/Qwen", Author: "Alibaba Cloud", Stars: 9800, Downloads: 45000, Version: "2.5", IsOfficial: true},
		{Name: "Data Analyst Pro", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=analyst", Description: "Advanced data analysis agent with statistical reasoning, visualization suggestions, and insight extraction capabilities.", Category: "analysis", Tags: "data,statistics,visualization,insights", Provider: "openai", Source: "https://github.com/openai/openai-cookbook", Author: "Community", Stars: 7600, Downloads: 34000, Version: "1.2", IsOfficial: false},
		{Name: "Creative Director", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=creative", Description: "AI-powered creative brainstorming agent for marketing campaigns, brand strategy, and visual concept development.", Category: "creative", Tags: "marketing,branding,design,strategy", Provider: "openai", Source: "https://github.com/ai-creative-tools/director", Author: "Community", Stars: 5400, Downloads: 23000, Version: "1.0", IsOfficial: false},
		{Name: "Customer Service Bot", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=support", Description: "Intelligent customer service agent with multi-language support, FAQ handling, and ticket escalation workflows.", Category: "customer_service", Tags: "support,faq,tickets,multilingual", Provider: "qwen", Source: "https://github.com/service-bots/cs-agent", Author: "Community", Stars: 4200, Downloads: 19000, Version: "2.0", IsOfficial: false},
		{Name: "Research Scholar", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=scholar", Description: "Academic research assistant for literature review, paper summarization, and citation management.", Category: "analysis", Tags: "research,academic,papers,citations", Provider: "anthropic", Source: "https://github.com/research-tools/scholar-agent", Author: "Community", Stars: 6100, Downloads: 28000, Version: "1.5", IsOfficial: false},
		{Name: "DevOps Engineer", Avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=devops", Description: "Infrastructure automation agent for CI/CD pipelines, Kubernetes deployments, and cloud resource management.", Category: "coding", Tags: "devops,k8s,ci-cd,infrastructure", Provider: "deepseek", Source: "https://github.com/devops-agents/infra-bot", Author: "Community", Stars: 3800, Downloads: 15000, Version: "1.1", IsOfficial: false},
	}

	for _, t := range templates {
		var existing model.AgentTemplate
		if h.DB.Where("name = ?", t.Name).First(&existing).Error != nil {
			h.DB.Create(&t)
		} else {
			h.DB.Model(&existing).Updates(t)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Templates synced", "count": len(templates)})
}

// =================== Agent Stats ===================

func (h *AgentHandler) GetAgentStats(c *gin.Context) {
	var totalAgents, activeAgents, builtinAgents int64
	h.DB.Model(&model.Agent{}).Count(&totalAgents)
	h.DB.Model(&model.Agent{}).Where("status = ?", "active").Count(&activeAgents)
	h.DB.Model(&model.Agent{}).Where("is_builtin = ?", true).Count(&builtinAgents)

	var totalTemplates int64
	h.DB.Model(&model.AgentTemplate{}).Count(&totalTemplates)

	c.JSON(http.StatusOK, gin.H{
		"total_agents":    totalAgents,
		"active_agents":   activeAgents,
		"builtin_agents":  builtinAgents,
		"custom_agents":   totalAgents - builtinAgents,
		"total_templates": totalTemplates,
	})
}
