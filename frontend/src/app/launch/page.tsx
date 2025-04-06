'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TokenLaunchForm from "@/components/TokenLaunchForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowDownAZ, ArrowUpZA, Clock, Banknote, Percent } from "lucide-react";

interface Presale {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  total_supply: number;
  token_price: number;
  min_purchase: number;
  max_purchase: number;
  presale_percentage: number;
  end_time: number;
  user_address: string;
  mint_address: string;
  presale_address: string;
}

type SortOption = 'newest' | 'oldest' | 'highest-percentage' | 'lowest-percentage' | 'highest-price' | 'lowest-price';

export default function LaunchPage() {
  const [showLaunchForm, setShowLaunchForm] = useState(false);
  const [presales, setPresales] = useState<Presale[]>([]);
  const [filteredPresales, setFilteredPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCardClick = (mintAddress: string) => {
    window.location.href = `/${mintAddress}`;
  };

  useEffect(() => {
    const fetchPresales = async () => {
      try {
        const response = await fetch('/api/presale');
        const data = await response.json();
        if (data.data) {
          setPresales(data.data);
          setFilteredPresales(data.data);
        }
      } catch (error) {
        console.error('Error fetching presales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresales();
  }, []);

  useEffect(() => {
    // Filter and sort presales when sort option or search term changes
    let filtered = [...presales];
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(presale => 
        presale.name.toLowerCase().includes(term) || 
        presale.symbol.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'highest-percentage':
        filtered.sort((a, b) => b.presale_percentage - a.presale_percentage);
        break;
      case 'lowest-percentage':
        filtered.sort((a, b) => a.presale_percentage - b.presale_percentage);
        break;
      case 'highest-price':
        filtered.sort((a, b) => b.token_price - a.token_price);
        break;
      case 'lowest-price':
        filtered.sort((a, b) => a.token_price - b.token_price);
        break;
      default:
        break;
    }
    
    setFilteredPresales(filtered);
  }, [presales, sortOption, searchTerm]);

  const getSortLabel = () => {
    switch (sortOption) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'highest-percentage': return 'Highest % Sold';
      case 'lowest-percentage': return 'Lowest % Sold';
      case 'highest-price': return 'Highest Price';
      case 'lowest-price': return 'Lowest Price';
      default: return 'Sort By';
    }
  };

  const getSortIcon = () => {
    switch (sortOption) {
      case 'newest':
      case 'oldest':
        return <Clock className="h-4 w-4" />;
      case 'highest-percentage':
      case 'lowest-percentage':
        return <Percent className="h-4 w-4" />;
      case 'highest-price':
      case 'lowest-price':
        return <Banknote className="h-4 w-4" />;
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
          {showLaunchForm ? (
            <TokenLaunchForm />
          ) : (
            <>
              {/* Launch Token Section */}
              <section className="flex flex-col items-center gap-4 w-full max-w-4xl mb-12">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => setShowLaunchForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl py-6 px-8 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Launch Token
                </Button>
                <p className="text-gray-300 text-sm">
                  Create a token in &lt;$2 and &lt;2 mins
                </p>
              </section>

              {/* Featured Launches Section - Temporarily Commented Out */}

              {/* All Launches Section */}
              <section className="w-full max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-white">All Launches</h2>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    {/* Search input */}
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Search by name or symbol"
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
                          <DropdownMenuRadioItem value="highest-percentage">
                            <Percent className="mr-2 h-4 w-4" />
                            Highest % Sold
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="lowest-percentage">
                            <Percent className="mr-2 h-4 w-4" />
                            Lowest % Sold
                          </DropdownMenuRadioItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioItem value="highest-price">
                            <Banknote className="mr-2 h-4 w-4" />
                            Highest Price
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="lowest-price">
                            <Banknote className="mr-2 h-4 w-4" />
                            Lowest Price
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card 
                        key={i} 
                        className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <Skeleton className="h-2 w-full rounded-full mb-1" />
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredPresales.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPresales.map((presale) => (
                      <Card 
                        key={presale.id} 
                        className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800/50 transition-colors cursor-pointer rounded-xl p-4"
                        onClick={() => handleCardClick(presale.mint_address)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <div className="text-white text-2xl">🧩</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">${presale.symbol}</span>
                              <span className="text-sm text-gray-300">{presale.name}</span>
                            </div>
                            <p className="text-sm text-gray-300">Total Supply: {presale.total_supply.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r from-purple-600 to-pink-600`} style={{ width: `${presale.presale_percentage}%` }}></div>
                          </div>
                          <div className="flex justify-between text-sm mt-1 text-gray-300">
                            <span>{presale.presale_percentage}%</span>
                            <span>{presale.min_purchase}/{presale.max_purchase} SOL</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-300">
                    No launches match your search criteria
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