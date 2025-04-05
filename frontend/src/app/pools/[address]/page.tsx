'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from '@solana/wallet-adapter-react';
import { wallet } from '@/lib/orca';

interface PoolDetails {
  whirlpool_address: string;
  token_mint_a: string;
  token_mint_b: string;
  created_at: string;
  token_a_symbol?: string;
  token_b_symbol?: string;
  token_a_balance?: number;
  token_b_balance?: number;
}

export default function PoolDetailsPage() {
  const params = useParams();
  const [pool, setPool] = useState<PoolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const [lowerPrice, setLowerPrice] = useState('');
  const [upperPrice, setUpperPrice] = useState('');

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
    if (!pool || !tokenAAmount || !tokenBAmount || !lowerPrice || !upperPrice) return;
    
    if (!connected || !publicKey) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const response = await fetch('/api/pools/add-liquidity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poolAddress: pool.whirlpool_address,
          userAddress: publicKey.toString(),
          tokenAAmount: parseFloat(tokenAAmount),
          tokenBAmount: parseFloat(tokenBAmount),
          priceLower: parseFloat(lowerPrice),
          priceUpper: parseFloat(upperPrice),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Handle success (e.g., show notification, redirect)
        console.log('Liquidity added successfully');
      }
    } catch (error) {
      console.error('Error adding liquidity:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading pool details...</div>
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

        <div className="max-w-4xl mx-auto relative z-10">
          <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white p-6 rounded-xl">
            <h1 className="text-2xl font-bold mb-6">Add Liquidity to Pool</h1>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300">Token A Amount</Label>
                  <Input
                    type="number"
                    value={tokenAAmount}
                    onChange={(e) => setTokenAAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-2"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Token B Amount</Label>
                  <Input
                    type="number"
                    value={tokenBAmount}
                    onChange={(e) => setTokenBAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-2"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300">Lower Price Limit</Label>
                  <Input
                    type="number"
                    value={lowerPrice}
                    onChange={(e) => setLowerPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-2"
                    placeholder="Enter lower price"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Upper Price Limit</Label>
                  <Input
                    type="number"
                    value={upperPrice}
                    onChange={(e) => setUpperPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-2"
                    placeholder="Enter upper price"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Pool Address</Label>
                  <p className="text-sm break-all mt-1">{pool.whirlpool_address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Token A</Label>
                    <p className="text-sm break-all mt-1">{pool.token_mint_a}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Token B</Label>
                    <p className="text-sm break-all mt-1">{pool.token_mint_b}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddLiquidity}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                disabled={!tokenAAmount || !tokenBAmount || !lowerPrice || !upperPrice || !connected}
              >
                {!connected 
                 ? 'Connect Wallet to Add Liquidity' 
                 : 'Add Liquidity'
                }
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 