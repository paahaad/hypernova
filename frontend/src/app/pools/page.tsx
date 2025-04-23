'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PoolLaunchForm from "@/components/forms/PoolLaunchForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock, ArrowDownUp, Filter, Check, Copy } from "lucide-react";

interface Pool {
  whirlpool_address: string;
  token_mint_a: string;
  token_mint_b: string;
  created_at: string;
  liquidity?: string;
  volume_24h?: string;
  fees_24h?: string;
  apr_24h?: string;
}

type SortOption = 'liquidity' | 'volume' | 'fees' | 'apr' | 'newest';

interface CopiedState {
  [key: string]: boolean;
}

export default function PoolsPage() {
  const [showCreatePoolForm, setShowCreatePoolForm] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [filteredPools, setFilteredPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('volume');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedStates, setCopiedStates] = useState<CopiedState>({});

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

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('/api/pools');
        const data = await response.json();
        if (data.success && data.pools) {
          // Temporary mock data for demonstration
          const poolsWithData = data.pools.map((pool: Pool) => ({
            ...pool,
            liquidity: `$${(Math.random() * 10000000).toFixed(2)}`,
            volume_24h: `$${(Math.random() * 1000000).toFixed(2)}`,
            fees_24h: `$${(Math.random() * 10000).toFixed(2)}`,
            apr_24h: `${(Math.random() * 1000).toFixed(2)}%`
          }));
          setPools(poolsWithData);
          setFilteredPools(poolsWithData);
        }
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  useEffect(() => {
    let filtered = [...pools];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pool => 
        pool.whirlpool_address.toLowerCase().includes(term) || 
        pool.token_mint_a.toLowerCase().includes(term) ||
        pool.token_mint_b.toLowerCase().includes(term)
      );
    }
    
    switch (sortOption) {
      case 'liquidity':
        filtered.sort((a, b) => parseFloat(b.liquidity?.replace('$', '') || '0') - parseFloat(a.liquidity?.replace('$', '') || '0'));
        break;
      case 'volume':
        filtered.sort((a, b) => parseFloat(b.volume_24h?.replace('$', '') || '0') - parseFloat(a.volume_24h?.replace('$', '') || '0'));
        break;
      case 'fees':
        filtered.sort((a, b) => parseFloat(b.fees_24h?.replace('$', '') || '0') - parseFloat(a.fees_24h?.replace('$', '') || '0'));
        break;
      case 'apr':
        filtered.sort((a, b) => parseFloat(b.apr_24h?.replace('%', '') || '0') - parseFloat(a.apr_24h?.replace('%', '') || '0'));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    
    setFilteredPools(filtered);
  }, [pools, sortOption, searchTerm]);

  const getSortLabel = () => {
    switch (sortOption) {
      case 'liquidity': return 'Liquidity';
      case 'volume': return 'Volume 24H';
      case 'fees': return 'Fees 24H';
      case 'apr': return 'APR 24H';
      case 'newest': return 'Newest First';
      default: return 'Sort By';
    }
  };

  const getSortIcon = () => {
    switch (sortOption) {
      case 'liquidity':
      case 'volume':
      case 'fees':
      case 'apr':
        return <ArrowDownUp className="h-4 w-4" />;
      case 'newest':
        return <Clock className="h-4 w-4" />;
      default:
        return <ChevronDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className="relative p-8">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 relative z-10">
          {showCreatePoolForm ? (
            <div className="w-full max-w-6xl">
              <PoolLaunchForm />
            </div>
          ) : (
            <>
              {/* Create Pool Section */}
              <section className="flex flex-col items-center gap-4 w-full max-w-6xl mb-12">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => setShowCreatePoolForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl py-6 px-8 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Create Pool
                </Button>
                <p className="text-gray-300 text-sm">
                  Create a new liquidity pool in minutes
                </p>
              </section>

              {/* Pools List Section */}
              <section className="w-full max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-white">Liquidity Pools</h2>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Search pools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        
                        className="w-full h-9 bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="w-full">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-800/50 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-4 px-6 font-medium text-gray-400">Pool</th>
                          <th className="py-4 px-6 font-medium text-gray-400 cursor-pointer" onClick={() => setSortOption('liquidity')}>
                            Liquidity {sortOption === 'liquidity' && '↓'}
                          </th>
                          <th className="py-4 px-6 font-medium text-gray-400 cursor-pointer" onClick={() => setSortOption('volume')}>
                            Volume 24H {sortOption === 'volume' && '↓'}
                          </th>
                          <th className="py-4 px-6 font-medium text-gray-400 cursor-pointer" onClick={() => setSortOption('fees')}>
                            Fees 24H {sortOption === 'fees' && '↓'}
                          </th>
                          <th className="py-4 px-6 font-medium text-gray-400 cursor-pointer" onClick={() => setSortOption('apr')}>
                            APR 24H {sortOption === 'apr' && '↓'}
                          </th>
                          <th className="py-4 px-6 font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPools.map((pool) => (
                          <tr key={pool.whirlpool_address} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                  <span className="text-sm">💧</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium truncate max-w-[200px]">{pool.token_mint_a.slice(0, 4)}...{pool.token_mint_a.slice(-4)}</div>
                                    <button 
                                      onClick={() => copyToClipboard(pool.token_mint_a, `a-${pool.whirlpool_address}`)}
                                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    >
                                      {copiedStates[`a-${pool.whirlpool_address}`] ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-400 truncate max-w-[200px]">{pool.token_mint_b.slice(0, 4)}...{pool.token_mint_b.slice(-4)}</div>
                                    <button 
                                      onClick={() => copyToClipboard(pool.token_mint_b, `b-${pool.whirlpool_address}`)}
                                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    >
                                      {copiedStates[`b-${pool.whirlpool_address}`] ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-medium">{pool.liquidity}</td>
                            <td className="py-4 px-6 font-medium">{pool.volume_24h}</td>
                            <td className="py-4 px-6 font-medium">{pool.fees_24h}</td>
                            <td className="py-4 px-6">
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                                {pool.apr_24h}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500 text-purple-500 hover:bg-purple-500/20"
                                onClick={() => window.location.href = `/pools/${pool.whirlpool_address}`}
                              >
                                Deposit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
