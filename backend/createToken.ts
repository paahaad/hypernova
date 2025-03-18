// import {
//     createSolanaRpc,
//     generateKeyPairSigner,
//     Address,
//     lamports,
// } from '@solana/web3.js';

// import {
//     createMint,
//     getMint,
//     getOrCreateAssociatedTokenAccount,
//     mintTo,
// } from '@solana/spl-token';

// async function createNewToken() {
//     // Connect to devnet
//     const rpc = createSolanaRpc("https://api.testnet.sonic.game/");
    
//     // Generate a new keypair for the mint authority
//     const mintAuthority = await generateKeyPairSigner();
    
//     // Create the token mint
//     const mint = await createMint(
//         rpc,
//         mintAuthority,
//         mintAuthority.address, // Mint authority
//         mintAuthority.address, // Freeze authority
//         9 // Number of decimals
//     );

//     console.log(`Token Mint Address: ${mint}`);

//     // Get the token mint info
//     const mintInfo = await getMint(rpc, mint);
//     console.log(`Token Decimals: ${mintInfo.decimals}`);

//     // Create associated token account for the mint authority
//     const tokenAccount = await getOrCreateAssociatedTokenAccount(
//         rpc,
//         mintAuthority,
//         mint,
//         mintAuthority.address
//     );

//     console.log(`Token Account Address: ${tokenAccount.address}`);

//     // Mint some tokens to the token account
//     const mintAmount = 1000000000; // 1 token with 9 decimals
//     await mintTo(
//         rpc,
//         mintAuthority,
//         mint,
//         tokenAccount.address,
//         mintAuthority,
//         mintAmount
//     );

//     console.log(`Minted ${mintAmount} tokens to ${tokenAccount.address}`);

//     return {
//         mint,
//         mintAuthority,
//         tokenAccount: tokenAccount.address
//     };
// }

// createNewToken().catch(console.error);
