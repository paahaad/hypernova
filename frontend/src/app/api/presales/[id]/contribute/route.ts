import { NextRequest, NextResponse } from 'next/server';
import { presales, presaleContributions } from '@/db/repositories';
import { removeHypPrefix } from '@/db/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/presales/[id]/contribute - Contribute to a presale
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['user_wallet', 'amount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // First try to find presale by ID
    let presale = await presales.findById(id);
    
    // If not found by ID, try to find by presale_address
    if (!presale || presale.length === 0) {
      presale = await presales.findByPresaleAddress(id);
    }
    
    if (!presale || presale.length === 0) {
      return NextResponse.json(
        { error: 'Presale not found', success: false },
        { status: 404 }
      );
    }
    
    // Check if presale is active
    if (presale[0].status !== 'active') {
      return NextResponse.json(
        { error: `Presale is not active. Current status: ${presale[0].status}`, success: false },
        { status: 400 }
      );
    }
    
    // Create contribution record
    const contribution = await presaleContributions.create({
      presale_id: removeHypPrefix(presale[0].id),
      user_wallet: body.user_wallet,
      amount: body.amount
    });
    
    // Update total_raised in presale
    const updatedPresale = await presales.update(presale[0].id, {
      total_raised: String(Number(presale[0].total_raised) + Number(body.amount))
    });
    
    // In UI-based integration, we'd also return a transaction to sign
    if (body.clientOrigin && body.clientOrigin === 'ui') {
      return NextResponse.json({
        success: true,
        data: {
          contribution,
          presale: updatedPresale[0]
        },
        // Mock transaction
        tx: Buffer.from('dummy_transaction_data').toString('base64')
      }, { status: 201 });
    }
    
    return NextResponse.json({ 
      success: true,
      data: {
        contribution,
        presale: updatedPresale[0]
      } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error contributing to presale:', error);
    return NextResponse.json(
      { error: 'Failed to contribute to presale', success: false },
      { status: 500 }
    );
  }
} 