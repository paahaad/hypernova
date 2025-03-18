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
 * Executes a token swap in a Whirlpool liquidity pool
 * @param {PublicKey} whirlpoolAddress - The public key of the Whirlpool to swap in
 * @param {number} inputTokenAmount - The amount of input tokens to swap
 * @param {boolean} aToB - Direction of the swap (true for A→B, false for B→A)
 * @param {boolean} [amountSpecifiedIsInput=true] - Whether the specified amount is input (true) or output (false)
 * @param {number} [minOutputAmount=0] - Minimum amount of output tokens to receive, used as slippage protection
 * @returns {Promise<{transactionId: string}>} Object containing the transaction ID
 * @throws {Error} If the Whirlpool is not found or if the swap fails
 */
async function swap(
    whirlpoolAddress: PublicKey,
    inputTokenAmount: number,
    aToB: boolean,  // true if swapping A to B, false if B to A
    amountSpecifiedIsInput: boolean = true,  // true if amount specified is input amount
    minOutputAmount: number = 0  // minimum amount of output token to receive
) {
    try {
        // Get the whirlpool data
        const whirlpool = await ctx.fetcher.getPool(whirlpoolAddress);
        if (!whirlpool) {
            throw new Error("Whirlpool not found");
        }

        // Create the swap instruction
        const swapIx = await ctx.program.methods
            .swap(
                new BN(inputTokenAmount),
                new BN(minOutputAmount),
                new BN(0), // sqrtPriceLimit - 0 for no limit
                amountSpecifiedIsInput,
                aToB
            )
            .accounts({
                whirlpool: whirlpoolAddress,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenAuthority: wallet.publicKey,
                tokenOwnerAccountA: wallet.publicKey,
                tokenVaultA: whirlpool.tokenVaultA,
                tokenOwnerAccountB: wallet.publicKey,
                tokenVaultB: whirlpool.tokenVaultB,
                tickArray0: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, whirlpool.tickCurrentIndex).publicKey,
                tickArray1: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, whirlpool.tickCurrentIndex + 1).publicKey,
                tickArray2: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, whirlpool.tickCurrentIndex - 1).publicKey,
                oracle: PDAUtil.getOracle(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress).publicKey
            })
            .instruction();

        // Create and send transaction
        const transaction = new Transaction();
        transaction.add(swapIx);
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
        console.error("Error swapping tokens:", error);
        throw error;
    }
}

export default swap;
