"use client"

import React from 'react';
import { WalletAdapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolanaProvider } from './SolanaProvider';
import { getWalletAdapters } from '@/config/wallets';
import { getRpcEndpoint } from '@/config/rpc';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const network = WalletAdapterNetwork.Devnet;
  const wallets = getWalletAdapters(network);
  const endpoint = getRpcEndpoint(network, true); // Set to true to use custom RPC

  return (
    <SolanaProvider network={network} wallets={wallets as WalletAdapter[]} endpoint={endpoint}>
      {children}
    </SolanaProvider>
  );
} 