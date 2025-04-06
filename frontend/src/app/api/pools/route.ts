import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase/server";
import { envBACKEND_URL } from '@/lib/env';

const BACKEND_URL = envBACKEND_URL;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.tokenMintA || !body.tokenMintB || !body.userAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: tokenMintA, tokenMintB, or userAddress' },
                { status: 400 }
            );
        }
        const { data: existingPool, error: checkError } = await supabase
            .from('pools')
            .select('whirlpool_address')
            .or(`token_mint_a.eq.${body.tokenMintA},token_mint_a.eq.${body.tokenMintB}`)
            .or(`token_mint_b.eq.${body.tokenMintB},token_mint_b.eq.${body.tokenMintA}`)
            .single();


        console.log("existingPool", existingPool);
        console.log("checkError", checkError);

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error checking existing pool:', checkError);
            return NextResponse.json(
                { error: 'Failed to check existing pool' },
                { status: 500 }
            );
        }

        if (existingPool) {
            return NextResponse.json(
                {
                    success: true,
                    whirlpoolAddress: existingPool.whirlpool_address,
                    message: 'Pool already exists',
                    tx: null
                }
            );
        }

        // Forward the request to the backend
        const response = await fetch(`${BACKEND_URL}/pool`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        const tx = data.tx;
        const whirlpoolAddress = data.whirlpoolAddress;

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create pool');
        }

        // Save pool data to Supabase
        const { error: supabaseError } = await supabase
            .from('pools')
            .insert({
                token_mint_a: body.tokenMintA,
                token_mint_b: body.tokenMintB,
                whirlpool_address: whirlpoolAddress,
                created_at: new Date().toISOString(),
            });

        if (supabaseError) {
            console.error('Error saving pool to Supabase:', supabaseError);
            // Don't throw error here, as the pool was created successfully
        }

        return NextResponse.json({ success: true, tx, whirlpoolAddress });
    } catch (error) {
        console.error('Error creating pool:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create pool' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { data: pools, error } = await supabase
            .from('pools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pools:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pools' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, pools });
    } catch (error) {
        console.error('Error fetching pools:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch pools' },
            { status: 500 }
        );
    }
}
