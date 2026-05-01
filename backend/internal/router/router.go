package router

import (
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

	// Public routes
	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/register", authHandler.Register)
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
		// Model Catalog & Lifecycle
		protected.GET("/models", modelHandler.List)
		protected.GET("/models/:id", modelHandler.Get)
		protected.POST("/models", modelHandler.Create)
		protected.PUT("/models/:id", modelHandler.Update)
		protected.DELETE("/models/:id", modelHandler.Delete)
		protected.POST("/models/import/huggingface", modelHandler.ImportFromHuggingFace)
		protected.GET("/models/:id/versions", modelHandler.ListVersions)
		protected.POST("/models/:id/versions", modelHandler.CreateVersion)
		protected.GET("/models/compatibility", modelHandler.GetCompatibilityMatrix)

		// Model Deployments
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
	}

	// WebSocket
	r.GET("/ws", hub.HandleWS)

	return r
}
