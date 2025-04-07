import { envNEXT_PUBLIC_USE_MAINNET } from '@/lib/env';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Set this to true for mainnet, false for testnet/devnet
const isMainnet = envNEXT_PUBLIC_USE_MAINNET;

// The network to use throughout the application
export const NETWORK = isMainnet 
  ? WalletAdapterNetwork.Mainnet 
  : WalletAdapterNetwork.Devnet;

// Helper function to check if we're on mainnet
export const isMainnetEnvironment = () => NETWORK === WalletAdapterNetwork.Mainnet;

// Friendly name for the current network (for UI display)
export const NETWORK_NAME = isMainnetEnvironment() ? 'Mainnet' : 'Devnet'; 