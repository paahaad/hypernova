'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PoolLaunchForm from "@/components/PoolLaunchForm";

interface Pool {
  whirlpool_address: string;
  token_mint_a: string;
  token_mint_b: string;
  created_at: string;
}

export default function PoolsPage() {
  const [showCreatePoolForm, setShowCreatePoolForm] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('/api/pools');
        const data = await response.json();
        if (data.success && data.pools) {
          setPools(data.pools);
        }
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Liquidity Pools</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">TVL</span>
                    <span className="text-sm text-gray-300">↓</span>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center text-gray-300">Loading pools...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pools.map((pool) => (
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
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
