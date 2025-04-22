import { NextRequest, NextResponse } from 'next/server';
import { presales, tokens } from '@/db/repositories';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/presales/[id] - Get presale details by ID or address
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // First try to find by ID
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
    
    // Get token details
    const token = await tokens.findById(presale[0].token_id);
    
    // Include token details in the response
    const presaleWithToken = {
      ...presale[0],
      token: token && token.length > 0 ? token[0] : null,
    };
    
    return NextResponse.json({ 
      success: true, 
      data: presaleWithToken,
      presale: presaleWithToken // For backward compatibility with old API
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching presale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presale' },
      { status: 500 }
    );
  }
}

// PATCH /api/presales/[id] - Update a presale
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // First try to find by ID
    let existingPresale = await presales.findById(id);
    
    // If not found by ID, try to find by presale_address
    if (!existingPresale || existingPresale.length === 0) {
      existingPresale = await presales.findByPresaleAddress(id);
    }
    
    if (!existingPresale || existingPresale.length === 0) {
      return NextResponse.json(
        { error: 'Presale not found' },
        { status: 404 }
      );
    }
    
    // Update the presale (use the actual ID from the found presale)
    const updatedPresale = await presales.update(existingPresale[0].id, {
      status: body.status,
      total_raised: body.total_raised,
      end_time: body.end_time ? new Date(body.end_time) : undefined
    });
    
    return NextResponse.json({ 
      success: true,
      data: updatedPresale 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating presale:', error);
    return NextResponse.json(
      { error: 'Failed to update presale' },
      { status: 500 }
    );
  }
} 