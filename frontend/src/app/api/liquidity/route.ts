import { NextResponse } from 'next/server';
import { liquidityPositions, pools, tokens } from '@/db/repositories';

// GET /api/liquidity - List all liquidity positions
export async function GET() {
  try {
    const positions = await liquidityPositions.findAll();
    return NextResponse.json({ data: positions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching liquidity positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liquidity positions' },
      { status: 500 }
    );
  }
} 