-- Create tables
CREATE TABLE IF NOT EXISTS "tb_tokens" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "mint_address" text UNIQUE NOT NULL,
    "symbol" text NOT NULL,
    "name" text NOT NULL,
    "decimals" integer NOT NULL,
    "logo_uri" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tb_presales" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "token_id" uuid REFERENCES "tb_tokens"("id"),
    "name" text,
    "symbol" text,
    "uri" text,
    "description" text,
    "total_supply" numeric,
    "token_price" numeric,
    "min_purchase" numeric,
    "max_purchase" numeric,
    "mint_address" text UNIQUE,
    "presale_address" text UNIQUE NOT NULL,
    "presale_percentage" numeric,
    "total_raised" numeric NOT NULL,
    "target_amount" numeric NOT NULL,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "status" text NOT NULL DEFAULT 'active',
    "user_address" text,
    "finalized" boolean DEFAULT false,
    "recipient_wallet" text,
    "finalized_at" timestamp,
    "finalize_tx" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tb_pools" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "pool_address" text UNIQUE NOT NULL,
    "token_a_id" uuid REFERENCES "tb_tokens"("id"),
    "token_b_id" uuid REFERENCES "tb_tokens"("id"),
    "lp_mint" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tb_liquidity_positions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_wallet" text NOT NULL,
    "pool_id" uuid REFERENCES "tb_pools"("id"),
    "amount_token_a" numeric NOT NULL,
    "amount_token_b" numeric NOT NULL,
    "lp_tokens" numeric NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tb_swaps" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "pool_id" uuid REFERENCES "tb_pools"("id"),
    "user_wallet" text NOT NULL,
    "amount_in" numeric NOT NULL,
    "amount_out" numeric NOT NULL,
    "token_in_id" uuid REFERENCES "tb_tokens"("id"),
    "token_out_id" uuid REFERENCES "tb_tokens"("id"),
    "tx_hash" text UNIQUE NOT NULL,
    "timestamp" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tb_fees" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "pool_id" uuid REFERENCES "tb_pools"("id"),
    "user_wallet" text NOT NULL,
    "unclaimed_fee_a" numeric NOT NULL,
    "unclaimed_fee_b" numeric NOT NULL,
    "last_claimed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "tb_presale_contributions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "presale_id" uuid REFERENCES "tb_presales"("id"),
    "user_wallet" text NOT NULL,
    "amount" numeric NOT NULL,
    "timestamp" timestamp DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tokens_mint_address ON "tb_tokens"("mint_address");
CREATE INDEX IF NOT EXISTS idx_presales_token_id ON "tb_presales"("token_id");
CREATE INDEX IF NOT EXISTS idx_pools_tokens ON "tb_pools"("token_a_id", "token_b_id");
CREATE INDEX IF NOT EXISTS idx_liquidity_user_wallet ON "tb_liquidity_positions"("user_wallet");
CREATE INDEX IF NOT EXISTS idx_swaps_user_wallet ON "tb_swaps"("user_wallet");
CREATE INDEX IF NOT EXISTS idx_fees_user_wallet ON "tb_fees"("user_wallet");
CREATE INDEX IF NOT EXISTS idx_presale_contributions_user ON "tb_presale_contributions"("user_wallet"); 