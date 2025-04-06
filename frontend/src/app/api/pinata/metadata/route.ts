import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body for metadata
    const metadata = await request.json();

    if (!metadata) {
      return NextResponse.json(
        { error: "Metadata is required" },
        { status: 400 }
      );
    }

    // Upload JSON metadata to Pinata
    const response = await pinata.upload.json(metadata);
    const ipfsHash = response.IpfsHash;
    
    // Convert CID to URL
    const url = await pinata.gateways.convert(ipfsHash);
    
    return NextResponse.json({ url, ipfsHash }, { status: 200 });
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    return NextResponse.json(
      { error: "Failed to upload metadata" },
      { status: 500 }
    );
  }
} 