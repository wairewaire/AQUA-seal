package services

import (
	"sort"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
	"github.com/wairewaire/aqua-seal/backend/internal/repository"
)

type DashboardService struct {
	batches repository.BatchRepository
	trace   *TraceabilityService
	now     func() time.Time
}

func NewDashboardService(batches repository.BatchRepository, trace *TraceabilityService) *DashboardService {
	return &DashboardService{batches: batches, trace: trace, now: time.Now}
}

func (s *DashboardService) Build(bmuID string) models.Dashboard {
	result := models.Dashboard{BatchCountsByStatus: map[models.BatchStatus]int{}, RecentActivity: []models.TraceEventSummary{}}
	start := s.now().UTC().Truncate(24 * time.Hour)
	for _, batch := range s.batches.ListBatches() {
		if bmuID != "" && batch.LandingSite.BMUID != bmuID {
			continue
		}
		result.BatchCountsByStatus[batch.Status]++
		result.TotalWeightKg += batch.WeightKg
		if !batch.LandedAt.Before(start) {
			result.TodayCatches++
		}
		if s.trace != nil {
			events, _ := s.trace.Events(batch.ID)
			for _, event := range events {
				result.RecentActivity = append(result.RecentActivity, models.TraceEventSummary{BatchCode: batch.BatchCode, EventType: event.Type, OccurredAt: event.OccurredAt, Location: event.Location})
			}
		}
	}
	sort.Slice(result.RecentActivity, func(i, j int) bool {
		return result.RecentActivity[i].OccurredAt.After(result.RecentActivity[j].OccurredAt)
	})
	if len(result.RecentActivity) > 10 {
		result.RecentActivity = result.RecentActivity[:10]
	}
	return result
}
