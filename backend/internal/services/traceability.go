package services

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

var ErrTamperedTrace = errors.New("trace event hash chain verification failed")

type TraceEventRepository interface {
	Append(models.TraceEvent) error
	List(string) ([]models.TraceEvent, error)
}

type MemoryTraceEventRepository struct {
	events map[string][]models.TraceEvent
}

func NewMemoryTraceEventRepository() *MemoryTraceEventRepository {
	return &MemoryTraceEventRepository{events: make(map[string][]models.TraceEvent)}
}
func (r *MemoryTraceEventRepository) Append(event models.TraceEvent) error {
	for _, existing := range r.events[event.BatchID] {
		if existing.ID == event.ID {
			return errors.New("trace event already exists")
		}
	}
	r.events[event.BatchID] = append(r.events[event.BatchID], event)
	return nil
}
func (r *MemoryTraceEventRepository) List(batchID string) ([]models.TraceEvent, error) {
	return append([]models.TraceEvent(nil), r.events[batchID]...), nil
}
func (r *MemoryTraceEventRepository) MutateForTest(batchID string, index int, mutate func(*models.TraceEvent)) {
	mutate(&r.events[batchID][index])
}

type TraceabilityService struct{ repo TraceEventRepository }

func NewTraceabilityService(repo TraceEventRepository) *TraceabilityService {
	return &TraceabilityService{repo: repo}
}

func CanonicalEventHash(event models.TraceEvent) string {
	canonical := struct {
		ID, BatchID  string
		Type         models.EventType
		OccurredAt   time.Time
		Location     string
		ActorRole    models.UserRole
		Notes        *string
		Metadata     map[string]interface{}
		PreviousHash string
	}{event.ID, event.BatchID, event.Type, event.OccurredAt.UTC(), event.Location, event.ActorRole, event.Notes, event.Metadata, event.PreviousHash}
	payload, _ := json.Marshal(canonical)
	sum := sha256.Sum256(payload)
	return hex.EncodeToString(sum[:])
}
func (s *TraceabilityService) Append(event models.TraceEvent) error {
	events, err := s.repo.List(event.BatchID)
	if err != nil {
		return err
	}
	previous := ""
	if len(events) > 0 {
		previous = events[len(events)-1].EventHash
	}
	if event.PreviousHash == "" {
		event.PreviousHash = previous
	}
	if event.PreviousHash != previous {
		return fmt.Errorf("previous hash mismatch")
	}
	event.EventHash = CanonicalEventHash(event)
	return s.repo.Append(event)
}
func (s *TraceabilityService) Events(batchID string) ([]models.TraceEvent, error) {
	return s.repo.List(batchID)
}
func (s *TraceabilityService) Verify(batchID string) error {
	events, err := s.repo.List(batchID)
	if err != nil {
		return err
	}
	previous := ""
	for _, event := range events {
		if event.PreviousHash != previous || event.EventHash != CanonicalEventHash(event) {
			return ErrTamperedTrace
		}
		previous = event.EventHash
	}
	return nil
}
