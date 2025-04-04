import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

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
export const getRpcEndpoint = (network: WalletAdapterNetwork, useCustom = false) => {
  return useCustom ? CUSTOM_RPC_ENDPOINTS[network] : RPC_ENDPOINTS[network];
}; 