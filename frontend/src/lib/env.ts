// All environment variables are defined in the .env / .env.local file
// Use the envs exported from this file in the application instead of process.env in every file

// Check if we are in the server or client context
const isServer = typeof window === 'undefined';

// Environment variables for the application
// This file simplifies accessing environment variables and provides consistent naming

// Auth variables
export const envNEXT_PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
export const envNEXT_PUBLIC_USE_TEST_TOKENS = process.env.NEXT_PUBLIC_USE_TEST_TOKENS === 'true';
export const envNEXT_PUBLIC_NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet';

// Blockchain variables
export const envNEXT_PUBLIC_HYPERNOVA_PROGRAM_ID = process.env.NEXT_PUBLIC_HYPERNOVA_PROGRAM_ID || '';
export const envWALLET_MONITOR_INTERVAL = process.env.WALLET_MONITOR_INTERVAL ? parseInt(process.env.WALLET_MONITOR_INTERVAL) : 1000;

// Database variables
export const envSUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL || '';

// Environment variables
export const envNEXT_PUBLIC_USE_MAINNET = process.env.NEXT_PUBLIC_USE_MAINNET === 'true';
export const envNEXT_PUBLIC_PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
// RPC URLs based on network environment
export const envMAINNET_RPC_URL = 'https://rpc.mainnet-alpha.sonic.game';
export const envTESTNET_RPC_URL = 'https://api.testnet.sonic.game';
export const envRPC_URL = envNEXT_PUBLIC_USE_MAINNET ? envMAINNET_RPC_URL : envTESTNET_RPC_URL;
export const envPINATA_API_KEY = process.env.PINATA_API_KEY || '';
export const envPINATA_API_SECRET = process.env.PINATA_API_SECRET || '';
export const envPINATA_JWT = process.env.PINATA_JWT || '';
export const envNEXT_PUBLIC_GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || ''; 