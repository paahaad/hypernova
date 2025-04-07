import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Upload file to Pinata
    const response = await pinata.upload.file(file);
    const ipfsHash = response.IpfsHash;
    
    // Convert CID to URL
    const url = await pinata.gateways.convert(ipfsHash);
    
    return NextResponse.json({ url, ipfsHash }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 