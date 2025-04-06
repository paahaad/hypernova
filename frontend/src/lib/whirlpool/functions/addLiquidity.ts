import { PublicKey } from "@solana/web3.js";
import { ORCA_WHIRLPOOL_PROGRAM_ID, getConnection, getWhirlpoolClient, getWhirlpoolContext, getSdk } from "../client";
import { Decimal } from "decimal.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

/**
 * Get a quote for adding liquidity to a position
 */
export async function getQuote(
    tokenA: PublicKey,
    tokenAAmount: Decimal,
    tickLower: number,
    tickUpper: number,
    whirlpoolAddress: PublicKey,
) {
    const ctx = await getWhirlpoolContext();
    const whirlpoolClient = await getWhirlpoolClient();
    const sdk = await getSdk();
    const { TokenExtensionUtil, increaseLiquidityQuoteByInputToken } = sdk;
    const { Percentage } = await import('@orca-so/common-sdk');
    
    const whirlpool = await whirlpoolClient.getPool(whirlpoolAddress);
    const whirlpoolData = await ctx.fetcher.getPool(whirlpoolAddress);

    const inputTokenQuote = await increaseLiquidityQuoteByInputToken(
        tokenA,
        tokenAAmount,
        tickLower,
        tickUpper,
        Percentage.fromFraction(1, 100), // 0.1% slippage
        whirlpool,
        await TokenExtensionUtil.buildTokenExtensionContext(ctx.fetcher, whirlpoolData!)
    );

    return inputTokenQuote;
}

/**
 * Adds liquidity to a Whirlpool position within a specified price range
 */
export async function addLiquidity(
    whirlpoolAddress: PublicKey,
    userAddress: PublicKey,
    tokenAmountA: number,
    tokenAmountB: number,
    priceLower: number,
    priceUpper: number
) {
    try {
        const ctx = await getWhirlpoolContext();
        const connection = await getConnection();
        const whirlpoolClient = await getWhirlpoolClient();
        
        // Dynamically import required SDK modules
        const sdk = await getSdk();
        const { PDAUtil, PriceMath, TickUtil, toTx, WhirlpoolIx } = sdk;

        // Get the whirlpool data
        const whirlpool = await whirlpoolClient.getPool(whirlpoolAddress);
        const whirlpoolData = await whirlpool.getData();
        
        if (!whirlpool) {
            throw new Error("Whirlpool not found");
        }

        // Convert prices to tick indices
        const tickLowerIndex = PriceMath.priceToTickIndex(
            new Decimal(priceLower),
            6, // Using default decimals, adjust based on your tokens
            6
        );
        const tickUpperIndex = PriceMath.priceToTickIndex(
            new Decimal(priceUpper),
            6,
            6
        );

        // Get initializable tick indices
        const tickLower = TickUtil.getInitializableTickIndex(
            PriceMath.priceToTickIndex(new Decimal(98), 6, 9),
            whirlpoolData.tickSpacing
        );
        const tickUpper = TickUtil.getInitializableTickIndex(
            PriceMath.priceToTickIndex(new Decimal(150), 6, 9),
            whirlpoolData.tickSpacing
        );

        // Check if tick array exists and initialize if necessary
        const tickArrayPda = PDAUtil.getTickArray(
            ORCA_WHIRLPOOL_PROGRAM_ID,
            whirlpoolAddress,
            tickLower
        );
        const tickArray = await ctx.fetcher.getTickArray(tickArrayPda.publicKey);
        
        // Initialize tick array if not found
        if (!tickArray) {
            const { wallet } = await import('../client').then(module => module.getKeyPairAndWallet());
            
            const tick_tx = toTx(ctx, WhirlpoolIx.initTickArrayIx(ctx.program, {
                startTick: tickLower,
                tickArrayPda,
                whirlpool: whirlpoolAddress,
                funder: wallet.publicKey,
            }));

            await tick_tx.buildAndExecute();
        }

        // Get quote for adding liquidity
        const quote = await getQuote(
            whirlpool.getTokenAInfo().address, 
            new Decimal(tokenAmountA), 
            tickLowerIndex, 
            tickUpperIndex, 
            whirlpoolAddress
        );

        // Open position
        const { positionMint, tx } = await whirlpool.openPosition(
            tickLowerIndex,
            tickUpperIndex,
            quote
        );

        // Build the transaction
        const transaction = await tx.build();

        // Serialize the transaction for client-side signing
        const serializedTx = Buffer.from(transaction.transaction.serialize({
            requireAllSignatures: false,
        })).toString('base64');

        return {
            positionMint: positionMint.toString(),
            tx: serializedTx
        };
    } catch (error) {
        console.error("Error adding liquidity:", error);
        throw error;
    }
} 