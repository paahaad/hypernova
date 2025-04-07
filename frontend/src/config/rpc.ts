import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { NETWORK } from './environment';

export const RPC_ENDPOINTS = {
  [WalletAdapterNetwork.Mainnet]: 'https://rpc.mainnet-alpha.sonic.game',
  [WalletAdapterNetwork.Devnet]: 'https://api.testnet.sonic.game',
  [WalletAdapterNetwork.Testnet]: 'https://api.testnet.sonic.game',
} as const;

// You can add your custom RPC endpoints here
export const CUSTOM_RPC_ENDPOINTS = {
  [WalletAdapterNetwork.Mainnet]: 'https://rpc.mainnet-alpha.sonic.game',
  [WalletAdapterNetwork.Devnet]: 'https://api.testnet.sonic.game',
  [WalletAdapterNetwork.Testnet]: 'https://api.testnet.sonic.game',
} as const;

// Use this function to get the RPC endpoint
export const getRpcEndpoint = (useCustom = false) => {
  return useCustom ? CUSTOM_RPC_ENDPOINTS[NETWORK] : RPC_ENDPOINTS[NETWORK];
};

// For compatibility with existing code that needs to specify the network
export const getRpcEndpointLegacy = (network: WalletAdapterNetwork, useCustom = false) => {
  return useCustom ? CUSTOM_RPC_ENDPOINTS[network] : RPC_ENDPOINTS[network];
}; 