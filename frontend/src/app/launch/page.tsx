'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TokenLaunchForm from "@/components/forms/TokenLaunchForm";
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
  imageURI: string;
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
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowLaunchForm(true)}
                  className="cyber-glitch-btn text-white py-4 px-8 transition-all duration-200"
                >
                  Launch Token
                </Button>
                <p className="text-gray-300 text-sm">
                  Create a token in &lt;$2 and &lt;2 mins
                </p>

                {/* Add the glitch button styles */}
                <style jsx global>{`
                  @keyframes glitch {
                    0% {
                      clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
                      transform: translate(0px, 0px);
                    }
                    2% {
                      clip-path: polygon(0 78%, 100% 78%, 100% 100%, 0 100%);
                      transform: translate(-5px, 0px);
                    }
                    4% {
                      clip-path: polygon(0 44%, 100% 44%, 100% 54%, 0 54%);
                      transform: translate(5px, 0px);
                    }
                    5% {
                      clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
                      transform: translate(5px, 0px);
                    }
                    6% {
                      clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
                      transform: translate(-5px, 0px);
                    }
                    7% {
                      clip-path: polygon(0 10%, 100% 10%, 100% 0, 0 0);
                      transform: translate(5px, 0px);
                    }
                    8% {
                      clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%);
                      transform: translate(5px, 10px) rotateX(90deg);
                    }
                    9% {
                      clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
                      transform: translate(-5px, 0px);
                    }
                    11% {
                      clip-path: polygon(0 15%, 100% 15%, 100% 90%, 0 90%);
                      transform: translate(10px, 0px);
                    }
                    13% {
                      clip-path: polygon(0 0, 0 0, 0 0, 0 0);
                      transform: translate(0, 0);
                    }
                    100% {
                      clip-path: polygon(0 0, 0 0, 0 0, 0 0);
                      transform: translate(0, 0);
                    }
                  }

                  @keyframes glitch-shake {
                    0% {
                      transform: translate(0);
                    }
                    20% {
                      transform: translate(-4px, 2px);
                    }
                    40% {
                      transform: translate(-2px, -2px);
                    }
                    60% {
                      transform: translate(4px, 2px);
                    }
                    80% {
                      transform: translate(2px, -4px);
                    }
                    100% {
                      transform: translate(0);
                    }
                  }

                  @keyframes text-flicker {
                    0% {
                      opacity: 0.8;
                      text-shadow: 0 0 29px rgba(139, 92, 246, 0.6);
                    }
                    2% {
                      opacity: 1;
                      text-shadow: 0 0 29px rgba(139, 92, 246, 0.6);
                    }
                    4% {
                      opacity: 0.8;
                      text-shadow: 0 0 29px rgba(139, 92, 246, 0.6);
                    }
                    8% {
                      opacity: 1;
                      text-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
                    }
                    70% {
                      opacity: 0.9;
                      text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
                    }
                    100% {
                      opacity: 1;
                      text-shadow: 0 0 29px rgba(139, 92, 246, 0.6);
                    }
                  }

                  @keyframes border-flicker {
                    0% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.1), 0 0 5px rgba(139, 92, 246, 0.1), 0 0 10px rgba(139, 92, 246, 0.1);
                    }
                    2% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.5);
                    }
                    4% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.1), 0 0 5px rgba(139, 92, 246, 0.1), 0 0 10px rgba(139, 92, 246, 0.1);
                    }
                    8% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.6), 0 0 5px rgba(139, 92, 246, 0.6), 0 0 10px rgba(139, 92, 246, 0.6);
                    }
                    70% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.2), 0 0 5px rgba(139, 92, 246, 0.2), 0 0 10px rgba(139, 92, 246, 0.2);
                    }
                    100% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.3), 0 0 5px rgba(139, 92, 246, 0.3), 0 0 10px rgba(139, 92, 246, 0.3);
                    }
                  }

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

                  .cyber-glitch-btn::before {
                    filter: blur(5px);
                  }

                  .cyber-glitch-btn:hover {
                    background: linear-gradient(45deg, rgba(20, 18, 35, 0.8), rgba(40, 38, 70, 0.8));
                    animation: border-flicker 0.5s linear infinite, text-flicker 0.5s linear infinite;
                  }

                  .cyber-glitch-btn:hover::before {
                    opacity: 0.4;
                  }

                  .cyber-glitch-btn:hover::after {
                    opacity: 1;
                    animation: glitch 2s linear infinite;
                  }
                  
                  /* Add scan lines for cyberpunk effect */
                  .cyber-glitch-btn::after {
                    background: repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent 2px,
                      rgba(139, 92, 246, 0.1) 3px,
                      rgba(139, 92, 246, 0.1) 4px
                    );
                    opacity: 0.2;
                  }

                  /* Every 4 seconds, make the button shake for a moment */
                  @keyframes glitch-periodic {
                    0%, 95%, 100% {
                      transform: translate(0);
                    }
                    96% {
                      transform: translate(-5px, 0);
                    }
                    97% {
                      transform: translate(5px, 0);
                    }
                    98% {
                      transform: translate(-3px, 0);
                    }
                    99% {
                      transform: translate(3px, 0);
                    }
                  }

                  .cyber-glitch-btn {
                    animation: glitch-periodic 4s infinite, border-flicker 2s infinite;
                  }

                  /* Styles for the featured card */
                  .cyber-card {
                    background: linear-gradient(45deg, rgba(15, 14, 26, 0.8), rgba(30, 28, 52, 0.8));
                    border: 1px solid rgba(139, 92, 246, 0.4) !important;
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.2);
                    animation: border-flicker-card 4s linear infinite, glitch-periodic 6s infinite;
                    position: relative;
                    z-index: 1;
                  }

                  .cyber-card::before,
                  .cyber-card::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: -1;
                    pointer-events: none;
                  }

                  .cyber-card::before {
                    background: linear-gradient(45deg, 
                      rgba(139, 92, 246, 0.4), 
                      rgba(192, 38, 211, 0.4), 
                      rgba(236, 72, 153, 0.4));
                    filter: blur(5px);
                    opacity: 0.2;
                  }

                  .cyber-card::after {
                    background: repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent 2px,
                      rgba(139, 92, 246, 0.1) 3px,
                      rgba(139, 92, 246, 0.1) 4px
                    );
                    opacity: 0.3;
                  }

                  .cyber-card:hover {
                    animation: border-flicker-card 0.5s linear infinite, card-shake 0.3s infinite;
                    transform: translateY(-2px);
                    transition: transform 0.3s ease;
                  }

                  .cyber-card:hover::before {
                    opacity: 0.4;
                  }

                  /* Enhanced shake effect specifically for the card */
                  @keyframes card-shake {
                    0% {
                      transform: translate(0);
                    }
                    20% {
                      transform: translate(-4.5px, 2.5px);
                    }
                    40% {
                      transform: translate(-2.5px, -2.5px);
                    }
                    60% {
                      transform: translate(4.5px, 2.5px);
                    }
                    80% {
                      transform: translate(2.5px, -4.5px);
                    }
                    100% {
                      transform: translate(0);
                    }
                  }

                  @keyframes border-flicker-card {
                    0% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.1), 0 0 5px rgba(139, 92, 246, 0.1), 0 0 10px rgba(139, 92, 246, 0.1);
                    }
                    2% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.5);
                    }
                    4% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.1), 0 0 5px rgba(139, 92, 246, 0.1), 0 0 10px rgba(139, 92, 246, 0.1);
                    }
                    8% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.6), 0 0 5px rgba(139, 92, 246, 0.6), 0 0 10px rgba(139, 92, 246, 0.6);
                    }
                    70% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.2), 0 0 5px rgba(139, 92, 246, 0.2), 0 0 10px rgba(139, 92, 246, 0.2);
                    }
                    100% {
                      box-shadow: 0 0 2px rgba(139, 92, 246, 0.3), 0 0 5px rgba(139, 92, 246, 0.3), 0 0 10px rgba(139, 92, 246, 0.3);
                    }
                  }

                  .cyber-text {
                    font-family: 'Orbitron', 'Rajdhani', 'Courier New', monospace;
                    text-shadow: 0 0 5px rgba(139, 92, 246, 0.8);
                    animation: text-flicker-card 3s linear infinite;
                  }

                  @keyframes text-flicker-card {
                    0% {
                      opacity: 0.8;
                      text-shadow: 0 0 5px rgba(139, 92, 246, 0.8);
                    }
                    2% {
                      opacity: 1;
                      text-shadow: 0 0 8px rgba(139, 92, 246, 1);
                    }
                    8% {
                      opacity: 0.9;
                      text-shadow: 0 0 5px rgba(139, 92, 246, 0.8);
                    }
                    70% {
                      opacity: 1;
                      text-shadow: 0 0 10px rgba(139, 92, 246, 1);
                    }
                    100% {
                      opacity: 0.9;
                      text-shadow: 0 0 5px rgba(139, 92, 246, 0.8);
                    }
                  }

                  .featured-badge {
                    background: linear-gradient(90deg, #a855f7, #ec4899);
                    color: white;
                    border-radius: 4px;
                    font-weight: bold;
                    animation: badge-flicker 2s linear infinite;
                  }

                  @keyframes badge-flicker {
                    0%, 100% {
                      opacity: 1;
                    }
                    50% {
                      opacity: 0.7;
                    }
                  }

                  .cyber-progress-bar {
                    background: linear-gradient(90deg, #a855f7, #ec4899);
                    position: relative;
                    overflow: hidden;
                  }

                  .cyber-progress-bar::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, 
                      transparent 0%, 
                      rgba(255, 255, 255, 0.4) 50%, 
                      transparent 100%);
                    animation: progress-shine 2s infinite linear;
                  }

                  @keyframes progress-shine {
                    0% {
                      transform: translateX(-100%);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }
                `}</style>
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
                    {filteredPresales.map((presale, index) => (
                      <Card 
                        key={presale.id} 
                        className={`backdrop-blur-sm text-white cursor-pointer rounded-xl p-4 ${
                          index === 0 
                            ? "cyber-card relative border-0 overflow-hidden" 
                            : "bg-gray-900/50 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                        }`}
                        onClick={() => handleCardClick(presale.mint_address)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            index === 0 
                              ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                              : "bg-gradient-to-r from-purple-600 to-pink-600"
                          }`}>
                            {presale?.imageURI ? (
                              <img 
                                src={presale.imageURI} 
                                alt={presale.name || "Token image"} 
                                className="w-full h-full object-cover rounded-lg" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : (
                              <div className="text-white text-2xl">🧩</div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${index === 0 ? "cyber-text text-xl" : ""}`}>${presale.symbol}</span>
                              <span className="text-sm text-gray-300">{presale.name}</span>
                              {index === 0 && (
                                <span className="featured-badge ml-2 px-2 py-0.5 text-xs uppercase">Trending</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300">Total Supply: {presale.total_supply.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${
                              index === 0 
                                ? "cyber-progress-bar" 
                                : "bg-gradient-to-r from-purple-600 to-pink-600"
                            }`} style={{ width: `${presale.presale_percentage}%` }}></div>
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