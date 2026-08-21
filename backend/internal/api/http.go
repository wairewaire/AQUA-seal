package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/wairewaire/aqua-seal/backend/internal/repository"
	"github.com/wairewaire/aqua-seal/backend/internal/security"
	"github.com/wairewaire/aqua-seal/backend/internal/services"
)

type Handler struct {
	batches     *services.BatchService
	trace       *services.TraceabilityService
	dashboard   *services.DashboardService
	marketplace *services.MarketplaceService
}

type USSDHandler struct{ ussd *services.USSDService }
type HealthHandler struct{ dbCheck func() error }

func NewFoundationHandler(dbCheck func() error) http.Handler {
	h := &HealthHandler{dbCheck: dbCheck}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", h.root)
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("GET /health/db", h.healthDB)
	return mux
}

func NewHandler(batches *services.BatchService) http.Handler {
	return NewHandlerWithUSSDTrace(batches, nil, nil, nil)
}

func NewHandlerWithUSSD(batches *services.BatchService, ussd *services.USSDService, dbCheck func() error) http.Handler {
	return NewHandlerWithUSSDTrace(batches, ussd, dbCheck, nil)
}

func NewHandlerWithUSSDTrace(batches *services.BatchService, ussd *services.USSDService, dbCheck func() error, trace *services.TraceabilityService) http.Handler {
	return (&Handler{batches: batches, trace: trace}).routes(ussd, dbCheck)
}

func NewHandlerWithDashboards(batches *services.BatchService, ussd *services.USSDService, dbCheck func() error, trace *services.TraceabilityService, dashboard *services.DashboardService) http.Handler {
	h := &Handler{batches: batches, trace: trace, dashboard: dashboard}
	return h.routes(ussd, dbCheck)
}

func NewHandlerWithMarketplace(batches *services.BatchService, ussd *services.USSDService, dbCheck func() error, trace *services.TraceabilityService, dashboard *services.DashboardService, marketplace *services.MarketplaceService) http.Handler {
	h := &Handler{batches: batches, trace: trace, dashboard: dashboard, marketplace: marketplace}
	return h.routes(ussd, dbCheck)
}

func (h *Handler) routes(ussd *services.USSDService, dbCheck func() error) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", h.root)
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("GET /health/db", (&HealthHandler{dbCheck: dbCheck}).healthDB)
	mux.HandleFunc("GET /api/v1/batches", h.listBatches)
	mux.HandleFunc("POST /api/v1/batches", h.createBatch)
	mux.HandleFunc("GET /api/v1/verify/", h.verify)
	mux.HandleFunc("GET /api/v1/batches/", h.batch)
	if h.dashboard != nil {
		mux.HandleFunc("GET /api/v1/bmu/dashboard", h.bmuDashboard)
		mux.HandleFunc("GET /api/v1/admin/dashboard", h.adminDashboard)
	}
	if h.marketplace != nil {
		mux.HandleFunc("GET /api/v1/marketplace", h.marketplaceList)
		mux.HandleFunc("POST /api/v1/marketplace/listings", h.marketplaceListing)
		mux.HandleFunc("POST /api/v1/purchase-requests", h.purchaseRequest)
	}
	if ussd != nil {
		mux.HandleFunc("POST /api/v1/ussd", (&USSDHandler{ussd: ussd}).handle)
	}
	return mux
}

func (h *Handler) marketplaceList(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.marketplace.List())
}
func (h *Handler) marketplaceListing(w http.ResponseWriter, r *http.Request) {
	var input services.CreateListingInput
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid JSON"})
		return
	}
	listing, err := h.marketplace.CreateListing(input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid listing"})
		return
	}
	writeJSON(w, http.StatusCreated, listing)
}
func (h *Handler) purchaseRequest(w http.ResponseWriter, r *http.Request) {
	var input services.CreatePurchaseInput
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid JSON"})
		return
	}
	purchase, err := h.marketplace.RequestPurchase(input)
	if errors.Is(err, services.ErrListingNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"code": "not_found", "message": "listing not found"})
		return
	}
	if errors.Is(err, services.ErrListingUnavailable) {
		writeJSON(w, http.StatusConflict, map[string]string{"code": "unavailable", "message": "listing is not available"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid purchase request"})
		return
	}
	writeJSON(w, http.StatusCreated, purchase)
}

func (h *Handler) bmuDashboard(w http.ResponseWriter, r *http.Request) {
	claims, ok := security.ClaimsFromContext(r.Context())
	if !ok {
		http.Error(w, "authentication required", http.StatusUnauthorized)
		return
	}
	if claims.Role != "bmu_clerk" && claims.Role != "admin" {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	writeJSON(w, http.StatusOK, h.dashboard.Build(claims.BMUID))
}
func (h *Handler) adminDashboard(w http.ResponseWriter, r *http.Request) {
	claims, ok := security.ClaimsFromContext(r.Context())
	if !ok {
		http.Error(w, "authentication required", http.StatusUnauthorized)
		return
	}
	if claims.Role != "admin" {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	writeJSON(w, http.StatusOK, h.dashboard.Build(""))
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func (h *Handler) root(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"service": "aqua-seal-api", "status": "ok", "health": "/health"})
}
func (h *HealthHandler) root(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"service": "aqua-seal-api", "status": "ok", "health": "/health"})
}
func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
func (h *HealthHandler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
func (h *HealthHandler) healthDB(w http.ResponseWriter, _ *http.Request) {
	if h.dbCheck == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable", "message": "database is not configured"})
		return
	}
	if err := h.dbCheck(); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable", "message": "database check failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *USSDHandler) handle(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	response, err := h.ussd.Handle(r.Context(), services.USSDRequest{SessionID: r.FormValue("sessionId"), PhoneNumber: r.FormValue("phoneNumber"), Text: r.FormValue("text")})
	if err != nil {
		http.Error(w, response, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte(response))
}

func (h *Handler) listBatches(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.batches.List())
}
func (h *Handler) createBatch(w http.ResponseWriter, r *http.Request) {
	var input services.CreateBatchInput
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid JSON"})
		return
	}
	batch, err := h.batches.Create(input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid batch"})
		return
	}
	writeJSON(w, http.StatusCreated, batch)
}
func (h *Handler) verify(w http.ResponseWriter, r *http.Request) {
	result, err := h.batches.Verify(strings.TrimPrefix(r.URL.Path, "/api/v1/verify/"))
	if errors.Is(err, repository.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"code": "not_found", "message": "batch not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid batch"})
		return
	}
	writeJSON(w, http.StatusOK, result)
}
func (h *Handler) batch(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/v1/batches/"), "/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		writeJSON(w, http.StatusNotFound, nil)
		return
	}
	id := parts[0]
	if len(parts) == 2 && parts[1] == "events" && r.Method == http.MethodPost {
		var input services.AddEventInput
		if json.NewDecoder(r.Body).Decode(&input) != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid JSON"})
			return
		}
		batch, err := h.batches.AddEvent(id, input)
		if errors.Is(err, repository.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"code": "not_found", "message": "batch not found"})
			return
		}
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"code": "validation_error", "message": "invalid event"})
			return
		}
		writeJSON(w, http.StatusOK, batch)
		return
	}
	batch, err := h.batches.Get(id)
	if errors.Is(err, repository.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"code": "not_found", "message": "batch not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"code": "internal_error", "message": "could not load batch"})
		return
	}
	if len(parts) == 2 && parts[1] == "trace" {
		if h.trace == nil {
			writeJSON(w, http.StatusOK, batch.HandlingEvents)
			return
		}
		if err := h.trace.Verify(id); err != nil {
			writeJSON(w, http.StatusConflict, map[string]string{"code": "tampered_trace", "message": "trace verification failed"})
			return
		}
		events, err := h.trace.Events(id)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"code": "internal_error", "message": "could not load trace"})
			return
		}
		writeJSON(w, http.StatusOK, events)
		return
	}
	writeJSON(w, http.StatusOK, batch)
}
