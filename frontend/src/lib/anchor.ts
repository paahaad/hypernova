import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import IDL from './idl.json';
import { Hypernova } from './idlType';

// Initialize connection
export const connection = new Connection(
    process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8899',
    'confirmed'
);

export const dummyWallet: Wallet = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => tx,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => txs,
    payer: Keypair.generate(),
};

// Initialize provider
export const getProvider = (wallet: Wallet) => {
    return new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });
};

// Initialize program
export const getProgram = (wallet: Wallet) => {
    const provider = getProvider(wallet);
    return new Program<Hypernova>(IDL, provider);
};

export const getProgramWithDummyWallet = () => {
    return getProgram(dummyWallet);
};