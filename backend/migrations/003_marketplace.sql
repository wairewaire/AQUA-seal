CREATE TABLE market_listings (
    id UUID PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES fish_batches(id),
    seller_user_id UUID REFERENCES users(id),
    price_kes_per_kg NUMERIC(12,2) NOT NULL CHECK (price_kes_per_kg > 0),
    quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    status TEXT NOT NULL,
    listed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    buyer_user_id UUID REFERENCES users(id)
);
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES market_listings(id),
    buyer_user_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES market_listings(id),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id),
    seller_user_id UUID REFERENCES users(id),
    buyer_user_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL,
    agreed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);