import { eq } from 'drizzle-orm';
import { db } from '../config';
import { tb_pools, tb_tokens } from '../schema';

export interface Pool {
  pool_address: string;
  token_a_id?: string;
  token_b_id?: string;
  lp_mint: string;
}

export const poolRepository = {
  /**
   * Find a pool by its address
   */
  async findByAddress(address: string) {
    return db.query.tb_pools.findFirst({
      where: eq(tb_pools.pool_address, address),
      with: {
        tokenA: true,
        tokenB: true
      }
    });
  },

  /**
   * Create a new pool
   */
  async create(poolData: Pool) {
    return db.insert(tb_pools).values(poolData);
  },

  /**
   * Find a token by mint address
   */
  async findTokenByMintAddress(mintAddress: string) {
    return db.query.tb_tokens.findFirst({
      where: eq(tb_tokens.mint_address, mintAddress)
    });
  }
}; 