import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { swap } from '@/lib/whirlpool';

export async function POST(req: NextRequest) {
  try {
    const {
      whirlpoolAddress,
      inputTokenAmount,
      aToB,
      amountSpecifiedIsInput,
      minOutputAmount,
      userAddress,
    } = await req.json();

    if (!whirlpoolAddress || !inputTokenAmount || userAddress === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const whirlpoolPubkey = new PublicKey(whirlpoolAddress);
    const userPubkey = new PublicKey(userAddress);

    const tx = await swap({
      whirlpoolAddress: whirlpoolPubkey,
      amount: inputTokenAmount,
      userAddress: userPubkey,
      aToB,
      amountSpecifiedIsInput,
      minOutputAmount,
    });

    return NextResponse.json({
      tx: tx.serialize().toString('base64'),
    });
  } catch (error: any) {
    console.error('Swap error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process swap' },
      { status: 500 }
    );
  }
} 