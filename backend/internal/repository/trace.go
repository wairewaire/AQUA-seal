package repository

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

type PostgresTraceEventRepository struct{ pool *pgxpool.Pool }

func NewPostgresTraceEventRepository(pool *pgxpool.Pool) *PostgresTraceEventRepository {
	return &PostgresTraceEventRepository{pool: pool}
}

func (r *PostgresTraceEventRepository) Append(ctx context.Context, event models.TraceEvent) error {
	eventID, err := uuid.Parse(event.ID)
	if err != nil {
		return err
	}
	batchID, err := uuid.Parse(event.BatchID)
	if err != nil {
		return err
	}
	metadata, err := json.Marshal(event.Metadata)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `INSERT INTO trace_events (id, batch_id, event_type, metadata, previous_hash, event_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`, eventID, batchID, event.Type, metadata, event.PreviousHash, event.EventHash, event.OccurredAt)
	return err
}

func (r *PostgresTraceEventRepository) List(ctx context.Context, batchID string) ([]models.TraceEvent, error) {
	parsedBatchID, err := uuid.Parse(batchID)
	if err != nil {
		return nil, err
	}
	rows, err := r.pool.Query(ctx, `SELECT id, batch_id, event_type, metadata, previous_hash, event_hash, created_at FROM trace_events WHERE batch_id = $1 ORDER BY created_at, id`, parsedBatchID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []models.TraceEvent{}
	for rows.Next() {
		var event models.TraceEvent
		var metadata []byte
		if err := rows.Scan(&event.ID, &event.BatchID, &event.Type, &metadata, &event.PreviousHash, &event.EventHash, &event.OccurredAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(metadata, &event.Metadata); err != nil {
			return nil, err
		}
		result = append(result, event)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return result, nil
}
