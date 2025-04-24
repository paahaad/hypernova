import express, { Request, Response } from 'express';
import type { Application } from 'express';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import swap from './functions/pools/swap';
import createPool from './functions/pools/createPool';
import addLP from './functions/pools/addLP';
import removeLP from './functions/pools/removeLP';
import { ctx, config, configExtension } from './client';
import { envPORT } from './env';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection, db } from './db/config';
import { poolRepository } from './db/repositories/poolRepository';
import { swapRepository } from './db/repositories/swapRepository';
import { liquidityRepository } from './db/repositories/liquidityRepository';
import { tokenRepository } from './db/repositories/tokenRepository';
import { transactionRepository } from './db/repositories/transactionRepository';
/* eslint-disable @typescript-eslint/no-explicit-any */

// Load environment variables
dotenv.config();

const app: Application = express();
app.use(cors({
  origin: "*", // Specify your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Initialize Whirlpools configuration
async function initializeWhirlpools() {
    try {
        // Check if config exists
        const configAccount = await ctx.fetcher.getConfig(config);
        if (!configAccount) {
            console.log("Whirlpools config not found, initializing...");
            // Initialize config if needed
            await ctx.program.methods
                .initializeConfig(
                    ctx.wallet.publicKey,
                    ctx.wallet.publicKey,
                    ctx.wallet.publicKey,
                    25
                )
                .accounts({
                    config,
                    funder: ctx.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            console.log("Whirlpools config initialized");
        }

        // Check if config extension exists
        const configExtensionAccount = await ctx.fetcher.getConfigExtension(configExtension);
        if (!configExtensionAccount) {
            console.log("Config extension not found, initializing...");
            // Initialize config extension if needed
            await ctx.program.methods
                .initializeConfigExtension()
                .accounts({
                    configExtension,
                    config,
                    funder: ctx.wallet.publicKey,
                    feeAuthority: ctx.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            console.log("Config extension initialized");
        }
    } catch (error) {
        console.error("Error initializing Whirlpools:", error);
        throw error;
    }
}

// Start server only after initialization
async function startServer() {
    try {
        // Check database connection first
        const dbConnected = await checkDatabaseConnection();
        if (!dbConnected) {
            console.error("Unable to connect to the database. Please check your connection settings.");
            process.exit(1);
        }
        
        await initializeWhirlpools();
        const PORT = envPORT;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

/**
 * @swagger
 * /swap:
 *   post:
 *     summary: Swap tokens in a Whirlpool
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whirlpoolAddress
 *               - inputTokenAmount
 *               - aToB
 *               - amountSpecifiedIsInput
 *               - minOutputAmount
 *             properties:
 *               whirlpoolAddress:
 *                 $ref: '#/components/schemas/PublicKey'
 *               inputTokenAmount:
 *                 type: number
 *                 description: Amount of input tokens to swap
 *               aToB:
 *                 type: boolean
 *                 description: Direction of swap (true for A→B, false for B→A)
 *               amountSpecifiedIsInput:
 *                 type: boolean
 *                 description: Whether the specified amount is input or output
 *               minOutputAmount:
 *                 type: number
 *                 description: Minimum amount of tokens to receive
 *     responses:
 *       200:
 *         description: Successful swap
 *       500:
 *         description: Error occurred during swap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/swap', async (req, res) => {
    try {
        const { whirlpoolAddress, inputTokenAmount, aToB, amountSpecifiedIsInput, minOutputAmount, userAddress } = req.body;
        const result = await swap(
            new PublicKey(whirlpoolAddress),
            inputTokenAmount,
            aToB,
            amountSpecifiedIsInput,
            minOutputAmount
        );

        // Find the pool in the database
        const pool = await poolRepository.findByAddress(whirlpoolAddress);
        if (!pool) {
            throw new Error("Pool not found in database");
        }

        // Store the swap data
        await swapRepository.create({
            pool_id: pool.id,
            user_wallet: userAddress,
            amount_in: inputTokenAmount,
            amount_out: 0, // We don't have the actual output amount, so use 0 as a default
            token_in_id: aToB ? (pool.token_a_id ?? undefined) : (pool.token_b_id ?? undefined),
            token_out_id: aToB ? (pool.token_b_id ?? undefined) : (pool.token_a_id ?? undefined),
            tx_hash: result.transactionId || '' // Using transactionId from result
        });

        console.log("Swap transaction saved to database:", result.transactionId);
        res.json(result);
    } catch (error) {
        console.error("Swap error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * @swagger
 * /pool:
 *   post:
 *     summary: Create a new Whirlpool
 *     tags: [Pool]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenMintA
 *               - tokenMintB
 *             properties:
 *               tokenMintA:
 *                 $ref: '#/components/schemas/PublicKey'
 *               tokenMintB:
 *                 $ref: '#/components/schemas/PublicKey'
 *     responses:
 *       200:
 *         description: Pool created successfully
 *       500:
 *         description: Error occurred during pool creation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/pool', async (req, res) => {
    try {
        const { tokenMintA, tokenMintB, userAddress, tokenAData, tokenBData } = req.body;
        const result = await createPool(
            new PublicKey(tokenMintA),
            new PublicKey(tokenMintB),
            new PublicKey(userAddress)
        );

        // Ensure tokens exist in the database
        let tokenA, tokenB;
        
        if (tokenAData) {
            tokenA = await tokenRepository.ensureToken({
                mint_address: tokenMintA,
                symbol: tokenAData.symbol,
                name: tokenAData.name,
                decimals: tokenAData.decimals,
                logo_uri: tokenAData.logo_uri
            });
        } else {
            tokenA = await tokenRepository.findByMintAddress(tokenMintA);
            if (!tokenA) {
                // Create a basic token record if data not provided
                tokenA = await tokenRepository.ensureToken({
                    mint_address: tokenMintA,
                    symbol: "TOKEN_A",
                    name: "Token A",
                    decimals: 9,
                    logo_uri: ""
                });
            }
        }
        
        if (tokenBData) {
            tokenB = await tokenRepository.ensureToken({
                mint_address: tokenMintB,
                symbol: tokenBData.symbol,
                name: tokenBData.name,
                decimals: tokenBData.decimals,
                logo_uri: tokenBData.logo_uri
            });
        } else {
            tokenB = await tokenRepository.findByMintAddress(tokenMintB);
            if (!tokenB) {
                // Create a basic token record if data not provided
                tokenB = await tokenRepository.ensureToken({
                    mint_address: tokenMintB,
                    symbol: "TOKEN_B",
                    name: "Token B",
                    decimals: 9,
                    logo_uri: ""
                });
            }
        }

        // Insert new pool record
        await poolRepository.create({
            pool_address: result.whirlpoolAddress.toString(),
            token_a_id: tokenA?.id,
            token_b_id: tokenB?.id,
            lp_mint: 'pending' // LP mint might not be available immediately
        });

        console.log("Pool created and saved to database:", result.whirlpoolAddress.toString());
        res.json({ success: true, tx: result.tx, whirlpoolAddress: result.whirlpoolAddress });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * @swagger
 * /liquidity/add:
 *   post:
 *     summary: Add liquidity to a Whirlpool
 *     tags: [Liquidity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whirlpoolAddress
 *               - tokenAmountA
 *               - tokenAmountB
 *               - priceLower
 *               - priceUpper
 *             properties:
 *               whirlpoolAddress:
 *                 $ref: '#/components/schemas/PublicKey'
 *               tokenAmountA:
 *                 type: number
 *                 description: Amount of token A to add
 *               tokenAmountB:
 *                 type: number
 *                 description: Amount of token B to add
 *               priceLower:
 *                 type: number
 *                 description: Lower price bound for the position
 *               priceUpper:
 *                 type: number
 *                 description: Upper price bound for the position
 *     responses:
 *       200:
 *         description: Liquidity added successfully
 *       500:
 *         description: Error occurred while adding liquidity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/liquidity/add', async (req, res) => {
    try {
        const { whirlpoolAddress, tokenAmountA, tokenAmountB, priceLower, priceUpper, userAddress } = req.body;
        const result = await addLP(
            new PublicKey(whirlpoolAddress),
            new PublicKey(userAddress),
            tokenAmountA,
            tokenAmountB,
            priceLower,
            priceUpper
        );

        // Find the pool
        const pool = await poolRepository.findByAddress(whirlpoolAddress);
        if (!pool) {
            throw new Error("Pool not found in database");
        }

        // Check if user already has a position in this pool
        const existingPosition = await liquidityRepository.findByUserAndPool(userAddress, pool.id);
        
        const liquidityAmount = 0; // We don't have the actual liquidity amount, so use 0 as a default
        
        if (existingPosition) {
            // Update existing position
            await liquidityRepository.update(existingPosition.id, {
                amount_token_a: Number(existingPosition.amount_token_a) + Number(tokenAmountA),
                amount_token_b: Number(existingPosition.amount_token_b) + Number(tokenAmountB),
                lp_tokens: Number(existingPosition.lp_tokens) + Number(liquidityAmount)
            });
            console.log("Updated liquidity position for user:", userAddress);
        } else {
            // Create new position
            await liquidityRepository.create({
                pool_id: pool.id,
                user_wallet: userAddress,
                amount_token_a: tokenAmountA,
                amount_token_b: tokenAmountB,
                lp_tokens: liquidityAmount
            });
            console.log("Created new liquidity position for user:", userAddress);
        }
        
        res.json(result);
    } catch (error) {
        console.error("Add liquidity error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * @swagger
 * /liquidity/remove:
 *   post:
 *     summary: Remove liquidity from a Whirlpool position
 *     tags: [Liquidity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whirlpoolAddress
 *               - positionAddress
 *               - liquidityAmount
 *             properties:
 *               whirlpoolAddress:
 *                 $ref: '#/components/schemas/PublicKey'
 *               positionAddress:
 *                 $ref: '#/components/schemas/PublicKey'
 *               liquidityAmount:
 *                 type: number
 *                 description: Amount of liquidity to remove
 *     responses:
 *       200:
 *         description: Liquidity removed successfully
 *       500:
 *         description: Error occurred while removing liquidity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/liquidity/remove', async (req, res) => {
    try {
        const { whirlpoolAddress, positionAddress, liquidityAmount, userAddress } = req.body;
        const result = await removeLP(
            new PublicKey(whirlpoolAddress),
            new PublicKey(positionAddress),
            liquidityAmount
        );

        // Find the pool
        const pool = await poolRepository.findByAddress(whirlpoolAddress);
        if (!pool) {
            throw new Error("Pool not found in database");
        }

        // Find the user's liquidity position
        const position = await liquidityRepository.findByUserAndPool(userAddress, pool.id);
        if (!position) {
            throw new Error("Liquidity position not found for user");
        }

        // Calculate the percentage of liquidity being removed
        const removalRatio = liquidityAmount / Number(position.lp_tokens);
        const tokenAToRemove = Number(position.amount_token_a) * removalRatio;
        const tokenBToRemove = Number(position.amount_token_b) * removalRatio;
        
        // Update the position
        await liquidityRepository.update(position.id, {
            amount_token_a: Number(position.amount_token_a) - tokenAToRemove,
            amount_token_b: Number(position.amount_token_b) - tokenBToRemove,
            lp_tokens: Number(position.lp_tokens) - liquidityAmount
        });

        console.log("Updated liquidity position after removal for user:", userAddress);
        res.json(result);
    } catch (error) {
        console.error("Remove liquidity error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 */
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

startServer(); 