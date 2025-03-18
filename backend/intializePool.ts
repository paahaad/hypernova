import {
    WhirlpoolContext,
    buildWhirlpoolClient,
    PDAUtil,
} from "@orca-so/whirlpools-sdk";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { ReadOnlyWallet } from "@orca-so/common-sdk";

const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey("FDtFfB7t7ndyFm9yvwS2KisRxCTrWZhCwdgPTCyCPrww");

// Create a new keypair for the config account
const configKeypair = Keypair.generate();

const connection = new Connection("https://api.testnet.sonic.game/");
const wallet = new ReadOnlyWallet(new PublicKey("CRtPaRBqT274CaE5X4tFgjccx5XXY5zKYfLPnvitKdJx"));
const ctx = WhirlpoolContext.from(
    connection,
    wallet,
    ORCA_WHIRLPOOL_PROGRAM_ID,
);


async function initializeConfig() {
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
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    return initializeConfigIx;

    
}

// Call the function
initializeConfig().catch(console.error);
