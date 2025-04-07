import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { envRPC_URL, envNEXT_PUBLIC_USE_MAINNET } from './env';
import { getHypernovaProgramId, HypernovaIDL as IDL } from '../../anchor/src/hypernova-exports';

// Initialize connection
export const connection = new Connection(
    envRPC_URL,
    'confirmed'
);

// Get the appropriate program ID based on environment
export const programId = getHypernovaProgramId();

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
    const address = programId.toBase58();
    return new Program({ ...IDL, address } as any, provider);
};

export const getProgramWithDummyWallet = () => {
    return getProgram(dummyWallet);
};