import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { addLiquidity } from '@/lib/whirlpool/functions/addLiquidity';
import { pools } from '@/db/repositories';

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
        const poolData = await pools.findByPoolAddress(body.poolAddress);

        if (!poolData || poolData.length === 0) {
            return NextResponse.json(
                { error: 'Pool not found' },
                { status: 404 }
            );
        }

        console.table({"poolAddress": body.poolAddress, "tokenAAmount": body.tokenAAmount, "tokenBAmount": body.tokenBAmount, "priceLower": body.priceLower, "priceUpper": body.priceUpper});

        // Add liquidity using our direct implementation
        const result = await addLiquidity(
            new PublicKey(body.poolAddress),
            new PublicKey(body.userAddress),
            body.tokenAAmount,
            body.tokenBAmount,
            body.priceLower,
            body.priceUpper
        );

        return NextResponse.json({ 
            success: true, 
            tx: result.tx,
            positionMint: result.positionMint,
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