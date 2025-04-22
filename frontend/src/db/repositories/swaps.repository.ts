import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_swaps } from '../schema';

export class SwapsRepository extends BaseRepository {
  async findAll() {
    return await this.db.select().from(tb_swaps);
  }

  async findById(id: string) {
    return await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.id, id))
      .limit(1);
  }

  async findByPoolId(poolId: string) {
    return await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.pool_id, poolId));
  }

  async findByUserWallet(userWallet: string) {
    return await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.user_wallet, userWallet));
  }

  async findByTxHash(txHash: string) {
    return await this.db
      .select()
      .from(tb_swaps)
      .where(eq(tb_swaps.tx_hash, txHash))
      .limit(1);
  }

  async create(data: {
    pool_id: string;
    user_wallet: string;
    amount_in: number;
    amount_out: number;
    token_in_id: string;
    token_out_id: string;
    tx_hash: string;
  }) {
    return await this.db.insert(tb_swaps).values(data).returning();
  }

  async delete(id: string) {
    return await this.db
      .delete(tb_swaps)
      .where(eq(tb_swaps.id, id))
      .returning();
  }
} 