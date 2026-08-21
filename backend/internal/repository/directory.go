package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

var ErrInvalidRole = errors.New("invalid role")

type DirectoryRepository struct{ pool *pgxpool.Pool }

func NewDirectoryRepository(pool *pgxpool.Pool) *DirectoryRepository {
	return &DirectoryRepository{pool: pool}
}

func (r *DirectoryRepository) CreateUser(ctx context.Context, phone, email, passwordHash, roleName string) (models.User, error) {
	var user models.User
	err := r.pool.QueryRow(ctx, `
		INSERT INTO users (id, phone_number, email, password_hash, role_id)
		SELECT $1, $2, NULLIF($3, ''), NULLIF($4, ''), id FROM roles WHERE name = $5
		RETURNING id, phone_number, COALESCE(email, ''), is_active, created_at,
			(SELECT roles.id FROM roles WHERE roles.id = users.role_id),
			(SELECT roles.name FROM roles WHERE roles.id = users.role_id)`,
		uuid.New(), phone, email, passwordHash, roleName).Scan(&user.ID, &user.PhoneNumber, &user.Email, &user.IsActive, &user.CreatedAt, &user.Role.ID, &user.Role.Name)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.User{}, ErrInvalidRole
	}
	return user, err
}

func (r *DirectoryRepository) GetUser(ctx context.Context, id string) (models.User, error) {
	var user models.User
	err := r.pool.QueryRow(ctx, `SELECT users.id, users.phone_number, COALESCE(users.email, ''), users.is_active, users.created_at, roles.id, roles.name FROM users JOIN roles ON roles.id = users.role_id WHERE users.id = $1`, id).Scan(&user.ID, &user.PhoneNumber, &user.Email, &user.IsActive, &user.CreatedAt, &user.Role.ID, &user.Role.Name)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.User{}, ErrNotFound
	}
	return user, err
}

func (r *DirectoryRepository) ListUsers(ctx context.Context) ([]models.User, error) {
	rows, err := r.pool.Query(ctx, `SELECT users.id, users.phone_number, COALESCE(users.email, ''), users.is_active, users.created_at, roles.id, roles.name FROM users JOIN roles ON roles.id = users.role_id ORDER BY users.created_at`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	users := []models.User{}
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.PhoneNumber, &user.Email, &user.IsActive, &user.CreatedAt, &user.Role.ID, &user.Role.Name); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (r *DirectoryRepository) CreateBMU(ctx context.Context, name, region string) (models.BMU, error) {
	var bmu models.BMU
	err := r.pool.QueryRow(ctx, `INSERT INTO bmus (id, name, region) VALUES ($1, $2, $3) RETURNING id, name, region`, uuid.New(), name, region).Scan(&bmu.ID, &bmu.Name, &bmu.Region)
	return bmu, err
}

func (r *DirectoryRepository) GetBMU(ctx context.Context, id string) (models.BMU, error) {
	var bmu models.BMU
	err := r.pool.QueryRow(ctx, `SELECT id, name, region FROM bmus WHERE id = $1`, id).Scan(&bmu.ID, &bmu.Name, &bmu.Region)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.BMU{}, ErrNotFound
	}
	return bmu, err
}

func (r *DirectoryRepository) ListBMUs(ctx context.Context) ([]models.BMU, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, name, region FROM bmus ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []models.BMU{}
	for rows.Next() {
		var item models.BMU
		if err := rows.Scan(&item.ID, &item.Name, &item.Region); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

func (r *DirectoryRepository) CreateLandingSite(ctx context.Context, site models.LandingSiteRecord) (models.LandingSiteRecord, error) {
	if site.ID == "" {
		site.ID = uuid.NewString()
	}
	err := r.pool.QueryRow(ctx, `INSERT INTO landing_sites (id, bmu_id, name, county, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, site.ID, site.BMUID, site.Name, site.County, site.Latitude, site.Longitude).Scan(&site.ID)
	return site, err
}

func (r *DirectoryRepository) GetLandingSite(ctx context.Context, id string) (models.LandingSiteRecord, error) {
	var site models.LandingSiteRecord
	err := r.pool.QueryRow(ctx, `SELECT id, bmu_id, name, county, COALESCE(latitude, 0), COALESCE(longitude, 0) FROM landing_sites WHERE id = $1`, id).Scan(&site.ID, &site.BMUID, &site.Name, &site.County, &site.Latitude, &site.Longitude)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.LandingSiteRecord{}, ErrNotFound
	}
	return site, err
}

func (r *DirectoryRepository) CreateFisherman(ctx context.Context, fisherman models.Fisherman) (models.Fisherman, error) {
	if fisherman.ID == "" {
		fisherman.ID = uuid.NewString()
	}
	err := r.pool.QueryRow(ctx, `INSERT INTO fishermen (id, user_id, bmu_id, national_id_hash, full_name, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, fisherman.ID, fisherman.UserID, fisherman.BMUID, fisherman.NationalIDHash, fisherman.FullName, fisherman.Verified).Scan(&fisherman.ID)
	return fisherman, err
}

func (r *DirectoryRepository) CreateBoat(ctx context.Context, boat models.Boat) (models.Boat, error) {
	if boat.ID == "" {
		boat.ID = uuid.NewString()
	}
	err := r.pool.QueryRow(ctx, `INSERT INTO boats (id, fisherman_id, bmu_id, registration_no, boat_type) VALUES ($1, $2, $3, $4, $5) RETURNING id`, boat.ID, boat.FishermanID, boat.BMUID, boat.RegistrationNo, boat.BoatType).Scan(&boat.ID)
	return boat, err
}
