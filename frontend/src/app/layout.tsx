"use client"

import "./globals.css";
import React from "react";
import Layout from "@/components/layout/layout";
import { SolanaProvider } from "@/providers/SolanaProvider";
import { getWalletAdapters } from "@/config/wallets";
import { getRpcEndpoint } from "@/config/rpc";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const wallets = getWalletAdapters(network);
  const endpoint = getRpcEndpoint(network, true); // Set to true to use custom RPC

  return (
    <html lang="en">
      <body>
        <SolanaProvider network={network} wallets={wallets} endpoint={endpoint}>
          <Layout>
            {children}
          </Layout>
        </SolanaProvider>
      </body>
    </html>
  );
}
