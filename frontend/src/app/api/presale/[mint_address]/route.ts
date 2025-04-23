import { NextResponse } from "next/server";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getHypernovaProgram } from "@project/anchor";
import { presales } from "@/db/repositories";

export async function GET(
    req: Request,
    { params }: { params: { mint_address: string } }
) {
    try {
        const mintAddress = params.mint_address;

        if (!mintAddress) {
            return NextResponse.json(
                { success: false, error: "Mint address is required" },
                { status: 400 }
            );
        }

        const presaleData = await presales.findByMintAddress(mintAddress);

        if (!presaleData || presaleData.length === 0) {
            return NextResponse.json(
                { success: false, error: "Token not found" },
                { status: 404 }
            );
        }

        const data = presaleData[0];

        // Convert any BN values to regular numbers
        const processedData = {
            ...data,
            description: data.description || "",
            total_supply: data.total_supply ? Number(data.total_supply) : null,
            token_price: data.token_price ? Number(data.token_price) : null,
            min_purchase: data.min_purchase ? Number(data.min_purchase) : null,
            max_purchase: data.max_purchase ? Number(data.max_purchase) : null,
            end_time: data.end_time ? new Date(data.end_time).getTime() / 1000 : null, // Convert Date to UNIX timestamp
        };

        return NextResponse.json(processedData);
    } catch (error: any) {
        console.error("Error fetching token data:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch token data" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: Request,
    { params }: { params: { mint_address: string } }
) {
    try {
        const dummyWallet = new Keypair();
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "");
        const provider = new AnchorProvider(
            connection,
            { publicKey: dummyWallet.publicKey } as Wallet,
            { commitment: "confirmed" }
        );
        const program = getHypernovaProgram(provider);
        console.log("program", program);
        const mintAddress = params.mint_address;
        const { solAmount } = await req.json();

        if (!mintAddress) {
            return NextResponse.json(
                { success: false, error: "Mint address is required" },
                { status: 400 }
            );
        }

        if (!solAmount || typeof solAmount !== 'number') {
            return NextResponse.json(
                { success: false, error: "Valid SOL amount is required" },
                { status: 400 }
            );
        }

        // Convert SOL amount to lamports (1 SOL = 1e9 lamports)
        const solAmountLamports = solAmount * 1e9;

        const presaleData = await presales.findByMintAddress(mintAddress);

        if (!presaleData || presaleData.length === 0) {
            return NextResponse.json(
                { success: false, error: "Token not found" },
                { status: 404 }
            );
        }

        const data = presaleData[0];
        console.table(data);

        // Convert min and max purchase to lamports for comparison
        const minPurchaseLamports = Number(data.min_purchase) * 1e9;
        const maxPurchaseLamports = Number(data.max_purchase) * 1e9;

        // Validate purchase amount
        if (solAmountLamports < minPurchaseLamports) {
            return NextResponse.json(
                { success: false, error: "Purchase amount is below minimum allowed" },
                { status: 400 }
            );
        }

        if (solAmountLamports > maxPurchaseLamports) {
            return NextResponse.json(
                { success: false, error: "Purchase amount is above maximum allowed" },
                { status: 400 }
            );
        }

        const presaleAddress = new PublicKey(data.presale_address);
        // @ts-expect-error: this is false error
        const presaleAccount = await program.account.presaleInfo.fetch(presaleAddress);
        console.log("presaleAccount", presaleAccount);
        const token_price = presaleAccount.tokenPrice.toNumber();
        console.log("token_price", token_price);
        const tokenAmount = solAmountLamports / token_price;
        console.log("tokenAmount", tokenAmount);

        return NextResponse.json({
            success: true,
            data: {
                tokenAmount,
                solAmount,
                tokenPrice: token_price,
                minPurchase: Number(data.min_purchase),
                maxPurchase: Number(data.max_purchase)
            }
        });
    } catch (error: any) {
        console.error("Error calculating token amount:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to calculate token amount" },
            { status: 500 }
        );
    }
} 