import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_swaps } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class SwapsRepository extends BaseRepository {
  async findAll() {
    const swaps = await this.db.select().from(tb_swaps);
    return transformDatabaseResults(swaps);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const swaps = await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(swaps);
  }

  async findByPoolId(poolId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPoolId = removeHypPrefix(poolId);
    
    const swaps = await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.pool_id, dbPoolId));
    
    return transformDatabaseResults(swaps);
  }

  async findByUserWallet(userWallet: string) {
    const swaps = await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.user_wallet, userWallet));
    
    return transformDatabaseResults(swaps);
  }

  async findByTxHash(txHash: string) {
    const swaps = await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.tx_hash, txHash))
      .limit(1);
    
    return transformDatabaseResults(swaps);
  }

  async create(data: {
    pool_id: string;
    user_wallet: string;
    amount_in: string;
    amount_out: string;
    token_in_id: string;
    token_out_id: string;
    tx_hash: string;
  }) {
    // Clean any IDs in the data
    const cleanedData = {
      ...data,
      pool_id: removeHypPrefix(data.pool_id),
      token_in_id: removeHypPrefix(data.token_in_id),
      token_out_id: removeHypPrefix(data.token_out_id),
    };
    
    const newSwaps = await this.db.insert(tb_swaps).values(cleanedData).returning();
    return transformDatabaseResults(newSwaps);
  }

  async delete(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedSwaps = await this.db
      .delete(tb_swaps)
      .where(eq(tb_swaps.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedSwaps);
  }
} 