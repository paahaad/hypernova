import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import { envRPC_URL } from './env';
import { getHypernovaProgramId, Hypernova, HypernovaIDL as IDL } from '../../anchor/src/hypernova-exports';

// Initialize connection
export const connection = new Connection(envRPC_URL, "confirmed");

// Get the appropriate program ID based on environment
export const programId = getHypernovaProgramId();

export const dummyWallet: Wallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: async <T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> => tx,
  signAllTransactions: async <T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]> => txs,
  payer: Keypair.generate(),
};

// Initialize provider
export const getProvider = (wallet: Wallet) => {
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
};

// Initialize program
export const getProgram = (wallet: Wallet) => {
  const provider = getProvider(wallet);
  const address = programId.toBase58();
  return new Program<Hypernova>(
    IDL as Hypernova,
    address as any,
    provider as any
  );
};

export const getProgramWithDummyWallet = () => {
  return getProgram(dummyWallet);
};
