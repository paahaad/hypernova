'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { ChevronDown, Clock, ArrowDownUp, Filter, Check, Copy, Plus } from "lucide-react";

interface Pool {
  whirlpool_address: string;
  token_mint_a: string;
  token_mint_b: string;
  token_a_symbol?: string;
  token_b_symbol?: string;
  token_a_name?: string;
  token_b_name?: string;
  token_a_logo_uri?: string;
  token_b_logo_uri?: string;
  created_at: string;
  liquidity?: string;
  volume_24h?: string;
  fees_24h?: string;
  apr_24h?: string;
}

type SortOption = 'liquidity' | 'volume' | 'newest';

interface CopiedState {
  [key: string]: boolean;
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [filteredPools, setFilteredPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('volume');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedStates, setCopiedStates] = useState<CopiedState>({});
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefreshPools = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const response = await fetch('/api/pools');
      const data = await response.json();
      if (data.success && data.pools) {
        setPools(data.pools);
        setFilteredPools(data.pools);
      }
    } catch (error) {
      console.error('Error refreshing pools:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('/api/pools');
        const data = await response.json();
        if (data.success && data.pools) {
          // Data is already formatted correctly from the API
          setPools(data.pools);
          setFilteredPools(data.pools);
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
        pool.token_mint_b.toLowerCase().includes(term) ||
        (pool.token_a_symbol && pool.token_a_symbol.toLowerCase().includes(term)) ||
        (pool.token_b_symbol && pool.token_b_symbol.toLowerCase().includes(term))
      );
    }
    
    switch (sortOption) {
      case 'liquidity':
        filtered.sort((a, b) => parseFloat(b.liquidity?.replace('$', '') || '0') - parseFloat(a.liquidity?.replace('$', '') || '0'));
        break;
      case 'volume':
        filtered.sort((a, b) => parseFloat(b.volume_24h?.replace('$', '') || '0') - parseFloat(a.volume_24h?.replace('$', '') || '0'));
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
      case 'newest': return 'Newest First';
      default: return 'Sort By';
    }
  };

  const getSortIcon = () => {
    switch (sortOption) {
      case 'liquidity':
      case 'volume':
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
          {/* Create Pool Button */}
          <section className="flex flex-col items-center gap-4 w-full max-w-6xl mb-6">
            <Link href="/createpool">
              <Button 
                variant="outline" 
                size="lg"
                className="cyber-glitch-btn text-white py-4 px-8 transition-all duration-200"
              >
              Create Pool
              </Button>
            </Link>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPools}
                  disabled={refreshing}
                  className="border-purple-500 text-purple-500 hover:bg-purple-500/20"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Pools'}
                </Button>
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
                      <th className="py-4 px-6 font-medium text-gray-400">Pool Information</th>
                      <th className="py-4 px-6 font-medium text-gray-400 cursor-pointer" onClick={() => setSortOption('liquidity')}>
                        Liquidity {sortOption === 'liquidity' && '↓'}
                      </th>
                      <th className="py-4 px-6 font-medium text-gray-400 cursor-pointer" onClick={() => setSortOption('volume')}>
                        Volume 24H {sortOption === 'volume' && '↓'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPools.map((pool) => (
                      <tr 
                        key={pool.whirlpool_address} 
                        className="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer" 
                        onClick={() => window.location.href = `/pools/${pool.whirlpool_address}`}
                      >
                        <td className="py-4 px-6">
                          {/* Split Pool Information section */}
                          <div className="flex items-start justify-between gap-4">
                            {/* Left section: Token pair info */}
                            <div className="flex flex-col gap-3">
                              {/* Pool Name/Pair */}
                              <div className="text-sm text-purple-400 font-bold">
                                {pool.token_a_symbol && pool.token_b_symbol 
                                  ? `${pool.token_a_symbol}/${pool.token_b_symbol}`
                                  : 'Token Pair'}
                              </div>
                              
                              {/* Token info rows */}
                              <div className="flex flex-col gap-2">
                                {/* Token A with logo */}
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                                    {pool.token_a_logo_uri ? (
                                      <img 
                                        src={pool.token_a_logo_uri} 
                                        alt={pool.token_a_symbol || 'Token A'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://placehold.co/200x200/0f172a/f8fafc?text=?";
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs">?</span>
                                    )}
                                  </div>
                                  <div className="font-medium truncate max-w-[180px]">
                                    {pool.token_a_symbol ? `${pool.token_a_symbol} (${pool.token_mint_a.slice(0, 4)}...${pool.token_mint_a.slice(-4)})` : `${pool.token_mint_a.slice(0, 4)}...${pool.token_mint_a.slice(-4)}`}
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(pool.token_mint_a, `a-${pool.whirlpool_address}`);
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                  >
                                    {copiedStates[`a-${pool.whirlpool_address}`] ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                                
                                {/* Token B with logo */}
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                                    {pool.token_b_logo_uri ? (
                                      <img 
                                        src={pool.token_b_logo_uri} 
                                        alt={pool.token_b_symbol || 'Token B'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://placehold.co/200x200/0f172a/f8fafc?text=?";
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs">?</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-400 truncate max-w-[180px]">
                                    {pool.token_b_symbol ? `${pool.token_b_symbol} (${pool.token_mint_b.slice(0, 4)}...${pool.token_mint_b.slice(-4)})` : `${pool.token_mint_b.slice(0, 4)}...${pool.token_mint_b.slice(-4)}`}
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(pool.token_mint_b, `b-${pool.whirlpool_address}`);
                                    }}
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
                            
                            {/* Right section: Whirlpool address */}
                            <div className="flex flex-col items-end">
                              <div className="text-xs text-gray-500 mb-1">Whirlpool</div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-xs text-gray-300 truncate max-w-[120px]">
                                  {pool.whirlpool_address.slice(0, 8)}...{pool.whirlpool_address.slice(-8)}
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(pool.whirlpool_address, `pool-${pool.whirlpool_address}`);
                                  }}
                                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                                >
                                  {copiedStates[`pool-${pool.whirlpool_address}`] ? (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Include the styles for glitch button and effects */}
          <style jsx global>{`
            .cyber-glitch-btn {
              position: relative;
              width: auto;
              min-width: 180px;
              height: auto;
              background: linear-gradient(45deg, rgba(15, 14, 26, 0.8), rgba(30, 28, 52, 0.8));
              border: 1px solid rgba(139, 92, 246, 0.4);
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.2);
              text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
              font-family: 'Orbitron', 'Rajdhani', 'Courier New', monospace;
              font-size: 1.5rem;
              font-weight: 600;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #fff;
              z-index: 1;
              overflow: hidden;
              animation: border-flicker 4s linear infinite, text-flicker 4s linear infinite;
            }

            .cyber-glitch-btn::before,
            .cyber-glitch-btn::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(45deg, 
                rgba(139, 92, 246, 0.5), 
                rgba(239, 68, 68, 0.5), 
                rgba(59, 130, 246, 0.5));
              z-index: -1;
              opacity: 0;
              transition: opacity 0.3s ease;
            }

            .cyber-glitch-btn:hover {
              background: linear-gradient(45deg, rgba(20, 18, 35, 0.8), rgba(40, 38, 70, 0.8));
              animation: border-flicker 0.5s linear infinite, text-flicker 0.5s linear infinite;
            }

            @keyframes text-flicker {
              0% { opacity: 0.8; text-shadow: 0 0 29px rgba(139, 92, 246, 0.6); }
              2% { opacity: 1; text-shadow: 0 0 29px rgba(139, 92, 246, 0.6); }
              4% { opacity: 0.8; text-shadow: 0 0 29px rgba(139, 92, 246, 0.6); }
              8% { opacity: 1; text-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
              70% { opacity: 0.9; text-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
              100% { opacity: 1; text-shadow: 0 0 29px rgba(139, 92, 246, 0.6); }
            }

            @keyframes border-flicker {
              0% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.1), 0 0 5px rgba(139, 92, 246, 0.1), 0 0 10px rgba(139, 92, 246, 0.1); }
              2% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.5); }
              4% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.1), 0 0 5px rgba(139, 92, 246, 0.1), 0 0 10px rgba(139, 92, 246, 0.1); }
              8% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.6), 0 0 5px rgba(139, 92, 246, 0.6), 0 0 10px rgba(139, 92, 246, 0.6); }
              70% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.2), 0 0 5px rgba(139, 92, 246, 0.2), 0 0 10px rgba(139, 92, 246, 0.2); }
              100% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.3), 0 0 5px rgba(139, 92, 246, 0.3), 0 0 10px rgba(139, 92, 246, 0.3); }
            }

            @keyframes glitch-periodic {
              0%, 95%, 100% { transform: translate(0); }
              96% { transform: translate(-5px, 0); }
              97% { transform: translate(5px, 0); }
              98% { transform: translate(-3px, 0); }
              99% { transform: translate(3px, 0); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
