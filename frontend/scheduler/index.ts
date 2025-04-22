import { createClient } from '@supabase/supabase-js';
import * as anchor from '@coral-xyz/anchor';
import cron from 'node-cron';
import { getHypernovaProgram } from "@project/anchor";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
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
    const { data: presales, error } = await supabase
      .from('presales')
      .select('*')
      .lt('end_time', now)
      .eq('finalized', false);

    if (error) {
      console.error('Error querying presales:', error);
      return;
    }

    for (const presale of presales || []) {
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

        await supabase
          .from('presales')
          .update({
            finalized: true,
            recipient_wallet: recipientWallet.publicKey.toString(),
            finalized_at: now,
            finalize_tx: tx
          })
          .eq('presale_address', presale.presale_address);

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