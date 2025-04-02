'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';

interface FormData {
  name: string;
  ticker: string;
  description: string;
  image: File | null;
  totalSupply: string;
  tokenPrice: string;
  minPurchase: string;
  maxPurchase: string;
  presalePercentage: number;
  endTime: string;
}

export default function TokenLaunchForm() {
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
    totalSupply: '',
    tokenPrice: '',
    minPurchase: '',
    maxPurchase: '',
    presalePercentage: 50,
    endTime: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });
      formDataToSend.append('userAddress', publicKey.toString());

      const response = await fetch('/api/presale', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create presale');
      }

      const tx = data.tx;
      if (!tx) {
        toast.message(data.message);
        return;
      }
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      
      const signature = await sendTransaction(txData, connection);
      console.log('signature', signature);

      toast.success('Presale created successfully!');
      // Reset form or redirect
    } catch (error: any) {
      console.log('error', error);
      toast.error(error.message || 'Failed to create presale');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Token Name
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter token name"
            required
          />
        </div>
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium mb-1">
            Token Ticker
          </label>
          <Input
            id="ticker"
            value={formData.ticker}
            onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
            placeholder="Enter token ticker"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter token description"
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Token Image
          </label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            required
          />
        </div>
        <div>
          <label htmlFor="totalSupply" className="block text-sm font-medium mb-1">
            Total Supply
          </label>
          <Input
            id="totalSupply"
            type="number"
            value={formData.totalSupply}
            onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
            placeholder="Enter total supply"
            required
          />
        </div>
        <div>
          <label htmlFor="tokenPrice" className="block text-sm font-medium mb-1">
            Token Price (SOL)
          </label>
          <Input
            id="tokenPrice"
            type="number"
            value={formData.tokenPrice}
            onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
            placeholder="Enter token price in SOL"
            required
          />
        </div>
        <div>
          <label htmlFor="minPurchase" className="block text-sm font-medium mb-1">
            Minimum Purchase (SOL)
          </label>
          <Input
            id="minPurchase"
            type="number"
            value={formData.minPurchase}
            onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
            placeholder="Enter minimum purchase amount"
            required
          />
        </div>
        <div>
          <label htmlFor="maxPurchase" className="block text-sm font-medium mb-1">
            Maximum Purchase (SOL)
          </label>
          <Input
            id="maxPurchase"
            type="number"
            value={formData.maxPurchase}
            onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value })}
            placeholder="Enter maximum purchase amount"
            required
          />
        </div>
        <div>
          <label htmlFor="presalePercentage" className="block text-sm font-medium mb-1">
            Presale Percentage
          </label>
          <Input
            id="presalePercentage"
            type="number"
            value={formData.presalePercentage}
            onChange={(e) => setFormData({ ...formData, presalePercentage: Number(e.target.value) })}
            placeholder="Enter presale percentage"
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End Time
          </label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Presale...' : 'Create Presale'}
        </Button>
      </form>
    </Card>
  );
} 