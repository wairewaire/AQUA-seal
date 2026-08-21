package api

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/wairewaire/aqua-seal/backend/internal/repository"
	"github.com/wairewaire/aqua-seal/backend/internal/services"
)

func TestUSSDWebhookFullSession(t *testing.T) {
	batches := services.NewBatchService(repository.NewMemoryRepository())
	ussd := services.NewUSSDService(services.NewMemorySessionRepository(), batches, nil)
	handler := NewHandlerWithUSSD(batches, ussd, nil)
	texts := []string{"", "1", "1*BOAT-1", "1*BOAT-1*1", "1*BOAT-1*1*32", "1*BOAT-1*1*32*1", "1*BOAT-1*1*32*1*Dunga+Beach", "1*BOAT-1*1*32*1*Dunga+Beach*1"}
	for index, text := range texts {
		form := url.Values{"sessionId": {"http-session"}, "phoneNumber": {"+254700000001"}, "text": {text}}
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodPost, "/api/v1/ussd", strings.NewReader(form.Encode()))
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		handler.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusOK {
			t.Fatalf("step %d status = %d", index, recorder.Code)
		}
		if index == len(texts)-1 && !strings.HasPrefix(recorder.Body.String(), "END Catch registered") {
			t.Fatalf("final response = %q", recorder.Body.String())
		}
	}
	if len(batches.List()) != 1 {
		t.Fatalf("created batches = %d", len(batches.List()))
	}
}
