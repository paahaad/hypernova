'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import axios from 'axios';
import { themedToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface FormData {
  tokenMintA: string;
  tokenMintB: string;
}

type StatusState = 'idle' | 'creating' | 'signing' | 'complete' | 'error';

export default function PoolLaunchForm() {
  const router = useRouter();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>('idle');
  const [formData, setFormData] = useState<FormData>({
    tokenMintA: '',
    tokenMintB: '',
  });

  const getButtonText = () => {
    if (!publicKey) return 'Connect Your Wallet to Continue';
    
    switch (status) {
      case 'idle': return 'Create Pool';
      case 'creating': return 'Creating Pool...';
      case 'signing': return 'Waiting for Signature...';
      case 'complete': return 'Pool Created Successfully!';
      case 'error': return 'Retry Pool Creation';
      default: return 'Create Pool';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setStatus('creating');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pool`, {
        tokenMintA: formData.tokenMintA,
        tokenMintB: formData.tokenMintB,
        userAddress: publicKey.toString(),
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to create pool');
      }
      const tx = response.data.tx;
      if (!tx) {
        toast.message(response.data.message);
        return;
      }
      
      setStatus('signing');
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      const signature = await sendTransaction(txData, connection);
      console.log('signature', signature);
      // TODO: Store the pool data in the database
      setStatus('complete');
      themedToast.success('Pool created successfully!');
      
      // Navigate to pools page after successful creation
      setTimeout(() => {
        router.push('/pools');
      }, 1500);
    } catch (error: any) {
      console.log('error', error);
      setStatus('error');
      themedToast.error(error.message || 'Failed to create pool');
    } finally {
      if (status !== 'complete') {
        setIsLoading(false);
        setStatus('idle');
      }
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
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {getButtonText()}
        </Button>
      </form>
    </div>
  );
} 