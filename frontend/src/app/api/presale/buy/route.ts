import { getHypernovaProgram } from "@project/anchor";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { VAULT } from "@/lib/constants";
import { presales } from "@/db/repositories";

export async function POST(req: Request) {
    try {
        const dummyWallet = new Keypair();
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "");
        const provider = new AnchorProvider(
            connection,
            { publicKey: dummyWallet.publicKey } as Wallet,
            { commitment: "confirmed" }
        );
        const program = getHypernovaProgram(provider);
        const { mintAddress, amount, userAddress } = await req.json();



        if (!mintAddress || !amount) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const mintPubkey = new PublicKey(mintAddress);
        const userPubkey = new PublicKey(userAddress);

        const presaleData = await presales.findByMintAddress(mintAddress);

        if (!presaleData || presaleData.length === 0) {
            return NextResponse.json(
                { success: false, error: "Presale not found" },
                { status: 404 }
            );
        }

        const data = presaleData[0];
        
        if (!data.id) {
            return NextResponse.json(
                { success: false, error: "Invalid presale data: missing ID" },
                { status: 500 }
            );
        }

        const [presalePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("presale"), mintPubkey.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .purchase(
                new BN(Number(data.id)),
                new BN(amount * 1000000000)
            )
            .accounts({
                user: userPubkey,
                presaleAccount: presalePDA,
            })
            .transaction();

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = userPubkey;

        console.log("Simulating transaction...");
        const simulation = await connection.simulateTransaction(tx);
        console.log("Simulation result:", simulation.value.logs);

        const serializedTx = Buffer.from(tx.serialize({
            requireAllSignatures: false,
        })).toString('base64');

        return NextResponse.json({ success: true, tx: serializedTx });
    } catch (error: any) {
        console.error("Error buying from presale:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
