package services

import (
	"context"
	"strings"
	"testing"

	"github.com/wairewaire/aqua-seal/backend/internal/repository"
)

type recordingNotifier struct {
	phone   string
	message string
}

func (n *recordingNotifier) SendSMS(_ context.Context, phone, message string) error {
	n.phone, n.message = phone, message
	return nil
}

func TestGenerateBatchCodeIsTypoResistant(t *testing.T) {
	code, err := GenerateBatchCode()
	if err != nil {
		t.Fatal(err)
	}
	if len(code) != 8 || !strings.HasPrefix(code, "SK") {
		t.Fatalf("code = %q", code)
	}
	if strings.ContainsAny(code, "01IO") {
		t.Fatalf("code contains ambiguous character: %q", code)
	}
}

func TestUSSDFullCatchRegistration(t *testing.T) {
	repo := repository.NewMemoryRepository()
	batches := NewBatchService(repo)
	notifier := &recordingNotifier{}
	service := NewUSSDService(NewMemorySessionRepository(), batches, notifier)
	ctx := context.Background()
	request := func(text string) string {
		response, err := service.Handle(ctx, USSDRequest{SessionID: "session-1", PhoneNumber: "+254700000001", Text: text})
		if err != nil {
			t.Fatal(err)
		}
		return response
	}
	checks := []struct{ text, prefix string }{
		{"", "CON Welcome"}, {"1", "CON Enter boat"}, {"1*BOAT-1", "CON Select species"}, {"1*BOAT-1*1", "CON Enter weight"}, {"1*BOAT-1*1*32", "CON Harvest method"}, {"1*BOAT-1*1*32*1", "CON Enter landing"}, {"1*BOAT-1*1*32*1*Dunga+Beach", "CON Confirm catch"},
	}
	for _, check := range checks {
		if response := request(check.text); !strings.HasPrefix(response, check.prefix) {
			t.Fatalf("text %q response %q, want prefix %q", check.text, response, check.prefix)
		}
	}
	response := request("1*BOAT-1*1*32*1*Dunga+Beach*1")
	if !strings.HasPrefix(response, "END Catch registered. Your Batch ID is SK") {
		t.Fatalf("final response = %q", response)
	}
	if notifier.phone != "+254700000001" || !strings.Contains(notifier.message, "Batch ID: SK") {
		t.Fatalf("SMS not sent: %+v", notifier)
	}
	list := batches.List()
	if len(list) != 1 || list[0].BatchCode == "" {
		t.Fatalf("batches = %+v", list)
	}
}

func TestUSSDInvalidWeightDoesNotAdvance(t *testing.T) {
	service := NewUSSDService(NewMemorySessionRepository(), NewBatchService(repository.NewMemoryRepository()), nil)
	ctx := context.Background()
	for _, text := range []string{"", "1", "1*BOAT-1", "1*BOAT-1*1"} {
		if _, err := service.Handle(ctx, USSDRequest{SessionID: "session-2", PhoneNumber: "+254700000002", Text: text}); err != nil {
			t.Fatal(err)
		}
	}
	response, err := service.Handle(ctx, USSDRequest{SessionID: "session-2", PhoneNumber: "+254700000002", Text: "1*BOAT-1*1*zero"})
	if err != nil {
		t.Fatal(err)
	}
	if response != "CON Enter a valid weight in KG:" {
		t.Fatalf("response = %q", response)
	}
}
