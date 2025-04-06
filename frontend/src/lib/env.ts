// All environment variables are defined in the .env / .env.local file
// Use the envs exported from this file in the application instead of process.env in every file

// ---The envNEXT_PUBLIC_USE_MAINNET is used to determine if the application is running on mainnet or testnet---
export const envNEXT_PUBLIC_USE_MAINNET = process.env.NEXT_PUBLIC_USE_MAINNET || false;


export const envNEXT_PUBLIC_PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
// RPC URLs based on network environment
export const envMAINNET_RPC_URL = 'https://rpc.mainnet-alpha.sonic.game';
export const envTESTNET_RPC_URL = 'https://api.testnet.sonic.game';
export const envRPC_URL = envNEXT_PUBLIC_USE_MAINNET ? envMAINNET_RPC_URL : envTESTNET_RPC_URL;
export const envNEXT_PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || envRPC_URL;
export const envSUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL || '';
export const envNEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const envNEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const envSUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const envBACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
export const envPINATA_API_KEY = process.env.PINATA_API_KEY || '';
export const envPINATA_API_SECRET = process.env.PINATA_API_SECRET || '';
export const envPINATA_JWT = process.env.PINATA_JWT || '';
export const envNEXT_PUBLIC_GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || ''; 