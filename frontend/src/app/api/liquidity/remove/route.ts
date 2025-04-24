import { NextRequest, NextResponse } from 'next/server';
import { liquidityPositions } from '@/db/repositories';

// POST /api/liquidity/remove - Remove liquidity from a pool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['id', 'amount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if position exists
    const position = await liquidityPositions.findById(body.id);
    if (!position || position.length === 0) {
      return NextResponse.json(
        { error: 'Liquidity position not found', success: false },
        { status: 404 }
      );
    }
    
    // Calculate new amounts
    const percentToRemove = Number(body.amount) / Number(position[0].lp_tokens);
    const newAmountA = Number(position[0].amount_token_a) * (1 - percentToRemove);
    const newAmountB = Number(position[0].amount_token_b) * (1 - percentToRemove);
    const newLpTokens = Number(position[0].lp_tokens) - Number(body.amount);
    
    let result;
    
    // If removing all liquidity, delete the position
    if (newLpTokens <= 0) {
      result = await liquidityPositions.delete(body.id);
    } else {
      // Update position with new amounts
      result = await liquidityPositions.update(body.id, {
        amount_token_a: String(newAmountA),
        amount_token_b: String(newAmountB),
        lp_tokens: String(newLpTokens)
      });
    }
    
    // In UI-based integration, we'd also return a transaction to sign
    if (body.clientOrigin && body.clientOrigin === 'ui') {
      return NextResponse.json({
        success: true,
        data: result,
        // Mock transaction
        tx: Buffer.from('dummy_transaction_data').toString('base64')
      }, { status: 200 });
    }
    
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error removing liquidity:', error);
    return NextResponse.json(
      { error: 'Failed to remove liquidity', success: false },
      { status: 500 }
    );
  }
} 