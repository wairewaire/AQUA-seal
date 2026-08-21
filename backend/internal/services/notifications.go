package services

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"strings"
)

type NotificationProvider interface {
	SendSMS(ctx context.Context, phoneNumber, message string) error
}

type AfricasTalkingSMSProvider struct {
	Username string
	APIKey   string
	From     string
	Client   *http.Client
}

func (p *AfricasTalkingSMSProvider) SendSMS(ctx context.Context, phoneNumber, message string) error {
	if p.Username == "" || p.APIKey == "" {
		return errors.New("africas talking credentials are not configured")
	}
	form := url.Values{"username": {p.Username}, "to": {phoneNumber}, "message": {message}}
	if p.From != "" {
		form.Set("from", p.From)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.africastalking.com/version1/messaging", strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("apiKey", p.APIKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := p.Client
	if client == nil {
		client = http.DefaultClient
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return errors.New("africas talking SMS request failed")
	}
	return nil
}
