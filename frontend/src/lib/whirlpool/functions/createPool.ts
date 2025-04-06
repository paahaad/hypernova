import { PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";
import { config, ORCA_WHIRLPOOL_PROGRAM_ID, getConnection, getWhirlpoolContext, getSdk } from "../client";

/**
 * Creates a new whirlpool with the given token mints
 */
export async function createPool(tokenMintA: PublicKey, tokenMintB: PublicKey, userAddress: PublicKey) {
    // Get context and connection using the singleton (async)
    const ctx = await getWhirlpoolContext();
    const connection = await getConnection();
    
    // Dynamically import required SDK modules
    const sdk = await getSdk();
    const { PDAUtil, PoolUtil, PriceMath } = sdk;
    
    // Configuration
    const TICK_SPACING = 32896;
    const desiredMarketPrice = new Decimal(100);
    const actualPrice = new Decimal(1).div(desiredMarketPrice);
    const INTIAL_SQRT_PRICE = PriceMath.tickIndexToSqrtPriceX64(actualPrice.toNumber());

    const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID, config, TICK_SPACING).publicKey;

    // Get token vault PDAs
    const tokenVaultAKeypair = Keypair.generate();
    const tokenVaultBKeypair = Keypair.generate();
    const orderMints = PoolUtil.orderMints(tokenMintA, tokenMintB);

    const tokenMintX = new PublicKey(orderMints[0].toString());
    const tokenMintY = new PublicKey(orderMints[1].toString());

    const whirlpoolPda = PDAUtil.getWhirlpool(ORCA_WHIRLPOOL_PROGRAM_ID, config, tokenMintX, tokenMintY, TICK_SPACING);

    // Generate the initialize pool instruction
    const initializePoolIx = await ctx.program.methods
        .initializePool(
            whirlpoolPda.bump,
            new BN(TICK_SPACING),
            new BN(INTIAL_SQRT_PRICE)
        )
        .accounts({
            feeTier: feeTierPda,
            whirlpoolsConfig: config,
            funder: userAddress,
            whirlpool: whirlpoolPda.publicKey,
            tokenMintA: tokenMintA,
            tokenMintB: tokenMintB,
            tokenVaultA: tokenVaultAKeypair.publicKey,
            tokenVaultB: tokenVaultBKeypair.publicKey,
            tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            systemProgram: new PublicKey("11111111111111111111111111111111"),
            rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
        })
        .instruction();

    // Create a new transaction
    const transaction = new Transaction();
    transaction.add(initializePoolIx);
    transaction.feePayer = userAddress;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(tokenVaultAKeypair, tokenVaultBKeypair);

    // Serialize the transaction for client-side signing
    const serializedTx = Buffer.from(transaction.serialize({
        requireAllSignatures: false,
    })).toString('base64');

    return {
        tx: serializedTx,
        whirlpoolAddress: whirlpoolPda.publicKey.toString()
    };
} 