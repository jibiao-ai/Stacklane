package main

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/config"
	"github.com/stacklane/stacklane/internal/model"
	"github.com/stacklane/stacklane/internal/router"
	"github.com/stacklane/stacklane/internal/ws"
)

func main() {
	cfg := config.Load()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate
	db.AutoMigrate(
		&model.User{},
		&model.Tenant{},
		&model.GPUNode{},
		&model.Cluster{},
		&model.ModelAsset{},
		&model.Service{},
		&model.Deployment{},
		&model.Event{},
		&model.Policy{},
		&model.Alert{},
	)

	// Seed default tenant
	db.FirstOrCreate(&model.Tenant{}, model.Tenant{Name: "default"})

	// WebSocket hub
	hub := ws.NewHub()
	go hub.Run()

	// Setup router
	r := router.Setup(db, cfg.JWTSecret, hub)

	log.Printf("Stacklane API server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
