package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

type USSDSessionRepository struct{ pool *pgxpool.Pool }

func NewUSSDSessionRepository(pool *pgxpool.Pool) *USSDSessionRepository {
	return &USSDSessionRepository{pool: pool}
}

func (r *USSDSessionRepository) Get(ctx context.Context, id string) (models.USSDSession, error) {
	var session models.USSDSession
	err := r.pool.QueryRow(ctx, `SELECT session_id, phone_number, current_step, temp_data, expires_at FROM ussd_sessions WHERE session_id = $1 AND expires_at > now()`, id).Scan(&session.SessionID, &session.PhoneNumber, &session.CurrentStep, &session.TempData, &session.ExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.USSDSession{}, ErrNotFound
	}
	return session, err
}

func (r *USSDSessionRepository) Save(ctx context.Context, session models.USSDSession) error {
	_, err := r.pool.Exec(ctx, `INSERT INTO ussd_sessions (session_id, phone_number, current_step, temp_data, expires_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (session_id) DO UPDATE SET phone_number = EXCLUDED.phone_number, current_step = EXCLUDED.current_step, temp_data = EXCLUDED.temp_data, expires_at = EXCLUDED.expires_at`, session.SessionID, session.PhoneNumber, session.CurrentStep, session.TempData, session.ExpiresAt)
	return err
}
