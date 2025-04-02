import { PublicKey } from '@solana/web3.js';

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  tags: string[];
}

// This is a basic list - you can expand it or fetch from Jupiter API
export const TOKEN_LIST: TokenInfo[] = [
  {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    tags: ["native"]
  },
  {
    symbol: "SONIC",
    name: "Sonic",
    address: "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES",
    decimals: 9,
    logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A",
    tags: ["popular"]
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    tags: ["stablecoin", "popular"]
  },
  // Add more tokens as needed
];

export const POPULAR_TOKENS = TOKEN_LIST.filter(token => 
  token.tags.includes('popular')
);

export const STABLE_COINS = TOKEN_LIST.filter(token => 
  token.tags.includes('stablecoin')
); 