package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
	"github.com/wairewaire/aqua-seal/backend/internal/repository"
)

var ErrInvalid = errors.New("invalid input")

type BatchService struct {
	repo  repository.BatchRepository
	trace *TraceabilityService
}

func NewBatchService(repo repository.BatchRepository) *BatchService { return &BatchService{repo: repo} }
func NewBatchServiceWithTrace(repo repository.BatchRepository, trace *TraceabilityService) *BatchService {
	return &BatchService{repo: repo, trace: trace}
}

type CreateBatchInput struct {
	Species       models.Species
	LandingSite   models.LandingSite
	BoatID        string
	WeightKg      float64
	HarvestMethod string
}
type AddEventInput struct {
	Type      models.EventType `json:"type"`
	Location  string           `json:"location"`
	Notes     *string          `json:"notes"`
	ActorRole models.UserRole  `json:"actorRole"`
}

func normalizeID(id string) string { return strings.ToUpper(strings.Join(strings.Fields(id), "")) }
func (s *BatchService) Get(id string) (models.FishBatch, error) {
	return s.repo.GetBatch(normalizeID(id))
}
func (s *BatchService) List() []models.FishBatch { return s.repo.ListBatches() }

func (s *BatchService) Create(input CreateBatchInput) (models.FishBatch, error) {
	return s.createWithID(input, "")
}

func (s *BatchService) CreateWithCode(input CreateBatchInput, code string) (models.FishBatch, error) {
	return s.createWithID(input, code)
}

func (s *BatchService) createWithID(input CreateBatchInput, code string) (models.FishBatch, error) {
	if input.WeightKg <= 0 || input.BoatID == "" || input.Species.ID == "" || input.LandingSite.ID == "" {
		return models.FishBatch{}, ErrInvalid
	}
	now := time.Now().UTC()
	if code == "" {
		code = fmt.Sprintf("LV-%d", now.UnixNano()%1000000)
	}
	batch := models.FishBatch{ID: code, BatchCode: code, Species: input.Species, LandingSite: input.LandingSite, BoatID: input.BoatID, WeightKg: input.WeightKg, HarvestMethod: input.HarvestMethod, LandedAt: now, Freshness: "grade_a", Status: models.BatchLanded, Verification: "unverified", CreatedAt: now, UpdatedAt: now}
	batch.HandlingEvents = append(batch.HandlingEvents, s.event(batch, models.EventLanded, "Batch recorded at landing.", ""))
	if s.trace != nil {
		registered := s.event(batch, models.EventCatchRegistered, "Catch registered.", "")
		registered.PreviousHash = ""
		registered.EventHash = ""
		if err := s.trace.Append(registered); err != nil {
			return models.FishBatch{}, err
		}
		landed := batch.HandlingEvents[0]
		landed.PreviousHash = ""
		landed.EventHash = ""
		if err := s.trace.Append(landed); err != nil {
			return models.FishBatch{}, err
		}
	}
	return batch, s.repo.SaveBatch(batch)
}

func (s *BatchService) event(batch models.FishBatch, eventType models.EventType, notes, location string) models.TraceEvent {
	now := time.Now().UTC()
	previous := ""
	if len(batch.HandlingEvents) > 0 {
		previous = batch.HandlingEvents[len(batch.HandlingEvents)-1].EventHash
	}
	event := models.TraceEvent{ID: fmt.Sprintf("evt_%s_%d", batch.ID, now.UnixNano()), BatchID: batch.ID, Type: eventType, OccurredAt: now, Location: location, ActorRole: models.RoleBMUOfficer, PreviousHash: previous, Notes: &notes}
	event.EventHash = CanonicalEventHash(event)
	return event
}

func (s *BatchService) AddEvent(id string, input AddEventInput) (models.FishBatch, error) {
	batch, err := s.Get(id)
	if err != nil {
		return models.FishBatch{}, err
	}
	if input.Type == "" || input.Location == "" {
		return models.FishBatch{}, ErrInvalid
	}
	event := s.event(batch, input.Type, "", input.Location)
	event.Notes = input.Notes
	event.ActorRole = input.ActorRole
	if event.ActorRole == "" {
		event.ActorRole = models.RoleBMUOfficer
	}
	if s.trace != nil {
		traceEvent := event
		traceEvent.PreviousHash = ""
		traceEvent.EventHash = ""
		if err := s.trace.Append(traceEvent); err != nil {
			return models.FishBatch{}, err
		}
	}
	event.EventHash = CanonicalEventHash(event)
	batch.HandlingEvents = append(batch.HandlingEvents, event)
	batch.UpdatedAt = time.Now().UTC()
	if input.Type == models.EventInspected {
		batch.Status = models.BatchVerified
		batch.Verification = "verified"
	}
	return batch, s.repo.SaveBatch(batch)
}

func (s *BatchService) Verify(id string) (models.PublicVerification, error) {
	batch, err := s.Get(id)
	if err != nil {
		return models.PublicVerification{}, err
	}
	checklist := models.VerificationChecklist{}
	for _, event := range batch.HandlingEvents {
		switch event.Type { case models.EventCatchRegistered: checklist.CatchRegistered = true; case models.EventLanded: checklist.Landed = true; case models.EventInspected: checklist.Inspected = true; case models.EventIced: checklist.ColdStorageRecorded = true }
	}
	status := "VERIFIED"; if !checklist.Inspected { status = "NEEDS_REVIEW" }; if batch.Status == models.BatchExpired { status = "EXPIRED" }
	freshness := batch.Freshness; switch batch.Freshness { case "grade_a": freshness = "excellent"; case "grade_b": freshness = "good"; case "grade_c": freshness = "fair"; case "spoiled": freshness = "poor" }
	return models.PublicVerification{BatchCode: batch.BatchCode, Species: batch.Species.CommonName, LandingSite: batch.LandingSite.Name + ", " + batch.LandingSite.County, LandingTime: batch.LandedAt, HarvestMethod: batch.HarvestMethod, Status: status, Freshness: freshness, Checklist: checklist}, nil
}
