import { getHypernovaProgram } from "@project/anchor";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { VAULT } from "@/lib/constants";

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

        const { data, error } = await supabase
            .from('presales')
            .select('id, name, symbol, uri, total_supply, description, token_price, min_purchase, max_purchase, presale_percentage, end_time, user_address, mint_address, presale_address')
            .eq('mint_address', mintAddress)
            .single();

        if (error) {
            console.error("Error fetching presale data:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const [presalePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("presale"), mintPubkey.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .purchase(
                new BN(data.id),
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
