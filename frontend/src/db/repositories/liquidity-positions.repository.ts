import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_liquidity_positions } from '../schema';

export class LiquidityPositionsRepository extends BaseRepository {
  async findAll() {
    return await this.db.select().from(tb_liquidity_positions);
  }

  async findById(id: string) {
    return await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.id, id))
      .limit(1);
  }

  async findByUserWallet(userWallet: string) {
    return await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.user_wallet, userWallet));
  }

  async findByPoolId(poolId: string) {
    return await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.pool_id, poolId));
  }

  async findByUserAndPool(userWallet: string, poolId: string) {
    return await this.db
      .select()
      .from(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.user_wallet, userWallet))
      .where(eq(tb_liquidity_positions.pool_id, poolId))
      .limit(1);
  }

  async create(data: {
    user_wallet: string;
    pool_id: string;
    amount_token_a: number;
    amount_token_b: number;
    lp_tokens: number;
  }) {
    return await this.db.insert(tb_liquidity_positions).values(data).returning();
  }

  async update(id: string, data: Partial<typeof tb_liquidity_positions.$inferInsert>) {
    return await this.db
      .update(tb_liquidity_positions)
      .set({ ...data, updated_at: new Date() })
      .where(eq(tb_liquidity_positions.id, id))
      .returning();
  }

  async delete(id: string) {
    return await this.db
      .delete(tb_liquidity_positions)
      .where(eq(tb_liquidity_positions.id, id))
      .returning();
  }
} 