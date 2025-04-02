"use client"

import React, { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapter } from '@solana/wallet-adapter-base';

interface SolanaProviderProps {
  children: React.ReactNode;
  network?: WalletAdapterNetwork;
  endpoint?: string;
  wallets?: WalletAdapter[];
  autoConnect?: boolean;
}

export function SolanaProvider({
  children,
  network = WalletAdapterNetwork.Devnet,
  endpoint: customEndpoint,
  wallets: customWallets = [],
  autoConnect = true,
}: SolanaProviderProps) {
  // Use custom endpoint if provided, otherwise use cluster API URL
  const endpoint = useMemo(
    () => customEndpoint || clusterApiUrl(network),
    [customEndpoint, network]
  );

  // Use custom wallets if provided, otherwise use default wallets
  const wallets = useMemo(
    () => customWallets,
    [customWallets]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 