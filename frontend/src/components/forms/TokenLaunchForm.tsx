'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { HypernovaApi } from '@/lib/api-client';
import { Upload, ImageIcon } from 'lucide-react';

// CylinderSlider component for 3D slider controls
interface CylinderSliderProps {
  values: number[];
  currentValue: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  color: string;
}

function CylinderSlider({ values, currentValue, onChange, label, unit = '', color }: CylinderSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate the closest value based on the drag position
  const handleChange = useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    // Invert the calculation for vertical orientation (bottom = 0, top = max)
    const position = 1 - ((clientY - rect.top) / rect.height);
    const index = Math.min(
      Math.max(Math.round(position * (values.length - 1)), 0),
      values.length - 1
    );
    
    onChange(values[index]);
  }, [onChange, values]);

  // Event handlers for mouse and touch interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleChange(e.clientY);
  }, [handleChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleChange(e.clientY);
    }
  }, [isDragging, handleChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Find the current index
  const currentIndex = values.indexOf(currentValue);
  const fillPercentage = currentIndex / (values.length - 1) * 100;
  
  // Get the three main break values - first, middle, and last
  const breakValues = [
    values[0],                                      // Min value
    values[Math.floor((values.length - 1) / 2)],    // Middle value
    values[values.length - 1]                       // Max value
  ];

  return (
    <div className="flex flex-col items-center h-full pt-10 pb-8 px-4">
      <label className="block text-sm text-gray-300 mb-4 text-center">{label}</label>
      
      {/* Glass container with proper spacing */}
      <div className="relative flex justify-center h-full w-full">
        <div 
          ref={sliderRef}
          className="relative w-20 h-[160px] cursor-pointer"
          style={{ perspective: '800px' }}
          onMouseDown={handleMouseDown}
        >
          {/* Glass container - outer */}
          <div 
            className="absolute inset-0 rounded-b-2xl rounded-t-xl bg-transparent shadow-lg"
            style={{ 
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 0 10px rgba(255,255,255,0.05)'
            }}
          >
            {/* Glass texture effects */}
            <div 
              className="absolute inset-[1px] rounded-b-2xl rounded-t-xl overflow-hidden"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                backdropFilter: 'blur(5px)'
              }}
            >
              {/* Rim highlight */}
              <div 
                className="absolute inset-x-0 top-0 h-1 bg-white opacity-30 rounded-t-xl"
              ></div>
              
              {/* Side highlights */}
              <div 
                className="absolute left-0 inset-y-0 w-[1px] bg-white opacity-20"
              ></div>
              <div 
                className="absolute right-0 inset-y-0 w-[1px] bg-white opacity-10"
              ></div>
              
              {/* Empty glass texture */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%), linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.02) 100%)'
                }}
              ></div>
              
              {/* Liquid fill with juice appearance */}
              <div 
                className="absolute bottom-0 w-full transition-all duration-300 ease-out"
                style={{
                  height: `${fillPercentage}%`,
                  background: `linear-gradient(to top, ${color}, ${color}dd)`,
                  boxShadow: 'inset 0 5px 15px rgba(255,255,255,0.3)'
                }}
              >
                {/* Liquid surface highlight */}
                <div 
                  className="absolute inset-x-0 top-0 h-1 bg-white opacity-40"
                  style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                ></div>
                
                {/* Bubbles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-70" 
                       style={{ left: '20%', bottom: '10%', animation: 'bubble 4s infinite ease-in' }}></div>
                  <div className="bubble-md absolute w-2 h-2 rounded-full bg-white opacity-50" 
                       style={{ left: '60%', bottom: '30%', animation: 'bubble 6s infinite ease-in 1s' }}></div>
                  <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-60" 
                       style={{ left: '40%', bottom: '50%', animation: 'bubble 5s infinite ease-in 2s' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current value indicator with glass effect */}
          <div 
            className="absolute right-full pr-3 text-sm font-medium text-white transition-all duration-300"
            style={{ 
              top: `${100 - fillPercentage}%`, 
              transform: 'translateY(-50%)'
            }}
          >
            <div 
              className="px-2 py-1 rounded-md backdrop-blur-sm bg-gray-800/80"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {currentValue}{unit}
            </div>
          </div>
          
          {/* Measurement bar with dashes on the right */}
          <div className="absolute left-full h-full pl-1.5">
            {/* Vertical measuring line */}
            <div className="absolute h-full w-[1px] bg-gray-700"></div>
            
            {/* Tick marks for all values */}
            {values.map((value, index) => {
              const position = 100 - (index / (values.length - 1) * 100);
              const isBreakValue = breakValues.includes(value);
              const isActive = value <= currentValue;
              
              return (
                <div 
                  key={index} 
                  className="absolute flex items-center cursor-pointer"
                  style={{ top: `${position}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value);
                  }}
                >
                  {/* Tick mark - longer for break values, shorter for others */}
                  <div 
                    className={`h-[1px] ${isBreakValue ? 'w-5' : 'w-2'} ${isActive ? 'bg-gray-300' : 'bg-gray-500'}`}
                  ></div>
                  
                  {/* Only show labels for the 3 break values */}
                  {isBreakValue && (
                    <span className={`ml-1.5 text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {value}{unit}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormData {
  name: string;
  ticker: string;
  description: string;
  image: File | null;
  totalSupply: string;
  tokenPrice: string;
  minPurchase: string;
  maxPurchase: string;
  presaleAmount: number;
  presalePercentage: number;
  endTime: string;
}

// Add animation keyframes to the component
const GlobalStyles = () => {
  return (
    <style jsx global>{`
      @keyframes bubble {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
      }
    `}</style>
  );
};

export default function TokenLaunchForm() {
  const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [finalUri, setFinalUri] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
    totalSupply: '1000000000',
    tokenPrice: '0.00001',
    presaleAmount: 42,
    minPurchase: '0.01',
    maxPurchase: '',
    presalePercentage: 50,
    endTime: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, image: file });
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  }, [formData]);

  const uploadToPinata = async (file: File) => {
    try {
      const data = new FormData();
      data.set('file', file);
      
      const uploadResponse = await fetch('/api/pinata/upload', {
        method: 'POST',
        body: data,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to Pinata');
      }
      
      const uploadResult = await uploadResponse.json();
      return uploadResult.url;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  };

  const uploadMetadataToPinata = async (metadata: object) => {
    try {
      const response = await fetch('/api/pinata/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload metadata to Pinata');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.image) {
      toast.error('Please upload an image');
      return;
    }

    setIsLoading(true);
    try {
      // Upload image to Pinata
      const imageUrl = await uploadToPinata(formData.image);
      
      // Create metadata object
      const metadata = {
        name: formData.name,
        symbol: formData.ticker,
        description: formData.description,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Total Supply",
            value: formData.totalSupply
          }
        ]
      };
      
      // Upload metadata to Pinata
      const metadataUrl = await uploadMetadataToPinata(metadata);
      
      // Save the metadata URL
      setFinalUri(metadataUrl);

      // First create token
      const token = await HypernovaApi.tokens.create({
        mint_address: publicKey.toString(), // This is temporary, will be updated with the actual mint
        symbol: formData.ticker,
        name: formData.name,
        decimals: 9, // Default for Solana SPL tokens
        logo_uri: imageUrl
      });

      // Now create presale using the token
      const response = await fetch('/api/presale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.ticker,
          uri: metadataUrl,
          description: formData.description,
          totalSupply: parseInt(formData.totalSupply),
          presaleAmount: formData.presaleAmount * 1e9,
          // Initial token price: amount as u64 / (total_supply * presale_percentage as u64 / 100);
          tokenPrice: (formData.presaleAmount) / (parseInt(formData.totalSupply) * formData.presalePercentage / 100),
          minPurchase: parseFloat(formData.minPurchase),
          maxPurchase: parseFloat(formData.maxPurchase),
          presalePercentage: 100 - formData.presalePercentage - 20,
          endTime: Math.floor(new Date(formData.endTime).getTime() / 1000),
          userAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create token');
      }

      // Get the token ID from created token response
      console.log('Created token:', token);
      
      // Extract the token ID - assuming token contains the ID as a string or has an id property
      const tokenId = typeof token === 'string' ? token : (token as any).id;
      
      // Create presale in database 
      await HypernovaApi.presales.create({
        token_id: tokenId,
        presale_address: data.presaleAddress || 'pending_address',
        total_raised: 0,
        target_amount: formData.presaleAmount,
        start_time: new Date().toISOString(),
        end_time: formData.endTime,
        status: 'active'
      });

      const tx = data.tx;
      const txData = Transaction.from(Buffer.from(tx, 'base64'));
      
      // Sign and send transaction using wallet adapter
      const signature = await sendTransaction(txData, connection);
      console.log('signature', signature);

      toast.success('Token created successfully!');
      // Reset form or redirect
    } catch (error: any) {
      console.error('Error creating token:', error);
      toast.error(error.message || 'Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <GlobalStyles />
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
          <div 
            className={`bg-gray-800/50 border-2 ${isDragging ? 'border-green-500 border-dashed' : 'border-gray-700'} rounded-lg p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] cursor-pointer`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {imagePreview ? (
              <div className="w-full flex flex-col items-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 max-w-full object-contain rounded-lg mb-4" 
                />
                <p className="text-sm text-gray-400">Click or drag to change image</p>
              </div>
            ) : (
              <>
                <Upload className="h-16 w-16 text-gray-500 mb-4" />
                <p className="text-gray-300 font-medium mb-2">Drag and drop your token image here</p>
                <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                <Button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Select Image
                </Button>
              </>
            )}
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
                className="w-full bg-gray-800/50 border-gray-700 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="0"
                required
              />
            </div>
          </div>
        </Card>

        {/* Presale Configuration */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-6">Presale Configuration</h3>
          
          {/* Two column layout for vertical sliders with increased height */}
          <div className="grid grid-cols-2 gap-8 h-[280px] mb-6">
            {/* DEV Allocation Slider */}
            <CylinderSlider
              label="DEV Allocation"
              values={[0, 10, 20, 30, 40, 50]}
              currentValue={formData.presalePercentage}
              onChange={(value) => setFormData({ ...formData, presalePercentage: value })}
              unit="%"
              color="#f97316" // orange-500
            />
            
            {/* Presale Target Amount Slider */}
            <CylinderSlider
              label="Presale Target Amount"
              values={[42, 52, 62, 72, 82, 92, 102, 112, 122, 132, 142, 152, 162, 172, 182, 192, 202, 212, 222, 232, 242, 252, 262, 272, 282, 292, 302, 312, 322, 332, 342, 352, 362, 372, 382, 392, 402, 410, 420]}
              currentValue={formData.presaleAmount}
              onChange={(value) => setFormData({ ...formData, presaleAmount: value })}
              unit=" sol"
              color="#8b5cf6" // purple-500
            />
          </div>
          
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Max Purchase (SOL)</label>
              <Input
                type="number"
                value={formData.maxPurchase}
                onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="0"
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