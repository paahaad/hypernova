// import { PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import { connection } from "@/lib/anchor";
import { NextResponse } from "next/server";

// interface CreatePoolInput {
//     tokenMintA: string;
//     tokenMintB: string;
//     userAddress: string;
// }

// export async function POST(req: Request) {
//     try {
//         const body: CreatePoolInput = await req.json();
        
//         // Dynamically import the Orca SDK
//         const { PDAUtil } = await import("@orca-so/whirlpools-sdk");
//         const { getOrca, ORCA_WHIRLPOOL_PROGRAM_ID, config } = await import("@/lib/orca");
//         const orca = await getOrca();

//         // Validate required fields
//         if (!body.tokenMintA || !body.tokenMintB || !body.userAddress) {
//             return NextResponse.json(
//                 { success: false, error: "Missing required fields" },
//                 { status: 400 }
//             );
//         }

//         // Convert string addresses to PublicKey
//         const tokenMintA = new PublicKey(body.tokenMintA);
//         const tokenMintB = new PublicKey(body.tokenMintB);
//         const userAddress = new PublicKey(body.userAddress);

//         const TICK_SPACING = 32896;
//         const FEE_RATE = 10000;

//         const whirlpoolPda = PDAUtil.getWhirlpool(ORCA_WHIRLPOOL_PROGRAM_ID, config, tokenMintA, tokenMintB, TICK_SPACING);
//         const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID, config, TICK_SPACING).publicKey;

//         // Get token vault PDAs
//         const tokenVaultAKeypair = Keypair.generate();
//         const tokenVaultBKeypair = Keypair.generate();

//         console.log("Debug info:");
//         console.log("Whirlpool PDA:", whirlpoolPda.publicKey.toBase58());
//         console.log("Fee Tier PDA:", feeTierPda.toBase58());
//         console.log("Config account:", config.toBase58());
//         console.log("Token Mint A:", tokenMintA.toBase58());
//         console.log("Token Mint B:", tokenMintB.toBase58());
//         console.log("User Address:", userAddress.toBase58());

//         // Verify config account exists
//         const configAccountInfo = await connection.getAccountInfo(config);
//         console.log("Config account info:", configAccountInfo ? "exists" : "does not exist");

//         const initializeFeeTierIx = await orca.program.methods
//             .initializePool(
//                 whirlpoolPda.bump,
//                 TICK_SPACING,
//                 FEE_RATE
//             )
//             .accounts({
//                 feeTier: feeTierPda,
//                 whirlpoolsConfig: config,
//                 funder: userAddress,
//                 whirlpool: whirlpoolPda.publicKey,
//                 tokenMintA,
//                 tokenMintB,
//                 tokenVaultA: tokenVaultAKeypair.publicKey,
//                 tokenVaultB: tokenVaultBKeypair.publicKey,
//                 tokenProgram: TOKEN_PROGRAM_ID,
//                 systemProgram: SystemProgram.programId,
//                 rent: SYSVAR_RENT_PUBKEY,
//             })
//             .instruction();

//         // Create a new transaction
//         const transaction = new Transaction();
//         transaction.add(initializeFeeTierIx);
//         transaction.feePayer = userAddress;
//         transaction.partialSign(tokenVaultAKeypair, tokenVaultBKeypair);

//         // Simulate the transaction
//         console.log("Simulating transaction...");
//         const simulation = await connection.simulateTransaction(transaction);
//         console.log("Simulation result:", simulation.value.logs);

//         const serializedTransaction = transaction.serialize({
//             requireAllSignatures: false,
//         });
//         const base64Transaction = Buffer.from(serializedTransaction).toString('base64');

//         return NextResponse.json({
//             success: true,
//             data: {
//                 whirlpoolAddress: whirlpoolPda.publicKey.toBase58(),
//                 tokenVaultA: tokenVaultAKeypair.publicKey.toBase58(),
//                 tokenVaultB: tokenVaultBKeypair.publicKey.toBase58(),
//                 tx: base64Transaction
//             }
//         });
//     } catch (error: any) {
//         console.error("Error creating pool:", error);
//         return NextResponse.json(
//             { success: false, error: error.message || "Failed to create pool" },
//             { status: 500 }
//         );
//     }
// }

// dummy route
export async function GET(req: Request) {
    return NextResponse.json({ success: true, message: "Hello, world!" });
}
