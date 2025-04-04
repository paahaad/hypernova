"use client"

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from '@solana/wallet-adapter-react';
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface HowToBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToBridgeModal({ isOpen, onClose }: HowToBridgeModalProps) {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString() || '';

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Address copied to clipboard");
    }
  };

  const handleBridgeRedirect = () => {
    window.open("https://bridge.sonic.game", "_blank");
  };

  const handleExplorerRedirect = () => {
    window.open("https://explorer.sonic.game", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-black/80 backdrop-blur-xl border border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-gray-200 text-2xl font-bold mb-4">How to Bridge</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <h3 className="text-lg font-medium text-gray-300 mb-3">Your Connected Address</h3>
            <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-md">
              <code className="text-sm text-gray-300 flex-1 overflow-hidden text-ellipsis">
                {walletAddress || 'No wallet connected'}
              </code>
              {walletAddress && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopyAddress} 
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Copy size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {/* <h3 className="text-lg font-medium text-gray-300">Instructions</h3> */}
            <p className="text-gray-400">
              Use this address as the Destination Address in the Sonic Bridge
            </p>
          </div>
          
          <Button 
            onClick={handleBridgeRedirect} 
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
          >
            Go to Sonic Bridge <ExternalLink size={16} className="ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 