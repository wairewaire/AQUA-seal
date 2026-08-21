package services

import (
	"context"
	"strings"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

type DirectoryRepository interface {
	CreateUser(context.Context, string, string, string, string) (models.User, error)
	GetUser(context.Context, string) (models.User, error)
	ListUsers(context.Context) ([]models.User, error)
	CreateBMU(context.Context, string, string) (models.BMU, error)
	GetBMU(context.Context, string) (models.BMU, error)
	ListBMUs(context.Context) ([]models.BMU, error)
	CreateLandingSite(context.Context, models.LandingSiteRecord) (models.LandingSiteRecord, error)
	GetLandingSite(context.Context, string) (models.LandingSiteRecord, error)
	CreateFisherman(context.Context, models.Fisherman) (models.Fisherman, error)
	CreateBoat(context.Context, models.Boat) (models.Boat, error)
}

type DirectoryService struct{ repo DirectoryRepository }

func NewDirectoryService(repo DirectoryRepository) *DirectoryService {
	return &DirectoryService{repo: repo}
}

func (s *DirectoryService) CreateUser(ctx context.Context, phone, email, passwordHash, role string) (models.User, error) {
	if strings.TrimSpace(phone) == "" || !validRole(role) {
		return models.User{}, ErrInvalid
	}
	return s.repo.CreateUser(ctx, strings.TrimSpace(phone), strings.TrimSpace(email), passwordHash, role)
}

func (s *DirectoryService) CreateBMU(ctx context.Context, name, region string) (models.BMU, error) {
	if strings.TrimSpace(name) == "" || strings.TrimSpace(region) == "" {
		return models.BMU{}, ErrInvalid
	}
	return s.repo.CreateBMU(ctx, strings.TrimSpace(name), strings.TrimSpace(region))
}

func (s *DirectoryService) CreateLandingSite(ctx context.Context, site models.LandingSiteRecord) (models.LandingSiteRecord, error) {
	if site.BMUID == "" || strings.TrimSpace(site.Name) == "" || strings.TrimSpace(site.County) == "" {
		return models.LandingSiteRecord{}, ErrInvalid
	}
	return s.repo.CreateLandingSite(ctx, site)
}

func (s *DirectoryService) CreateFisherman(ctx context.Context, fisherman models.Fisherman) (models.Fisherman, error) {
	if fisherman.UserID == "" || fisherman.BMUID == "" || strings.TrimSpace(fisherman.FullName) == "" || strings.TrimSpace(fisherman.NationalIDHash) == "" {
		return models.Fisherman{}, ErrInvalid
	}
	return s.repo.CreateFisherman(ctx, fisherman)
}

func (s *DirectoryService) CreateBoat(ctx context.Context, boat models.Boat) (models.Boat, error) {
	if boat.FishermanID == "" || boat.BMUID == "" || strings.TrimSpace(boat.RegistrationNo) == "" || strings.TrimSpace(boat.BoatType) == "" {
		return models.Boat{}, ErrInvalid
	}
	return s.repo.CreateBoat(ctx, boat)
}

func validRole(role string) bool {
	switch role {
	case "fisherman", "bmu_clerk", "fishmonger", "buyer", "admin":
		return true
	default:
		return false
	}
}
