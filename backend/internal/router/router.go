package router

import (
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/gpustack"
	"github.com/stacklane/stacklane/internal/handler"
	"github.com/stacklane/stacklane/internal/middleware"
	"github.com/stacklane/stacklane/internal/ws"
)

func Setup(db *gorm.DB, jwtSecret string, hub *ws.Hub, gpuClient *gpustack.Client, syncSvc *gpustack.SyncService) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORS())

	authHandler := &handler.AuthHandler{DB: db, JWTSecret: jwtSecret}
	dashHandler := &handler.DashboardHandler{DB: db}
	svcHandler := &handler.ServiceHandler{DB: db}
	modelHandler := &handler.ModelHandler{DB: db}
	clusterHandler := &handler.ClusterHandler{DB: db}
	eventHandler := &handler.EventHandler{DB: db}
	policyHandler := &handler.PolicyHandler{DB: db}
	gpuHandler := &handler.GPUHandler{DB: db, GPUStackClient: gpuClient, SyncService: syncSvc}
	runtimeHandler := &handler.RuntimeHandler{DB: db}
	trafficHandler := &handler.TrafficHandler{DB: db}
	tenantHandler := &handler.TenantHandler{DB: db}
	systemHandler := &handler.SystemHandler{DB: db, StartTime: time.Now()}
	difyHandler := &handler.DifyHandler{DB: db}
	agentHandler := &handler.AgentHandler{DB: db}
	channelHandler := &handler.ChannelHandler{DB: db}
	skillHandler := &handler.SkillHandler{DB: db}

	// Public routes
	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/register", authHandler.Register)
		api.GET("/auth/password-policy", authHandler.GetPasswordPolicy)
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "service": "stacklane", "version": "1.0.0"})
		})
	}

	// Protected routes
	protected := r.Group("/api/v1")
	protected.Use(middleware.JWTAuth(jwtSecret))
	{
		// User
		protected.GET("/auth/profile", authHandler.GetProfile)
		protected.PUT("/auth/password", authHandler.ChangePassword)

		// Dashboard
		protected.GET("/dashboard/stats", dashHandler.GetStats)
		protected.GET("/dashboard/events", dashHandler.GetRecentEvents)
		protected.GET("/dashboard/alerts", dashHandler.GetAlerts)

		// =================== GPU Management ===================
		// GPU Devices
		protected.GET("/gpus", gpuHandler.ListGPUs)
		protected.GET("/gpus/:id", gpuHandler.GetGPUDetail)
		protected.GET("/gpus/:id/metrics", gpuHandler.GetGPUMetrics)
		protected.GET("/gpus/pool/summary", gpuHandler.GetPoolSummary)
		protected.GET("/gpus/scheduling/available", gpuHandler.GetGPUSchedulingInfo)

		// GPU Nodes (Worker Machines)
		protected.GET("/gpu-nodes", gpuHandler.GetGPUNodes)
		protected.GET("/gpu-nodes/:id", gpuHandler.GetGPUNodeDetail)

		// GPUStack Integration
		protected.POST("/gpustack/sync", gpuHandler.SyncFromGPUStack)
		protected.GET("/gpustack/status", gpuHandler.GetGPUStackStatus)
		protected.GET("/gpustack/workers", gpuHandler.GetGPUStackWorkers)
		protected.GET("/gpustack/models", gpuHandler.GetGPUStackModels)
		protected.GET("/gpustack/instances", gpuHandler.GetGPUStackInstances)
		protected.GET("/gpustack/resources", gpuHandler.GetGPUStackResourceSummary)

		// =================== Model Management ===================

		protected.GET("/models", modelHandler.List)
		protected.GET("/models/:id", modelHandler.Get)
		protected.POST("/models", modelHandler.Create)
		protected.PUT("/models/:id", modelHandler.Update)
		protected.DELETE("/models/:id", modelHandler.Delete)
		protected.POST("/models/import/huggingface", modelHandler.ImportFromHuggingFace)
		protected.GET("/models/:id/versions", modelHandler.ListVersions)
		protected.POST("/models/:id/versions", modelHandler.CreateVersion)
		protected.GET("/models/compatibility", modelHandler.GetCompatibilityMatrix)

		protected.POST("/models/deploy", modelHandler.DeployModel)
		protected.GET("/models/deployments", modelHandler.ListDeployments)

		// =================== Runtime Hub ===================
		protected.GET("/runtimes", runtimeHandler.ListRuntimes)
		protected.GET("/runtimes/:id", runtimeHandler.GetRuntime)
		protected.POST("/runtimes", runtimeHandler.CreateRuntime)
		protected.PUT("/runtimes/:id", runtimeHandler.UpdateRuntime)
		protected.DELETE("/runtimes/:id", runtimeHandler.DeleteRuntime)
		protected.GET("/runtimes/compatibility", runtimeHandler.GetRuntimeCompatibility)

		// =================== Services ===================
		protected.GET("/services", svcHandler.List)
		protected.GET("/services/:id", svcHandler.Get)
		protected.POST("/services", svcHandler.Create)
		protected.PUT("/services/:id", svcHandler.Update)
		protected.DELETE("/services/:id", svcHandler.Delete)

		// =================== Clusters ===================
		protected.GET("/clusters", clusterHandler.ListClusters)
		protected.GET("/clusters/:id", clusterHandler.GetCluster)
		protected.GET("/nodes", clusterHandler.ListNodes)
		protected.GET("/nodes/:id", clusterHandler.GetNode)

		// =================== Events & Policies ===================
		protected.GET("/events", eventHandler.List)
		protected.GET("/policies", policyHandler.List)
		protected.POST("/policies", policyHandler.Create)
		protected.PUT("/policies/:id", policyHandler.Update)
		protected.DELETE("/policies/:id", policyHandler.Delete)

		// =================== Traffic Management ===================
		// Traffic Rules
		protected.GET("/traffic/rules", trafficHandler.ListRules)
		protected.GET("/traffic/rules/:id", trafficHandler.GetRule)
		protected.POST("/traffic/rules", trafficHandler.CreateRule)
		protected.PUT("/traffic/rules/:id", trafficHandler.UpdateRule)
		protected.DELETE("/traffic/rules/:id", trafficHandler.DeleteRule)
		protected.POST("/traffic/rules/:id/toggle", trafficHandler.ToggleRule)

		// A/B Testing
		protected.GET("/traffic/ab-tests", trafficHandler.ListABTests)
		protected.GET("/traffic/ab-tests/:id", trafficHandler.GetABTest)
		protected.POST("/traffic/ab-tests", trafficHandler.CreateABTest)
		protected.PUT("/traffic/ab-tests/:id", trafficHandler.UpdateABTest)
		protected.POST("/traffic/ab-tests/:id/start", trafficHandler.StartABTest)
		protected.POST("/traffic/ab-tests/:id/stop", trafficHandler.StopABTest)
		protected.DELETE("/traffic/ab-tests/:id", trafficHandler.DeleteABTest)

		// Rate Limiting
		protected.GET("/traffic/rate-limits", trafficHandler.ListRateLimits)
		protected.POST("/traffic/rate-limits", trafficHandler.CreateRateLimit)
		protected.PUT("/traffic/rate-limits/:id", trafficHandler.UpdateRateLimit)
		protected.DELETE("/traffic/rate-limits/:id", trafficHandler.DeleteRateLimit)

		// Circuit Breaker
		protected.GET("/traffic/circuit-breakers", trafficHandler.ListCircuitBreakers)
		protected.POST("/traffic/circuit-breakers", trafficHandler.CreateCircuitBreaker)
		protected.PUT("/traffic/circuit-breakers/:id", trafficHandler.UpdateCircuitBreaker)
		protected.DELETE("/traffic/circuit-breakers/:id", trafficHandler.DeleteCircuitBreaker)
		protected.POST("/traffic/circuit-breakers/:id/reset", trafficHandler.ResetCircuitBreaker)

		// Traffic Stats
		protected.GET("/traffic/stats", trafficHandler.GetTrafficStats)

		// =================== Tenant Management ===================
		protected.GET("/tenants", tenantHandler.ListTenants)
		protected.GET("/tenants/stats", tenantHandler.GetTenantStats)
		protected.GET("/tenants/:id", tenantHandler.GetTenant)
		protected.POST("/tenants", tenantHandler.CreateTenant)
		protected.PUT("/tenants/:id", tenantHandler.UpdateTenant)
		protected.DELETE("/tenants/:id", tenantHandler.DeleteTenant)
		protected.GET("/tenants/:id/quota", tenantHandler.GetQuota)
		protected.PUT("/tenants/:id/quota", tenantHandler.UpdateQuota)
		protected.GET("/tenants/:id/members", tenantHandler.ListMembers)
		protected.POST("/tenants/:id/members", tenantHandler.AddMember)
		protected.DELETE("/tenants/:id/members/:member_id", tenantHandler.RemoveMember)
		protected.PUT("/tenants/:id/members/:member_id/role", tenantHandler.UpdateMemberRole)

		// =================== System Settings ===================
		protected.GET("/system/info", systemHandler.GetSystemInfo)
		protected.GET("/system/config", systemHandler.GetConfig)
		protected.GET("/system/config/:category", systemHandler.GetConfigByCategory)
		protected.PUT("/system/config", systemHandler.UpdateConfig)
		protected.PUT("/system/config/batch", systemHandler.BatchUpdateConfig)
		protected.DELETE("/system/config/:key", systemHandler.DeleteConfig)
		protected.GET("/system/notifications", systemHandler.GetNotificationSettings)
		protected.PUT("/system/notifications", systemHandler.UpdateNotificationSettings)
		protected.GET("/system/audit-logs", systemHandler.GetAuditLogs)
		protected.GET("/system/backup", systemHandler.GetBackupStatus)
		protected.POST("/system/backup", systemHandler.TriggerBackup)

		// =================== Dify Integration ===================
		protected.GET("/dify/connection", difyHandler.GetConnection)
		protected.POST("/dify/connection", difyHandler.ConfigureConnection)
		protected.POST("/dify/connection/test", difyHandler.TestConnection)
		protected.DELETE("/dify/connection", difyHandler.Disconnect)
		protected.GET("/dify/apps", difyHandler.ListApps)
		protected.GET("/dify/apps/:id", difyHandler.GetApp)
		protected.POST("/dify/apps/sync", difyHandler.SyncApps)
		protected.GET("/dify/workflows", difyHandler.ListWorkflows)
		protected.GET("/dify/workflows/:id", difyHandler.GetWorkflow)
		protected.POST("/dify/workflows", difyHandler.CreateWorkflow)
		protected.PUT("/dify/workflows/:id", difyHandler.UpdateWorkflow)
		protected.DELETE("/dify/workflows/:id", difyHandler.DeleteWorkflow)
		protected.POST("/dify/workflows/:id/run", difyHandler.RunWorkflow)
		protected.GET("/dify/executions", difyHandler.ListExecutions)
		protected.GET("/dify/stats", difyHandler.GetStats)

		// =================== Agent Management ===================
		protected.GET("/agents", agentHandler.ListAgents)
		protected.GET("/agents/stats", agentHandler.GetAgentStats)
		protected.GET("/agents/:id", agentHandler.GetAgent)
		protected.POST("/agents", agentHandler.CreateAgent)
		protected.PUT("/agents/:id", agentHandler.UpdateAgent)
		protected.DELETE("/agents/:id", agentHandler.DeleteAgent)
		protected.POST("/agents/:id/toggle", agentHandler.ToggleAgent)
		protected.GET("/agents/templates", agentHandler.ListTemplates)
		protected.GET("/agents/templates/:id", agentHandler.GetTemplate)
		protected.POST("/agents/templates/:id/install", agentHandler.InstallTemplate)
		protected.POST("/agents/templates/sync", agentHandler.SyncTemplates)

		// =================== Channel Management ===================
		protected.GET("/channels", channelHandler.ListChannels)
		protected.GET("/channels/stats", channelHandler.GetChannelStats)
		protected.GET("/channels/types", channelHandler.GetSupportedTypes)
		protected.GET("/channels/:id", channelHandler.GetChannel)
		protected.POST("/channels", channelHandler.CreateChannel)
		protected.PUT("/channels/:id", channelHandler.UpdateChannel)
		protected.DELETE("/channels/:id", channelHandler.DeleteChannel)
		protected.POST("/channels/:id/connect", channelHandler.ConnectChannel)
		protected.POST("/channels/:id/disconnect", channelHandler.DisconnectChannel)
		protected.POST("/channels/:id/test", channelHandler.TestChannel)
		protected.POST("/channels/:id/bind-agent", channelHandler.BindAgent)
		protected.GET("/channels/:id/messages", channelHandler.ListMessages)

		// =================== Skill Management ===================
		protected.GET("/skills", skillHandler.ListSkills)
		protected.GET("/skills/stats", skillHandler.GetSkillStats)
		protected.GET("/skills/:id", skillHandler.GetSkill)
		protected.POST("/skills", skillHandler.CreateSkill)
		protected.PUT("/skills/:id", skillHandler.UpdateSkill)
		protected.DELETE("/skills/:id", skillHandler.DeleteSkill)
		protected.POST("/skills/:id/toggle", skillHandler.ToggleSkill)
		protected.POST("/skills/:id/execute", skillHandler.ExecuteSkill)
		protected.GET("/skills/executions", skillHandler.ListExecutions)
		protected.POST("/skills/sync", skillHandler.SyncBuiltinSkills)
	}

	// WebSocket
	r.GET("/ws", hub.HandleWS)

	return r
}
