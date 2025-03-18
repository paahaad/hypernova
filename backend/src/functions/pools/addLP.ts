import {
    PDAUtil,
    Position,
    PriceMath,
    TickUtil,
    TokenExtensionUtil,
    WhirlpoolContext,
    WhirlpoolData,
    WhirlpoolIx,
    buildWhirlpoolClient,
    increaseLiquidityQuoteByInputToken,
    swapQuoteByInputToken,
    toTx
} from "@orca-so/whirlpools-sdk";
import { PublicKey, Transaction, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, VersionedTransaction } from "@solana/web3.js";
import { config, connection, keyPair, wallet, ctx, ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolClient } from "../../client";
import { BN } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Percentage } from "@orca-so/common-sdk";

export async function getQuote(
    tokenA: PublicKey,
    tokenAAmount: Decimal,
    tickLower: number,
    tickUpper: number,
    whirlpoolAddress: PublicKey,
) {
    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const whirlpool = await whirlpoolClient.getPool(whirlpoolAddress)
    const whirlpoolData = await ctx.fetcher.getPool(whirlpoolAddress)

    const inputTokenQuote = await increaseLiquidityQuoteByInputToken(
        tokenA,
        tokenAAmount,
        tickLower,
        tickUpper,
        Percentage.fromFraction(1, 100), // 0.1%,
        whirlpool,
        await TokenExtensionUtil.buildTokenExtensionContext(ctx.fetcher, whirlpoolData!)
    );

    return inputTokenQuote
}

/**
 * Adds liquidity to a Whirlpool position within a specified price range
 * @param {PublicKey} whirlpoolAddress - The public key of the Whirlpool to add liquidity to
 * @param {number} tokenAmountA - The amount of token A to add
 * @param {number} tokenAmountB - The amount of token B to add
 * @param {number} priceLower - The lower price bound of the position
 * @param {number} priceUpper - The upper price bound of the position
 * @returns {Promise<{
 *   positionMint: PublicKey,
 *   position: PublicKey,
 *   transactionId: string
 * }>} Object containing the position details and transaction ID
 * @throws {Error} If the Whirlpool is not found or if adding liquidity fails
 */
async function addLiquidity(
    whirlpoolAddress: PublicKey,
    userAddress: PublicKey,
    tokenAmountA: number,
    tokenAmountB: number,
    priceLower: number,
    priceUpper: number
) {
    try {
        console.table({ "whirlpool": whirlpoolAddress.toString(), "user": userAddress.toString(), "tokenAmountA": tokenAmountA, "tokenAmountB": tokenAmountB, "priceLower": priceLower, "priceUpper": priceUpper })
        // Get the whirlpool data
        const whirlpool = await whirlpoolClient.getPool(whirlpoolAddress);
        const whirlpoolData = await whirlpool.getData()
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

        const tickLower = TickUtil.getInitializableTickIndex(
            PriceMath.priceToTickIndex(new Decimal(98), 6, 9),
            whirlpoolData.tickSpacing
        );
        const tickUpper = TickUtil.getInitializableTickIndex(
            PriceMath.priceToTickIndex(new Decimal(150), 6, 9),
            whirlpoolData.tickSpacing
        );

        const tickArrayPda = PDAUtil.getTickArray(
            ctx.program.programId,
            whirlpoolAddress,
            tickLower
        );
        const tickArray = await ctx.fetcher.getTickArray(tickArrayPda.publicKey);
        console.log(tickArray)

        let tick_tx = null;
        if (!tickArray) {
            tick_tx = toTx(ctx, WhirlpoolIx.initTickArrayIx(ctx.program, {
                startTick: tickLower,
                tickArrayPda,
                whirlpool: whirlpoolAddress,
                funder: wallet.publicKey,
            }));

            const signature = await tick_tx.buildAndExecute()
            console.log("Simulated tx")
            const tx = await connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0,
                commitment: "confirmed"
            })
            console.log(tx)
        }


        const quote = await getQuote(whirlpool.getTokenAInfo().address, new Decimal(tokenAmountA), tickLowerIndex, tickUpperIndex, whirlpoolAddress)
        console.log(quote)


        const { positionMint, tx } = await whirlpool.openPosition(
            tickLowerIndex,
            tickUpperIndex,
            quote
        );

        const transaction = await tx.build()

        console.table({
            funder: userAddress.toString(),
            owner: userAddress.toString(),
            whirlpool: whirlpoolAddress.toString(),
            positionTokenAccount: userAddress.toString(),
            tokenOwnerAccountA: userAddress.toString(),
            tokenOwnerAccountB: userAddress.toString(),

            tokenProgram: TOKEN_PROGRAM_ID.toString(),
            positionAuthority: userAddress.toString(),

        })



        const unsigned_tx = transaction.transaction
        console.log(unsigned_tx.signatures)

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

export default addLiquidity;
