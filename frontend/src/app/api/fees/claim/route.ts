import { NextRequest, NextResponse } from 'next/server';
import { fees } from '@/db/repositories';
import { removeHypPrefix } from '@/db/utils';

// POST /api/fees/claim - Claim trading fees
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['user_wallet', 'pool_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if user has unclaimed fees for this pool
    const userFees = await fees.findByPoolAndUser(body.pool_id, body.user_wallet);
    
    if (!userFees || userFees.length === 0) {
      return NextResponse.json(
        { error: 'No unclaimed fees found', success: false },
        { status: 404 }
      );
    }
    
    // In a real implementation, we'd interact with the blockchain to claim fees
    
    // Update fee record to mark as claimed
    const claimedFees = await fees.update(userFees[0].id, {
      unclaimed_fee_a: '0',
      unclaimed_fee_b: '0',
      last_claimed_at: new Date()
    });
    
    // In UI-based integration, we'd also return a transaction to sign
    if (body.clientOrigin && body.clientOrigin === 'ui') {
      return NextResponse.json({
        success: true,
        data: claimedFees,
        // Mock transaction
        tx: Buffer.from('dummy_transaction_data').toString('base64')
      }, { status: 200 });
    }
    
    return NextResponse.json({ data: claimedFees }, { status: 200 });
  } catch (error) {
    console.error('Error claiming fees:', error);
    return NextResponse.json(
      { error: 'Failed to claim fees', success: false },
      { status: 500 }
    );
  }
} 