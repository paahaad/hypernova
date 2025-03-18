import {
    PDAUtil
} from "@orca-so/whirlpools-sdk";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { config, configExtension, connection, keyPair, wallet, ctx, ORCA_WHIRLPOOL_PROGRAM_ID } from "../../client";



async function initializeFeeTier() {
    // Get the initialize config instruction

    const TICK_SPACING = 32896;
    const FEE_RATE = 10000;

    const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID, config, TICK_SPACING);
    const initializeFeeTierIx = await ctx.program.methods
        .initializeFeeTier(
            TICK_SPACING,
            FEE_RATE
        )
        .accounts({
            feeTier: feeTierPda.publicKey,
            config: config,
            funder: wallet.publicKey,
            feeAuthority: wallet.publicKey,
            systemProgram: SystemProgram.programId
        })
        .instruction();

    // Create a new transaction
    const transaction = new Transaction();
    transaction.add(initializeFeeTierIx);
    transaction.feePayer = wallet.publicKey;

    // Simulate the transaction
    const simulation = await connection.simulateTransaction(
        transaction
    );

    console.log("Simulation result:", simulation);

    const tx = await connection.sendTransaction(transaction, [keyPair]);
    console.log("Transaction sent:", tx);

    return initializeFeeTierIx;
}

// Call the function
initializeFeeTier().catch(console.error);
