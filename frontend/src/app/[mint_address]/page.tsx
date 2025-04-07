'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

interface TokenDetailsProps {
  params: {
    mint_address: string;
  }
}

interface PresaleData {
  name: string;
  symbol: string;
  uri: string;
  total_supply: number;
  token_price: number;
  min_purchase: number;
  max_purchase: number;
  presale_percentage: number;
  end_time: string;
  user_address: string;
  mint_address: string;
  presale_address: string;
}

export default function TokenDetailsPage({ params }: TokenDetailsProps) {
  const [selectedAmount, setSelectedAmount] = useState('0.1');
  const [presaleData, setPresaleData] = useState<PresaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenAmount, setTokenAmount] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { publicKey, sendTransaction, connected } = useWallet();

  useEffect(() => {
    const fetchPresaleData = async () => {
      try {
        const response = await fetch(`/api/presale/${params.mint_address}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch presale data');
        }

        setPresaleData(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch presale data');
      } finally {
        setLoading(false);
      }
    };

    fetchPresaleData();
  }, [params.mint_address]);

  useEffect(() => {
    const calculateTokenAmount = async () => {
      if (!presaleData || !selectedAmount) return;

      try {
        const response = await fetch(`/api/presale/${params.mint_address}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ solAmount: parseFloat(selectedAmount) }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to calculate token amount');
        }

        setTokenAmount(data.data.tokenAmount);
      } catch (err: any) {
        console.error('Error calculating token amount:', err);
        toast.error(err.message || 'Failed to calculate token amount');
        setTokenAmount(null);
      }
    };

    calculateTokenAmount();
  }, [selectedAmount, presaleData, params.mint_address]);

  const handlePurchase = async () => {
    if (!presaleData || !selectedAmount) return;
  
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }
    
    setIsPurchasing(true);
    try {
      const response = await fetch('/api/presale/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAddress: params.mint_address,
          amount: parseFloat(selectedAmount),
          userAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process purchase');
      }

      const tx = data.tx;
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      const signature = await sendTransaction(txData, connection);

      toast.success('Purchase successful');
      console.log('Purchase successful:', signature);
    } catch (err: any) {
      toast.error(err.message || 'Failed to process purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen p-8">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
          {/* Retro grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Token Header - Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>

          {/* Progress Bar - Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Buy Card - Skeleton */}
          <Card className="mb-8 bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-10" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Description - Skeleton */}
          <Card className="mb-8 bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>

          {/* Allocation - Skeleton */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-64 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!presaleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Failed to load presale data</div>
      </div>
    );
  }

  const amounts = ['0.1', '0.5', '1', '5'];
  const presaleProgress = (presaleData.presale_percentage / 100) * 100;

  return (
    <div className="relative min-h-screen p-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
        {/* Retro grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Token Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">{presaleData.name}</h1>
            <Badge variant="outline" className="text-gray-400">by {presaleData.user_address.slice(0, 6)}</Badge>
            <span className="text-gray-400">1 hour ago</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">${presaleData.symbol}</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => {
                navigator.clipboard.writeText(presaleData.mint_address);
                toast.success('Address copied to clipboard');
              }}
            >
              <span className="text-xs">{presaleData.mint_address.slice(0, 6)}...{presaleData.mint_address.slice(-4)}</span>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500" 
              style={{ width: `${presaleProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-400">{presaleProgress.toFixed(1)}% filled</span>
            <span className="text-gray-400">{presaleData.presale_percentage} SOL</span>
          </div>
        </div>

        {/* Buy Card */}
        <Card className="mb-8 bg-gray-900/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {amounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className={`w-full ${selectedAmount === amount ? 'bg-gray-700' : 'bg-gray-800/50'}`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  {amount} SOL
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">You pay</span>
              <span className="text-xl font-semibold">{selectedAmount}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400">You receive</span>
              <span className="text-xl font-semibold">
                {tokenAmount ? tokenAmount.toFixed(0) : 'Calculating...'}
              </span>
            </div>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={handlePurchase}
              disabled={isPurchasing || !connected}
            >
              {!connected 
                ? 'Connect Wallet to Buy' 
                : isPurchasing 
                  ? 'Processing...' 
                  : 'Buy'}
            </Button>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-8 bg-gray-900/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-400">
              {presaleData.uri ? 'Loading description...' : 'No description available'}
            </p>
          </CardContent>
        </Card>

        {/* Allocation */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Allocation at LP Creation</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Dev Allocation:</span>
                <span>{(100 - presaleData.presale_percentage).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">LP Allocation:</span>
                <span>20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Community Allocation:</span>
                <span>{(presaleData.presale_percentage - 20).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 