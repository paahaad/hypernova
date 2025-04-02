'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export function SettingsModal({ isOpen, onClose, slippage, onSlippageChange }: SettingsModalProps) {
  const [customSlippage, setCustomSlippage] = useState('');

  const presetSlippages = [0.1, 0.5, 1.0];

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
      onSlippageChange(numValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Transaction Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Slippage Tolerance
            </label>
            <div className="flex gap-2 mb-2">
              {presetSlippages.map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? "default" : "outline"}
                  className={slippage === value ? "bg-orange-500" : "bg-gray-800"}
                  onClick={() => {
                    onSlippageChange(value);
                    setCustomSlippage('');
                  }}
                >
                  {value}%
                </Button>
              ))}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="Custom slippage"
                value={customSlippage}
                onChange={(e) => handleCustomSlippageChange(e.target.value)}
                className="bg-gray-800 border-gray-700 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                %
              </span>
            </div>
          </div>

          {parseFloat(customSlippage) > 3 && (
            <div className="text-yellow-500 text-sm">
              High slippage tolerance. Your transaction may be frontrun.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 