'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface FormData {
  name: string;
  ticker: string;
  description: string;
  image: File | null;
}

export default function TokenLaunchForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
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
            />
          </div>
        </div>

        {/* Tokens for Dev */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Tokens for Dev</label>
          <div className="flex gap-4">
            <div className="bg-orange-500/20 px-4 py-2 rounded-lg">50%</div>
            <div className="bg-orange-500/20 px-4 py-2 rounded-lg">30%</div>
            <div className="bg-orange-500/20 px-4 py-2 rounded-lg">0%</div>
          </div>
        </div>

        {/* Pre-Liquidity Pool Config */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Pre-Liquidity Pool Config</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Amount of LP to raise</label>
              <div className="flex gap-4">
                <Button variant="outline" className="bg-orange-500/20">42 SOL</Button>
                <Button variant="outline" className="bg-orange-500/20">111 SOL</Button>
                <Button variant="outline" className="bg-orange-500/20">420 SOL</Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-4">
                This amount will be locked forever in the liquidity pool against 20% of the tokens, once raised.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Max per wallet</label>
              <Button variant="outline" className="bg-red-500/20">10 SOL</Button>
            </div>
          </div>
        </Card>

        {/* Launch Button */}
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
        >
          Launch Token
        </Button>
      </form>
    </div>
  );
} 