import { NextRequest, NextResponse } from 'next/server';
import { presales, presaleContributions } from '@/db/repositories';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/presales/[id]/contributions - List all contributions for a presale
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // First try to find presale by ID
    let presale = await presales.findById(id);
    
    // If not found by ID, try to find by presale_address
    if (!presale || presale.length === 0) {
      presale = await presales.findByPresaleAddress(id);
    }
    
    if (!presale || presale.length === 0) {
      return NextResponse.json(
        { error: 'Presale not found' },
        { status: 404 }
      );
    }
    
    // Use the actual presale ID for the lookup
    const contributions = await presaleContributions.findByPresaleId(presale[0].id);
    
    return NextResponse.json({ 
      success: true,
      data: contributions 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching presale contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presale contributions' },
      { status: 500 }
    );
  }
} 