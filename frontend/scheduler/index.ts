import * as anchor from '@coral-xyz/anchor';
import cron from 'node-cron';
import { getHypernovaProgram } from "@project/anchor";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { presales } from "@/db/repositories";

const dummyWallet = new Keypair();
const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "");
const provider = new AnchorProvider(
  connection,
  { publicKey: dummyWallet.publicKey } as Wallet,
  { commitment: "confirmed" }
);
const program = getHypernovaProgram(provider);

async function checkAndFinalizeSales() {
  try {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const recipientWallet = new Keypair();
    
    // Query presales that have ended but not finalized
    const endedPresales = await presales.findEndedNotFinalized(now);

    if (!endedPresales || endedPresales.length === 0) {
      console.log('No ended presales to finalize');
      return;
    }

    for (const presale of endedPresales) {
      try {
        // Create transaction to finalize sale
        const tx = await program.methods
          .finalizeSale()
          .accounts({
            presaleAccount: new PublicKey(presale.presale_address),
            recipient: recipientWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        // Update the presale record to mark it as finalized
        await presales.updateByPresaleAddress(presale.presale_address, {
          finalized: true,
          recipient_wallet: recipientWallet.publicKey.toString(),
          finalized_at: new Date(now * 1000),
          finalize_tx: tx
        });

        // Save the recipient wallet's private key securely
        // IMPORTANT: In production, use proper key management system
        console.log('Presale finalized:', {
          presaleAddress: presale.presale_address,
          recipientWallet: recipientWallet.publicKey.toString(),
          tx: tx,
          recipientPrivateKey: Buffer.from(recipientWallet.secretKey).toString('base64')
        });

      } catch (err) {
        console.error(`Error finalizing presale ${presale.presale_address}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in checkAndFinalizeSales:', err);
  }
}

// Run every 2 minutes
cron.schedule('*/2 * * * *', async () => {
  console.log('Running presale finalization check...');
  await checkAndFinalizeSales();
});

// Initial check on startup
checkAndFinalizeSales();