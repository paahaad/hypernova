import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_fees } from '../schema';

export class FeesRepository extends BaseRepository {
  async findAll() {
    return await this.db.select().from(tb_fees);
  }

  async findById(id: string) {
    return await this.db
      .select()
      .from(tb_fees)
      .where(eq(tb_fees.id, id))
      .limit(1);
  }

  async findByUserWallet(userWallet: string) {
    return await this.db
      .select()
      .from(tb_fees)
      .where(eq(tb_fees.user_wallet, userWallet));
  }

  async findByPoolAndUser(poolId: string, userWallet: string) {
    return await this.db
      .select()
      .from(tb_fees)
      .where(
        and(
          eq(tb_fees.pool_id, poolId),
          eq(tb_fees.user_wallet, userWallet)
        )
      )
      .limit(1);
  }

  async findByPoolId(poolId: string) {
    return await this.db
      .select()
      .from(tb_fees)
      .where(eq(tb_fees.pool_id, poolId));
  }

  async create(data: {
    pool_id: string;
    user_wallet: string;
    unclaimed_fee_a: number;
    unclaimed_fee_b: number;
    last_claimed_at?: Date;
  }) {
    return await this.db.insert(tb_fees).values(data).returning();
  }

  async update(id: string, data: Partial<typeof tb_fees.$inferInsert>) {
    return await this.db
      .update(tb_fees)
      .set(data)
      .where(eq(tb_fees.id, id))
      .returning();
  }

  async updateOrCreate(poolId: string, userWallet: string, data: {
    unclaimed_fee_a: number;
    unclaimed_fee_b: number;
    last_claimed_at?: Date;
  }) {
    const existingFee = await this.findByPoolAndUser(poolId, userWallet);
    
    if (existingFee && existingFee.length > 0) {
      return await this.update(existingFee[0].id, data);
    } else {
      return await this.create({
        pool_id: poolId,
        user_wallet: userWallet,
        ...data
      });
    }
  }

  async delete(id: string) {
    return await this.db
      .delete(tb_fees)
      .where(eq(tb_fees.id, id))
      .returning();
  }
} 