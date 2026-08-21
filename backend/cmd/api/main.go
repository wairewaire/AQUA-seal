package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/api"
	"github.com/wairewaire/aqua-seal/backend/internal/config"
	"github.com/wairewaire/aqua-seal/backend/internal/database"
	"github.com/wairewaire/aqua-seal/backend/internal/repository"
	"github.com/wairewaire/aqua-seal/backend/internal/services"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)
	var dbCheck func() error
	batchRepo := repository.NewMemoryRepository()
	traceRepo := services.NewMemoryTraceEventRepository()
	traceService := services.NewTraceabilityService(traceRepo)
	batchService := services.NewBatchServiceWithTrace(batchRepo, traceService)
	var sessionRepo services.SessionRepository = services.NewMemorySessionRepository()
	if cfg.DatabaseURL != "" {
		pool, err := database.Connect(context.Background(), cfg.DatabaseURL)
		if err != nil {
			logger.Error("database connection failed", "error", err)
			os.Exit(1)
		}
		defer pool.Close()
		sessionRepo = repository.NewUSSDSessionRepository(pool)
		dbCheck = func() error {
			return database.Ping(context.Background(), pool)
		}
		if err := database.PingWithRetry(context.Background(), pool, 10, time.Second); err != nil {
			logger.Error("database ping failed", "error", err)
			os.Exit(1)
		}
		logger.Info("postgres connection ready")
	}
	ussdService := services.NewUSSDService(sessionRepo, batchService, nil)
	dashboardService := services.NewDashboardService(batchRepo, traceService)
	marketplaceService := services.NewMarketplaceService()
	logger.Info("api listening", "address", cfg.HTTPAddr)
	if err := http.ListenAndServe(cfg.HTTPAddr, api.NewHandlerWithMarketplace(batchService, ussdService, dbCheck, traceService, dashboardService, marketplaceService)); err != nil {
		logger.Error("api stopped", "error", err)
		os.Exit(1)
	}
}
