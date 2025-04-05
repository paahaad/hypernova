import { BaseWalletAdapter, WalletName, WalletReadyState, WalletError, WalletAdapterProps, SupportedTransactionVersions } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction, Connection, SendOptions, TransactionVersion } from '@solana/web3.js';

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
  name = 'Backpack' as WalletName<'Backpack'>;
  url = 'https://www.backpack.app';
  icon = '/assets/wallets/backpack.svg';
  readyState: WalletReadyState = WalletReadyState.Installed;
  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions: SupportedTransactionVersions = new Set(['legacy', 0] as TransactionVersion[]);

  constructor() {
    super();
  }

  async connect(): Promise<void> {
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

  async disconnect(): Promise<void> {
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

  async sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string> {
    if (!window.backpack) {
      throw new Error('Backpack wallet not found');
    }
    const signed = await this.signTransaction(transaction);
    return connection.sendRawTransaction(signed.serialize(), options);
  }
}

// Custom OKX Wallet Adapter
export class OKXWalletAdapter extends BaseWalletAdapter {
  name = 'OKX' as WalletName<'OKX'>;
  url = 'https://www.okx.com';
  icon = '/assets/wallets/okx.svg';
  readyState: WalletReadyState = WalletReadyState.Installed;
  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions: SupportedTransactionVersions = new Set(['legacy', 0] as TransactionVersion[]);

  constructor() {
    super();
  }

  async connect(): Promise<void> {
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

  async disconnect(): Promise<void> {
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

  async sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string> {
    if (!window.okxwallet) {
      throw new Error('OKX wallet not found');
    }
    const signed = await this.signTransaction(transaction);
    return connection.sendRawTransaction(signed.serialize(), options);
  }
}

// Custom Bybit Wallet Adapter
export class BybitWalletAdapter extends BaseWalletAdapter {
  name = 'Bybit' as WalletName<'Bybit'>;
  url = 'https://www.bybit.com';
  icon = '/assets/wallets/bybit.svg';
  readyState: WalletReadyState = WalletReadyState.Installed;
  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions: SupportedTransactionVersions = new Set(['legacy', 0] as TransactionVersion[]);

  constructor() {
    super();
  }

  async connect(): Promise<void> {
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

  async disconnect(): Promise<void> {
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

  async sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string> {
    if (!window.bybit) {
      throw new Error('Bybit wallet not found');
    }
    const signed = await this.signTransaction(transaction);
    return connection.sendRawTransaction(signed.serialize(), options);
  }
} 