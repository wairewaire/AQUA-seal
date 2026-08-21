package repository

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/database"
	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

func TestDirectoryRepositoryWithPostgres(t *testing.T) {
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("set TEST_DATABASE_URL to run the real PostgreSQL repository test")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	pool, err := database.Connect(ctx, databaseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	if err := database.Ping(ctx, pool); err != nil {
		t.Fatal(err)
	}

	repo := NewDirectoryRepository(pool)
	phone := "+2547" + time.Now().Format("150405.000000")
	user, err := repo.CreateUser(ctx, phone, phone+"@example.test", "hash", "fisherman")
	if err != nil {
		t.Fatal(err)
	}
	if user.Role.Name != "fisherman" || user.PhoneNumber != phone {
		t.Fatalf("unexpected user: %+v", user)
	}
	fetched, err := repo.GetUser(ctx, user.ID)
	if err != nil {
		t.Fatal(err)
	}
	if fetched.ID != user.ID {
		t.Fatalf("fetched user ID = %s, want %s", fetched.ID, user.ID)
	}

	bmu, err := repo.CreateBMU(ctx, "Integration BMU "+phone, "Kisumu")
	if err != nil {
		t.Fatal(err)
	}
	site, err := repo.CreateLandingSite(ctx, models.LandingSiteRecord{BMUID: bmu.ID, Name: "Integration Landing Site", County: "Kisumu"})
	if err != nil {
		t.Fatal(err)
	}
	fetchedSite, err := repo.GetLandingSite(ctx, site.ID)
	if err != nil {
		t.Fatal(err)
	}
	if fetchedSite.BMUID != bmu.ID {
		t.Fatalf("site BMU = %s, want %s", fetchedSite.BMUID, bmu.ID)
	}
}

func TestUSSDSessionRepositoryWithPostgres(t *testing.T) {
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("set TEST_DATABASE_URL to run the real PostgreSQL repository test")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	pool, err := database.Connect(ctx, databaseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	repo := NewUSSDSessionRepository(pool)
	session := models.USSDSession{SessionID: "integration-session-" + time.Now().Format("150405.000000"), PhoneNumber: "+254700000099", CurrentStep: "boat", TempData: map[string]interface{}{"boat_id": "BOAT-1"}, ExpiresAt: time.Now().Add(time.Hour)}
	if err := repo.Save(ctx, session); err != nil {
		t.Fatal(err)
	}
	fetched, err := repo.Get(ctx, session.SessionID)
	if err != nil {
		t.Fatal(err)
	}
	if fetched.CurrentStep != session.CurrentStep || fetched.TempData["boat_id"] != "BOAT-1" {
		t.Fatalf("fetched session = %+v", fetched)
	}
}
