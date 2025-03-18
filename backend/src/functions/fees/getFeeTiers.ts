import {
    PDAUtil
} from "@orca-so/whirlpools-sdk";
import { Transaction } from "@solana/web3.js";
import { config, configExtension, connection, keyPair, wallet, ctx, ORCA_WHIRLPOOL_PROGRAM_ID } from "../../client";


async function getFeeTiers() {
    const feeTiers = await ctx.program.account.feeTier.all();
    
    console.table(feeTiers
        .sort((a, b) => a.account.tickSpacing - b.account.tickSpacing)
        .map(feeTier => ({
            feeTier: feeTier.publicKey.toBase58(),
            tickSpacing: feeTier.account.tickSpacing,
            feeRate: feeTier.account.defaultFeeRate
        })));
}

getFeeTiers().catch(console.error);

// ┌─────────┬────────────────────────────────────────────────┬─────────────┬─────────┐
// │ (index) │ feeTier                                        │ tickSpacing │ feeRate │
// ├─────────┼────────────────────────────────────────────────┼─────────────┼─────────┤
// │ 0       │ 'GxxJaKQLCeSJQSpvycPfv5QvhWVpU6uQ5WBnJgzEUb4z' │ 1           │ 100     │
// │ 1       │ 'C6w4nsyHLmXkAbbWU5ePvkaWSJEEZJWq6SynGbuv3eJB' │ 2           │ 200     │
// │ 2       │ 'GKQwu7Yqw7hLdVQ66cquTy5MLnaVsfigytoxgVu7ruQe' │ 4           │ 500     │
// │ 3       │ '5UCf4RLApV3a9SKLsPzs4ptn8eWnYZAGgDrAugNoo4wy' │ 8           │ 1000    │
// │ 4       │ 'DCsFhT3MuM2wNuKpoUXcHHY3EkjtBH3JoA14U1yR1Kka' │ 16          │ 1600    │
// │ 5       │ '2nskCy3LtPdzDu58u8bfQW4Lpi5P9MmVHGihanJnbUm5' │ 32          │ 3000    │
// │ 6       │ 'EpVH17vo2hBJ3LanrrgP78MQDfUtMN2RSPNQbxqqzUxG' │ 64          │ 6500    │
// │ 7       │ '6buez11P2SC7XAudU9Bp3gYJVDZaCVSAykTzrMWVEFzb' │ 128         │ 10000   │
// │ 8       │ 'FCKbXHKuDowYbb7UBEHhewu6rX1i8gtLcqTJZG2Qznkc' │ 256         │ 20000   │
// │ 9       │ '3C45jyoRQKkyXj2a9Hh85VwDqszsQoiEXvrsvHfu7bwL' │ 32896       │ 10000   │
// └─────────┴────────────────────────────────────────────────┴─────────────┴─────────┘