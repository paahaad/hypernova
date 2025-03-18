import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getProgramWithDummyWallet } from "@/lib/anchor";

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

        const { data, error } = await supabase
            .from('presales')
            .select('name, symbol, uri, total_supply, description, token_price, min_purchase, max_purchase, presale_percentage, end_time, user_address, mint_address, presale_address')
            .eq('mint_address', mintAddress)
            .single();

        if (error) {
            console.error("Error fetching from Supabase:", error);
            return NextResponse.json(
                { success: false, error: error.message || "Failed to fetch token data" },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: "Token not found" },
                { status: 404 }
            );
        }

        // Convert any BN values to regular numbers
        const processedData = {
            ...data,
            description: data.description || "",
            total_supply: data.total_supply ? Number(data.total_supply) : null,
            token_price: data.token_price ? Number(data.token_price) : null,
            min_purchase: data.min_purchase ? Number(data.min_purchase) : null,
            max_purchase: data.max_purchase ? Number(data.max_purchase) : null,
            end_time: data.end_time ? Number(data.end_time) : null,
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
        const program =  getProgramWithDummyWallet();
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

        const { data, error } = await supabase
            .from('presales')
            .select('token_price, min_purchase, max_purchase, presale_address')
            .eq('mint_address', mintAddress)
            .single();

        console.table(data);

        if (error) {
            console.error("Error fetching from Supabase:", error);
            return NextResponse.json(
                { success: false, error: error.message || "Failed to fetch token data" },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: "Token not found" },
                { status: 404 }
            );
        }

        // Convert min and max purchase to lamports for comparison
        const minPurchaseLamports = data.min_purchase * 1e9;
        const maxPurchaseLamports = data.max_purchase * 1e9;

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

        const presaleAccount = await program.account.presaleInfo.fetch(data.presale_address);
        const token_price = Number(presaleAccount.tokenPrice);
        // Calculate token amount
        const tokenAmount = solAmountLamports / token_price;

        return NextResponse.json({
            success: true,
            data: {
                tokenAmount: Number(tokenAmount) / 1e6,
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