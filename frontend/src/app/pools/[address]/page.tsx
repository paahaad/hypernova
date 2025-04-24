'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from '@solana/wallet-adapter-react';
import { wallet } from '@/lib/orca';
import { Switch } from "@/components/ui/switch";
import { Check, Copy } from "lucide-react";
import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { themedToast } from '@/lib/toast';

// TiltingBottle component for horizontal bottle UI that tilts based on token amounts
interface TiltingBottleProps {
  tokenAAmount: string;
  tokenBAmount: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  onTokenAChange: (value: string) => void;
  onTokenBChange: (value: string) => void;
}

function TiltingBottle({ 
  tokenAAmount, 
  tokenBAmount, 
  tokenASymbol,
  tokenBSymbol,
  onTokenAChange, 
  onTokenBChange 
}: TiltingBottleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startAmounts, setStartAmounts] = useState<[string, string]>(['0', '0']);
  
  // Calculate token values for display
  const tokenA = parseFloat(tokenAAmount) || 0;
  const tokenB = parseFloat(tokenBAmount) || 0;
  
  // Calculate tilt based on token ratio
  const calculateTilt = () => {
    if (tokenA === 0 && tokenB === 0) return 0;
    
    // Tilt based on which token has more - negative for tokenA, positive for tokenB
    const ratio = tokenB / (tokenA + tokenB);
    return (ratio - 0.5) * 40; // -20 to +20 degrees
  };

  // Calculate fill percentages
  const totalAmount = Math.max(tokenA + tokenB, 0.01);
  const fillPercentageA = (tokenA / totalAmount) * 50; // max 50% of bottle
  const fillPercentageB = (tokenB / totalAmount) * 50; // max 50% of bottle
  
  const tiltAngle = calculateTilt();
  
  // Handle the bottle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setStartAmounts([tokenAAmount, tokenBAmount]);
    e.preventDefault();
  }, [tokenAAmount, tokenBAmount]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = startY - e.clientY; // Inverted Y for natural feel
    
    const xSensitivity = 0.05; // Adjust sensitivity as needed
    const ySensitivity = 0.05;
    
    // Update token amounts based on drag
    // Horizontal movement affects the relative ratio
    // Vertical movement affects the total amount
    
    const startA = parseFloat(startAmounts[0]) || 0;
    const startB = parseFloat(startAmounts[1]) || 0;
    
    let newAmountA = Math.max(0, startA + (deltaY * ySensitivity) - (deltaX * xSensitivity));
    let newAmountB = Math.max(0, startB + (deltaY * ySensitivity) + (deltaX * xSensitivity));
    
    // Normalize so amounts don't get too large
    if (newAmountA + newAmountB > 100) {
      const scale = 100 / (newAmountA + newAmountB);
      newAmountA *= scale;
      newAmountB *= scale;
    }
    
    onTokenAChange(newAmountA.toFixed(2));
    onTokenBChange(newAmountB.toFixed(2));
  }, [isDragging, startX, startY, startAmounts, onTokenAChange, onTokenBChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col items-center p-6 relative">
      <div className="flex justify-between w-full mb-2">
        <div className="text-sm text-white font-medium">
          {tokenASymbol}: <span>{tokenA.toFixed(2)}</span>
        </div>
        <div className="text-sm text-white font-medium">
          {tokenBSymbol}: <span>{tokenB.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Bottle container with perspective */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[400px] h-[180px] flex items-center justify-center perspective-800"
      >
        {/* Bottle with tilt transformation */}
        <div 
          className="relative w-[280px] h-[100px] transition-transform duration-300 cursor-move"
          style={{ 
            transform: `rotateZ(${tiltAngle}deg)`,
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Glass container - rectangular with slight rounded corners */}
          <div 
            className="absolute inset-0 rounded-sm bg-transparent overflow-hidden"
            style={{ 
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 0 10px rgba(255,255,255,0.05)'
            }}
          >
            {/* Glass texture */}
            <div 
              className="absolute inset-[1px] rounded-sm overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                backdropFilter: 'blur(5px)'
              }}
            >
              {/* Rim highlight */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white opacity-50"></div>
              
              {/* Liquid container that stays horizontal regardless of bottle tilt */}
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ 
                  transform: `rotateZ(${-tiltAngle}deg)`,
                  transformOrigin: 'center' 
                }}
              >
                {/* Token B Liquid (top layer) - blue */}
                <div 
                  className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-out"
                  style={{
                    height: `${fillPercentageB}%`,
                    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                    boxShadow: 'inset 0 0 15px rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Bubbles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-70" 
                         style={{ left: '20%', top: '60%', animation: 'bubble-horizontal 3s infinite ease-in' }}></div>
                    <div className="bubble-sm absolute w-1.5 h-1.5 rounded-full bg-white opacity-50" 
                         style={{ left: '70%', top: '30%', animation: 'bubble-horizontal 4s infinite ease-in 1s' }}></div>
                  </div>
                </div>
                
                {/* Token A Liquid (bottom layer) - purple */}
                <div 
                  className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-out"
                  style={{
                    height: `${fillPercentageA}%`,
                    background: 'linear-gradient(to top, #a855f7, #c084fc)',
                    boxShadow: 'inset 0 0 15px rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Bubbles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-70" 
                         style={{ left: '35%', top: '40%', animation: 'bubble-horizontal 3.5s infinite ease-in 0.5s' }}></div>
                    <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-60" 
                         style={{ left: '80%', top: '70%', animation: 'bubble-horizontal 3.2s infinite ease-in 1.5s' }}></div>
                  </div>
                </div>
                
                {/* Liquid surface highlight - interface between the two liquids */}
                {tokenA > 0 && tokenB > 0 && (
                  <div 
                    className="absolute inset-x-0 h-[1px] bg-white opacity-40"
                    style={{ 
                      bottom: `${fillPercentageA}%`,
                      boxShadow: '0 0 5px rgba(255,255,255,0.7)'
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Token indicators */}
          <div className="absolute -left-8 top-1/4 transform -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold">{tokenASymbol[0]}</span>
            </div>
          </div>
          
          <div className="absolute -left-8 bottom-1/4 transform -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold">{tokenBSymbol[0]}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-400 mt-4">
        Drag the bottle to adjust token amounts
      </div>
    </div>
  );
}

const GlobalStyles = () => {
  return (
    <style jsx global>{`
      @keyframes bubble {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
      }
      
      @keyframes bubble-horizontal {
        0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
        100% { transform: translate(-20px, -20px) scale(1.5); opacity: 0; }
      }

      .perspective-800 {
        perspective: 800px;
      }
    `}</style>
  );
};

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
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  const { publicKey, connected, sendTransaction } = useWallet();
  
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
    if (!pool || !connected || !publicKey || !sendTransaction) {
      console.error('Pool not found or wallet not connected');
      return;
    }

    setIsAddingLiquidity(true);

    try {
      const payload = {
        whirlpoolAddress: pool.whirlpool_address,
        userAddress: publicKey.toString(),
        tokenAmountA: parseFloat(tokenAAmount),
        tokenAmountB: parseFloat(tokenBAmount),
        priceLower: parseFloat(minPrice),
        priceUpper: parseFloat(maxPrice)
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/liquidity/add`, payload);

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to add liquidity');
      }

      const { tx, positionMint } = response.data;
      
      if (!tx) {
        themedToast.error('No transaction received from server');
        return;
      }

      // Convert base64 transaction to Transaction object
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      
      const signature = await sendTransaction(txData, connection);
      
      console.log('Transaction signature:', signature);
      console.log('Position mint:', positionMint);

      // Reset form
      setTokenAAmount('');
      setTokenBAmount('');
      
      themedToast.success('Successfully added liquidity!');
      
      // Optionally refresh pool data or navigate to the positions tab
      setActiveTab('positions');

    } catch (error: any) {
      console.error('Error adding liquidity:', error);
      themedToast.error(error.message || 'Failed to add liquidity');
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const handleMinPriceChange = (value: number) => {
    setMinPrice(value.toString());
    setPriceRange([value, parseFloat(maxPrice)]);
  };
  
  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(value.toString());
    setPriceRange([parseFloat(minPrice), value]);
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
      <GlobalStyles />
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
              <Card className="bg-transparent backdrop-blur-sm border border-gray-700 text-white p-6">
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
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8">
              <Card className="bg-transparent backdrop-blur-sm border border-gray-700 text-white p-6">
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
                      <h3 className="text-lg font-medium">Add liquidity to pool</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Auto-Fill</span>
                        <Switch
                          checked={autoFill}
                          onCheckedChange={setAutoFill}
                          className="bg-gray-700"
                        />
                      </div>
                    </div>

                    {/* Token Input Fields */}
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
                          <button 
                            className="text-sm text-gray-400 hover:text-white"
                            onClick={() => setTokenAAmount((parseFloat(tokenAAmount) || 0) > 0 ? (parseFloat(tokenAAmount) / 2).toString() : "0")}
                          >
                            50%
                          </button>
                          <button 
                            className="text-sm text-gray-400 hover:text-white"
                            onClick={() => setTokenAAmount("20")}
                          >
                            MAX
                          </button>
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
                          <button 
                            className="text-sm text-gray-400 hover:text-white"
                            onClick={() => setTokenBAmount((parseFloat(tokenBAmount) || 0) > 0 ? (parseFloat(tokenBAmount) / 2).toString() : "0")}
                          >
                            50%
                          </button>
                          <button 
                            className="text-sm text-gray-400 hover:text-white"
                            onClick={() => setTokenBAmount("20")}
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Bottle UI */}
                    <div className="mt-8">
                      <TiltingBottle
                        tokenAAmount={tokenAAmount}
                        tokenBAmount={tokenBAmount}
                        tokenASymbol={pool?.token_a_symbol || 'Token A'}
                        tokenBSymbol={pool?.token_b_symbol || 'Token B'}
                        onTokenAChange={setTokenAAmount}
                        onTokenBChange={setTokenBAmount}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span>SOL needed to create position:</span>
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
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                      disabled={!connected || isAddingLiquidity}
                    >
                      {isAddingLiquidity ? 'Adding Liquidity...' : 'Add Liquidity'}
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