"use client"

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Token } from "@/types/token";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/anchor";
import { ExternalLink, Copy, Check } from "lucide-react";
import { themedToast } from '@/lib/toast';

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  tokens: Token[];
  selectedToken?: Token;
}

const COMMON_TOKENS: Token[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
  },
  {
    address: "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES",
    symbol: "SONIC",
    name: "Sonic",
    decimals: 9,
    logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
  },
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
  },
  {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
  }
];

export function TokenSelector({ isOpen, onClose, onSelect, tokens, selectedToken }: TokenSelectorProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchQuery, setSearchQuery] = useState("");
  const { publicKey } = useWallet();
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      const balances: Record<string, number> = {};
      
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      balances["So11111111111111111111111111111111111111112"] = solBalance / 1e9;

      // Fetch SPL token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });

      tokenAccounts.value.forEach((account) => {
        const tokenData = account.account.data.parsed.info;
        const mint = tokenData.mint;
        const amount = tokenData.tokenAmount.uiAmount;
        balances[mint] = amount;
      });

      setTokenBalances(balances);
    };

    fetchBalances();
  }, [publicKey]);

  const allTokens = [...COMMON_TOKENS, ...tokens];
  
  const filteredTokens = allTokens
    .filter(token => 
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const balanceA = tokenBalances[a.address] || 0;
      const balanceB = tokenBalances[b.address] || 0;
      return balanceB - balanceA;
    });

  // Track copied states for all tokens
  const [copiedTokenAddress, setCopiedTokenAddress] = useState<string | null>(null);
  
  const handleCopy = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedTokenAddress(address);
    themedToast.success("Address copied to clipboard");
    setTimeout(() => setCopiedTokenAddress(null), 2000);
  };

  const Content = () => (
    <>
      <div className="p-4 bg-black/80 backdrop-blur-xl">
        <div className="relative mb-4">
          <Input
            placeholder="Search token name, symbol or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-lg bg-gray-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500 pl-12"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className={`w-full p-3 rounded-lg flex items-center space-x-4 transition-all ${
                  selectedToken?.address === token.address 
                    ? "bg-gray-800/50 border border-gray-600" 
                    : "hover:bg-gray-800/50 border border-gray-700"
                }`}
              >
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center">
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-medium text-gray-200">{token.symbol}</span>
                      <span className="text-base text-gray-400">{token.name}</span>
                    </div>
                    {tokenBalances[token.address] !== undefined && (
                      <span className="text-base text-gray-300">
                        {tokenBalances[token.address].toFixed(4)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {`${token.address.slice(0, 4)}...${token.address.slice(-4)}`}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, token.address)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {copiedTokenAddress === token.address ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <a
                      href={`https://explorer.sonic.game/address/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-black/80 backdrop-blur-xl border border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-200">Select Token</DialogTitle>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-black/80 backdrop-blur-xl border-t border-gray-700/50">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold text-gray-200">Select Token</DrawerTitle>
        </DrawerHeader>
        <Content />
      </DrawerContent>
    </Drawer>
  );
} 