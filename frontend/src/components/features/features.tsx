"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  RocketIcon,
  ArrowLeftRightIcon,
  WalletIcon,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: RocketIcon,
      title: "Launch any token",
      description:
        "From memes to games to consumer tokens with an in-built launch mechanism",
    },
    {
      icon: ArrowLeftRightIcon,
      title: "Trade ANY Tokens",
      description:
        "the native Hypernova DEX built using Concentrated Liquidity (CLMM) implementation",
    },
    {
      icon: WalletIcon,
      title: "Provide Liquidity",
      description:
        "Create Liquidity Pools or provide liquidity to existing pools and earn yield",
    }
  ];

  return (
    <section className="py-20 relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
        {/* Retro grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6 retro-glow"
          >
            The Vertical DEX on Sonic
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              className="retro-card border-gray-800 hover:border-gray-700 transition-all duration-300 hover:translate-y-[-5px]"
              id={`n8gk8u_${index}`}
            >
              <CardContent className="p-6" id={`r745an_${index}`}>
                <div className="flex items-center mb-4">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-white mr-4"
                    id={`oaelas_${index}`}
                  >
                    <feature.icon className="h-6 w-6" id={`2h1o9b_${index}`} />
                  </div>
                  <h3 className="text-xl font-bold" id={`j8d439_${index}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-lg" id={`0ycpc7_${index}`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
