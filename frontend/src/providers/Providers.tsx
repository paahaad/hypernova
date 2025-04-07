"use client"

import React from 'react';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { SolanaProvider } from './SolanaProvider';
import { getWalletAdapters } from '@/config/wallets';
import { getRpcEndpoint } from '@/config/rpc';
import { NETWORK } from '@/config/environment';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const wallets = getWalletAdapters(NETWORK);
  const endpoint = getRpcEndpoint(true); // Set to true to use custom RPC

  return (
    <SolanaProvider network={NETWORK} wallets={wallets as WalletAdapter[]} endpoint={endpoint}>
      {children}
    </SolanaProvider>
  );
} 