'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from '@solana/wallet-adapter-react';
import { wallet } from '@/lib/orca';
import { Switch } from "@/components/ui/switch";
import { Check, Copy } from "lucide-react";

interface PoolDetails {
  whirlpool_address: string;
  token_mint_a: string;
  token_mint_b: string;
  created_at: string;
  token_a_symbol?: string;
  token_b_symbol?: string;
  token_a_balance?: number;
  token_b_balance?: number;
  tvl?: number;
  trading_volume?: number;
  current_price?: number;
}

export default function PoolDetailsPage() {
  const params = useParams();
  const [pool, setPool] = useState<PoolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'add'>('positions');
  const [selectedTab, setSelectedTab] = useState<'full' | 'custom'>('full');
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const [minPrice, setMinPrice] = useState('6.490425');
  const [maxPrice, setMaxPrice] = useState('9.110986');
  const [numBins, setNumBins] = useState('69');
  const [autoFill, setAutoFill] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([6.490425, 9.110986]);
  const currentPrice = 7.6899;
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  const { publicKey, connected } = useWallet();
  
  useEffect(() => {
    const fetchPoolDetails = async () => {
      try {
        const response = await fetch(`/api/pools/${params.address}`);
        const data = await response.json();
        if (data.success && data.pool) {
          setPool(data.pool);
        }
      } catch (error) {
        console.error('Error fetching pool details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolDetails();
  }, [params.address]);

  const handleAddLiquidity = async () => {
    if (!pool || !connected || !publicKey) {
      console.error('Pool not found or wallet not connected');
      return;
    }

    try {
      // This will be handled by the Add Position button click handler
      console.log('Add Position clicked');
    } catch (error) {
      console.error('Error adding liquidity:', error);
    }
  };

  const handleRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setMinPrice(range[0].toString());
    setMaxPrice(range[1].toString());
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-16 w-full mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
              
              <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </Card>
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6">
              <Skeleton className="h-8 w-full mb-6" />
              <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Pool not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative p-8">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white/60">
              <a href="/pools" className="hover:text-white">Pools</a>
              <span>›</span>
              <span className="text-white text-2xl font-bold">{pool?.token_a_symbol}-{pool?.token_b_symbol}</span>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-white">0.08%</span>
              <span className="text-gray-400 text-sm ml-2">24hr fee / TVL</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6">
                <h2 className="text-gray-400 text-sm mb-2">Total Value Locked</h2>
                <p className="text-2xl font-bold">${pool?.tvl?.toLocaleString() || "0.00"}</p>

                <h3 className="text-gray-400 text-sm mt-6 mb-4">Liquidity Allocation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600"></div>
                      <span>{pool?.token_a_symbol}</span>
                      <div className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-0.5">
                        <span className="text-gray-500 text-sm">{pool?.token_mint_a?.slice(0, 4)}...{pool?.token_mint_a?.slice(-4)}</span>
                        <button 
                          onClick={() => copyToClipboard(pool?.token_mint_a || '', 'alloc-a')}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedStates['alloc-a'] ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <span>{pool?.token_a_balance?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                      <span>{pool?.token_b_symbol}</span>
                      <div className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-0.5">
                        <span className="text-gray-500 text-sm">{pool?.token_mint_b?.slice(0, 4)}...{pool?.token_mint_b?.slice(-4)}</span>
                        <button 
                          onClick={() => copyToClipboard(pool?.token_mint_b || '', 'alloc-b')}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedStates['alloc-b'] ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <span>{pool?.token_b_balance?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bin Step</span>
                    <span>50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Fee</span>
                    <span>0.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Fee</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protocol Fee</span>
                    <span>0.00503125%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dynamic Fee</span>
                    <span>0.100625%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Fee</span>
                    <span>$251,809.57</span>
                  </div>
                </div>
              </Card>

              {/* Trading Volume Chart */}
              <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6">
                <h3 className="text-gray-400 mb-2">Trading Volume</h3>
                <p className="text-2xl font-bold mb-4">${pool?.trading_volume?.toLocaleString()}</p>
                <div className="h-48 w-full bg-gray-800/50 rounded-lg relative overflow-hidden">
                  {/* Example trading volume graph */}
                  <div className="absolute inset-0 flex items-end p-2">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-purple-500/50 mx-0.5 rounded-t"
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8">
              <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6">
                {/* Tabs */}
                <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
                  <button
                    className={`flex-1 px-4 py-2 ${
                      activeTab === 'positions'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setActiveTab('positions')}
                  >
                    Positions
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 ${
                      activeTab === 'add'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setActiveTab('add')}
                  >
                    Add Position
                  </button>
                </div>

                {activeTab === 'positions' ? (
                  <div className="space-y-6">
                    {/* Position Card */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-gray-400 text-sm font-medium">Price Range</h2>
                          <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg px-3 py-1.5">
                            <span className="text-sm font-medium">0.5417981 - 0.0001658</span>
                            <button className="p-1 hover:bg-gray-700 rounded-md transition-colors">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 7h10v10H7V7z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          </div>
                          <span className="text-gray-400 text-sm">{pool?.token_b_symbol} per {pool?.token_a_symbol}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <span className="text-gray-400 text-sm block">24hr Fee / TVL</span>
                            <span className="text-sm font-medium">-</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-sm block">Your Liquidity</span>
                            <span className="text-sm font-medium">$10.01</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3 bg-gray-900/50 rounded-lg p-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0"></div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{pool?.token_a_symbol}</span>
                              <div className="flex items-center space-x-1 bg-gray-800/50 rounded px-2 py-0.5">
                                <span className="text-gray-500 text-xs truncate">{pool?.token_mint_a?.slice(0, 4)}...{pool?.token_mint_a?.slice(-4)}</span>
                                <button 
                                  onClick={() => copyToClipboard(pool?.token_mint_a || '', 'alloc-a')}
                                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                                >
                                  {copiedStates['alloc-a'] ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <span className="text-sm">0.00</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-gray-900/50 rounded-lg p-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{pool?.token_b_symbol}</span>
                              <div className="flex items-center space-x-1 bg-gray-800/50 rounded px-2 py-0.5">
                                <span className="text-gray-500 text-xs truncate">{pool?.token_mint_b?.slice(0, 4)}...{pool?.token_mint_b?.slice(-4)}</span>
                                <button 
                                  onClick={() => copyToClipboard(pool?.token_mint_b || '', 'alloc-b')}
                                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                                >
                                  {copiedStates['alloc-b'] ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <span className="text-sm">0.00</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-400">Total Liquidity</span>
                        <div className="text-2xl font-bold">$0.00</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Fees Earned (Claimed)</span>
                        <div className="text-2xl font-bold">$0.00</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-4">
                        <h3>Your Positions</h3>
                        <Button variant="outline" size="sm">
                          ↺ Swap
                        </Button>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400">Your Unclaimed Swap Fee</span>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-600"></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{pool?.token_a_symbol}</span>
                              <span className="text-gray-500 text-xs">{pool?.token_mint_a?.slice(0, 4)}...{pool?.token_mint_a?.slice(-4)}</span>
                            </div>
                            <span>0.00</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{pool?.token_b_symbol}</span>
                              <span className="text-gray-500 text-xs">{pool?.token_mint_b?.slice(0, 4)}...{pool?.token_mint_b?.slice(-4)}</span>
                            </div>
                            <span>0.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3>Enter deposit amount:</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Auto-Fill</span>
                        <Switch
                          checked={autoFill}
                          onCheckedChange={setAutoFill}
                          className="bg-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-600"></div>
                          <Label className="text-gray-400">
                            {pool?.token_a_symbol}
                            <span className="text-gray-500 text-xs ml-2">{pool?.token_mint_a?.slice(0, 4)}...{pool?.token_mint_a?.slice(-4)}</span>
                          </Label>
                        </div>
                        <Input
                          type="number"
                          value={tokenAAmount}
                          onChange={(e) => setTokenAAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="0.00"
                        />
                        <div className="flex justify-between mt-1">
                          <button className="text-sm text-gray-400 hover:text-white">50%</button>
                          <button className="text-sm text-gray-400 hover:text-white">MAX</button>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                          <Label className="text-gray-400">
                            {pool?.token_b_symbol}
                            <span className="text-gray-500 text-xs ml-2">{pool?.token_mint_b?.slice(0, 4)}...{pool?.token_mint_b?.slice(-4)}</span>
                          </Label>
                        </div>
                        <Input
                          type="number"
                          value={tokenBAmount}
                          onChange={(e) => setTokenBAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="0.00"
                        />
                        <div className="flex justify-between mt-1">
                          <button className="text-sm text-gray-400 hover:text-white">50%</button>
                          <button className="text-sm text-gray-400 hover:text-white">MAX</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4">Select Range Type</h3>
                      <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
                        <button
                          className={`flex-1 px-4 py-2 ${
                            selectedTab === 'full'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                          onClick={() => setSelectedTab('full')}
                        >
                          Full Range
                        </button>
                        <button
                          className={`flex-1 px-4 py-2 ${
                            selectedTab === 'custom'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                          onClick={() => setSelectedTab('custom')}
                        >
                          Custom Range
                        </button>
                      </div>

                      {selectedTab === 'full' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-400">Min Price</Label>
                              <Input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white mt-2"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400">Max Price</Label>
                              <Input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white mt-2"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="h-64 bg-gray-800/50 rounded-lg p-4 relative">
                            {/* Price Range Graph */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-32 relative">
                                {/* Current Price Line */}
                                <div 
                                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                                  style={{ left: `${((currentPrice - 6) / (10 - 6)) * 100}%` }}
                                >
                                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm">
                                    Current Price
                                    <div className="text-xs text-gray-400">{currentPrice}</div>
                                  </div>
                                </div>

                                {/* Selected Range */}
                                <div 
                                  className="absolute top-0 bottom-0 bg-purple-500/20"
                                  style={{
                                    left: `${((priceRange[0] - 6) / (10 - 6)) * 100}%`,
                                    width: `${((priceRange[1] - priceRange[0]) / (10 - 6)) * 100}%`
                                  }}
                                />

                                {/* Range Handles */}
                                <div 
                                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full cursor-pointer"
                                  style={{ left: `${((priceRange[0] - 6) / (10 - 6)) * 100}%` }}
                                  // Add drag handling here
                                />
                                <div 
                                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full cursor-pointer"
                                  style={{ left: `${((priceRange[1] - 6) / (10 - 6)) * 100}%` }}
                                  // Add drag handling here
                                />
                              </div>
                            </div>

                            {/* Price Labels */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-between text-sm text-gray-400">
                              <span>6.00</span>
                              <span>10.00</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <Label className="text-gray-400">Min Price</Label>
                              <p className="text-xl">{priceRange[0].toFixed(6)}</p>
                              <p className="text-red-500">-15.60%</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Current</Label>
                              <p className="text-xl">{currentPrice}</p>
                              <p className="text-gray-400">Market Price</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Max Price</Label>
                              <p className="text-xl">{priceRange[1].toFixed(6)}</p>
                              <p className="text-green-500">+18.48%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span>SOL needed to create 1 positions:</span>
                        <span className="text-purple-400">0.05656552 SOL</span>
                        <Button variant="link" size="sm" className="text-gray-400">
                          Show cost details
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>Refundable:</span>
                        <span className="text-purple-400">0.056152 SOL</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddLiquidity}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                      disabled={!connected}
                    >
                      Add Liquidity
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 