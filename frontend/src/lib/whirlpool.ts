import { PublicKey, Transaction } from '@solana/web3.js';
import { WhirlpoolContext, buildWhirlpoolClient } from '@orca-so/whirlpools-sdk';
import { connection } from './anchor';

interface SwapParams {
  whirlpoolAddress: PublicKey;
  amount: number;
  userAddress: PublicKey;
  aToB: boolean;
  amountSpecifiedIsInput: boolean;
  minOutputAmount: number;
}

export async function swap({
  whirlpoolAddress,
  amount,
  userAddress,
  aToB,
  amountSpecifiedIsInput,
  minOutputAmount,
}: SwapParams): Promise<Transaction> {
  try {
    const ctx = WhirlpoolContext.withConnection(connection);
    const client = buildWhirlpoolClient(ctx);
    
    const whirlpool = await client.getPool(whirlpoolAddress);
    const quote = await whirlpool.getQuote({
      amount,
      aToB,
      amountSpecifiedIsInput,
      slippageTolerance: minOutputAmount,
    });

    const tx = await whirlpool.swap({
      ...quote,
      userAddress,
    });

    return tx.transaction;
  } catch (error: any) {
    console.error('Error in swap:', error);
    throw new Error(error.message || 'Failed to create swap transaction');
  }
} 