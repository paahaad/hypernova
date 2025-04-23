import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_fees } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class FeesRepository extends BaseRepository {
  async findAll() {
    const fees = await this.db.select().from(tb_fees);
    return transformDatabaseResults(fees);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const fees = await this.db
      .select()
      .from(tb_fees)
      .where(eq(tb_fees.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(fees);
  }

  async findByUserWallet(userWallet: string) {
    const fees = await this.db
      .select()
      .from(tb_fees)
      .where(eq(tb_fees.user_wallet, userWallet));
    
    return transformDatabaseResults(fees);
  }

  async findByPoolAndUser(poolId: string, userWallet: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPoolId = removeHypPrefix(poolId);
    
    const fees = await this.db
      .select()
      .from(tb_fees)
      .where(
        and(
          eq(tb_fees.pool_id, dbPoolId),
          eq(tb_fees.user_wallet, userWallet)
        )
      )
      .limit(1);
    
    return transformDatabaseResults(fees);
  }

  async findByPoolId(poolId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPoolId = removeHypPrefix(poolId);
    
    const fees = await this.db
      .select()
      .from(tb_fees)
      .where(eq(tb_fees.pool_id, dbPoolId));
    
    return transformDatabaseResults(fees);
  }

  async create(data: {
    pool_id: string;
    user_wallet: string;
    unclaimed_fee_a: string;
    unclaimed_fee_b: string;
    last_claimed_at?: Date;
  }) {
    // Clean any IDs in the data
    const cleanedData = {
      ...data,
      pool_id: removeHypPrefix(data.pool_id),
    };
    
    const newFees = await this.db.insert(tb_fees).values(cleanedData).returning();
    return transformDatabaseResults(newFees);
  }

  async update(id: string, data: Partial<typeof tb_fees.$inferInsert>) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    // Clean any IDs in the data
    const cleanedData = { ...data };
    if (cleanedData.pool_id) {
      cleanedData.pool_id = removeHypPrefix(cleanedData.pool_id);
    }
    
    const updatedFees = await this.db
      .update(tb_fees)
      .set(cleanedData)
      .where(eq(tb_fees.id, dbId))
      .returning();
    
    return transformDatabaseResults(updatedFees);
  }

  async updateOrCreate(poolId: string, userWallet: string, data: {
    unclaimed_fee_a: string;
    unclaimed_fee_b: string;
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
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedFees = await this.db
      .delete(tb_fees)
      .where(eq(tb_fees.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedFees);
  }
} 