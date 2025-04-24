import { NextRequest, NextResponse } from 'next/server';
import { pools, tokens } from '@/db/repositories';
import { removeHypPrefix } from '@/db/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/pools/[id] - Get pool details by ID or address
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    let pool;
    
    // First try to find by ID
    pool = await pools.findById(id);
    
    // If not found by ID, try to find by pool_address
    if (!pool || pool.length === 0) {
      pool = await pools.findByPoolAddress(id);
    }
    
    if (!pool || pool.length === 0) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      );
    }
    
    // Get token details for both tokens
    const tokenA = pool[0].token_a_id ? await tokens.findById(pool[0].token_a_id) : null;
    const tokenB = pool[0].token_b_id ? await tokens.findById(pool[0].token_b_id) : null;
    
    // Include token details in the response
    const poolWithTokens = {
      ...pool[0],
      tokenA: tokenA && tokenA.length > 0 ? tokenA[0] : null,
      tokenB: tokenB && tokenB.length > 0 ? tokenB[0] : null,
    };
    
    return NextResponse.json({ 
      success: true,
      data: poolWithTokens,
      pool: poolWithTokens // For backward compatibility with old API
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool' },
      { status: 500 }
    );
  }
}

// PATCH /api/pools/[id] - Update a pool (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if pool exists by ID
    let existingPool = await pools.findById(id);
    
    // If not found by ID, try by pool_address
    if (!existingPool || existingPool.length === 0) {
      existingPool = await pools.findByPoolAddress(id);
    }
    
    if (!existingPool || existingPool.length === 0) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      );
    }
    
    // Update the pool (use the actual ID from the found pool)
    const updatedPool = await pools.update(existingPool[0].id, {
      lp_mint: body.lp_mint,
      // Don't allow updating token references or pool address for security
    });
    
    return NextResponse.json({ 
      success: true,
      data: updatedPool 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating pool:', error);
    return NextResponse.json(
      { error: 'Failed to update pool' },
      { status: 500 }
    );
  }
} 