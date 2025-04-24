import { eq, desc } from 'drizzle-orm';
import { db } from '../config';
import { tb_swaps, tb_liquidity_positions, tb_pools } from '../schema';

export const transactionRepository = {
  /**
   * Get all swaps for a user
   */
  async getUserSwaps(userWallet: string) {
    return db.query.tb_swaps.findMany({
      where: eq(tb_swaps.user_wallet, userWallet),
      orderBy: [desc(tb_swaps.timestamp)],
      with: {
        pool: {
          with: {
            tokenA: true,
            tokenB: true
          }
        },
        tokenIn: true,
        tokenOut: true
      }
    });
  },

  /**
   * Get all liquidity positions for a user
   */
  async getUserLiquidityPositions(userWallet: string) {
    return db.query.tb_liquidity_positions.findMany({
      where: eq(tb_liquidity_positions.user_wallet, userWallet),
      with: {
        pool: {
          with: {
            tokenA: true,
            tokenB: true
          }
        }
      }
    });
  },

  /**
   * Get transaction history for a user (both swaps and LP actions)
   */
  async getUserTransactionHistory(userWallet: string) {
    const swaps = await this.getUserSwaps(userWallet);
    const positions = await this.getUserLiquidityPositions(userWallet);

    return {
      swaps,
      positions
    };
  }
}; 