import { NextRequest, NextResponse } from 'next/server';
import { fees, pools, tokens } from '@/db/repositories';

interface RouteParams {
  params: {
    wallet: string;
  };
}

// GET /api/fees/user/[wallet] - Fetch unclaimed fees for a user
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { wallet } = params;
    
    // Get all unclaimed fees for this user
    const userFees = await fees.findByUserWallet(wallet);
    
    if (!userFees || userFees.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    
    // Enhance fees with pool and token information
    const enhancedFees = await Promise.all(
      userFees.map(async (fee) => {
        const pool = fee.pool_id ? await pools.findById(fee.pool_id) : null;
        
        if (!pool || pool.length === 0) {
          return fee;
        }
        
        const tokenA = pool[0].token_a_id ? await tokens.findById(pool[0].token_a_id) : null;
        const tokenB = pool[0].token_b_id ? await tokens.findById(pool[0].token_b_id) : null;
        
        return {
          ...fee,
          pool: pool[0],
          tokenA: tokenA && tokenA.length > 0 ? tokenA[0] : null,
          tokenB: tokenB && tokenB.length > 0 ? tokenB[0] : null,
        };
      })
    );
    
    return NextResponse.json({ data: enhancedFees }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user fees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user fees' },
      { status: 500 }
    );
  }
} 