'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PoolLaunchForm from "@/components/PoolLaunchForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock, ArrowDownUp, Filter } from "lucide-react";

interface Pool {
  whirlpool_address: string;
  token_mint_a: string;
  token_mint_b: string;
  created_at: string;
}

type SortOption = 'newest' | 'oldest' | 'token-a-asc' | 'token-a-desc' | 'token-b-asc' | 'token-b-desc';

export default function PoolsPage() {
  const [showCreatePoolForm, setShowCreatePoolForm] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [filteredPools, setFilteredPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('/api/pools');
        const data = await response.json();
        if (data.success && data.pools) {
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
    // Filter and sort pools when sort option or search term changes
    let filtered = [...pools];
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pool => 
        pool.whirlpool_address.toLowerCase().includes(term) || 
        pool.token_mint_a.toLowerCase().includes(term) ||
        pool.token_mint_b.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'token-a-asc':
        filtered.sort((a, b) => a.token_mint_a.localeCompare(b.token_mint_a));
        break;
      case 'token-a-desc':
        filtered.sort((a, b) => b.token_mint_a.localeCompare(a.token_mint_a));
        break;
      case 'token-b-asc':
        filtered.sort((a, b) => a.token_mint_b.localeCompare(b.token_mint_b));
        break;
      case 'token-b-desc':
        filtered.sort((a, b) => b.token_mint_b.localeCompare(a.token_mint_b));
        break;
      default:
        break;
    }
    
    setFilteredPools(filtered);
  }, [pools, sortOption, searchTerm]);

  const getSortLabel = () => {
    switch (sortOption) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'token-a-asc': return 'Token A (A-Z)';
      case 'token-a-desc': return 'Token A (Z-A)';
      case 'token-b-asc': return 'Token B (A-Z)';
      case 'token-b-desc': return 'Token B (Z-A)';
      default: return 'Sort By';
    }
  };

  const getSortIcon = () => {
    switch (sortOption) {
      case 'newest':
      case 'oldest':
        return <Clock className="h-4 w-4" />;
      case 'token-a-asc':
      case 'token-a-desc':
      case 'token-b-asc':
      case 'token-b-desc':
        return <ArrowDownUp className="h-4 w-4" />;
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
            <div className="w-full max-w-4xl">
              <PoolLaunchForm />
            </div>
          ) : (
            <>
              {/* Create Pool Section */}
              <section className="flex flex-col items-center gap-4 w-full max-w-4xl mb-12">
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
              <section className="w-full max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-white">Liquidity Pools</h2>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    {/* Search input */}
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Search by address or token"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    
                    {/* Sort dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9 border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800/50 flex items-center gap-2">
                          {getSortIcon()}
                          <span>{getSortLabel()}</span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700 text-white">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                          <DropdownMenuRadioItem value="newest">
                            <Clock className="mr-2 h-4 w-4" />
                            Newest First
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="oldest">
                            <Clock className="mr-2 h-4 w-4" />
                            Oldest First
                          </DropdownMenuRadioItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioItem value="token-a-asc">
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Token A (A-Z)
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="token-a-desc">
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Token A (Z-A)
                          </DropdownMenuRadioItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioItem value="token-b-asc">
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Token B (A-Z)
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="token-b-desc">
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Token B (Z-A)
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card 
                        key={i} 
                        className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white rounded-xl p-6"
                      >
                        <div className="flex flex-col gap-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <Skeleton className="w-16 h-16 rounded-lg" />
                              <div>
                                <Skeleton className="h-4 w-28 mb-1" />
                                <Skeleton className="h-5 w-60" />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Skeleton className="h-4 w-16 mb-1" />
                              <Skeleton className="h-5 w-full max-w-64" />
                            </div>
                            <div>
                              <Skeleton className="h-4 w-16 mb-1" />
                              <Skeleton className="h-5 w-full max-w-64" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredPools.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPools.map((pool) => (
                      <Card 
                        key={pool.whirlpool_address} 
                        className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800/50 transition-colors cursor-pointer rounded-xl p-6"
                        onClick={() => window.location.href = `/pools/${pool.whirlpool_address}`}
                      >
                        <div className="flex flex-col gap-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <div className="text-white text-3xl">💧</div>
                              </div>
                              <div>
                                <div className="text-base text-gray-300 mb-1">Whirlpool Address</div>
                                <div className="text-base font-medium break-all">{pool.whirlpool_address}</div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6 text-base">
                            <div>
                              <div className="text-gray-300 mb-1">Token A</div>
                              <div className="font-medium break-all">{pool.token_mint_a}</div>
                            </div>
                            <div>
                              <div className="text-gray-300 mb-1">Token B</div>
                              <div className="font-medium break-all">{pool.token_mint_b}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-300">
                    No pools match your search criteria
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
