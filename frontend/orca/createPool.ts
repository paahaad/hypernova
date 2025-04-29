// import { Address, createKeyPairSignerFromBytes, createSolanaRpc, generateKeyPairSigner, getAddressEncoder, KeyPairSigner, Rpc, SolanaRpcApi } from "@solana/kit";
// import secret from "./wallet.json";
// import { fetchMint, getInitializeMint2Instruction, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
// import { createConcentratedLiquidityPool, setWhirlpoolsConfig, setRpc as setRpcActions, setPayerFromBytes } from "@orca-so/whirlpools";
// import { fetchWhirlpool } from "@orca-so/whirlpools-client";
// import { sqrtPriceToPrice } from "@orca-so/whirlpools-core";
// import { getCreateAccountInstruction } from "@solana-program/system";
// import { buildAndSendTransaction, setRpc } from "@orca-so/tx-sender";
// import dotenv from "dotenv";

// dotenv.config();

// async function main() {
//     // Initialize a connection to the RPC and read in private key
//     //@ts-ignore
//     const rpc = createSolanaRpc(process.env.RPC_URL);
//     //@ts-ignore
//     await setRpc(process.env.RPC_URL);
//     //@ts-ignore
//     await setRpcActions(process.env.RPC_URL);
//     await setPayerFromBytes(new Uint8Array(secret));
//     await setWhirlpoolsConfig("solanaDevnet");
//     const signer = await createKeyPairSignerFromBytes(new Uint8Array(secret));
//     console.log('wallet address:', signer.address);

//     // Create new token mints. Note that the in a more realistic scenario,
//     // the mints are generated beforehand.
//     const newTokenPubkeys = await Promise.all([
//         createNewTokenMint(rpc, signer, signer.address, signer.address, 9),
//         createNewTokenMint(rpc, signer, signer.address, signer.address, 6),
//     ]);

//     // Token A and Token B Mint has to be cardinally ordered
//     // For example, SOL/USDC can be created, but USDC/SOL cannot be created
//     const [tokenAddressA, tokenAddressB] = orderMints(newTokenPubkeys[0], newTokenPubkeys[1]);

//     // Fetch token mint infos
//     const tokenA = await fetchMint(rpc, tokenAddressA);
//     const tokenB = await fetchMint(rpc, tokenAddressB);
//     const decimalA = tokenA.data.decimals;
//     const decimalB = tokenB.data.decimals;
//     console.log("tokenA:", tokenAddressA, "decimalA:", decimalA);
//     console.log("tokenB:", tokenAddressB, "decimalB:", decimalB);

//     // The tick spacing maps to the fee tier of the pool. For more details, see
//     // https://dev.orca.so/Architecture%20Overview/Whirlpool%20Parameters#initialized-feetiers
//     const tickSpacing = 64;
//     const initialPrice = 0.01;

//     // Create a new pool
//     const { instructions, poolAddress, callback: sendTx } = await createConcentratedLiquidityPool(
//         tokenAddressA,
//         tokenAddressB,
//         tickSpacing,
//         initialPrice
//     );

//     const signature = await sendTx();
//     console.log("createPoolTxId:", signature);

//     // Fetch pool data to verify the initial price and tick
//     const pool = await fetchWhirlpool(rpc, poolAddress);
//     const poolData = pool.data;
//     const poolInitialPrice = sqrtPriceToPrice(poolData.sqrtPrice, decimalA, decimalB);
//     const poolInitialTick = poolData.tickCurrentIndex;

//     console.log(
//         "poolAddress:", poolAddress.toString(),
//         "\n  tokenA:", poolData.tokenMintA.toString(),
//         "\n  tokenB:", poolData.tokenMintB.toString(),
//         "\n  tickSpacing:", poolData.tickSpacing,
//         "\n  initialPrice:", poolInitialPrice,
//         "\n  initialTick:", poolInitialTick
//     );
// }

// async function createNewTokenMint(
//     rpc: Rpc<SolanaRpcApi>,
//     signer: KeyPairSigner,
//     mintAuthority: Address,
//     freezeAuthority: Address,
//     decimals: number) {
//     const keypair = await generateKeyPairSigner();
//     const mintLen = 82;
//     const lamports = await rpc.getMinimumBalanceForRentExemption(BigInt(mintLen)).send();
//     const createAccountInstruction = getCreateAccountInstruction({
//         payer: signer,
//         newAccount: keypair,
//         lamports,
//         space: mintLen,
//         programAddress: TOKEN_PROGRAM_ADDRESS,
//     });

//     const initializeMintInstruction = getInitializeMint2Instruction({
//         mint: keypair.address,
//         decimals,
//         mintAuthority,
//         freezeAuthority,
//     });

//     await buildAndSendTransaction([createAccountInstruction, initializeMintInstruction], signer);

//     return keypair.address;
// }

// // This function is implemented in token.ts in the @orca/whirlpools package
// function orderMints(mintA: Address, mintB: Address) {
//     const encoder = getAddressEncoder();
//     const mint1Bytes = new Uint8Array(encoder.encode(mintA));
//     const mint2Bytes = new Uint8Array(encoder.encode(mintB));
//     return Buffer.compare(mint1Bytes, mint2Bytes) < 0 ? [mintA, mintB] : [mintB, mintA];
// }

// main().catch((e) => console.error("error:", e));