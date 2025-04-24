import { eq } from 'drizzle-orm';
import { db } from '../config';
import { tb_swaps } from '../schema';

export interface Swap {
  pool_id?: string;
  user_wallet: string;
  amount_in: string | number;
  amount_out: string | number;
  token_in_id?: string;
  token_out_id?: string;
  tx_hash: string;
}

export const swapRepository = {
  /**
   * Create a new swap record
   */
  async create(swapData: Swap) {
    return db.insert(tb_swaps).values({
      ...swapData,
      amount_in: swapData.amount_in.toString(),
      amount_out: swapData.amount_out.toString()
    });
  },

  /**
   * Find swap by transaction hash
   */
  async findByTxHash(txHash: string) {
    return db.query.tb_swaps.findFirst({
      where: eq(tb_swaps.tx_hash, txHash)
    });
  }
}; 