package repository

import (
	"errors"
	"sync"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

var ErrNotFound = errors.New("not found")

type BatchRepository interface {
	GetBatch(id string) (models.FishBatch, error)
	ListBatches() []models.FishBatch
	SaveBatch(batch models.FishBatch) error
}

type MemoryRepository struct {
	mu      sync.RWMutex
	batches map[string]models.FishBatch
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{batches: make(map[string]models.FishBatch)}
}

func (r *MemoryRepository) GetBatch(id string) (models.FishBatch, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	batch, ok := r.batches[id]
	if !ok {
		return models.FishBatch{}, ErrNotFound
	}
	return batch, nil
}
func (r *MemoryRepository) ListBatches() []models.FishBatch {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make([]models.FishBatch, 0, len(r.batches))
	for _, batch := range r.batches {
		result = append(result, batch)
	}
	return result
}
func (r *MemoryRepository) SaveBatch(batch models.FishBatch) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.batches[batch.ID] = batch
	return nil
}
