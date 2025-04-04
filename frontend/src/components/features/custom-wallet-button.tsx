"use client";

import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { cn } from "@/lib/utils";

export function CustomWalletButton({ className, ...props }: React.ComponentProps<typeof WalletMultiButton>) {
  return (
    <div className={cn("custom-wallet-wrapper", className)}>
      <WalletMultiButton {...props} />
      <style jsx global>{`
        .custom-wallet-wrapper .wallet-adapter-button {
          background-color: rgba(17, 24, 39, 0.7) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
          border-radius: 0.5rem !important;
          height: auto !important;
          padding: 0.3rem 0.75rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          min-width: 0 !important;
          color: rgb(229, 231, 235) !important;
          line-height: 1.25rem !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-button:hover {
          background-color: rgba(31, 41, 55, 0.8) !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-button-start-icon {
          margin-right: 0.5rem !important;
          width: 1rem !important;
          height: 1rem !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-dropdown-list {
          background-color: rgba(17, 24, 39, 0.95) !important;
          backdrop-filter: blur(4px) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
          border-radius: 0.5rem !important;
        }
        
        .custom-wallet-wrapper .wallet-adapter-dropdown-list-item {
          padding: 0.75rem 0.75rem !important;
          font-size: 0.875rem !important;
          border-radius: 0.25rem !important;
        }
        
        .wallet-adapter-modal-wrapper {
          background-color: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .wallet-adapter-modal-title {
          color: white !important;
        }
        
        .wallet-adapter-modal-content {
          background-color: rgba(17, 24, 39, 0.95) !important;
          border: 1px solid rgba(31, 41, 55, 0.8) !important;
        }

        .wallet-adapter-modal-button-close {
          background-color: rgba(31, 41, 55, 0.8) !important;
        }
      `}</style>
    </div>
  );
} 