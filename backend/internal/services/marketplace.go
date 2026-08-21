package services

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

var ErrListingNotFound = errors.New("listing not found")
var ErrListingUnavailable = errors.New("listing is not available")

type MarketplaceService struct {
	mu           sync.RWMutex
	listings     map[string]models.MarketplaceListing
	purchases    map[string]models.PurchaseRequest
	transactions map[string]models.Transaction
	now          func() time.Time
}

type CreateListingInput struct {
	BatchID       string  `json:"batchId"`
	PriceKesPerKg float64 `json:"priceKesPerKg"`
	QuantityKg    float64 `json:"quantityKg"`
}
type CreatePurchaseInput struct {
	ListingID   string `json:"listingId"`
	BuyerUserID string `json:"buyerUserId"`
}

func NewMarketplaceService() *MarketplaceService {
	return &MarketplaceService{listings: map[string]models.MarketplaceListing{}, purchases: map[string]models.PurchaseRequest{}, transactions: map[string]models.Transaction{}, now: time.Now}
}

func (s *MarketplaceService) List() []models.MarketplaceListing {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]models.MarketplaceListing, 0, len(s.listings))
	for _, listing := range s.listings {
		result = append(result, listing)
	}
	return result
}

func (s *MarketplaceService) CreateListing(input CreateListingInput) (models.MarketplaceListing, error) {
	if input.BatchID == "" || input.PriceKesPerKg <= 0 || input.QuantityKg <= 0 {
		return models.MarketplaceListing{}, ErrInvalid
	}
	now := s.now().UTC()
	listing := models.MarketplaceListing{ID: "lst_" + uuid.NewString(), BatchID: input.BatchID, PriceKesPerKg: input.PriceKesPerKg, QuantityKg: input.QuantityKg, Status: models.ListingActive, ListedAt: now, ExpiresAt: now.Add(36 * time.Hour)}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.listings[listing.ID] = listing
	return listing, nil
}

func (s *MarketplaceService) RequestPurchase(input CreatePurchaseInput) (models.PurchaseRequest, error) {
	if input.ListingID == "" || input.BuyerUserID == "" {
		return models.PurchaseRequest{}, ErrInvalid
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	listing, ok := s.listings[input.ListingID]
	if !ok {
		return models.PurchaseRequest{}, ErrListingNotFound
	}
	if listing.Status != models.ListingActive || !s.now().Before(listing.ExpiresAt) {
		return models.PurchaseRequest{}, ErrListingUnavailable
	}
	buyer := input.BuyerUserID
	listing.BuyerUserID = &buyer
	listing.Status = models.ListingSold
	s.listings[listing.ID] = listing
	purchase := models.PurchaseRequest{ID: "purchase_" + uuid.NewString(), ListingID: listing.ID, BuyerUserID: buyer, CreatedAt: s.now().UTC(), Status: "agreed"}
	s.purchases[purchase.ID] = purchase
	transaction := models.Transaction{ID: "txn_" + uuid.NewString(), ListingID: listing.ID, PurchaseRequestID: purchase.ID, BuyerUserID: buyer, Status: "agreed", AgreedAt: purchase.CreatedAt}
	s.transactions[transaction.ID] = transaction
	return purchase, nil
}

func (s *MarketplaceService) GetListing(id string) (models.MarketplaceListing, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	listing, ok := s.listings[id]
	if !ok {
		return models.MarketplaceListing{}, fmt.Errorf("%w: %s", ErrListingNotFound, id)
	}
	return listing, nil
}
