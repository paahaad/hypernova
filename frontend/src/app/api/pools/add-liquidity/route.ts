import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.poolAddress || !body.tokenAAmount || !body.tokenBAmount || !body.priceLower || !body.priceUpper || !body.userAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: poolAddress, tokenAAmount, tokenBAmount, priceLower, or priceUpper' },
                { status: 400 }
            );
        }

        // Verify pool exists
        const { data: pool, error: poolError } = await supabase
            .from('pools')
            .select('*')
            .eq('whirlpool_address', body.poolAddress)
            .single();

        if (poolError || !pool) {
            return NextResponse.json(
                { error: 'Pool not found' },
                { status: 404 }
            );
        }

        console.table({"poolAddress" : body.poolAddress, "tokenAAmount" : body.tokenAAmount, "tokenBAmount" : body.tokenBAmount, "priceLower" : body.priceLower, "priceUpper" : body.priceUpper})

        // Forward the request to the backend
        const response = await fetch(`${BACKEND_URL}/liquidity/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                whirlpoolAddress: body.poolAddress,
                userAddress: body.userAddress,
                tokenAmountA: body.tokenAAmount,
                tokenAmountB: body.tokenBAmount,
                priceLower: body.priceLower,
                priceUpper: body.priceUpper,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add liquidity');
        }

        return NextResponse.json({ 
            success: true, 
            tx: data.tx,
            message: 'Liquidity added successfully'
        });
    } catch (error) {
        console.error('Error adding liquidity:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add liquidity' },
            { status: 500 }
        );
    }
} 