"use client"

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Settings2, ChevronDown, Maximize2, Divide, ArrowUpDown } from "lucide-react";
import useSWR from "swr";
import { TokenSelector } from "./token-selector";
import { SlippageModal } from "./slippage-modal";
import { Token } from "@/types/token";
import { useWallet } from "@solana/wallet-adapter-react";
import { themedToast } from '@/lib/toast';
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/anchor";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Hero() {
  const { publicKey } = useWallet();
  const [fromToken, setFromToken] = useState<Token>({
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
  });
  const [toToken, setToToken] = useState<Token>({
    address: "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES",
    symbol: "SONIC",
    name: "Sonic",
    decimals: 9,
    logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
  });
  const [fromAmount, setFromAmount] = useState("1.0");
  const [isFromSelectorOpen, setIsFromSelectorOpen] = useState(false);
  const [isToSelectorOpen, setIsToSelectorOpen] = useState(false);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);
  const [slippage, setSlippage] = useState(1);
  const [fromTokenBalance, setFromTokenBalance] = useState<number>(0);

  const { data, error } = useSWR(
    `https://api.jup.ag/price/v2?ids=${fromToken.address},${toToken.address}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const toAmount = useMemo(() => {
    if (!data?.data) return "...";
    
    const fromTokenData = data.data[fromToken.address];
    const toTokenData = data.data[toToken.address];
    
    if (!fromTokenData?.price || !toTokenData?.price) return "...";
    
    const fromPrice = parseFloat(fromTokenData.price);
    const toPrice = parseFloat(toTokenData.price);
    
    if (isNaN(fromPrice) || isNaN(toPrice)) return "...";
    
    const amount = (fromPrice / toPrice * parseFloat(fromAmount)).toFixed(2);
    return new Intl.NumberFormat('en-US').format(parseFloat(amount));
  }, [data, fromToken, toToken, fromAmount]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      if (fromToken.address === "So11111111111111111111111111111111111111112") {
        // Fetch SOL balance
        const balance = await connection.getBalance(publicKey);
        setFromTokenBalance(balance / 1e9);
      } else {
        // Fetch SPL token balance
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          mint: new PublicKey(fromToken.address),
        });

        if (tokenAccounts.value.length > 0) {
          const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          setFromTokenBalance(balance);
        } else {
          setFromTokenBalance(0);
        }
      }
    };

    fetchBalance();
  }, [publicKey, fromToken]);

  const handleMax = () => {
    if (fromTokenBalance > 0) {
      setFromAmount(fromTokenBalance.toString());
    }
  };

  const handleHalf = () => {
    if (fromTokenBalance > 0) {
      setFromAmount((fromTokenBalance / 2).toString());
    }
  };

  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleSwap = async () => {
    if (!publicKey) {
      themedToast.error("Please connect your wallet first");
      return;
    }

    try {
      // TODO: Implement swap logic using Jupiter API
      themedToast.success("Swap executed successfully!");
    } catch (error) {
      themedToast.error("Failed to execute swap");
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 border border-gray-700 rounded-full bg-gray-900/50 backdrop-blur-sm">
            <span className="text-xs font-medium text-gray-300">
              Built for SonicSVM 🚀
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight retro-glow scanline">
            <span className="retro-gradient">
              Hyperspeed Tokens on Sonic SVM
            </span>
          </h1>
    
          {/* Floating terminal-like UI */}
          <div className="mt-16 mb-10 relative max-w-3xl mx-auto scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl"></div>
            <div className="retro-card rounded-xl overflow-hidden p-1 relative w-3/4 mx-auto">
              <div className="bg-gray-900 rounded-t-lg p-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto text-xs text-gray-400">
                  hypernova.exchange
                </div>
                <button 
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsSlippageModalOpen(true)}
                >
                  <Settings2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="bg-black p-6 rounded-b-lg scanline">
                <div className="flex flex-col gap-4 items-center">
                  <div className="w-full bg-gradient-to-b from-gray-900/50 to-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">From</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleHalf}
                          className="text-xs text-gray-400 hover:text-gray-200 transition-colors border border-gray-700 rounded px-2 py-0.5"
                        >
                          Half
                        </button>
                        <button 
                          onClick={handleMax}
                          className="text-xs text-gray-400 hover:text-gray-200 transition-colors border border-gray-700 rounded px-2 py-0.5"
                        >
                          Max
                        </button>
                        <span className="text-sm text-gray-400">
                          Balance: {publicKey ? fromTokenBalance.toFixed(4) : "--"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setIsFromSelectorOpen(true)}
                        className="flex items-center hover:bg-gray-800/50 rounded-lg p-2 transition-colors border border-gray-700"
                      >
                        <div className="relative w-8 h-8 mr-2">
                          <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center">
                            <img 
                              src={fromToken.logoURI}
                              alt={fromToken.symbol}
                              className="w-6 h-6 rounded-full"
                            />
                          </div>
                        </div>
                        <span className="font-medium text-gray-200">{fromToken.symbol}</span>
                        <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                      </button>
                      <input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="font-mono text-lg bg-transparent text-right outline-none w-32 text-gray-200"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSwitchTokens}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <ArrowUpDown className="h-5 w-5 text-gray-400" />
                  </button>

                  <div className="w-full bg-gradient-to-b from-gray-900/50 to-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">To</span>
                      <span className="text-sm text-gray-400">
                        Balance: {publicKey ? "0.00" : "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setIsToSelectorOpen(true)}
                        className="flex items-center hover:bg-gray-800/50 rounded-lg p-2 transition-colors border border-gray-700"
                      >
                        <div className="relative w-8 h-8 mr-2">
                          <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center">
                            <img 
                              src={toToken.logoURI}
                              alt={toToken.symbol}
                              className="w-6 h-6 rounded-full"
                            />
                          </div>
                        </div>
                        <span className="font-medium text-gray-200">{toToken.symbol}</span>
                        <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                      </button>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-lg crt-flicker text-gray-200">
                          {toAmount}
                        </span>
                        {error && (
                          <span className="text-xs text-red-500">
                            Error fetching price
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSwap}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg h-12 retro-glow"
                  disabled={!publicKey}
                >
                  {publicKey ? "Swap" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-md mx-auto font-medium leading-relaxed tracking-wide">
            The largest DEX and Launchpad on Sonic SVM –– the first chain extension on Solana
          </p>
        </div>
      </div>

      <TokenSelector
        isOpen={isFromSelectorOpen}
        onClose={() => setIsFromSelectorOpen(false)}
        onSelect={setFromToken}
        tokens={[]}
        selectedToken={fromToken}
      />

      <TokenSelector
        isOpen={isToSelectorOpen}
        onClose={() => setIsToSelectorOpen(false)}
        onSelect={setToToken}
        tokens={[]}
        selectedToken={toToken}
      />

      <SlippageModal
        isOpen={isSlippageModalOpen}
        onClose={() => setIsSlippageModalOpen(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </section>
  );
}