import {
    PDAUtil,
    Position,
    PriceMath,
    WhirlpoolContext,
    WhirlpoolData
} from "@orca-so/whirlpools-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { config, connection, keyPair, wallet, ctx, ORCA_WHIRLPOOL_PROGRAM_ID } from "../../client";
import { BN } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

/**
 * Removes liquidity from a Whirlpool position and collects any accumulated fees
 * @param {PublicKey} whirlpoolAddress - The public key of the Whirlpool
 * @param {PublicKey} positionAddress - The public key of the position to remove liquidity from
 * @param {number} liquidityAmount - The amount of liquidity to remove
 * @returns {Promise<{transactionId: string}>} Object containing the transaction ID
 * @throws {Error} If the Whirlpool or position is not found, or if removing liquidity fails
 */
async function removeLiquidity(
    whirlpoolAddress: PublicKey,
    positionAddress: PublicKey,
    liquidityAmount: number
) {
    try {
        // Get the whirlpool data
        const whirlpool = await ctx.fetcher.getPool(whirlpoolAddress);
        if (!whirlpool) {
            throw new Error("Whirlpool not found");
        }

        // Get the position data
        const position = await ctx.fetcher.getPosition(positionAddress);
        if (!position) {
            throw new Error("Position not found");
        }

        // Create the decrease liquidity instruction
        const decreaseLiquidityIx = await ctx.program.methods
            .decreaseLiquidity(
                new BN(liquidityAmount),
                new BN(0), // Min amount of token A to receive
                new BN(0)  // Min amount of token B to receive
            )
            .accounts({
                whirlpool: whirlpoolAddress,
                position: positionAddress,
                positionTokenAccount: wallet.publicKey,
                tokenOwnerAccountA: wallet.publicKey,
                tokenOwnerAccountB: wallet.publicKey,
                tokenVaultA: whirlpool.tokenVaultA,
                tokenVaultB: whirlpool.tokenVaultB,
                tokenProgram: TOKEN_PROGRAM_ID,
                positionAuthority: wallet.publicKey,
                tickArrayLower: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, position.tickLowerIndex).publicKey,
                tickArrayUpper: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, position.tickUpperIndex).publicKey
            })
            .instruction();

        // Create the collect fees instruction to collect any accumulated fees
        const collectFeesIx = await ctx.program.methods
            .collectFees()
            .accounts({
                whirlpool: whirlpoolAddress,
                position: positionAddress,
                positionTokenAccount: wallet.publicKey,
                tokenOwnerAccountA: wallet.publicKey,
                tokenOwnerAccountB: wallet.publicKey,
                tokenVaultA: whirlpool.tokenVaultA,
                tokenVaultB: whirlpool.tokenVaultB,
                tokenProgram: TOKEN_PROGRAM_ID,
                positionAuthority: wallet.publicKey
            })
            .instruction();

        // Create and send transaction
        const transaction = new Transaction();
        transaction.add(decreaseLiquidityIx);
        transaction.add(collectFeesIx);
        transaction.feePayer = wallet.publicKey;

        // Simulate the transaction
        const simulation = await connection.simulateTransaction(
            transaction
        );

        console.log("Simulation result:", simulation);

        const tx = await connection.sendTransaction(transaction, [keyPair]);
        console.log("Transaction sent:", tx);

        return {
            transactionId: tx
        };
    } catch (error) {
        console.error("Error removing liquidity:", error);
        throw error;
    }
}

export default removeLiquidity;
