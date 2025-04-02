'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSolanaWallets } from '@privy-io/react-auth';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { toast } from 'sonner';
import { Settings, ArrowDown, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { TokenSelectionModal } from '@/components/TokenSelectionModal';
import { TOKEN_LIST, TokenInfo } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TradingViewWidget } from '@/components/TradingViewWidget';
import { SettingsModal } from '@/components/SettingsModal';

interface SwapState {
  inputAmount: string;
  outputAmount: string;
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
  slippage: number;
}

export default function SwapPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useSolanaWallets();
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [chartTimeframe, setChartTimeframe] = useState('1D');
  const [swapState, setSwapState] = useState<SwapState>({
    inputAmount: '',
    outputAmount: '',
    inputToken: TOKEN_LIST[0], // SOL
    outputToken: TOKEN_LIST[1], // SONIC
    slippage: 0.5,
  });

  const handleSwap = async () => {
    if (!wallets || !wallets.length) {
      toast.error('Please connect your wallet');
      return;
    }

    const wallet = wallets[0];
    if (!wallet) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!swapState.inputAmount || !swapState.outputAmount || !swapState.inputToken || !swapState.outputToken) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/pools/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whirlpoolAddress: swapState.inputToken.address,
          inputTokenAmount: parseFloat(swapState.inputAmount),
          aToB: true,
          amountSpecifiedIsInput: true,
          minOutputAmount: parseFloat(swapState.outputAmount) * (1 - swapState.slippage / 100),
          userAddress: wallet.address,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process swap');
      }

      const txData = Transaction.from(Buffer.from(data.tx, 'base64'));
      const signature = await wallet.sendTransaction(txData, connection);

      toast.success('Swap successful');
      console.log('Swap successful:', signature);
    } catch (err: any) {
      toast.error(err.message || 'Failed to process swap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSwapState(prev => ({
      ...prev,
      inputAmount: value,
      // In a real implementation, we would calculate the output amount based on the pool price
      outputAmount: value ? (parseFloat(value) * 0.99).toString() : '', // Dummy calculation with 1% fee
    }));
  };

  const handleTokenSwitch = () => {
    setSwapState(prev => ({
      ...prev,
      inputToken: prev.outputToken,
      outputToken: prev.inputToken,
      inputAmount: prev.outputAmount,
      outputAmount: prev.inputAmount,
    }));
  };

  // Helper function to get TradingView symbol
  const getTradingViewSymbol = (inputToken?: TokenInfo | null, outputToken?: TokenInfo | null) => {
    if (!inputToken || !outputToken) return "SOLUSDC";
    
    // Map token addresses to their TradingView symbols
    const symbolMap: { [key: string]: string } = {
      "So11111111111111111111111111111111111111112": "SOL",
      "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES": "SONIC",
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC"
    };

    const input = symbolMap[inputToken.address] || inputToken.symbol;
    const output = symbolMap[outputToken.address] || outputToken.symbol;

    return `${input}${output}`;
  };

  return (
    <div className="relative min-h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="relative z-10 container mx-auto p-8">
        <div className="flex justify-center">
          <div className={`flex gap-8 ${showChart ? 'w-full' : 'w-[420px]'}`}>
            {/* Chart Section */}
            {showChart && (
              <div className="flex-1 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {swapState.inputToken?.symbol && swapState.outputToken?.symbol 
                      ? `${swapState.inputToken.symbol}/${swapState.outputToken.symbol}`
                      : "Select tokens"}
                  </h2>
                  <div className="flex gap-2">
                    {['1H', '1D', '1W', '1M'].map((timeframe) => (
                      <Button
                        key={timeframe}
                        variant={chartTimeframe === timeframe ? "default" : "ghost"}
                        size="sm"
                        className={`h-7 ${chartTimeframe === timeframe ? 'bg-orange-500' : 'hover:bg-gray-800'}`}
                        onClick={() => setChartTimeframe(timeframe)}
                      >
                        {timeframe}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <TradingViewWidget
                    key={`${swapState.inputToken?.address}-${swapState.outputToken?.address}`}
                    inputToken={swapState.inputToken?.address}
                    outputToken={swapState.outputToken?.address}
                  />
                </div>
              </div>
            )}

            {/* Swap Interface */}
            <div className="w-[420px]">
              <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">Swap</h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowChart(!showChart)}
                        className={`h-8 px-2 ${showChart ? 'text-orange-500' : 'text-gray-400'} hover:text-white`}
                      >
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-gray-800/50"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Input Token */}
                  <div className="space-y-4 mb-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-300">You Pay</Label>
                      <span className="text-sm text-gray-400">
                        Balance: 0.00
                      </span>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Input
                          type="text"
                          value={swapState.inputAmount}
                          onChange={(e) => handleInputChange(e.target.value)}
                          className="bg-transparent border-none text-2xl focus-visible:ring-0 p-0 h-12 flex-1"
                          placeholder="0.0"
                        />
                        <Button
                          variant="ghost"
                          className="h-12 bg-gray-700/50 hover:bg-gray-600/50 flex-shrink-0"
                          onClick={() => setIsInputModalOpen(true)}
                        >
                          {swapState.inputToken ? (
                            <div className="flex items-center">
                              <img
                                src={swapState.inputToken.logoURI}
                                alt={swapState.inputToken.symbol}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <span>{swapState.inputToken.symbol}</span>
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex items-center">
                              Select token
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </div>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 bg-gray-700/30 hover:bg-gray-600/30"
                          onClick={() => handleInputChange("100")} // Replace with actual balance
                        >
                          MAX
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 bg-gray-700/30 hover:bg-gray-600/30"
                          onClick={() => handleInputChange("50")} // Replace with 50% of balance
                        >
                          50%
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 bg-gray-700/30 hover:bg-gray-600/30"
                          onClick={() => handleInputChange("25")} // Replace with 25% of balance
                        >
                          25%
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Switch Button */}
                  <div className="flex justify-center my-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleTokenSwitch}
                      className="rounded-full bg-gray-800/50 hover:bg-gray-700/50"
                    >
                      <ArrowDown className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Output Token */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <Label className="text-gray-300">You Receive</Label>
                      <span className="text-sm text-gray-400">
                        Balance: 0.00
                      </span>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Input
                          type="text"
                          value={swapState.outputAmount}
                          className="bg-transparent border-none text-2xl focus-visible:ring-0 p-0 h-12 flex-1"
                          placeholder="0.0"
                          readOnly
                        />
                        <Button
                          variant="ghost"
                          className="h-12 bg-gray-700/50 hover:bg-gray-600/50 flex-shrink-0"
                          onClick={() => setIsOutputModalOpen(true)}
                        >
                          {swapState.outputToken ? (
                            <div className="flex items-center">
                              <img
                                src={swapState.outputToken.logoURI}
                                alt={swapState.outputToken.symbol}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <span>{swapState.outputToken.symbol}</span>
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex items-center">
                              Select token
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Swap Details */}
                  {swapState.inputAmount && swapState.outputAmount && (
                    <div className="space-y-3 mb-6 bg-gray-800/30 p-4 rounded-xl">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price Impact</span>
                        <span>{'< 0.01%'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Network Fee</span>
                        <span>~0.000005 SOL</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-14 text-lg font-semibold"
                    onClick={handleSwap}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Swap'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <TokenSelectionModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSelect={(token) => setSwapState(prev => ({ ...prev, inputToken: token }))}
        selectedToken={swapState.inputToken?.address}
      />

      <TokenSelectionModal
        isOpen={isOutputModalOpen}
        onClose={() => setIsOutputModalOpen(false)}
        onSelect={(token) => setSwapState(prev => ({ ...prev, outputToken: token }))}
        selectedToken={swapState.outputToken?.address}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        slippage={swapState.slippage}
        onSlippageChange={(value) => setSwapState(prev => ({ ...prev, slippage: value }))}
      />
    </div>
  );
} 