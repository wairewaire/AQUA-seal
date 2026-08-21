package services

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

const (
	StepMenu        = "menu"
	StepBoat        = "boat"
	StepSpecies     = "species"
	StepWeight      = "weight"
	StepMethod      = "method"
	StepLandingSite = "landing_site"
	StepConfirm     = "confirm"
)

type SessionRepository interface {
	Get(context.Context, string) (models.USSDSession, error)
	Save(context.Context, models.USSDSession) error
}
type MemorySessionRepository struct {
	mu       sync.RWMutex
	sessions map[string]models.USSDSession
}

func NewMemorySessionRepository() *MemorySessionRepository {
	return &MemorySessionRepository{sessions: map[string]models.USSDSession{}}
}
func (r *MemorySessionRepository) Get(_ context.Context, id string) (models.USSDSession, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	session, ok := r.sessions[id]
	if !ok || time.Now().After(session.ExpiresAt) {
		return models.USSDSession{}, errors.New("session not found")
	}
	return session, nil
}
func (r *MemorySessionRepository) Save(_ context.Context, session models.USSDSession) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.sessions[session.SessionID] = session
	return nil
}

type USSDBatchCreator interface {
	CreateWithCode(CreateBatchInput, string) (models.FishBatch, error)
}
type USSDService struct {
	sessions      SessionRepository
	batches       USSDBatchCreator
	notifications NotificationProvider
	now           func() time.Time
}

func NewUSSDService(sessions SessionRepository, batches USSDBatchCreator, notifications NotificationProvider) *USSDService {
	return &USSDService{sessions: sessions, batches: batches, notifications: notifications, now: time.Now}
}

type USSDRequest struct {
	SessionID   string
	PhoneNumber string
	Text        string
}

func GenerateBatchCode() (string, error) {
	alphabet := "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
	result := make([]byte, 6)
	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", err
		}
		result[i] = alphabet[n.Int64()]
	}
	return "SK" + string(result), nil
}

func (s *USSDService) Handle(ctx context.Context, request USSDRequest) (string, error) {
	if request.SessionID == "" || request.PhoneNumber == "" {
		return "END Invalid session.", ErrInvalid
	}
	session, err := s.sessions.Get(ctx, request.SessionID)
	if err != nil {
		session = models.USSDSession{SessionID: request.SessionID, PhoneNumber: request.PhoneNumber, CurrentStep: StepMenu, TempData: map[string]interface{}{}, ExpiresAt: s.now().Add(15 * time.Minute)}
	}
	inputs := strings.Split(request.Text, "*")
	input := ""
	if len(inputs) > 0 {
		input = strings.TrimSpace(strings.ReplaceAll(inputs[len(inputs)-1], "+", " "))
	}
	if request.Text == "" {
		return s.reply(session, StepMenu, "CON Welcome to Aqua-seal\n1. Register Catch\n2. My Batches\n3. Update Batch\n4. My Sales\n5. Help")
	}
	dispatch := map[string]func(context.Context, models.USSDSession, string) (string, error){StepMenu: s.menuStep, StepBoat: s.boatStep, StepSpecies: s.speciesStep, StepWeight: s.weightStep, StepMethod: s.methodStep, StepLandingSite: s.landingSiteStep, StepConfirm: s.confirmStep}
	step, ok := dispatch[session.CurrentStep]
	if !ok {
		return "END Session expired.", nil
	}
	return step(ctx, session, input)
}

func (s *USSDService) reply(session models.USSDSession, next, response string) (string, error) {
	session.CurrentStep = next
	if err := s.sessions.Save(context.Background(), session); err != nil {
		return "END Service unavailable.", err
	}
	return response, nil
}
func (s *USSDService) menuStep(_ context.Context, session models.USSDSession, input string) (string, error) {
	if input != "1" {
		return "END Only catch registration is available.", nil
	}
	return s.reply(session, StepBoat, "CON Enter boat registration number:")
}
func (s *USSDService) boatStep(_ context.Context, session models.USSDSession, input string) (string, error) {
	if input == "" {
		return "CON Enter boat registration number:", nil
	}
	session.TempData["boat_id"] = input
	return s.reply(session, StepSpecies, "CON Select species:\n1. Tilapia\n2. Nile Perch\n3. Other")
}
func (s *USSDService) speciesStep(_ context.Context, session models.USSDSession, input string) (string, error) {
	names := map[string]string{"1": "Tilapia", "2": "Nile Perch", "3": "Other"}
	species, ok := names[input]
	if !ok {
		return "CON Select species:\n1. Tilapia\n2. Nile Perch\n3. Other", nil
	}
	session.TempData["species"] = species
	return s.reply(session, StepWeight, "CON Enter weight in KG:")
}
func (s *USSDService) weightStep(_ context.Context, session models.USSDSession, input string) (string, error) {
	weight, err := strconv.ParseFloat(input, 64)
	if err != nil || weight <= 0 {
		return "CON Enter a valid weight in KG:", nil
	}
	session.TempData["weight_kg"] = weight
	return s.reply(session, StepMethod, "CON Harvest method:\n1. Wild\n2. Cage")
}
func (s *USSDService) methodStep(_ context.Context, session models.USSDSession, input string) (string, error) {
	methods := map[string]string{"1": "wild", "2": "cage"}
	method, ok := methods[input]
	if !ok {
		return "CON Select 1 for Wild or 2 for Cage:", nil
	}
	session.TempData["harvest_method"] = method
	return s.reply(session, StepLandingSite, "CON Enter landing site:")
}
func (s *USSDService) landingSiteStep(_ context.Context, session models.USSDSession, input string) (string, error) {
	if input == "" {
		return "CON Enter landing site:", nil
	}
	session.TempData["landing_site"] = input
	return s.reply(session, StepConfirm, fmt.Sprintf("CON Confirm catch: %s KG %s at %s?\n1. Confirm\n2. Cancel", session.TempData["weight_kg"], session.TempData["species"], input))
}
func (s *USSDService) confirmStep(ctx context.Context, session models.USSDSession, input string) (string, error) {
	if input != "1" {
		return "END Catch registration cancelled.", nil
	}
	code, err := GenerateBatchCode()
	if err != nil {
		return "END Could not create batch.", err
	}
	weight, _ := session.TempData["weight_kg"].(float64)
	batch, err := s.batches.CreateWithCode(CreateBatchInput{Species: models.Species{ID: strings.ToLower(fmt.Sprint(session.TempData["species"])), CommonName: fmt.Sprint(session.TempData["species"])}, LandingSite: models.LandingSite{ID: fmt.Sprint(session.TempData["landing_site"]), Name: fmt.Sprint(session.TempData["landing_site"])}, BoatID: fmt.Sprint(session.TempData["boat_id"]), WeightKg: weight, HarvestMethod: fmt.Sprint(session.TempData["harvest_method"])}, code)
	if err != nil {
		return "END Could not register catch.", err
	}
	if s.notifications != nil {
		_ = s.notifications.SendSMS(ctx, session.PhoneNumber, "Aqua-seal catch registered. Batch ID: "+batch.ID)
	}
	return "END Catch registered. Your Batch ID is " + batch.ID, nil
}
