package services

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/wairewaire/aqua-seal/backend/internal/models"
)

var (
	ErrImmutableBlock = errors.New("blockchain entry sealed by BMU cannot be modified or edited by anyone")
	ErrBlockNotFound  = errors.New("blockchain block for batch not found")
	ErrChainCorrupted = errors.New("blockchain hash chain integrity verification failed")
)

const GenesisHash = "0000000000000000000000000000000000000000000000000000000000000000"

// CalculateBlockHash computes the deterministic SHA-256 hash of a blockchain block.
func CalculateBlockHash(block models.BlockchainBlock) string {
	payload := fmt.Sprintf("%d|%s|%s|%s|%s|%s|%s|%t|%s",
		block.BlockIndex,
		block.BatchID,
		block.Timestamp.UTC().Format(time.RFC3339Nano),
		block.PreviousHash,
		block.BMUID,
		block.BMUName,
		block.SealedByRole,
		block.IsImmutable,
		block.Signature,
	)
	hash := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(hash[:])
}

// CalculateDataHash calculates SHA-256 fingerprint for batch entry parameters.
func CalculateDataHash(batch models.FishBatch) string {
	payload, _ := json.Marshal(struct {
		ID            string  `json:"id"`
		SpeciesID     string  `json:"speciesId"`
		LandingSiteID string  `json:"landingSiteId"`
		BoatID        string  `json:"boatId"`
		WeightKg      float64 `json:"weightKg"`
		HarvestMethod string  `json:"harvestMethod"`
		LandedAt      string  `json:"landedAt"`
	}{
		ID:            batch.ID,
		SpeciesID:     batch.Species.ID,
		LandingSiteID: batch.LandingSite.ID,
		BoatID:        batch.BoatID,
		WeightKg:      batch.WeightKg,
		HarvestMethod: batch.HarvestMethod,
		LandedAt:      batch.LandedAt.UTC().Format(time.RFC3339),
	})
	hash := sha256.Sum256(payload)
	return hex.EncodeToString(hash[:])
}

type BlockchainService struct {
	mu     sync.RWMutex
	blocks []models.BlockchainBlock
	byBatch map[string]models.BlockchainBlock
}

func NewBlockchainService() *BlockchainService {
	svc := &BlockchainService{
		blocks:  make([]models.BlockchainBlock, 0),
		byBatch: make(map[string]models.BlockchainBlock),
	}
	return svc
}

// SealBatch seals a BMU catch data entry into an immutable block in the blockchain ledger.
func (s *BlockchainService) SealBatch(batch models.FishBatch, bmuID string, bmuName string, role models.UserRole) (models.BlockchainBlock, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.byBatch[batch.ID]; exists {
		return models.BlockchainBlock{}, ErrImmutableBlock
	}

	prevHash := GenesisHash
	blockIndex := int64(0)

	if len(s.blocks) > 0 {
		lastBlock := s.blocks[len(s.blocks)-1]
		prevHash = lastBlock.DataHash
		blockIndex = lastBlock.BlockIndex + 1
	}

	timestamp := batch.LandedAt
	if timestamp.IsZero() {
		timestamp = time.Now().UTC()
	}

	dataHash := CalculateDataHash(batch)
	signaturePayload := fmt.Sprintf("BMU_SEALED_BY_%s_%s_%s", bmuID, role, dataHash)
	signatureSum := sha256.Sum256([]byte(signaturePayload))

	block := models.BlockchainBlock{
		BlockIndex:   blockIndex,
		BatchID:      batch.ID,
		Timestamp:    timestamp,
		DataHash:     dataHash,
		PreviousHash: prevHash,
		BMUID:        bmuID,
		BMUName:      bmuName,
		SealedByRole: role,
		IsImmutable:  true,
		Signature:    hex.EncodeToString(signatureSum[:]),
	}

	s.blocks = append(s.blocks, block)
	s.byBatch[batch.ID] = block

	return block, nil
}

// GetLedger returns all blocks in the blockchain ledger.
func (s *BlockchainService) GetLedger() []models.BlockchainBlock {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.BlockchainBlock, len(s.blocks))
	copy(result, s.blocks)
	return result
}

// GetBlockByBatchID returns the blockchain block for a specific batch.
func (s *BlockchainService) GetBlockByBatchID(batchID string) (models.BlockchainBlock, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	block, exists := s.byBatch[batchID]
	if !exists {
		return models.BlockchainBlock{}, ErrBlockNotFound
	}
	return block, nil
}

// EnsureMutable verifies that a batch has not been sealed into the immutable blockchain.
func (s *BlockchainService) EnsureMutable(batchID string) error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if _, exists := s.byBatch[batchID]; exists {
		return ErrImmutableBlock
	}
	return nil
}

// VerifyLedger verifies SHA-256 hash chaining across the entire blockchain ledger.
func (s *BlockchainService) VerifyLedger() error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	prevHash := GenesisHash
	for i, block := range s.blocks {
		if block.PreviousHash != prevHash {
			return fmt.Errorf("%w: block %d previous hash mismatch", ErrChainCorrupted, i)
		}
		if !block.IsImmutable {
			return fmt.Errorf("%w: block %d immutability flag is false", ErrChainCorrupted, i)
		}
		prevHash = block.DataHash
	}
	return nil
}
