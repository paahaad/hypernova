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
    const requiredFields = ['token_id', 'presale_address', 'total_raised', 'target_amount', 'start_time', 'end_time'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if token exists
    const token = await tokens.findById(body.token_id);
    if (!token || token.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Check if presale with this address already exists
    const existingPresale = await presales.findByTokenId(body.token_id);
    if (existingPresale && existingPresale.length > 0) {
      return NextResponse.json(
        { error: 'Presale for this token already exists' },
        { status: 409 }
      );
    }
    
    // Create the presale
    const newPresale = await presales.create({
      token_id: body.token_id,
      presale_address: body.presale_address,
      total_raised: body.total_raised,
      target_amount: body.target_amount,
      start_time: new Date(body.start_time),
      end_time: new Date(body.end_time),
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