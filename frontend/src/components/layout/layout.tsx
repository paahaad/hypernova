"use client"

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/layout/theme-provider";
import  PrivyProvider  from "@/components/layout/privy-provider";
import { Toaster } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PrivyProvider>
      <ThemeProvider defaultTheme="dark">
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden">
          <div className="noise-overlay"></div>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster richColors position="top-center" />
        </div>

        {/* Global styles for retro effects */}
        <style jsx global>{`
          .noise-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.05;
            pointer-events: none;
            z-index: 1;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Helvetica, Arial, sans-serif;
          }

          .retro-glow {
            text-shadow:
              0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(255, 255, 255, 0.5),
              0 0 30px rgba(255, 255, 255, 0.3);
          }

          .retro-card {
            background: rgba(20, 20, 20, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }

          .retro-gradient {
            background: linear-gradient(135deg, #ff6b6b, #6b66ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .scanline {
            position: relative;
            overflow: hidden;
          }

          .scanline::before {
            content: "";
            position: absolute;
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            animation: scanline 6s linear infinite;
          }

          @keyframes scanline {
            0% {
              top: 0%;
            }
            100% {
              top: 100%;
            }
          }

          .crt-flicker {
            animation: flicker 0.3s infinite alternate;
          }

          @keyframes flicker {
            0% {
              opacity: 0.97;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </ThemeProvider>
    </PrivyProvider>
  );
} 