package models

import "time"

type Role struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type User struct {
	ID          string    `json:"id"`
	PhoneNumber string    `json:"phoneNumber"`
	Email       string    `json:"email,omitempty"`
	Role        Role      `json:"role"`
	IsActive    bool      `json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
}

type BMU struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Region string `json:"region"`
}

type LandingSiteRecord struct {
	ID        string  `json:"id"`
	BMUID     string  `json:"bmuId"`
	Name      string  `json:"name"`
	County    string  `json:"county"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Fisherman struct {
	ID             string `json:"id"`
	UserID         string `json:"userId"`
	BMUID          string `json:"bmuId"`
	FullName       string `json:"fullName"`
	NationalIDHash string `json:"-"`
	Verified       bool   `json:"verified"`
}

type Boat struct {
	ID             string `json:"id"`
	FishermanID    string `json:"fishermanId"`
	BMUID          string `json:"bmuId"`
	RegistrationNo string `json:"registrationNo"`
	BoatType       string `json:"boatType"`
}

type BatchStatus string

const (
	BatchDraft       BatchStatus = "draft"
	BatchLanded      BatchStatus = "landed"
	BatchVerified    BatchStatus = "verified"
	BatchNeedsReview BatchStatus = "needs_review"
	BatchExpired     BatchStatus = "expired"
	BatchRejected    BatchStatus = "rejected"
)

type EventType string

const (
	EventCatchRegistered EventType = "CATCH_REGISTERED"
	EventHarvested       EventType = "harvested"
	EventLanded          EventType = "landed"
	EventWeighed         EventType = "weighed"
	EventIced            EventType = "iced"
	EventTransported     EventType = "transported"
	EventInspected       EventType = "inspected"
	EventListed          EventType = "listed"
	EventSold            EventType = "sold"
)

type UserRole string

const (
	RoleFisher        UserRole = "fisher"
	RoleBMUOfficer    UserRole = "bmu_officer"
	RoleCountyOfficer UserRole = "county_officer"
	RoleBuyer         UserRole = "buyer"
	RoleAdmin         UserRole = "admin"
)

type Species struct {
	ID             string `json:"id"`
	CommonName     string `json:"commonName"`
	ScientificName string `json:"scientificName"`
	LocalName      string `json:"localName"`
	StockStatus    string `json:"stockStatus"`
}

type LandingSite struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	County      string      `json:"county"`
	Coordinates Coordinates `json:"coordinates"`
	BMUID       string      `json:"bmuId"`
}

type Coordinates struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type TraceEvent struct {
	ID           string                 `json:"id"`
	BatchID      string                 `json:"batchId"`
	Type         EventType              `json:"type"`
	OccurredAt   time.Time              `json:"occurredAt"`
	Location     string                 `json:"location"`
	ActorRole    UserRole               `json:"actorRole"`
	Notes        *string                `json:"notes"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	PreviousHash string                 `json:"previousHash"`
	EventHash    string                 `json:"eventHash"`
}

type FishBatch struct {
	ID             string       `json:"id"`
	BatchCode      string       `json:"batchCode,omitempty"`
	Species        Species      `json:"species"`
	LandingSite    LandingSite  `json:"landingSite"`
	BoatID         string       `json:"boatId"`
	WeightKg       float64      `json:"weightKg"`
	HarvestMethod  string       `json:"harvestMethod"`
	LandedAt       time.Time    `json:"landedAt"`
	Freshness      string       `json:"freshness"`
	Status         BatchStatus  `json:"status"`
	Verification   string       `json:"verification"`
	HandlingEvents []TraceEvent `json:"handlingEvents"`
	CreatedAt      time.Time    `json:"createdAt"`
	UpdatedAt      time.Time    `json:"updatedAt"`
}

type PublicVerification struct {
	BatchCode     string                `json:"batch_code"`
	Species       string                `json:"species"`
	LandingSite   string                `json:"landing_site"`
	LandingTime   time.Time             `json:"landing_time"`
	HarvestMethod string                `json:"harvest_method"`
	Status        string                `json:"status"`
	Freshness     string                `json:"freshness"`
	Checklist     VerificationChecklist `json:"checklist"`
}

type VerificationChecklist struct {
	CatchRegistered     bool `json:"catch_registered"`
	Landed              bool `json:"landed"`
	Inspected           bool `json:"inspected"`
	ColdStorageRecorded bool `json:"cold_storage_recorded"`
}

type Dashboard struct {
	TodayCatches        int                 `json:"today_catches"`
	TotalWeightKg       float64             `json:"total_weight_kg"`
	BatchCountsByStatus map[BatchStatus]int `json:"batch_counts_by_status"`
	RecentActivity      []TraceEventSummary `json:"recent_activity"`
}

type TraceEventSummary struct {
	BatchCode  string    `json:"batch_code"`
	EventType  EventType `json:"event_type"`
	OccurredAt time.Time `json:"occurred_at"`
	Location   string    `json:"location"`
}

type ListingStatus string

const (
	ListingActive    ListingStatus = "active"
	ListingLowStock  ListingStatus = "low_stock"
	ListingSold      ListingStatus = "sold"
	ListingExpired   ListingStatus = "expired"
	ListingWithdrawn ListingStatus = "withdrawn"
)

type MarketplaceListing struct {
	ID            string        `json:"id"`
	BatchID       string        `json:"batchId"`
	PriceKesPerKg float64       `json:"priceKesPerKg"`
	QuantityKg    float64       `json:"quantityKg"`
	Status        ListingStatus `json:"status"`
	ListedAt      time.Time     `json:"listedAt"`
	ExpiresAt     time.Time     `json:"expiresAt"`
	BuyerUserID   *string       `json:"buyerUserId"`
}

type PurchaseRequest struct {
	ID          string    `json:"id"`
	ListingID   string    `json:"listingId"`
	BuyerUserID string    `json:"buyerUserId"`
	CreatedAt   time.Time `json:"createdAt"`
	Status      string    `json:"status"`
}

type Transaction struct {
	ID                string    `json:"id"`
	ListingID         string    `json:"listingId"`
	PurchaseRequestID string    `json:"purchaseRequestId"`
	BuyerUserID       string    `json:"buyerUserId"`
	Status            string    `json:"status"`
	AgreedAt          time.Time `json:"agreedAt"`
}

type PublicBatch struct {
	ID             string        `json:"id"`
	Species        Species       `json:"species"`
	LandingSite    LandingSite   `json:"landingSite"`
	BoatID         string        `json:"boatId"`
	WeightKg       float64       `json:"weightKg"`
	HarvestMethod  string        `json:"harvestMethod"`
	LandedAt       time.Time     `json:"landedAt"`
	Freshness      string        `json:"freshness"`
	Status         BatchStatus   `json:"status"`
	Verification   string        `json:"verification"`
	HandlingEvents []PublicEvent `json:"handlingEvents"`
	CreatedAt      time.Time     `json:"createdAt"`
	UpdatedAt      time.Time     `json:"updatedAt"`
}

type PublicEvent struct {
	ID         string    `json:"id"`
	BatchID    string    `json:"batchId"`
	Type       EventType `json:"type"`
	OccurredAt time.Time `json:"occurredAt"`
	Location   string    `json:"location"`
	ActorRole  UserRole  `json:"actorRole"`
	Notes      *string   `json:"notes"`
}

type VerificationFlag struct {
	Code     string `json:"code"`
	Severity string `json:"severity"`
	Message  string `json:"message"`
}
