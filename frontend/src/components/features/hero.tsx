"use client"

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Hero() {
  const { data, error } = useSWR(
    "https://api.jup.ag/price/v2?ids=SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES,So11111111111111111111111111111111111111112",
    fetcher,
    { refreshInterval: 10000 } // Refresh every 10 seconds
  );

  const sonicAmount = useMemo(() => {
    if (!data?.data) return "...";
    
    const solPrice = parseFloat(data.data.So11111111111111111111111111111111111111112.price);
    const sonicPrice = parseFloat(data.data.SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES.price);
    const amount = (solPrice / sonicPrice).toFixed(2);
    return new Intl.NumberFormat('en-US').format(parseFloat(amount));
  }, [data]);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"
        ></div>

        {/* Retro grid */}
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-block px-3 py-1 mb-6 border border-gray-700 rounded-full bg-gray-900/50 backdrop-blur-sm"
          >
            <span className="text-xs font-medium text-gray-300">
              Built on Sonic 🚀
            </span>
          </div>

          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight retro-glow scanline"
          >
            <span className="retro-gradient">
              Hyperspeed Tokens on Sonic SVM
            </span>
          </h1>
    
          {/* Floating terminal-like UI */}
          <div className="mt-16 mb-10 relative max-w-3xl mx-auto scale-105">
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl"
            ></div>
            <div
              className="retro-card rounded-xl overflow-hidden p-1 relative w-3/4 mx-auto"
            >
              <div
                className="bg-gray-900 rounded-t-lg p-3 flex items-center"
              >
                <div className="flex space-x-2">
                  <div
                    className="w-3 h-3 rounded-full bg-red-500"
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-yellow-500"
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-green-500"
                  ></div>
                </div>
                <div className="mx-auto text-xs text-gray-400">
                  hypernova.exchange
                </div>
              </div>

              <div className="bg-black p-6 rounded-b-lg scanline">
                <div
                  className="flex flex-col gap-4 items-center"
                >
                  <div
                    className="w-full bg-gray-900 rounded-lg p-4 border border-gray-800"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        From
                      </span>
                      <span className="text-sm text-gray-400">
                        Balance: 0.00
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full overflow-hidden mr-2 flex items-center justify-center"
                        >
                          <img 
                            src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                            alt="SOL"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">
                          SOL
                        </span>
                      </div>
                      <span className="font-mono text-lg">
                        1.0
                      </span>
                    </div>
                  </div>

                  <div
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 rotate-90"
                  >
                    <ArrowRightIcon
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>

                  <div
                    className="w-full bg-gray-900 rounded-lg p-4 border border-gray-800"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        To
                      </span>
                      <span className="text-sm text-gray-400">
                        Balance: 0.00
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full overflow-hidden mr-2 flex items-center justify-center"
                        >
                          <img 
                            src="https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
                            alt="SONIC"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">
                          SONIC
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-lg crt-flicker">
                          {sonicAmount}
                        </span>
                        {error && (
                          <span className="text-xs text-red-500">
                            Error fetching price
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg h-12"
                >
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>

          <p
            className="text-xl md:text-2xl text-gray-100 mb-12 max-w-md mx-auto font-medium leading-relaxed tracking-wide"
          >
            The largest DEX and Launchpad on Sonic SVM –– the first chain extension on Solana
          </p>
        </div>
      </div>
    </section>
  );
}