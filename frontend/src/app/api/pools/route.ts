import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createPool } from '@/lib/whirlpool/functions/createPool';
import { pools, tokens } from '@/db/repositories';
import { transformDatabaseResults, removeHypPrefix } from '@/db/utils';

// GET /api/pools - List all pools
export async function GET() {
    try {
        const allPools = await pools.findAll();
        
        // For each pool, fetch token details
        const poolsWithTokenData = await Promise.all(
            allPools.map(async (pool) => {
                let tokenAMint = '';
                let tokenBMint = '';
                let tokenASymbol = '';
                let tokenBSymbol = '';
                let tokenAName = '';
                let tokenBName = '';
                let tokenALogoURI = '';
                let tokenBLogoURI = '';
                
                // Fetch token A details if token_a_id exists
                if (pool.token_a_id) {
                    const tokenADetails = await tokens.findById(pool.token_a_id);
                    if (tokenADetails && tokenADetails.length > 0) {
                        tokenAMint = tokenADetails[0].mint_address;
                        tokenASymbol = tokenADetails[0].symbol;
                        tokenAName = tokenADetails[0].name;
                        tokenALogoURI = tokenADetails[0].logo_uri || '';
                    }
                }
                
                // Fetch token B details if token_b_id exists
                if (pool.token_b_id) {
                    const tokenBDetails = await tokens.findById(pool.token_b_id);
                    if (tokenBDetails && tokenBDetails.length > 0) {
                        tokenBMint = tokenBDetails[0].mint_address;
                        tokenBSymbol = tokenBDetails[0].symbol;
                        tokenBName = tokenBDetails[0].name;
                        tokenBLogoURI = tokenBDetails[0].logo_uri || '';
                    }
                }
                
                // Format metrics properly
                let liquidity = '$0';
                let volume24h = '$0';
                
                if (pool.liquidity) {
                    // Format as currency
                    liquidity = `$${parseFloat(pool.liquidity).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                }
                
                if (pool.volume_24h) {
                    // Format as currency
                    volume24h = `$${parseFloat(pool.volume_24h).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                }
                
                return {
                    whirlpool_address: pool.pool_address,
                    token_mint_a: tokenAMint || `Unknown-${pool.token_a_id?.substring(0, 8) || 'Token-A'}`,
                    token_mint_b: tokenBMint || `Unknown-${pool.token_b_id?.substring(0, 8) || 'Token-B'}`,
                    token_a_symbol: tokenASymbol || 'UNK',
                    token_b_symbol: tokenBSymbol || 'UNK',
                    token_a_name: tokenAName || 'Unknown Token A',
                    token_b_name: tokenBName || 'Unknown Token B',
                    token_a_logo_uri: tokenALogoURI,
                    token_b_logo_uri: tokenBLogoURI,
                    created_at: pool.created_at || new Date().toISOString(),
                    liquidity: liquidity,
                    volume_24h: volume24h
                };
            })
        );
        
        return NextResponse.json({ success: true, pools: poolsWithTokenData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pools:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pools', success: false },
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
