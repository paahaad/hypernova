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
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / 1e9);
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
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            <div className="relative h-10 w-80 mr-3">
              <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center">
                <Image
                  src="/logoWhite.png"
                  alt="Hypernova Logo"
                  width={240}
                  height={24}
                  className="rounded-32 bg-black"
                />
              </div>
            </div>
            {/* <span className="text-2xl font-bold tracking-tight retro-glow">
              Hypernova
            </span> */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* <Link href="/swap" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Swap
            </Link> */}
            <Link
              href="/pools"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              Liquidity
            </Link>
            <Link
              href="/launch"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              Launch
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
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
                    <Wallet size={14} className="text-gray-400 mr-2" />
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
          <div className="flex items-center md:hidden space-x-4">
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
                className="text-sm font-medium text-gray-200 hover:text-white transition-colors py-2"
              >
                Swap
              </Link>
              <Link
                href="/pools"
                className="text-sm font-medium text-gray-200 hover:text-white transition-colors py-2"
              >
                Liquidity
              </Link>
              <Link
                href="/launch"
                className="text-sm font-medium text-gray-200 hover:text-white transition-colors py-2"
              >
                Launch
              </Link>
              {connected && (
                <>
                  {solBalance !== null && (
                    <div className="py-2">
                      <div className="px-3 py-[0.25rem] bg-gray-900/70 border border-gray-800 rounded-lg flex items-center h-auto">
                        <Wallet size={14} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-200">
                          {solBalance.toFixed(2)} SOL
                        </span>
                      </div>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleOpenBridgeModal}
                    className="w-full justify-center border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white py-[0.25rem] px-3 h-auto"
                  >
                    How to Bridge <ArrowUpRight size={14} className="ml-1" />
                  </Button>
                </>
              )}
              <div className="w-full mt-2">
                <CustomWalletButton className="w-full" />
              </div>
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
