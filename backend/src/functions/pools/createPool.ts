import {
    PDAUtil,
    PoolUtil,
    PriceMath,
    buildWhirlpoolClient
} from "@orca-so/whirlpools-sdk";
import { PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { config, configExtension, connection, keyPair, wallet, ctx, ORCA_WHIRLPOOL_PROGRAM_ID } from "../../client";
import { Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";

async function createPool(tokenMintA: PublicKey, tokenMintB: PublicKey, userAddress: PublicKey) {
    // Get the initialize config instruction

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

    console.log("Order Mints:", orderMints);

    const initializeFeeTierIx = await ctx.program.methods
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
        })  
        .instruction();


    // Create a new transaction
    const transaction = new Transaction();
    transaction.add(initializeFeeTierIx);
    transaction.feePayer = userAddress;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(tokenVaultAKeypair, tokenVaultBKeypair);

    const serializedTx = Buffer.from(transaction.serialize({
        requireAllSignatures: false,
    })).toString('base64');

    return {
        tx: serializedTx,
        whirlpoolAddress: whirlpoolPda.publicKey.toString()
    }
}

export default createPool;