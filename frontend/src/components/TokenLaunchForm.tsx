'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

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
  const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
    totalSupply: '1000000000',
    tokenPrice: '0.00001',
    minPurchase: '0.01',
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
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Upload image to IPFS or similar and get URI
      const imageUri = "https://placeholder.com/image.jpg"; // Replace with actual image upload

      const response = await fetch('/api/presale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.ticker,
          uri: imageUri,
          description: formData.description,
          totalSupply: parseInt(formData.totalSupply),
          tokenPrice: parseFloat(formData.tokenPrice),
          minPurchase: parseFloat(formData.minPurchase),
          maxPurchase: parseFloat(formData.maxPurchase),
          presalePercentage: formData.presalePercentage,
          endTime: Math.floor(new Date(formData.endTime).getTime() / 1000),
          userAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create token');
      }

      const tx = data.tx;
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      
      // Sign and send transaction using wallet adapter
      const signature = await sendTransaction(txData, connection);
      console.log('signature', signature);

      toast.success('Token created successfully!');
      // Reset form or redirect
    } catch (error: any) {
      toast.error(error.message || 'Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            required
          />
        </div>

        {/* Ticker Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Ticker</label>
          <Input
            type="text"
            value={formData.ticker}
            onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            placeholder="$"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            rows={4}
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Image</label>
          <div className="bg-gray-800/50 border-2 border-gray-700 rounded-lg p-4">
            <Button
              type="button"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Upload Image
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              required
            />
          </div>
        </div>

        {/* Token Details */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Token Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Total Supply</label>
              <Input
                type="number"
                value={formData.totalSupply}
                onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700"
                required
              />
            </div>
            {/* <div>
              <label className="block text-sm text-gray-300 mb-2">Token Price (SOL)</label>
              <Input
                type="number"
                value={formData.tokenPrice}
                onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700"
                required
              />
            </div> */}
          </div>
        </Card>

        {/* Presale Configuration */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Presale Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Tokens for DEV / Presale Percentage</label>
              <div className="flex gap-4">
                {[50, 30, 0].map((percentage) => (
                  <Button
                    key={percentage}
                    type="button"
                    variant={formData.presalePercentage === percentage ? "default" : "outline"}
                    className={formData.presalePercentage === percentage ? "bg-orange-500" : "bg-orange-500/20"}
                    onClick={() => setFormData({ ...formData, presalePercentage: percentage })}
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>
{/* 
            <div>
              <label className="block text-sm text-gray-300 mb-2">Min Purchase (SOL)</label>
              <Input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700"
                required
              />
            </div> */}

            <div>
              <label className="block text-sm text-gray-300 mb-2">Max Purchase (SOL)</label>
              <Input
                type="number"
                value={formData.maxPurchase}
                onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">End Time</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700"
                required
              />
            </div>
          </div>
        </Card>

        {/* Launch Button */}
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
          disabled={isLoading || !connected}
        >
          {!connected 
            ? 'Connect Your Wallet to Continue'
            : isLoading 
              ? 'Creating Token...' 
              : 'Launch Token'
          }
        </Button>
      </form>
    </div>
  );
} 