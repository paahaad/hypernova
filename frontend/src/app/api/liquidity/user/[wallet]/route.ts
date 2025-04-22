import { NextRequest, NextResponse } from 'next/server';
import { liquidityPositions, pools, tokens } from '@/db/repositories';

interface RouteParams {
  params: {
    wallet: string;
  };
}

// GET /api/liquidity/user/[wallet] - List positions for a specific user
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { wallet } = params;
    const positions = await liquidityPositions.findByUserWallet(wallet);
    
    if (!positions || positions.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    
    // Enhance positions with pool and token data
    const enhancedPositions = await Promise.all(
      positions.map(async (position) => {
        const pool = position.pool_id ? await pools.findById(position.pool_id) : null;
        
        if (!pool || pool.length === 0) {
          return position;
        }
        
        const tokenA = pool[0].token_a_id ? await tokens.findById(pool[0].token_a_id) : null;
        const tokenB = pool[0].token_b_id ? await tokens.findById(pool[0].token_b_id) : null;
        
        return {
          ...position,
          pool: pool[0],
          tokenA: tokenA && tokenA.length > 0 ? tokenA[0] : null,
          tokenB: tokenB && tokenB.length > 0 ? tokenB[0] : null,
        };
      })
    );
    
    return NextResponse.json({ data: enhancedPositions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user liquidity positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user liquidity positions' },
      { status: 500 }
    );
  }
} 