package models

import "time"

type USSDSession struct {
	SessionID   string                 `json:"sessionId"`
	PhoneNumber string                 `json:"phoneNumber"`
	CurrentStep string                 `json:"currentStep"`
	TempData    map[string]interface{} `json:"tempData"`
	ExpiresAt   time.Time              `json:"expiresAt"`
}
