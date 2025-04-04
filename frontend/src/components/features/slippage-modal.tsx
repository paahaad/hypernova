"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SlippageModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export function SlippageModal({ isOpen, onClose, slippage, onSlippageChange }: SlippageModalProps) {
  const [customSlippage, setCustomSlippage] = useState(slippage.toString());

  const handlePresetClick = (value: number) => {
    onSlippageChange(value);
    setCustomSlippage(value.toString());
  };

  const handleCustomChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onSlippageChange(numValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-black/80 backdrop-blur-xl border border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-gray-200 text-2xl font-bold mb-4">Transaction Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-3">Slippage Tolerance</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className={`h-12 text-lg border-gray-700 hover:bg-gray-800/50 ${
                  slippage === 0.5 ? "bg-gray-800/50 border-gray-600" : ""
                }`}
                onClick={() => handlePresetClick(0.5)}
              >
                0.5%
              </Button>
              <Button
                variant="outline"
                className={`h-12 text-lg border-gray-700 hover:bg-gray-800/50 ${
                  slippage === 1 ? "bg-gray-800/50 border-gray-600" : ""
                }`}
                onClick={() => handlePresetClick(1)}
              >
                1%
              </Button>
              <Button
                variant="outline"
                className={`h-12 text-lg border-gray-700 hover:bg-gray-800/50 ${
                  slippage === 2 ? "bg-gray-800/50 border-gray-600" : ""
                }`}
                onClick={() => handlePresetClick(2)}
              >
                2%
              </Button>
            </div>
          </div>
          <div>
            <div className="relative">
              <Input
                type="number"
                value={customSlippage}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="h-12 text-lg bg-gray-900/50 border-gray-700 text-gray-200 pl-10 placeholder:text-gray-500"
                placeholder="Custom"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 