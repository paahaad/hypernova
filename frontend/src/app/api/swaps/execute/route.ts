import { NextRequest, NextResponse } from 'next/server';
import { swaps, pools, tokens } from '@/db/repositories';
import { removeHypPrefix } from '@/db/utils';

// POST /api/swaps/execute - Execute a swap
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['pool_id', 'user_wallet', 'amount_in', 'amount_out', 'token_in_id', 'token_out_id', 'tx_hash'];
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
    
    // Check if token_in exists
    const tokenIn = await tokens.findById(body.token_in_id);
    if (!tokenIn || tokenIn.length === 0) {
      return NextResponse.json(
        { error: 'Input token not found', success: false },
        { status: 404 }
      );
    }
    
    // Check if token_out exists
    const tokenOut = await tokens.findById(body.token_out_id);
    if (!tokenOut || tokenOut.length === 0) {
      return NextResponse.json(
        { error: 'Output token not found', success: false },
        { status: 404 }
      );
    }
    
    // Check if tx_hash already exists
    const existingSwap = await swaps.findByTxHash(body.tx_hash);
    if (existingSwap && existingSwap.length > 0) {
      return NextResponse.json(
        { error: 'Transaction already processed', success: false },
        { status: 409 }
      );
    }
    
    // Create the swap record
    const swapResult = await swaps.create({
      pool_id: removeHypPrefix(body.pool_id),
      user_wallet: body.user_wallet,
      amount_in: Number(body.amount_in),
      amount_out: Number(body.amount_out),
      token_in_id: removeHypPrefix(body.token_in_id),
      token_out_id: removeHypPrefix(body.token_out_id),
      tx_hash: body.tx_hash
    });
    
    // In UI-based integration, we might need to return a transaction to sign
    if (body.clientOrigin && body.clientOrigin === 'ui') {
      return NextResponse.json({
        success: true,
        data: swapResult,
        // Mock transaction for UI
        tx: Buffer.from('dummy_transaction_data').toString('base64')
      }, { status: 201 });
    }
    
    return NextResponse.json({ data: swapResult }, { status: 201 });
  } catch (error) {
    console.error('Error executing swap:', error);
    return NextResponse.json(
      { error: 'Failed to execute swap', success: false },
      { status: 500 }
    );
  }
} 