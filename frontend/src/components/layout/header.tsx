"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon } from "lucide-react";
import { usePrivy } from '@privy-io/react-auth';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { login, logout, authenticated } = usePrivy();
  const pathname = usePathname();
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const showLaunchButton = authenticated && pathname !== '/launch';

  return (
    <header className="relative z-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            <div className="relative h-10 w-10 mr-3">
              <div
                className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="Hypernova Logo"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
            </div>
            <span
              className="text-2xl font-bold tracking-tight retro-glow"
            >
              Hypernova
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/swap" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Swap
            </Link>
            <Link href="/pools" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Liquidity
            </Link>
            <Link href="/launch" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Launch
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {authenticated ? (
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white"
                onClick={logout}
              >
                Disconnect Wallet
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white"
                onClick={login}
              >
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className="text-white"
            >
              {isMenuOpen ? (
                <XIcon size={24} />
              ) : (
                <MenuIcon size={24} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="md:hidden absolute left-0 right-0 top-20 bg-black/95 backdrop-blur-md border-t border-gray-800 p-4 retro-card"
          >
            <nav className="flex flex-col space-y-4">
              <Link href="/swap" className="text-sm font-medium text-gray-200 hover:text-white transition-colors py-2">
                Swap
              </Link>
              <Link href="/pools" className="text-sm font-medium text-gray-200 hover:text-white transition-colors py-2">
                Liquidity
              </Link>
              <Link href="/launch" className="text-sm font-medium text-gray-200 hover:text-white transition-colors py-2">
                Launch
              </Link>
              {authenticated ? (
                <Button className="w-full mt-2" onClick={logout}>
                  Disconnect Wallet
                </Button>
              ) : (
                <Button className="w-full mt-2" onClick={login}>
                  Connect Wallet
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
