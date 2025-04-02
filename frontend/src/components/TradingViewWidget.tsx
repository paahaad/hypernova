'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface TradingViewWidgetProps {
  inputToken?: string;
  outputToken?: string;
}

export function TradingViewWidget({ inputToken, outputToken }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  const getMarketSymbol = () => {
    // Map of token addresses to their available trading pairs
    const marketPairs: { [key: string]: { symbol: string, exchange: string }[] } = {
      "So11111111111111111111111111111111111111112": [ // SOL
        { symbol: "SOLUSDT", exchange: "BINANCE" },
        { symbol: "SOLUSDC", exchange: "BINANCE" }
      ],
      "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES": [ // SONIC
        { symbol: "SONICUSD", exchange: "OKX" },
        { symbol: "SONICUSDT", exchange: "OKX" },
        { symbol: "SONICSVUSD", exchange: "CRYPTO" }
      ],
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": [ // USDC
        { symbol: "USDCUSDT", exchange: "BINANCE" },
        { symbol: "USDCUSD", exchange: "BINANCE" }
      ],
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": [ // USDT
        { symbol: "USDTUSD", exchange: "BINANCE" },
        { symbol: "USDTUSDC", exchange: "BINANCE" }
      ]
    };

    // Check if input token has direct pairs
    if (inputToken && marketPairs[inputToken]) {
      const pair = marketPairs[inputToken][0];
      return `${pair.exchange}:${pair.symbol}`;
    }

    // Check if output token has pairs (might need to reverse the chart)
    if (outputToken && marketPairs[outputToken]) {
      const pair = marketPairs[outputToken][0];
      return `${pair.exchange}:${pair.symbol}`;
    }

    // Default to SOL/USDT if no specific pair is found
    return "BINANCE:SOLUSDT";
  };

  useEffect(() => {
    const symbol = getMarketSymbol();
    if (!symbol) return;

    // Clear previous chart
    if (container.current) {
      container.current.innerHTML = '';
    }

    // Create a new container for the chart
    const chartContainer = document.createElement('div');
    chartContainer.id = 'tradingview_chart';
    chartContainer.style.height = '100%';
    chartContainer.style.width = '100%';
    container.current?.appendChild(chartContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const widgetConfig = {
      "width": "100%",
      "height": "100%",
      "symbol": symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "backgroundColor": "rgba(19, 23, 34, 1)",
      "gridColor": "rgba(255, 255, 255, 0.06)",
      "studies": ["Volume@tv-basicstudies"]
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    chartContainer.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [inputToken, outputToken]); // Re-run effect when tokens change

  // Helper to get the display name for the chart header
  const getDisplayPair = () => {
    if (!inputToken && !outputToken) return "Chart";
    
    const tokenSymbols = {
      "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES": "SONIC",
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USD"
    };

    const input = inputToken && tokenSymbols[inputToken];
    const output = outputToken && tokenSymbols[outputToken];

    if (input && output) {
      return `${input}/${output}`;
    }
    return input || output || "Chart";
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="text-sm text-gray-400 mb-2">
        {getDisplayPair()}
      </div>
      <div ref={container} className="tradingview-widget-container flex-1 w-full" />
    </div>
  );
} 