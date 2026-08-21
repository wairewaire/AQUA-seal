package services

import (
	"testing"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

func TestMarketplaceListingAndSaleAgreement(t *testing.T) {
	service := NewMarketplaceService()
	service.now = func() time.Time { return time.Date(2026, 8, 21, 8, 0, 0, 0, time.UTC) }
	listing, err := service.CreateListing(CreateListingInput{BatchID: "SKABC123", PriceKesPerKg: 450, QuantityKg: 20})
	if err != nil {
		t.Fatal(err)
	}
	if listing.Status != models.ListingActive || listing.BuyerUserID != nil {
		t.Fatalf("listing = %+v", listing)
	}
	purchase, err := service.RequestPurchase(CreatePurchaseInput{ListingID: listing.ID, BuyerUserID: "buyer-1"})
	if err != nil {
		t.Fatal(err)
	}
	if purchase.Status != "agreed" {
		t.Fatalf("purchase status = %s", purchase.Status)
	}
	updated, err := service.GetListing(listing.ID)
	if err != nil {
		t.Fatal(err)
	}
	if updated.Status != models.ListingSold || updated.BuyerUserID == nil || *updated.BuyerUserID != "buyer-1" {
		t.Fatalf("updated listing = %+v", updated)
	}
}

func TestMarketplaceRejectsSecondPurchase(t *testing.T) {
	service := NewMarketplaceService()
	listing, _ := service.CreateListing(CreateListingInput{BatchID: "SKABC123", PriceKesPerKg: 450, QuantityKg: 20})
	_, _ = service.RequestPurchase(CreatePurchaseInput{ListingID: listing.ID, BuyerUserID: "buyer-1"})
	if _, err := service.RequestPurchase(CreatePurchaseInput{ListingID: listing.ID, BuyerUserID: "buyer-2"}); err != ErrListingUnavailable {
		t.Fatalf("error = %v", err)
	}
}
