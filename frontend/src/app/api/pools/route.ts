import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase/server";
import { PublicKey } from '@solana/web3.js';
import { createPool } from '@/lib/whirlpool/functions/createPool';
import { pools, tokens } from '@/db/repositories';
import { transformDatabaseResults, removeHypPrefix } from '@/db/utils';

// GET /api/pools - List all pools
export async function GET() {
    try {
        const allPools = await pools.findAll();
        return NextResponse.json({ data: allPools }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pools:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pools' },
            { status: 500 }
        );
    }
}

// POST /api/pools - Create a new pool
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // We need to handle two different API schemas:
        // 1. From UI: { tokenMintA, tokenMintB, userAddress }
        // 2. From our DB API: { pool_address, token_a_id, token_b_id, lp_mint }
        
        // If the body contains tokenMintA and tokenMintB, find the corresponding tokens
        if (body.tokenMintA && body.tokenMintB) {
            // Find tokenA by mint address
            const tokenA = await tokens.findByMintAddress(body.tokenMintA);
            if (!tokenA || tokenA.length === 0) {
                return NextResponse.json(
                    { error: 'Token A not found', success: false },
                    { status: 404 }
                );
            }
            
            // Find tokenB by mint address
            const tokenB = await tokens.findByMintAddress(body.tokenMintB);
            if (!tokenB || tokenB.length === 0) {
                return NextResponse.json(
                    { error: 'Token B not found', success: false },
                    { status: 404 }
                );
            }
            
            // Generate on-chain pool address (in a real implementation, this would be done by the blockchain)
            // For this example, we'll just combine the mint addresses to simulate a unique pool address
            const poolAddress = `${body.tokenMintA.substring(0, 6)}_${body.tokenMintB.substring(0, 6)}`;
            
            // Check if pool already exists for these tokens
            const existingPool = await pools.findByTokens(tokenA[0].id, tokenB[0].id);
            if (existingPool && existingPool.length > 0) {
                return NextResponse.json(
                    { error: 'Pool for these tokens already exists', success: false },
                    { status: 409 }
                );
            }
            
            // Create LP Mint (in a real implementation, this would be done by the blockchain)
            const lpMint = `LP_${poolAddress}`;
            
            // Create the pool in database
            const newPool = await pools.create({
                pool_address: poolAddress,
                token_a_id: removeHypPrefix(tokenA[0].id),
                token_b_id: removeHypPrefix(tokenB[0].id),
                lp_mint: lpMint
            });
            
            // Return the transaction to sign (in a real implementation)
            return NextResponse.json({
                success: true,
                data: newPool,
                // Mock transaction
                tx: Buffer.from('dummy_transaction_data').toString('base64')
            }, { status: 201 });
        }
        
        // Standard DB API schema
        const requiredFields = ['pool_address', 'token_a_id', 'token_b_id', 'lp_mint'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }
        
        // Check if tokens exist
        const tokenA = await tokens.findById(body.token_a_id);
        if (!tokenA || tokenA.length === 0) {
            return NextResponse.json(
                { error: 'Token A not found' },
                { status: 404 }
            );
        }
        
        const tokenB = await tokens.findById(body.token_b_id);
        if (!tokenB || tokenB.length === 0) {
            return NextResponse.json(
                { error: 'Token B not found' },
                { status: 404 }
            );
        }
        
        // Create the pool
        const newPool = await pools.create({
            pool_address: body.pool_address,
            token_a_id: removeHypPrefix(body.token_a_id),
            token_b_id: removeHypPrefix(body.token_b_id),
            lp_mint: body.lp_mint
        });
        
        return NextResponse.json({ data: newPool }, { status: 201 });
    } catch (error) {
        console.error('Error creating pool:', error);
        return NextResponse.json(
            { error: 'Failed to create pool', success: false },
            { status: 500 }
        );
    }
}
