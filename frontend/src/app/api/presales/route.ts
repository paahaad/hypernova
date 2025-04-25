import { NextRequest, NextResponse } from 'next/server';
import { presales, tokens } from '@/db/repositories';

// GET /api/presales - List all presales
export async function GET() {
  try {
    const allPresales = await presales.findAll();
    return NextResponse.json({ data: allPresales }, { status: 200 });
  } catch (error) {
    console.error('Error fetching presales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presales' },
      { status: 500 }
    );
  }
}

// POST /api/presales - Create a new presale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['presale_address', 'target_amount', 'start_time', 'end_time'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // If mint_address is provided, check if token exists
    if (body.mint_address) {
      const token = await tokens.findByMintAddress(body.mint_address);
      if (!token || token.length === 0) {
        console.log('Token not found, will be created later');
      }
    }
    
    // Check if presale with this address already exists
    const existingPresale = await presales.findByPresaleAddress(body.presale_address);
    if (existingPresale && existingPresale.length > 0) {
      return NextResponse.json(
        { error: 'Presale with this address already exists' },
        { status: 409 }
      );
    }
    
    // Ensure total_raised is included and defaulted to 0 if not provided
    if (body.total_raised === undefined) {
      body.total_raised = 0;
    }
    
    // Create the presale
    const newPresale = await presales.create({
      mint_address: body.mint_address,
      presale_address: body.presale_address,
      total_raised: body.total_raised,
      target_amount: body.target_amount,
      start_time: body.start_time,
      end_time: body.end_time,
      status: body.status || 'active'
    });
    
    return NextResponse.json({ data: newPresale }, { status: 201 });
  } catch (error) {
    console.error('Error creating presale:', error);
    return NextResponse.json(
      { error: 'Failed to create presale' },
      { status: 500 }
    );
  }
} 