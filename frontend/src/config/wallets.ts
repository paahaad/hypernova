import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  NightlyWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter, OKXWalletAdapter, BybitWalletAdapter } from './custom-wallets';

export const getWalletAdapters = (network: WalletAdapterNetwork) => {
  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new NightlyWalletAdapter(),
    new BackpackWalletAdapter(),
    new OKXWalletAdapter(),
    new BybitWalletAdapter(),
  ];
}; 