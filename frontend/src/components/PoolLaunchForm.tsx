'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { HypernovaApi } from '@/lib/api-client';

interface FormData {
  tokenMintA: string;
  tokenMintB: string;
}

export default function PoolLaunchForm() {
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    tokenMintA: '',
    tokenMintB: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // Use our API client to create the pool
      const response = await HypernovaApi.pools.create({
        pool_address: 'pending', // Will be updated by the blockchain
        token_a_id: formData.tokenMintA,
        token_b_id: formData.tokenMintB,
        lp_mint: 'pending' // Will be updated by the blockchain
      });

      // For on-chain interaction, we still need to call the original API
      const onChainResponse = await fetch('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenMintA: formData.tokenMintA,
          tokenMintB: formData.tokenMintB,
          userAddress: publicKey.toString(),
          clientOrigin: 'ui' // Mark this as coming from the UI
        }),
      });

      const data = await onChainResponse.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create pool');
      }

      const tx = data.tx;
      if (!tx) {
        toast.message(data.message);
        return;
      }
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      
      const signature = await sendTransaction(txData, connection);
      console.log('signature', signature);

      // Update pool with actual blockchain data if needed
      if (data.whirlpoolAddress) {
        // Extract the pool ID
        const poolId = typeof response === 'string' ? response : (response as any).id;
        
        await HypernovaApi.pools.update(poolId, {
          pool_address: data.whirlpoolAddress,
          lp_mint: data.lpMint || 'pending'
        });
      }

      toast.success('Pool created successfully!');
      // Reset form or redirect
    } catch (error: any) {
      console.log('error', error);
      toast.error(error.message || 'Failed to create pool');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Mint A Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Token Mint A Address</label>
          <Input
            type="text"
            value={formData.tokenMintA}
            onChange={(e) => setFormData({ ...formData, tokenMintA: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            placeholder="Enter Solana token mint address"
            required
          />
        </div>

        {/* Token Mint B Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Token Mint B Address</label>
          <Input
            type="text"
            value={formData.tokenMintB}
            onChange={(e) => setFormData({ ...formData, tokenMintB: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            placeholder="Enter Solana token mint address"
            required
          />
        </div>

        {/* Pool Configuration Info */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Pool Configuration</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Fee Rate: 1%</p>
            <p>• Tick Spacing: 32896</p>
            <p>• Initial Liquidity: 0</p>
          </div>
        </Card>

        {/* Create Pool Button */}
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Pool...' : 'Create Pool'}
        </Button>
      </form>
    </div>
  );
} 