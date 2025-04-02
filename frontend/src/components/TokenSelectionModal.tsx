'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star } from 'lucide-react';

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
}

const DEFAULT_TOKENS: TokenInfo[] = [
  {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
  },
  {
    symbol: "SONIC",
    name: "Sonic",
    address: "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES",
    decimals: 9,
    logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
  }
];

interface TokenSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
  selectedToken?: string;
}

export function TokenSelectionModal({ isOpen, onClose, onSelect, selectedToken }: TokenSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favoriteTokens') || '[]');
    }
    return [];
  });

  const filteredTokens = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return DEFAULT_TOKENS.filter(token =>
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-gray-900/50 backdrop-blur-sm border-gray-700 p-0">
        <DialogHeader className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Select a token</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700"
            />
          </div>
        </div>

        <ScrollArea className="h-[300px] p-2">
          <div className="space-y-1">
            {filteredTokens.map((token) => (
              <Button
                key={token.address}
                variant="ghost"
                className="w-full justify-between bg-gray-800/50 hover:bg-gray-700/50 h-14"
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
              >
                <div className="flex items-center">
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-gray-400">{token.name}</span>
                  </div>
                </div>
                <Star 
                  className={`h-4 w-4 ${favorites.includes(token.address) ? 'fill-yellow-500 text-yellow-500' : ''}`}
                />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 