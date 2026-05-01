.PHONY: help dev build up down logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev-backend: ## Run backend in development mode
	cd backend && go run cmd/main.go

dev-frontend: ## Run frontend in development mode
	cd frontend && npm run dev

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View service logs
	docker-compose logs -f

clean: ## Remove all containers and volumes
	docker-compose down -v --remove-orphans

status: ## Show service status
	docker-compose ps
