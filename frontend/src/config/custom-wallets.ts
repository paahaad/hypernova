import { BaseWalletAdapter, WalletName, WalletReadyState, WalletError } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

declare global {
  interface Window {
    backpack?: {
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
      signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
    };
    okxwallet?: {
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
      signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
    };
    bybit?: {
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
      signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
    };
  }
}

// Custom Backpack Wallet Adapter
export class BackpackWalletAdapter extends BaseWalletAdapter {
  name = 'Backpack' as WalletName;
  url = 'https://www.backpack.app';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjZmZmIi8+PC9zdmc+';
  readyState: WalletReadyState = WalletReadyState.Installed;
  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions = new Set(['legacy', 0]);

  async connect() {
    if (!window.backpack) {
      throw new Error('Backpack wallet not found');
    }
    this.connecting = true;
    try {
      const { publicKey } = await window.backpack.connect();
      this.publicKey = publicKey;
      this.emit('connect', publicKey);
    } catch (error) {
      this.emit('error', new WalletError((error as Error).message));
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect() {
    if (!window.backpack) {
      throw new Error('Backpack wallet not found');
    }
    try {
      await window.backpack.disconnect();
      this.publicKey = null;
      this.emit('disconnect');
    } catch (error) {
      this.emit('error', new WalletError((error as Error).message));
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!window.backpack) {
      throw new Error('Backpack wallet not found');
    }
    return window.backpack.signTransaction(transaction);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    if (!window.backpack) {
      throw new Error('Backpack wallet not found');
    }
    return window.backpack.signAllTransactions(transactions);
  }

  async sendTransaction(transaction: Transaction, connection: any): Promise<string> {
    if (!window.backpack) {
      throw new Error('Backpack wallet not found');
    }
    const signed = await this.signTransaction(transaction);
    return connection.sendRawTransaction(signed.serialize());
  }
}

// Custom OKX Wallet Adapter
export class OKXWalletAdapter extends BaseWalletAdapter {
  name = 'OKX' as WalletName;
  url = 'https://www.okx.com';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjZmZmIi8+PC9zdmc+';
  readyState: WalletReadyState = WalletReadyState.Installed;
  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions = new Set(['legacy', 0]);

  async connect() {
    if (!window.okxwallet) {
      throw new Error('OKX wallet not found');
    }
    this.connecting = true;
    try {
      const { publicKey } = await window.okxwallet.connect();
      this.publicKey = publicKey;
      this.emit('connect', publicKey);
    } catch (error) {
      this.emit('error', new WalletError((error as Error).message));
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect() {
    if (!window.okxwallet) {
      throw new Error('OKX wallet not found');
    }
    try {
      await window.okxwallet.disconnect();
      this.publicKey = null;
      this.emit('disconnect');
    } catch (error) {
      this.emit('error', new WalletError((error as Error).message));
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!window.okxwallet) {
      throw new Error('OKX wallet not found');
    }
    return window.okxwallet.signTransaction(transaction);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    if (!window.okxwallet) {
      throw new Error('OKX wallet not found');
    }
    return window.okxwallet.signAllTransactions(transactions);
  }

  async sendTransaction(transaction: Transaction, connection: any): Promise<string> {
    if (!window.okxwallet) {
      throw new Error('OKX wallet not found');
    }
    const signed = await this.signTransaction(transaction);
    return connection.sendRawTransaction(signed.serialize());
  }
}

// Custom Bybit Wallet Adapter
export class BybitWalletAdapter extends BaseWalletAdapter {
  name = 'Bybit' as WalletName;
  url = 'https://www.bybit.com';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjZmZmIi8+PC9zdmc+';
  readyState: WalletReadyState = WalletReadyState.Installed;
  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions = new Set(['legacy', 0]);

  async connect() {
    if (!window.bybit) {
      throw new Error('Bybit wallet not found');
    }
    this.connecting = true;
    try {
      const { publicKey } = await window.bybit.connect();
      this.publicKey = publicKey;
      this.emit('connect', publicKey);
    } catch (error) {
      this.emit('error', new WalletError((error as Error).message));
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect() {
    if (!window.bybit) {
      throw new Error('Bybit wallet not found');
    }
    try {
      await window.bybit.disconnect();
      this.publicKey = null;
      this.emit('disconnect');
    } catch (error) {
      this.emit('error', new WalletError((error as Error).message));
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!window.bybit) {
      throw new Error('Bybit wallet not found');
    }
    return window.bybit.signTransaction(transaction);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    if (!window.bybit) {
      throw new Error('Bybit wallet not found');
    }
    return window.bybit.signAllTransactions(transactions);
  }

  async sendTransaction(transaction: Transaction, connection: any): Promise<string> {
    if (!window.bybit) {
      throw new Error('Bybit wallet not found');
    }
    const signed = await this.signTransaction(transaction);
    return connection.sendRawTransaction(signed.serialize());
  }
} 