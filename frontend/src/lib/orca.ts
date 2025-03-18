import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { dummyWallet, connection } from "./anchor";

export const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey("FDtFfB7t7ndyFm9yvwS2KisRxCTrWZhCwdgPTCyCPrww");
export const config = new PublicKey("EzKxn2NVVC6ohUtHHkqdhXVpjVctR2B9KXyjK7qXf1Ez");
export const configExtension = new PublicKey("BukT4pT7DhbybXJpQZo9zLBpTQS6XgXqBfEmZ2CcfB1Q");

export interface Wallet {
    signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
    publicKey: PublicKey;
}

export const wallet: Wallet = dummyWallet;

export async function getOrca() {
    try {
        const { WhirlpoolContext } = await import("@orca-so/whirlpools-sdk");
        const orca = WhirlpoolContext.from(
            connection,
            wallet,
            ORCA_WHIRLPOOL_PROGRAM_ID,
        );

        return orca;
    } catch (error) {
        console.error("Error getting Orca:", error);
        throw error;
    }
}