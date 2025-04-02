'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';

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
      const response = await fetch('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenMintA: formData.tokenMintA,
          tokenMintB: formData.tokenMintB,
          userAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();

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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tokenMintA" className="block text-sm font-medium mb-1">
            Token Mint A
          </label>
          <Input
            id="tokenMintA"
            value={formData.tokenMintA}
            onChange={(e) => setFormData({ ...formData, tokenMintA: e.target.value })}
            placeholder="Enter token mint address"
            required
          />
        </div>
        <div>
          <label htmlFor="tokenMintB" className="block text-sm font-medium mb-1">
            Token Mint B
          </label>
          <Input
            id="tokenMintB"
            value={formData.tokenMintB}
            onChange={(e) => setFormData({ ...formData, tokenMintB: e.target.value })}
            placeholder="Enter token mint address"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Pool...' : 'Create Pool'}
        </Button>
      </form>
    </Card>
  );
} 