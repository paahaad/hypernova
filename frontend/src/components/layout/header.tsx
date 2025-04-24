"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon, ArrowUpRight, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { HowToBridgeModal } from "../features/how-to-bridge-modal";
import { connection } from "@/lib/anchor";
import { CustomWalletButton } from "../features/custom-wallet-button";
import { MobileWalletButton } from "../features/custom-wallet-button";
import { Connection, PublicKey } from "@solana/web3.js";
import { envRPC_URL, envMAINNET_RPC_URL, envTESTNET_RPC_URL, envNEXT_PUBLIC_USE_MAINNET } from "@/lib/env";
import { NETWORK_NAME } from "@/config/environment";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const { connected, publicKey } = useWallet();
  const pathname = usePathname();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchSolBalance = async () => {
      if (publicKey) {
        try {
          // Use the correct RPC endpoint based on environment
          const sonicBalance = await new Connection(envRPC_URL)
            .getBalance(publicKey)
            .then(bal => bal/ 1e9);
          
          setSolBalance(sonicBalance);
        } catch (error) {
          console.error("Error fetching SOL balance:", error);
          setSolBalance(null);
        }
      } else {
        setSolBalance(null);
      }
    };

    fetchSolBalance();

    // Set up polling to update balance
    const intervalId = setInterval(fetchSolBalance, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, [publicKey]);

  const showLaunchButton = connected && pathname !== "/launch";

  const handleOpenBridgeModal = () => {
    setIsBridgeModalOpen(true);
  };

  const handleCloseBridgeModal = () => {
    setIsBridgeModalOpen(false);
  };

  return (
    <header className="relative z-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/" className="flex flex-col items-start cursor-pointer relative">
              <div className="relative h-10 w-48 md:w-80 mr-3">
                <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center">
                  <Image
                    src="/logoWhite.png"
                    alt="Hypernova Logo"
                    width={240}
                    height={24}
                    className="rounded-32 bg-black"
                  />
                </div>
                <div className="absolute -bottom-6 right-8 text-[10px] md:text-xs font-medium text-white bg-purple-600/40 border border-purple-500/30 px-2 py-0.5 rounded-sm">
                  {NETWORK_NAME}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - centered */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            {/* <Link href="/swap" className="text-base font-medium text-gray-200 hover:text-white transition-colors px-4">
              Swap
            </Link> */}
            <Link
              href="/pools"
              className="text-base font-medium text-gray-200 hover:text-white transition-colors px-4"
            >
              Liquidity
            </Link>
            <Link
              href="/launch"
              className="text-base font-medium text-gray-200 hover:text-white transition-colors px-4"
            >
              Launch
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3 flex-1 justify-end">
            {connected && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenBridgeModal}
                  className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white py-[0.25rem] px-3 h-auto text-sm font-medium"
                >
                  How to Bridge <ArrowUpRight size={14} className="ml-1" />
                </Button>
                {solBalance !== null && (
                  <div className="px-3 py-[0.25rem] bg-gray-900/70 border border-gray-800 rounded-lg flex items-center h-auto">
                    <img 
                      src="https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
                      alt="Sonic Logo"
                      className="w-4 h-4 mr-2 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-200">
                      {solBalance.toFixed(2)} SOL
                    </span>
                  </div>
                )}
              </>
            )}
            <CustomWalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4 ml-auto">
            {connected ? (
              <>
                {solBalance !== null && (
                  <div className="px-3 py-[0.25rem] bg-gray-900/70 border border-gray-800 rounded-lg flex items-center h-auto">
                    <img 
                      src="https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
                      alt="Sonic Logo"
                      className="w-4 h-4 mr-2 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-200">
                      {solBalance.toFixed(2)} SOL
                    </span>
                  </div>
                )}
                <MobileWalletButton />
              </>
            ) : (
              <CustomWalletButton />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className="text-white"
            >
              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-20 bg-black/95 backdrop-blur-md border-t border-gray-800 p-4 retro-card">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/swap"
                className="text-base font-medium text-gray-200 hover:text-white transition-colors py-2"
              >
                Swap
              </Link>
              <Link
                href="/pools"
                className="text-base font-medium text-gray-200 hover:text-white transition-colors py-2"
              >
                Liquidity
              </Link>
              <Link
                href="/launch"
                className="text-base font-medium text-gray-200 hover:text-white transition-colors py-2"
              >
                Launch
              </Link>
              {connected && (
                <Button 
                  variant="outline" 
                  onClick={handleOpenBridgeModal}
                  className="w-full justify-center border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white py-[0.25rem] px-3 h-auto"
                >
                  How to Bridge <ArrowUpRight size={14} className="ml-1" />
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Bridge Modal */}
      <HowToBridgeModal
        isOpen={isBridgeModalOpen}
        onClose={handleCloseBridgeModal}
      />
    </header>
  );
}
