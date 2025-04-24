import { NextRequest, NextResponse } from 'next/server';
import { tokens } from '@/db/repositories';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/tokens/[id] - Get token details by ID
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const token = await tokens.findById(id);
    
    if (!token || token.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: token[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}

// PATCH /api/tokens/[id] - Update a token
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if token exists
    const existingToken = await tokens.findById(id);
    if (!existingToken || existingToken.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Update the token
    const updatedToken = await tokens.update(id, {
      symbol: body.symbol,
      name: body.name,
      decimals: body.decimals,
      logo_uri: body.logo_uri
    });
    
    return NextResponse.json({ data: updatedToken }, { status: 200 });
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json(
      { error: 'Failed to update token' },
      { status: 500 }
    );
  }
}

// DELETE /api/tokens/[id] - Delete a token (admin only)
export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Check if token exists
    const existingToken = await tokens.findById(id);
    if (!existingToken || existingToken.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Delete the token
    const deletedToken = await tokens.delete(id);
    
    return NextResponse.json({ data: deletedToken }, { status: 200 });
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json(
      { error: 'Failed to delete token' },
      { status: 500 }
    );
  }
} 