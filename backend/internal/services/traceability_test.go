package services

import (
	"testing"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

func TestTraceHashChainAndTamperDetection(t *testing.T) {
	repo := NewMemoryTraceEventRepository()
	service := NewTraceabilityService(repo)
	first := models.TraceEvent{ID: "event-1", BatchID: "SKABC123", Type: models.EventCatchRegistered, OccurredAt: time.Unix(1, 0).UTC(), ActorRole: models.RoleFisher}
	second := models.TraceEvent{ID: "event-2", BatchID: first.BatchID, Type: models.EventLanded, OccurredAt: time.Unix(2, 0).UTC(), ActorRole: models.RoleFisher, Location: "Dunga Beach"}
	if err := service.Append(first); err != nil {
		t.Fatal(err)
	}
	if err := service.Append(second); err != nil {
		t.Fatal(err)
	}
	if err := service.Verify(first.BatchID); err != nil {
		t.Fatal(err)
	}
	events, _ := repo.List(first.BatchID)
	if events[1].PreviousHash != events[0].EventHash {
		t.Fatal("event chain is not linked")
	}
	repo.MutateForTest(first.BatchID, 0, func(event *models.TraceEvent) { event.Location = "Tampered landing site" })
	if err := service.Verify(first.BatchID); err != ErrTamperedTrace {
		t.Fatalf("verification error = %v, want tamper error", err)
	}
}
