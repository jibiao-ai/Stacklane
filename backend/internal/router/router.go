package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/handler"
	"github.com/stacklane/stacklane/internal/middleware"
	"github.com/stacklane/stacklane/internal/ws"
)

func Setup(db *gorm.DB, jwtSecret string, hub *ws.Hub) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORS())

	authHandler := &handler.AuthHandler{DB: db, JWTSecret: jwtSecret}
	dashHandler := &handler.DashboardHandler{DB: db}
	svcHandler := &handler.ServiceHandler{DB: db}
	modelHandler := &handler.ModelHandler{DB: db}
	clusterHandler := &handler.ClusterHandler{DB: db}
	eventHandler := &handler.EventHandler{DB: db}
	policyHandler := &handler.PolicyHandler{DB: db}

	// Public routes
	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/register", authHandler.Register)
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "service": "stacklane"})
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

		// Services
		protected.GET("/services", svcHandler.List)
		protected.GET("/services/:id", svcHandler.Get)
		protected.POST("/services", svcHandler.Create)
		protected.PUT("/services/:id", svcHandler.Update)
		protected.DELETE("/services/:id", svcHandler.Delete)

		// Models
		protected.GET("/models", modelHandler.List)
		protected.GET("/models/:id", modelHandler.Get)
		protected.POST("/models", modelHandler.Create)
		protected.DELETE("/models/:id", modelHandler.Delete)

		// Clusters & Nodes
		protected.GET("/clusters", clusterHandler.ListClusters)
		protected.GET("/clusters/:id", clusterHandler.GetCluster)
		protected.GET("/nodes", clusterHandler.ListNodes)
		protected.GET("/nodes/:id", clusterHandler.GetNode)

		// Events
		protected.GET("/events", eventHandler.List)

		// Policies
		protected.GET("/policies", policyHandler.List)
		protected.POST("/policies", policyHandler.Create)
		protected.PUT("/policies/:id", policyHandler.Update)
		protected.DELETE("/policies/:id", policyHandler.Delete)
	}

	// WebSocket
	r.GET("/ws", hub.HandleWS)

	return r
}
