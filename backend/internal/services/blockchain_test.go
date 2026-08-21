package services

import (
	"testing"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

func TestBlockchainService_SealAndVerify(t *testing.T) {
	svc := NewBlockchainService()

	batch := models.FishBatch{
		ID:            "LV-1001",
		Species:       models.Species{ID: "sp_tilapia", CommonName: "Nile Tilapia"},
		LandingSite:   models.LandingSite{ID: "site_dunga", Name: "Dunga Beach"},
		BoatID:        "boat_01",
		WeightKg:      25.5,
		HarvestMethod: "gillnet",
		LandedAt:      time.Now().UTC(),
	}

	block, err := svc.SealBatch(batch, "bmu_dunga_01", "Dunga BMU", models.RoleBMUOfficer)
	if err != nil {
		t.Fatalf("expected batch to be sealed successfully, got %v", err)
	}

	if block.BlockIndex != 0 {
		t.Errorf("expected block index 0, got %d", block.BlockIndex)
	}
	if block.PreviousHash != GenesisHash {
		t.Errorf("expected genesis previous hash, got %s", block.PreviousHash)
	}
	if !block.IsImmutable {
		t.Error("expected block to be immutable")
	}

	// Attempting to re-seal the same batch should return ErrImmutableBlock
	_, err = svc.SealBatch(batch, "bmu_dunga_01", "Dunga BMU", models.RoleBMUOfficer)
	if err != ErrImmutableBlock {
		t.Fatalf("expected ErrImmutableBlock when re-sealing, got %v", err)
	}

	// EnsureMutable should return ErrImmutableBlock
	if err := svc.EnsureMutable(batch.ID); err != ErrImmutableBlock {
		t.Fatalf("expected EnsureMutable to fail with ErrImmutableBlock, got %v", err)
	}

	// Verify ledger hash chain integrity
	if err := svc.VerifyLedger(); err != nil {
		t.Fatalf("expected ledger verification to pass, got %v", err)
	}
}

func TestBlockchainService_ChainLinkage(t *testing.T) {
	svc := NewBlockchainService()

	batch1 := models.FishBatch{
		ID:            "LV-1001",
		Species:       models.Species{ID: "sp_tilapia"},
		LandingSite:   models.LandingSite{ID: "site_dunga"},
		BoatID:        "boat_01",
		WeightKg:      10.0,
		HarvestMethod: "gillnet",
		LandedAt:      time.Now().UTC(),
	}

	batch2 := models.FishBatch{
		ID:            "LV-1002",
		Species:       models.Species{ID: "sp_perch"},
		LandingSite:   models.LandingSite{ID: "site_dunga"},
		BoatID:        "boat_02",
		WeightKg:      40.0,
		HarvestMethod: "longline",
		LandedAt:      time.Now().UTC(),
	}

	block1, err := svc.SealBatch(batch1, "bmu_dunga_01", "Dunga BMU", models.RoleBMUOfficer)
	if err != nil {
		t.Fatal(err)
	}

	block2, err := svc.SealBatch(batch2, "bmu_dunga_01", "Dunga BMU", models.RoleBMUOfficer)
	if err != nil {
		t.Fatal(err)
	}

	if block2.BlockIndex != 1 {
		t.Errorf("expected block index 1, got %d", block2.BlockIndex)
	}
	if block2.PreviousHash != block1.DataHash {
		t.Errorf("expected block2 previous hash to match block1 data hash")
	}

	ledger := svc.GetLedger()
	if len(ledger) != 2 {
		t.Fatalf("expected 2 blocks in ledger, got %d", len(ledger))
	}

	if err := svc.VerifyLedger(); err != nil {
		t.Fatalf("expected valid ledger chain, got %v", err)
	}
}
