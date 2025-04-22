import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_pools } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class PoolsRepository extends BaseRepository {
  async findAll() {
    const pools = await this.db.select().from(tb_pools);
    return transformDatabaseResults(pools);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const pools = await this.db
      .select()
      .from(tb_pools)
      .where(eq(tb_pools.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(pools);
  }

  async findByPoolAddress(poolAddress: string) {
    const pools = await this.db
      .select()
      .from(tb_pools)
      .where(eq(tb_pools.pool_address, poolAddress))
      .limit(1);
    
    return transformDatabaseResults(pools);
  }

  async findByTokens(tokenAId: string, tokenBId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbTokenAId = removeHypPrefix(tokenAId);
    const dbTokenBId = removeHypPrefix(tokenBId);
    
    const pools = await this.db
      .select()
      .from(tb_pools)
      .where(eq(tb_pools.token_a_id, dbTokenAId))
      .where(eq(tb_pools.token_b_id, dbTokenBId))
      .limit(1);
    
    return transformDatabaseResults(pools);
  }

  async create(data: {
    pool_address: string;
    token_a_id: string;
    token_b_id: string;
    lp_mint: string;
  }) {
    // Clean any IDs in the data
    const cleanedData = {
      ...data,
      token_a_id: removeHypPrefix(data.token_a_id),
      token_b_id: removeHypPrefix(data.token_b_id)
    };
    
    const newPools = await this.db.insert(tb_pools).values(cleanedData).returning();
    return transformDatabaseResults(newPools);
  }

  async update(id: string, data: Partial<typeof tb_pools.$inferInsert>) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    // Clean any IDs in the data
    const cleanedData = { ...data };
    if (cleanedData.token_a_id) {
      cleanedData.token_a_id = removeHypPrefix(cleanedData.token_a_id);
    }
    if (cleanedData.token_b_id) {
      cleanedData.token_b_id = removeHypPrefix(cleanedData.token_b_id);
    }
    
    const updatedPools = await this.db
      .update(tb_pools)
      .set({ ...cleanedData, updated_at: new Date() })
      .where(eq(tb_pools.id, dbId))
      .returning();
    
    return transformDatabaseResults(updatedPools);
  }

  async delete(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedPools = await this.db
      .delete(tb_pools)
      .where(eq(tb_pools.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedPools);
  }
} 