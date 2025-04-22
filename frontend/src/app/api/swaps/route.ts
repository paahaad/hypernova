import { NextResponse } from 'next/server';
import { swaps } from '@/db/repositories';

// GET /api/swaps - List all swaps
export async function GET() {
  try {
    const allSwaps = await swaps.findAll();
    return NextResponse.json({ data: allSwaps }, { status: 200 });
  } catch (error) {
    console.error('Error fetching swaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swaps' },
      { status: 500 }
    );
  }
} 