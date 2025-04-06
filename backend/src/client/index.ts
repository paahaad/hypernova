import {
    WhirlpoolContext,
    PDAUtil,
    WHIRLPOOL_IDL,
    buildWhirlpoolClient
} from "@orca-so/whirlpools-sdk";
import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { Wallet } from "../types/wallet";
import bs58 from "bs58";
import dotenv from "dotenv";
import { envFEES_WALLET_SECRET_KEY, envRPC_ENDPOINT } from "../env";
dotenv.config();


export const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey("FDtFfB7t7ndyFm9yvwS2KisRxCTrWZhCwdgPTCyCPrww");
export const config = new PublicKey("EzKxn2NVVC6ohUtHHkqdhXVpjVctR2B9KXyjK7qXf1Ez");
export const configExtension = new PublicKey("BukT4pT7DhbybXJpQZo9zLBpTQS6XgXqBfEmZ2CcfB1Q");

export const connection = new Connection(envRPC_ENDPOINT);
export const keyPair = Keypair.fromSecretKey(bs58.decode(envFEES_WALLET_SECRET_KEY));
export const wallet = new Wallet(keyPair);
export const 

ctx = WhirlpoolContext.from(
    connection,
    wallet,
    ORCA_WHIRLPOOL_PROGRAM_ID,
);

export const whirlpoolClient = buildWhirlpoolClient(ctx);
export default ctx;