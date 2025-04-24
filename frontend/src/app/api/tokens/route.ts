import { NextRequest, NextResponse } from 'next/server';
import { tokens } from '@/db/repositories';

// GET /api/tokens - List all tokens
export async function GET() {
  try {
    const allTokens = await tokens.findAll();
    return NextResponse.json({ data: allTokens }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

// POST /api/tokens - Create a new token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['mint_address', 'symbol', 'name', 'decimals'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if token with mint_address already exists
    const existingToken = await tokens.findByMintAddress(body.mint_address);
    if (existingToken && existingToken.length > 0) {
      return NextResponse.json(
        { error: 'Token with this mint address already exists' },
        { status: 409 }
      );
    }
    
    // Create the token
    const newToken = await tokens.create({
      mint_address: body.mint_address,
      symbol: body.symbol,
      name: body.name,
      decimals: body.decimals,
      logo_uri: body.logo_uri
    });
    
    return NextResponse.json({ data: newToken }, { status: 201 });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
} 