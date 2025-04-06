import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { swap } from '@/lib/whirlpool/functions/swap';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.whirlpoolAddress || !body.userAddress || 
            body.inputTokenAmount === undefined || body.aToB === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Default values
        const amountSpecifiedIsInput = body.amountSpecifiedIsInput !== undefined ? body.amountSpecifiedIsInput : true;
        const minOutputAmount = body.minOutputAmount !== undefined ? body.minOutputAmount : 0;

        // Execute the swap using direct implementation
        const result = await swap(
            new PublicKey(body.whirlpoolAddress),
            new PublicKey(body.userAddress),
            body.inputTokenAmount,
            body.aToB,
            amountSpecifiedIsInput,
            minOutputAmount
        );

        return NextResponse.json({ 
            success: true, 
            tx: result.tx
        });
    } catch (error) {
        console.error('Error swapping tokens:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to swap tokens' },
            { status: 500 }
        );
    }
} 