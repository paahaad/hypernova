import { getHypernovaProgram } from "@project/anchor";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
} from "@solana/web3.js";
import { NextResponse } from "next/server";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { presales, tokens } from "@/db/repositories";
import { randomUUID } from 'crypto';
import { getRpcEndpoint } from "@/config/rpc";

interface PresaleInput {
  name: string;
  symbol: string;
  uri: string;
  description: string;
  totalSupply: number;
  presaleAmount: number;
  tokenPrice: number;
  minPurchase: number;
  maxPurchase: number;
  presalePercentage: number;
  endTime: number;
  userAddress: string;
  imageURI: string;
}

export async function GET(req: Request) {
  try {
    const allPresales = await presales.findAll();
    console.log("All presales:", allPresales);
    return NextResponse.json({ data: allPresales });
  } catch (error: any) {
    console.error("Error fetching presales:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch presales" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const dummyWallet = new Keypair();
    
    // Use the proper RPC endpoint from config
    const endpoint = getRpcEndpoint(true); // Use custom RPC
    console.log("Using RPC endpoint:", endpoint);
    
    const connection = new Connection(endpoint, "confirmed");
    const provider = new AnchorProvider(
      connection,
      { publicKey: dummyWallet.publicKey } as Wallet,
      { commitment: "confirmed" }
    );
    const program = getHypernovaProgram(provider);
    console.log("Program:", program);

    // Parse and validate input
    const body: PresaleInput = await req.json();

    console.log("Body:", body);
    // Validate required fields
    if (
      !body.name ||
      !body.symbol ||
      !body.uri ||
      !body.totalSupply ||
      !body.tokenPrice ||
      !body.minPurchase ||
      !body.maxPurchase ||
      !body.presaleAmount ||
      !body.presalePercentage ||
      !body.endTime ||
      !body.userAddress ||
      !body.imageURI
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate numeric ranges
    if (body.presalePercentage < 0 || body.presalePercentage > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Presale percentage must be between 0 and 100",
        },
        { status: 400 }
      );
    }

    if (body.minPurchase > body.maxPurchase) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum purchase cannot be greater than maximum purchase",
        },
        { status: 400 }
      );
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime >= body.endTime) {
      return NextResponse.json(
        { success: false, error: "End time must be in the future" },
        { status: 400 }
      );
    }

    // Generate a proper UUID instead of a random number
    const id = Math.floor(10 + Math.random() * 90); // Keep this for contract compatibility
    const dbId = randomUUID(); // Use this UUID for database operations

    const values = {
      name: body.name,
      symbol: body.symbol,
      uri: body.uri,
      totalSupply: new BN(body.totalSupply),
      minPurchase: new BN(body.minPurchase),
      maxPurchase: new BN(body.maxPurchase),
      // Assume ticker is presaleAmount TODO: Parvat, will rename this in contract
      ticker: new BN(body.presaleAmount),
      presalePercentage: body.presalePercentage,
      startTime: new BN(currentTime),
      endTime: new BN(body.endTime),
    };

    const [mintPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("mint"),
        new PublicKey(body.userAddress).toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [presalePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("presale"), mintPDA.toBuffer()],
      program.programId
    );

    console.log("Reaching here at 99");
    
    // Create token in tb_tokens first
    const newToken = await tokens.create({
      mint_address: mintPDA.toBase58(),
      symbol: body.symbol,
      name: body.name,
      decimals: 9, // Assuming 9 decimals as standard for Solana SPL tokens
      logo_uri: body?.imageURI
    });
    
    if (!newToken || newToken.length === 0) {
      return NextResponse.json(
        { success: false, error: "Error creating token data" },
        { status: 500 }
      );
    }
    
    // Create the presale record using Drizzle
    const newPresale = await presales.create({
      id: dbId, // Use the UUID string for database - id is now expecting a string
      token_id: newToken[0].id, // Link to the token we just created
      name: body.name,
      symbol: body.symbol,
      uri: body.uri,
      description: body.description,
      total_supply: body.totalSupply,
      imageURI: body?.imageURI as string,
      // ticker as u64 / (total_supply * presale_percentage as u64 / 100);
      token_price: body.tokenPrice,
      min_purchase: body.minPurchase,
      max_purchase: body.maxPurchase,
      mint_address: mintPDA.toBase58(),
      presale_address: presalePDA.toBase58(),
      presale_percentage: body.presalePercentage,
      end_time: body.endTime,
      user_address: body.userAddress,
      total_raised: 0,
      target_amount: body.presaleAmount * body.tokenPrice,
      start_time: new Date(currentTime * 1000),
      finalized: false,
    });

    if (!newPresale || newPresale.length === 0) {
      return NextResponse.json(
        { success: false, error: "Error creating presale data" },
        { status: 500 }
      );
    }

    const tx = await program.methods
      .createToken(
        new BN(id),
        values.startTime,
        values.endTime,
        values.ticker,
        values.name,
        values.symbol,
        values.uri,
        values.totalSupply,
        values.minPurchase,
        values.maxPurchase,
        values.presalePercentage
      )
      .accounts({
        payer: new PublicKey(body.userAddress),
      })
      .transaction();

    // Create ATA for presale PDA
    const presaleATA = await getAssociatedTokenAddress(
      mintPDA,
      presalePDA,
      true
    );

    const createPresaleATAInstruction = createAssociatedTokenAccountInstruction(
      new PublicKey(body.userAddress), // payer
      presaleATA, // ata
      presalePDA, // owner
      mintPDA // mint
    );
    tx.add(createPresaleATAInstruction);

    const tx2 = await program.methods
      .mintToken(new BN(id))
      .accounts({
        payer: new PublicKey(body.userAddress),
      })
      .transaction();

    const finalTx = new Transaction().add(tx, tx2);
    
    // Make sure to set the latest blockhash and fee payer BEFORE simulation
    finalTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    finalTx.feePayer = new PublicKey(body.userAddress);

    console.log("Simulating transaction...");
    const simulation = await connection.simulateTransaction(finalTx);
    console.log("Simulation result:", simulation.value.logs);
    
    const serializedTx = Buffer.from(
      finalTx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
    ).toString('base64');

    return NextResponse.json({ 
      success: true, 
      tx: serializedTx,
      tokenId: dbId, // Return the UUID for database operations
      presaleAddress: presalePDA.toBase58()
    });
  } catch (error: any) {
    console.error("Error creating presale token:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
