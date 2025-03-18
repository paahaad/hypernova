import express from 'express';
import type { Application } from 'express';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import swap from './functions/pools/swap';
import createPool from './functions/pools/createPool';
import addLP from './functions/pools/addLP';
import removeLP from './functions/pools/removeLP';
import { ctx, config, configExtension } from './client';

const app: Application = express();
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
        await initializeWhirlpools();
        const PORT = process.env.PORT || 3000;
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
        const { whirlpoolAddress, inputTokenAmount, aToB, amountSpecifiedIsInput, minOutputAmount } = req.body;
        const result = await swap(
            new PublicKey(whirlpoolAddress),
            inputTokenAmount,
            aToB,
            amountSpecifiedIsInput,
            minOutputAmount
        );
        res.json(result);
    } catch (error) {
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
        const { tokenMintA, tokenMintB , userAddress } = req.body;
        const result = await createPool(
            new PublicKey(tokenMintA),
            new PublicKey(tokenMintB),
            new PublicKey(userAddress)
        );
        console.log(result);
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
        res.json(result);
    } catch (error) {
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
        const { whirlpoolAddress, positionAddress, liquidityAmount } = req.body;
        const result = await removeLP(
            new PublicKey(whirlpoolAddress),
            new PublicKey(positionAddress),
            liquidityAmount
        );
        res.json(result);
    } catch (error) {
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