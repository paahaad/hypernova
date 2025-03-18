// import {
//     createKeyPairSignerFromBytes, Address, Transaction, pipe,
//     createTransactionMessage,
//     setTransactionMessageFeePayer,
//     setTransactionMessageLifetimeUsingBlockhash,
//     appendTransactionMessageInstruction, sendAndConfirmTransactionFactory, address, createKeyPairSignerFromPrivateKeyBytes,
//     appendTransactionMessageInstructions,
//     signAndSendTransactionMessageWithSigners,
//     signTransactionMessageWithSigners,
//     compileTransaction,
//     getTransactionEncoder,
//     getBase64EncodedWireTransaction
// } from '@solana/web3.js';
// import { setDefaultFunder, setWhirlpoolsConfig, createSplashPoolInstructions } from '@orca-so/whirlpools';
// import fs from 'fs';

// // Import the required functions from Solana Web3.js v2.0.0
// import {
//     generateKeyPairSigner,
//     createSolanaRpc,
//     devnet,
//     getAddressFromPublicKey,
//     lamports,
//     airdropFactory,
//     createSolanaRpcSubscriptions
// } from '@solana/web3.js';

// // Helper function to convert Uint8Array to Buffer for base64 conversion
// const toBuffer = (arr: Uint8Array): Buffer => {
//     if (Buffer.isBuffer(arr)) {
//         return arr;
//     } else if (arr instanceof Uint8Array) {
//         return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
//     } else {
//         return Buffer.from(arr);
//     }
// };

// // Original code for reference
// const keyPairBytes = new Uint8Array(JSON.parse(fs.readFileSync('/Users/aryan/.config/solana/id.json', 'utf8')));

// async function main() {
//     // Original code
//     const wallet = await createKeyPairSignerFromBytes(keyPairBytes);
//     const address = 'FDtFfB7t7ndyFm9yvwS2KisRxCTrWZhCwdgPTCyCPrww' as Address;
//     await setWhirlpoolsConfig(address);
//     console.log("Original wallet:", wallet);

//     const devnetRpc = createSolanaRpc("https://api.testnet.sonic.game/");
//     const devnetRpcSubscriptions = createSolanaRpcSubscriptions("wss://api.testnet.sonic.game/");

//     setDefaultFunder(wallet);

//     const tokenMintOne = "So11111111111111111111111111111111111111112" as Address;
//     const tokenMintTwo = "GNjic4v44vrxFEr6Hewm3Z16gQuiUsP7e2Z3dL3c2LkP" as Address;
//     const initialPrice = 0.01;

//     const { poolAddress, instructions, initializationCost } = await createSplashPoolInstructions(
//         devnetRpc,
//         tokenMintOne,
//         tokenMintTwo,
//         initialPrice,
//         wallet
//     );

//     console.log(`Pool Address: ${poolAddress}`);
//     console.log(`Initialization Cost: ${initializationCost} lamports`);

//     const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc: devnetRpc, rpcSubscriptions: devnetRpcSubscriptions });

//     const blockhash = await devnetRpc.getLatestBlockhash().send();

//     // Create transaction message using the pipe pattern
//     const txMsg = pipe(
//         createTransactionMessage({version : 0}),
//         (message) => setTransactionMessageFeePayer(wallet.address, message),
//         (message) => setTransactionMessageLifetimeUsingBlockhash(blockhash.value, message),
//         (message) => appendTransactionMessageInstructions(instructions, message)
//     );

//     // Compile the transaction message into a transaction
//     const transaction = compileTransaction(txMsg);
    
//     // Get the base64 encoded transaction
//     const base64Transaction = getBase64EncodedWireTransaction(transaction);
    
//     console.log("Base64 serialized transaction:");
//     console.log(base64Transaction);

//     // Sign the transaction message
//     const signedTransaction = await signTransactionMessageWithSigners(txMsg);
    
//     // Send and confirm the transaction
//     const txHash = await sendAndConfirmTransaction(signedTransaction, {
//         commitment: 'processed',
//         skipPreflight: true
//     });
    
//     console.log(`Transaction Hash: ${txHash}`);
// }

// main();
