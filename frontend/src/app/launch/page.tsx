'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TokenLaunchForm from "@/components/TokenLaunchForm";

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

export default function LaunchPage() {
  const [showLaunchForm, setShowLaunchForm] = useState(false);
  const [presales, setPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error('Error fetching presales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresales();
  }, []);

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

              {/* Featured Launches Section - Temporarily Commented Out
              <section className="w-full max-w-4xl mb-12">
                <h2 className="text-xl font-semibold mb-4 text-white">Featured Launches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800/50 transition-colors cursor-pointer rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <div className="text-white text-2xl">🧩</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">$BONIC</span>
                            <span className="text-sm text-gray-300">Bonic</span>
                          </div>
                          <p className="text-sm text-gray-300">The memecoin for Sonic x Bonk</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full w-[35%] bg-gradient-to-r from-purple-600 to-pink-600"></div>
                        </div>
                        <div className="flex justify-between text-sm mt-1 text-gray-300">
                          <span>35%</span>
                          <span>20/42 SOL</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
              */}

              {/* All Launches Section */}
              <section className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">All Launches</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Raised Amount</span>
                    <span className="text-sm text-gray-300">↓</span>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center text-gray-300">Loading launches...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presales.map((presale) => (
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
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 