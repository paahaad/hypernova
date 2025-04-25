-- Add metrics columns to the pools table
ALTER TABLE tb_pools 
  ADD COLUMN IF NOT EXISTS liquidity numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS volume_24h numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fees_24h numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apr_24h numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tick_spacing integer,
  ADD COLUMN IF NOT EXISTS fee_rate integer;

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_tb_pools_liquidity ON tb_pools (liquidity DESC);
CREATE INDEX IF NOT EXISTS idx_tb_pools_volume_24h ON tb_pools (volume_24h DESC); 