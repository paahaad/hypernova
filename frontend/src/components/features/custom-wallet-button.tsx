"use client";

import React, { useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { cn } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileWalletButton() {
  const { connected, publicKey } = useWallet();
  
  return (
    <div className="wallet-button-mobile-wrapper">
      <WalletMultiButton />
      <style jsx global>{`
        .wallet-button-mobile-wrapper {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-button {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          padding: 0 !important;
          border-radius: 9999px !important;
          border: 1px solid rgba(55, 65, 81, 0.8) !important;
          background-color: rgba(17, 24, 39, 0.7) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-button:hover {
          background-color: rgba(31, 41, 55, 0.8) !important;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-button-start-icon {
          margin: 0 !important;
          position: relative !important;
          display: block !important;
          visibility: visible !important;
          width: 18px !important;
          height: 18px !important;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-button span {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
        }
        
        /* Position the dropdown */
        .wallet-button-mobile-wrapper .wallet-adapter-dropdown {
          position: relative !important;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-dropdown-list {
          position: absolute !important;
          top: 100% !important;
          right: 0 !important;
          transform: none !important;
          margin-top: 4px !important;
          min-width: 200px !important;
          background-color: rgba(17, 24, 39, 0.95) !important;
          backdrop-filter: blur(4px) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
          border-radius: 0.375rem !important;
          padding: 4px !important;
          z-index: 999 !important;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-dropdown-list-item {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          border-radius: 0.25rem !important;
          text-align: left !important;
          color: rgb(229, 231, 235) !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          transition: all 0.2s ease !important;
          border: none !important;
          background-color: transparent !important;
        }
        
        .wallet-button-mobile-wrapper .wallet-adapter-dropdown-list-item:hover {
          background-color: rgba(55, 65, 81, 0.7) !important;
        }
      `}</style>
    </div>
  );
}

export function CustomWalletButton({ className, ...props }: React.ComponentProps<typeof WalletMultiButton>) {
  // Override wallet adapter text to change "Connect a wallet on Solana" to "Connect your preferred wallet"
  useEffect(() => {
    const overrideWalletText = () => {
      // Find and modify the text content of wallet buttons
      const walletButtons = document.querySelectorAll('.wallet-adapter-button-trigger');
      walletButtons.forEach(button => {
        if (button.textContent?.includes('Connect a wallet on Solana')) {
          button.textContent = 'Connect your preferred wallet';
        }
      });
      
      // Also modify the modal title if it exists
      const modalTitle = document.querySelector('.wallet-adapter-modal-title');
      if (modalTitle && modalTitle.textContent?.includes('Connect a wallet on Solana')) {
        modalTitle.textContent = 'Connect your preferred wallet';
      }
    };
    
    // Run initially
    overrideWalletText();
    
    // Set up a mutation observer to catch dynamic changes
    const observer = new MutationObserver(overrideWalletText);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("custom-wallet-wrapper", className)}>
      <WalletMultiButton {...props} />
      <style jsx global>{`
        .custom-wallet-wrapper .wallet-adapter-button {
          background-color: rgba(17, 24, 39, 0.7) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
          border-radius: 0.5rem !important;
          height: auto !important;
          padding: 0.25rem 0.75rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          min-width: 0 !important;
          color: rgb(229, 231, 235) !important;
          line-height: 1.25rem !important;
          text-align: left !important;
          justify-content: flex-start !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-button:hover {
          background-color: rgba(31, 41, 55, 0.8) !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-button-start-icon {
          margin-right: 0.5rem !important;
          width: 1rem !important;
          height: 1rem !important;
        }
        
        /* Dropdown styling */
        .custom-wallet-wrapper .wallet-adapter-dropdown {
          display: inline-block !important; 
        }
        
        .custom-wallet-wrapper .wallet-adapter-dropdown-list {
          background-color: rgba(17, 24, 39, 0.95) !important;
          backdrop-filter: blur(4px) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
          border-radius: 0.2rem !important;
          margin-top: 0.25rem !important;
          padding: 0.15rem !important;
          overflow: hidden !important;
          z-index: 50 !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-dropdown-list-item {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          border-radius: 0.25rem !important;
          text-align: left !important;
          color: rgb(229, 231, 235) !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          transition: all 0.2s ease !important;
          border: none !important;
          background-color: transparent !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-dropdown-list-item:hover {
          background-color: rgba(55, 65, 81, 0.7) !important;

        }

        .custom-wallet-wrapper .wallet-adapter-dropdown-list-item img,
        .wallet-adapter-modal-list .wallet-adapter-button img {
          width: 20px !important;
          height: 20px !important;
          margin-right: 0.5rem !important;
          border-radius: 4px !important;
        }
        
        /* Modal Styling */
        .wallet-adapter-modal-wrapper {
          background-color: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px) !important;
          padding: 1.25rem !important;
        }
        
        .wallet-adapter-modal {
          background-color: rgba(17, 24, 39, 0.95) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5) !important;
          padding: 1.5rem !important;
        }
        
        .wallet-adapter-modal-title {
          color: white !important;
          font-weight: 600 !important;
          font-size: 1.25rem !important;
          margin: 0rem !important;
          padding: 0.5rem 4rem !important;
          padding-left: 0rem !important;
          top: 0rem !important;
          left: 0rem !important;
          position: relative !important;
          z-index: 10 !important;
        }
        
        .wallet-adapter-modal-content {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .wallet-adapter-modal-button-close {
          background-color: rgba(0, 0, 0, 0) !important;
          color: rgb(156, 163, 175) !important;
          border-radius: 9999px !important;
          top: 1rem !important;
          right: 1rem !important;
          padding: 1rem 0.5rem !important;
          z-index: 50 !important;
        }
        
        .wallet-adapter-modal-list {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
        
        .wallet-adapter-modal-list .wallet-adapter-button {
          background-color: rgba(31, 41, 55, 0.5) !important;
          border: 1px solid rgba(75, 85, 99, 0.5) !important;
          border-radius: 0.5rem !important;
          color: rgb(229, 231, 235) !important;
          margin: 0.5rem 0 !important;
          padding: 0.25rem 0.75rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          text-align: left !important;
          justify-content: flex-start !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
        }
        
        .wallet-adapter-modal-list .wallet-adapter-button:hover {
          background-color: rgba(55, 65, 81, 0.7) !important;
          border-color: rgba(107, 114, 128, 0.8) !important;
        }
        
        .wallet-adapter-modal-list-more {
          color: rgb(156, 163, 175) !important;
          cursor: pointer !important;
          padding: 0.5rem !important;
          border-radius: 0.375rem !important;
          font-size: 0.875rem !important;
          text-align: left !important;
        }
        
        .wallet-adapter-modal-list-more:hover {
          color: rgb(209, 213, 219) !important;
          background-color: rgba(55, 65, 81, 0.5) !important;
        }
        
        /* Fix for long wallet adapter button text */
        .wallet-adapter-button-trigger {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 200px !important;
          text-align: left !important;
          justify-content: flex-start !important;
        }
        
        @media (max-width: 640px) {
          .wallet-adapter-button-trigger {
            max-width: 160px !important;
          }
        }
      `}</style>
    </div>
  );
} 