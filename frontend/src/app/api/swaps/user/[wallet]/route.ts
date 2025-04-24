import { NextRequest, NextResponse } from 'next/server';
import { swaps, pools, tokens } from '@/db/repositories';

interface RouteParams {
  params: {
    wallet: string;
  };
}

// GET /api/swaps/user/[wallet] - List all swaps for a user
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { wallet } = params;
    
    // Get all swaps for this user
    const userSwaps = await swaps.findByUserWallet(wallet);
    
    if (!userSwaps || userSwaps.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    
    // Enhance swaps with pool and token information
    const enhancedSwaps = await Promise.all(
      userSwaps.map(async (swap) => {
        const pool = swap.pool_id ? await pools.findById(swap.pool_id) : null;
        const tokenIn = swap.token_in_id ? await tokens.findById(swap.token_in_id) : null;
        const tokenOut = swap.token_out_id ? await tokens.findById(swap.token_out_id) : null;
        
        return {
          ...swap,
          pool: pool && pool.length > 0 ? pool[0] : null,
          tokenIn: tokenIn && tokenIn.length > 0 ? tokenIn[0] : null,
          tokenOut: tokenOut && tokenOut.length > 0 ? tokenOut[0] : null,
        };
      })
    );
    
    return NextResponse.json({ data: enhancedSwaps }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user swaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user swaps' },
      { status: 500 }
    );
  }
} 