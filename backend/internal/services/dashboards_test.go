package services

import (
	"testing"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
	"github.com/wairewaire/aqua-seal/backend/internal/repository"
)

func TestDashboardAggregatesAndScopesByBMU(t *testing.T) {
	repo := repository.NewMemoryRepository()
	service := NewBatchService(repo)
	today := time.Now().UTC()
	inputs := []CreateBatchInput{
		{Species: models.Species{ID: "tilapia", CommonName: "Tilapia"}, LandingSite: models.LandingSite{ID: "site-a", Name: "Site A", BMUID: "bmu-a"}, BoatID: "boat-a", WeightKg: 10, HarvestMethod: "wild"},
		{Species: models.Species{ID: "perch", CommonName: "Perch"}, LandingSite: models.LandingSite{ID: "site-b", Name: "Site B", BMUID: "bmu-b"}, BoatID: "boat-b", WeightKg: 20, HarvestMethod: "cage"},
	}
	for _, input := range inputs {
		if _, err := service.Create(input); err != nil {
			t.Fatal(err)
		}
	}
	dashboard := NewDashboardService(repo, nil)
	dashboard.now = func() time.Time { return today }
	result := dashboard.Build("bmu-a")
	if result.TodayCatches != 1 || result.TotalWeightKg != 10 || result.BatchCountsByStatus[models.BatchLanded] != 1 {
		t.Fatalf("unexpected BMU dashboard: %+v", result)
	}
	all := dashboard.Build("")
	if all.TodayCatches != 2 || all.TotalWeightKg != 30 || all.BatchCountsByStatus[models.BatchLanded] != 2 {
		t.Fatalf("unexpected admin dashboard: %+v", all)
	}
}
