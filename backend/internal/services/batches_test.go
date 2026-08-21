package services

import (
	"testing"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
	"github.com/wairewaire/aqua-seal/backend/internal/repository"
)

func testInput() CreateBatchInput {
	return CreateBatchInput{Species: models.Species{ID: "sp_tilapia", CommonName: "Nile Tilapia"}, LandingSite: models.LandingSite{ID: "site_dombo", Name: "Dunga Beach", County: "Kisumu"}, BoatID: "boat_01", WeightKg: 12.5, HarvestMethod: "gillnet"}
}

func TestCreateAndVerifyBatch(t *testing.T) {
	service := NewBatchService(repository.NewMemoryRepository())
	batch, err := service.Create(testInput())
	if err != nil {
		t.Fatal(err)
	}
	if len(batch.HandlingEvents) != 1 || batch.HandlingEvents[0].EventHash == "" {
		t.Fatal("expected a hashed landing event")
	}
	verified, err := service.Verify(batch.ID)
	if err != nil {
		t.Fatal(err)
	}
	if verified.BatchCode != batch.ID || verified.Checklist.Landed != true {
		t.Fatalf("unexpected public verification: %+v", verified)
	}
}

func TestAddEventChainsHashAndUpdatesStatus(t *testing.T) {
	service := NewBatchService(repository.NewMemoryRepository())
	batch, _ := service.Create(testInput())
	updated, err := service.AddEvent(batch.ID, AddEventInput{Type: models.EventInspected, Location: "Dunga BMU"})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Status != models.BatchVerified {
		t.Fatalf("status = %s", updated.Status)
	}
	if updated.HandlingEvents[1].PreviousHash != updated.HandlingEvents[0].EventHash {
		t.Fatal("event chain is broken")
	}
}
