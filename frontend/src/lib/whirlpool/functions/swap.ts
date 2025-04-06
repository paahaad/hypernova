import { PublicKey, Transaction } from "@solana/web3.js";
import { ORCA_WHIRLPOOL_PROGRAM_ID, getConnection, getWhirlpoolContext, getSdk } from "../client";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

/**
 * Executes a token swap in a Whirlpool liquidity pool
 */
export async function swap(
    whirlpoolAddress: PublicKey,
    userAddress: PublicKey,
    inputTokenAmount: number,
    aToB: boolean,  // true if swapping A to B, false if B to A
    amountSpecifiedIsInput: boolean = true,  // true if amount specified is input amount
    minOutputAmount: number = 0  // minimum amount of output token to receive
) {
    try {
        const ctx = await getWhirlpoolContext();
        const connection = await getConnection();
        
        // Dynamically import required SDK modules
        const sdk = await getSdk();
        const { PDAUtil } = sdk;
        
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
                tokenAuthority: userAddress,
                tokenOwnerAccountA: userAddress,
                tokenVaultA: whirlpool.tokenVaultA,
                tokenOwnerAccountB: userAddress,
                tokenVaultB: whirlpool.tokenVaultB,
                tickArray0: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, whirlpool.tickCurrentIndex).publicKey,
                tickArray1: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, whirlpool.tickCurrentIndex + 1).publicKey,
                tickArray2: PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, whirlpool.tickCurrentIndex - 1).publicKey,
                oracle: PDAUtil.getOracle(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress).publicKey
            })
            .instruction();

        // Create transaction
        const transaction = new Transaction();
        transaction.add(swapIx);
        transaction.feePayer = userAddress;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // Serialize the transaction for client-side signing
        const serializedTx = Buffer.from(transaction.serialize({
            requireAllSignatures: false,
        })).toString('base64');

        return {
            tx: serializedTx
        };
    } catch (error) {
        console.error("Error swapping tokens:", error);
        throw error;
    }
} 