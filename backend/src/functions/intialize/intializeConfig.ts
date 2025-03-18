import {
    Keypair, Transaction, SystemProgram
} from "@solana/web3.js";
import { wallet, ctx, connection, keyPair } from "../../client";


async function initializeConfig() {
    const configKeypair = Keypair.generate();
    // Get the initialize config instruction
    const initializeConfigIx = await ctx.program.methods
        .initializeConfig(
            wallet.publicKey,            // feeAuthority
            wallet.publicKey,            // collectProtocolFeesAuthority
            wallet.publicKey,            // rewardEmissionsSuperAuthority
            25                          // defaultProtocolFeeRate
        )
        .accounts({
            config: configKeypair.publicKey,
            funder: wallet.publicKey,
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

    const tx = await connection.sendTransaction(transaction, [keyPair, configKeypair]);
    console.log("Transaction sent:", tx);

    return initializeConfigIx;
}

// Call the function
initializeConfig().catch(console.error);
