import { eq, and } from 'drizzle-orm';
import { db } from '../config';
import { tb_liquidity_positions } from '../schema';

export interface LiquidityPosition {
  pool_id?: string;
  user_wallet: string;
  amount_token_a: string | number;
  amount_token_b: string | number;
  lp_tokens: string | number;
}

export const liquidityRepository = {
  /**
   * Create a new liquidity position
   */
  async create(positionData: LiquidityPosition) {
    return db.insert(tb_liquidity_positions).values({
      ...positionData,
      amount_token_a: positionData.amount_token_a.toString(),
      amount_token_b: positionData.amount_token_b.toString(),
      lp_tokens: positionData.lp_tokens.toString()
    });
  },

  /**
   * Find a liquidity position by user wallet and pool
   */
  async findByUserAndPool(userWallet: string, poolId: string) {
    return db.query.tb_liquidity_positions.findFirst({
      where: and(
        eq(tb_liquidity_positions.user_wallet, userWallet),
        eq(tb_liquidity_positions.pool_id, poolId)
      )
    });
  },

  /**
   * Update a liquidity position
   */
  async update(id: string, positionData: Partial<LiquidityPosition>) {
    const updateData: Record<string, any> = { ...positionData };
    
    if (typeof updateData.amount_token_a !== 'undefined') {
      updateData.amount_token_a = updateData.amount_token_a.toString();
    }
    
    if (typeof updateData.amount_token_b !== 'undefined') {
      updateData.amount_token_b = updateData.amount_token_b.toString();
    }
    
    if (typeof updateData.lp_tokens !== 'undefined') {
      updateData.lp_tokens = updateData.lp_tokens.toString();
    }
    
    return db.update(tb_liquidity_positions)
      .set(updateData)
      .where(eq(tb_liquidity_positions.id, id));
  }
}; 