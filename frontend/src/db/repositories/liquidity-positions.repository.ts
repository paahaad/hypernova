import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_liquidity_positions } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class LiquidityPositionsRepository extends BaseRepository {
  async findAll() {
    const positions = await this.db.select().from(tb_liquidity_positions);
    return transformDatabaseResults(positions);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const positions = await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(positions);
  }

  async findByUserWallet(userWallet: string) {
    const positions = await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.user_wallet, userWallet));
    
    return transformDatabaseResults(positions);
  }

  async findByPoolId(poolId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPoolId = removeHypPrefix(poolId);
    
    const positions = await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.pool_id, dbPoolId));
    
    return transformDatabaseResults(positions);
  }

  async findByUserAndPool(userWallet: string, poolId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPoolId = removeHypPrefix(poolId);
    
    const positions = await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(
        and(
          eq(tb_liquidity_positions.user_wallet, userWallet),
          eq(tb_liquidity_positions.pool_id, dbPoolId)
        )
      )
      .limit(1);
    
    return transformDatabaseResults(positions);
  }

  async create(data: {
    user_wallet: string;
    pool_id: string;
    amount_token_a: string;
    amount_token_b: string;
    lp_tokens: string;
  }) {
    // Clean any IDs in the data
    const cleanedData = {
      ...data,
      pool_id: removeHypPrefix(data.pool_id),
    };
    
    const newPositions = await this.db.insert(tb_liquidity_positions).values(cleanedData).returning();
    return transformDatabaseResults(newPositions);
  }

  async update(id: string, data: Partial<typeof tb_liquidity_positions.$inferInsert>) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    // Clean any IDs in the data
    const cleanedData = { ...data };
    if (cleanedData.pool_id) {
      cleanedData.pool_id = removeHypPrefix(cleanedData.pool_id);
    }
    
    const updatedPositions = await this.db
      .update(tb_liquidity_positions)
      .set({ ...cleanedData, updated_at: new Date() })
      .where(eq(tb_liquidity_positions.id, dbId))
      .returning();
    
    return transformDatabaseResults(updatedPositions);
  }

  async delete(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedPositions = await this.db
      .delete(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedPositions);
  }
} 