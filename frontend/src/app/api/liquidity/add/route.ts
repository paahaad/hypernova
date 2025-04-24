import { NextRequest, NextResponse } from 'next/server';
import { liquidityPositions, pools } from '@/db/repositories';
import { removeHypPrefix } from '@/db/utils';

// POST /api/liquidity/add - Add liquidity to a pool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['user_wallet', 'pool_id', 'amount_token_a', 'amount_token_b', 'lp_tokens'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if pool exists
    const pool = await pools.findById(body.pool_id);
    if (!pool || pool.length === 0) {
      return NextResponse.json(
        { error: 'Pool not found', success: false },
        { status: 404 }
      );
    }
    
    // Check if user already has a position in this pool
    const existingPosition = await liquidityPositions.findByUserAndPool(
      body.user_wallet,
      body.pool_id
    );
    
    let result;
    
    if (existingPosition && existingPosition.length > 0) {
      // Calculate and store numeric values
      const newAmountA = Number(existingPosition[0].amount_token_a) + Number(body.amount_token_a);
      const newAmountB = Number(existingPosition[0].amount_token_b) + Number(body.amount_token_b);
      const newLpTokens = Number(existingPosition[0].lp_tokens) + Number(body.lp_tokens);
      
      // Update existing position
      result = await liquidityPositions.update(existingPosition[0].id, {
        amount_token_a: String(newAmountA),
        amount_token_b: String(newAmountB),
        lp_tokens: String(newLpTokens)
      });
    } else {
      // Create new position
      result = await liquidityPositions.create({
        user_wallet: body.user_wallet,
        pool_id: removeHypPrefix(body.pool_id),
        amount_token_a: Number(body.amount_token_a),
        amount_token_b: Number(body.amount_token_b),
        lp_tokens: Number(body.lp_tokens)
      });
    }
    
    // In UI-based integration, we'd also return a transaction to sign
    if (body.clientOrigin && body.clientOrigin === 'ui') {
      return NextResponse.json({
        success: true,
        data: result,
        // Mock transaction
        tx: Buffer.from('dummy_transaction_data').toString('base64')
      }, { status: 201 });
    }
    
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('Error adding liquidity:', error);
    return NextResponse.json(
      { error: 'Failed to add liquidity', success: false },
      { status: 500 }
    );
  }
} 