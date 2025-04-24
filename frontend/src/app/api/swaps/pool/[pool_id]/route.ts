import { NextRequest, NextResponse } from 'next/server';
import { swaps, pools, tokens } from '@/db/repositories';

interface RouteParams {
  params: {
    pool_id: string;
  };
}

// GET /api/swaps/pool/[pool_id] - List all swaps for a specific pool
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { pool_id } = params;
    
    // Check if pool exists
    const pool = await pools.findById(pool_id);
    if (!pool || pool.length === 0) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      );
    }
    
    // Get all swaps for this pool
    const poolSwaps = await swaps.findByPoolId(pool_id);
    
    // Enhance swaps with token information
    const enhancedSwaps = await Promise.all(
      poolSwaps.map(async (swap) => {
        const tokenIn = swap.token_in_id ? await tokens.findById(swap.token_in_id) : null;
        const tokenOut = swap.token_out_id ? await tokens.findById(swap.token_out_id) : null;
        
        return {
          ...swap,
          tokenIn: tokenIn && tokenIn.length > 0 ? tokenIn[0] : null,
          tokenOut: tokenOut && tokenOut.length > 0 ? tokenOut[0] : null,
        };
      })
    );
    
    return NextResponse.json({ data: enhancedSwaps }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pool swaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool swaps' },
      { status: 500 }
    );
  }
} 