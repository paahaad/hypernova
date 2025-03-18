import {
    PDAUtil
} from "@orca-so/whirlpools-sdk";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { config, configExtension, connection, keyPair, wallet, ctx, ORCA_WHIRLPOOL_PROGRAM_ID } from "../../client";

async function initializeConfigExtension() {
    // Get the initialize config instruction
    const configPda = PDAUtil.getConfigExtension(ORCA_WHIRLPOOL_PROGRAM_ID, config);
    const initializeConfigIx = await ctx.program.methods
        .initializeConfigExtension(

        )
        .accounts({
            configExtension: configPda.publicKey,
            config: config,
            funder: wallet.publicKey,
            feeAuthority: wallet.publicKey,
            systemProgram: SystemProgram.programId
        })
        .instruction();

    // Create a new transaction
    const transaction = new Transaction();
    transaction.add(initializeConfigIx);
    transaction.feePayer = wallet.publicKey;

    // Simulate the transaction
    const simulation = await connection.simulateTransaction(
        transaction
    );

    console.log("Simulation result:", simulation);

    const tx = await connection.sendTransaction(transaction, [keyPair]);
    console.log("Transaction sent:", tx);

    return initializeConfigIx;
}

// Call the function
initializeConfigExtension().catch(console.error);
