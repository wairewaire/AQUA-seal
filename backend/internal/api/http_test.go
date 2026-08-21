package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
	"github.com/wairewaire/aqua-seal/backend/internal/repository"
	"github.com/wairewaire/aqua-seal/backend/internal/security"
	"github.com/wairewaire/aqua-seal/backend/internal/services"
)

func TestRootAndHealthRoutes(t *testing.T) {
	handler := NewHandler(services.NewBatchService(repository.NewMemoryRepository()))
	for _, path := range []string{"/", "/health"} {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, path, nil))
		if recorder.Code != http.StatusOK {
			t.Fatalf("GET %s returned %d, want %d", path, recorder.Code, http.StatusOK)
		}
	}
}

func TestPublicVerificationIsPrivacyFiltered(t *testing.T) {
	repo := repository.NewMemoryRepository()
	service := services.NewBatchService(repo)
	batch, err := service.Create(services.CreateBatchInput{Species: models.Species{ID: "tilapia", CommonName: "Tilapia"}, LandingSite: models.LandingSite{ID: "dunga", Name: "Dunga Beach", County: "Kisumu"}, BoatID: "BOAT-1", WeightKg: 12, HarvestMethod: "wild"})
	if err != nil {
		t.Fatal(err)
	}
	batch.HandlingEvents[0].ActorRole = models.RoleFisher
	batch.HandlingEvents[0].Notes = stringPtr("fisherman John Otieno +254700000000")
	if err := repo.SaveBatch(batch); err != nil {
		t.Fatal(err)
	}
	handler := NewHandler(service)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/verify/"+batch.ID, nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d", recorder.Code)
	}
	body := recorder.Body.String()
	for _, forbidden := range []string{"fisherman", "John Otieno", "+254700000000", "actorId", "actor_id", "actorRole", "eventHash", "metadata"} {
		if strings.Contains(body, forbidden) {
			t.Fatalf("public response contains %q: %s", forbidden, body)
		}
	}
	var payload map[string]interface{}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"batch_code", "species", "landing_site", "landing_time", "harvest_method", "status", "freshness", "checklist"} {
		if _, ok := payload[key]; !ok {
			t.Fatalf("missing public key %q", key)
		}
	}
	if len(payload) != 8 {
		t.Fatalf("public payload has %d keys, want 8", len(payload))
	}
}

func TestAuthenticatedBatchViewsAndTraceRoutes(t *testing.T) {
	service := services.NewBatchService(repository.NewMemoryRepository())
	batch, err := service.Create(services.CreateBatchInput{Species: models.Species{ID: "tilapia", CommonName: "Tilapia"}, LandingSite: models.LandingSite{ID: "dunga", Name: "Dunga Beach", County: "Kisumu"}, BoatID: "BOAT-1", WeightKg: 12, HarvestMethod: "wild"})
	if err != nil {
		t.Fatal(err)
	}
	handler := NewHandler(service)
	for _, path := range []string{"/api/v1/batches/" + batch.ID, "/api/v1/batches/" + batch.ID + "/trace"} {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, path, nil))
		if recorder.Code != http.StatusOK {
			t.Fatalf("GET %s status = %d", path, recorder.Code)
		}
	}
	recorder := httptest.NewRecorder()
	body := []byte(`{"species":{"id":"perch","commonName":"Nile Perch"},"landingSite":{"id":"dunga","name":"Dunga Beach","county":"Kisumu"},"boatId":"BOAT-1","weightKg":10,"harvestMethod":"wild"}`)
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/api/v1/batches", bytes.NewReader(body)))
	if recorder.Code != http.StatusCreated {
		t.Fatalf("POST batch status = %d", recorder.Code)
	}
}

func stringPtr(value string) *string { return &value }

func TestDashboardRoutesRequireRoleAndReturnScopedData(t *testing.T) {
	repo := repository.NewMemoryRepository()
	batchService := services.NewBatchService(repo)
	_, err := batchService.Create(services.CreateBatchInput{Species: models.Species{ID: "tilapia", CommonName: "Tilapia"}, LandingSite: models.LandingSite{ID: "site-a", Name: "Site A", BMUID: "bmu-a"}, BoatID: "boat-a", WeightKg: 10, HarvestMethod: "wild"})
	if err != nil {
		t.Fatal(err)
	}
	dashboard := services.NewDashboardService(repo, nil)
	handler := NewHandlerWithDashboards(batchService, nil, nil, nil, dashboard)
	unauthenticated := httptest.NewRecorder()
	handler.ServeHTTP(unauthenticated, httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil))
	if unauthenticated.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated status = %d", unauthenticated.Code)
	}
	request := httptest.NewRequest(http.MethodGet, "/api/v1/bmu/dashboard", nil)
	request = request.WithContext(security.WithClaims(request.Context(), security.Claims{Role: "bmu_clerk", BMUID: "bmu-a"}))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), `"today_catches":1`) {
		t.Fatalf("BMU dashboard response: %d %s", recorder.Code, recorder.Body.String())
	}
}

func TestMarketplaceRoutes(t *testing.T) {
	batchService := services.NewBatchService(repository.NewMemoryRepository())
	marketplace := services.NewMarketplaceService()
	handler := NewHandlerWithMarketplace(batchService, nil, nil, nil, nil, marketplace)
	listingBody := bytes.NewBufferString(`{"batchId":"SKABC123","priceKesPerKg":450,"quantityKg":20}`)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/api/v1/marketplace/listings", listingBody))
	if recorder.Code != http.StatusCreated {
		t.Fatalf("listing status = %d", recorder.Code)
	}
	var listing models.MarketplaceListing
	if err := json.Unmarshal(recorder.Body.Bytes(), &listing); err != nil {
		t.Fatal(err)
	}
	purchaseBody := bytes.NewBufferString(`{"listingId":"` + listing.ID + `","buyerUserId":"buyer-1"}`)
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/api/v1/purchase-requests", purchaseBody))
	if recorder.Code != http.StatusCreated || !strings.Contains(recorder.Body.String(), `"status":"agreed"`) {
		t.Fatalf("purchase response: %d %s", recorder.Code, recorder.Body.String())
	}
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/marketplace", nil))
	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), `"status":"sold"`) {
		t.Fatalf("marketplace response: %d %s", recorder.Code, recorder.Body.String())
	}
}
