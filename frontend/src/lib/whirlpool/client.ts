import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Wallet } from "./types/wallet";
import bs58 from "bs58";

// Constants that don't require initialization
export const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey("FDtFfB7t7ndyFm9yvwS2KisRxCTrWZhCwdgPTCyCPrww");
export const config = new PublicKey("EzKxn2NVVC6ohUtHHkqdhXVpjVctR2B9KXyjK7qXf1Ez");
export const configExtension = new PublicKey("BukT4pT7DhbybXJpQZo9zLBpTQS6XgXqBfEmZ2CcfB1Q");

// Singleton class to manage Whirlpool initialization
class WhirlpoolSingleton {
    private static instance: WhirlpoolSingleton;
    private _connection: Connection | null = null;
    private _wallet: Wallet | null = null;
    private _context: any = null;
    private _client: any = null;
    private _isInitializing = false;
    private _initPromise: Promise<void> | null = null;
    private _sdkModule: any = null;

    private constructor() {}

    public static getInstance(): WhirlpoolSingleton {
        if (!WhirlpoolSingleton.instance) {
            WhirlpoolSingleton.instance = new WhirlpoolSingleton();
        }
        return WhirlpoolSingleton.instance;
    }

    private async loadSdk() {
        if (this._sdkModule) return this._sdkModule;
        
        // Dynamically import SDK modules to avoid initialization during build time
        try {
            // Use dynamic imports to avoid initialization at module load time
            this._sdkModule = await import('@orca-so/whirlpools-sdk');
            return this._sdkModule;
        } catch (error) {
            console.error("Error loading Whirlpool SDK:", error);
            throw error;
        }
    }

    public async initialize(forceReInit = false): Promise<void> {
        // If already initializing, wait for that to complete
        if (this._isInitializing && this._initPromise) {
            return this._initPromise;
        }

        // If already initialized and not forcing reinitialization, do nothing
        if (this._context && this._client && !forceReInit) {
            return Promise.resolve();
        }

        // Set initialization flag and create promise
        this._isInitializing = true;
        this._initPromise = new Promise<void>(async (resolve, reject) => {
            try {
                // Get RPC endpoint and secret key from env vars
                const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.testnet.sonic.game/';
                const FEES_WALLET_SECRET_KEY = process.env.FEES_WALLET_SECRET_KEY || '';

                if (!FEES_WALLET_SECRET_KEY) {
                    console.warn("FEES_WALLET_SECRET_KEY is not set in environment variables");
                }

                // Initialize connection
                this._connection = new Connection(RPC_ENDPOINT);

                // Initialize wallet if secret key is available
                if (FEES_WALLET_SECRET_KEY) {
                    const keyPair = Keypair.fromSecretKey(bs58.decode(FEES_WALLET_SECRET_KEY));
                    this._wallet = new Wallet(keyPair);

                    // Load SDK dynamically
                    const sdk = await this.loadSdk();
                    
                    // Initialize context and client
                    this._context = sdk.WhirlpoolContext.from(
                        this._connection,
                        this._wallet,
                        ORCA_WHIRLPOOL_PROGRAM_ID,
                    );

                    this._client = sdk.buildWhirlpoolClient(this._context);
                }

                resolve();
            } catch (error) {
                console.error("Error initializing WhirlpoolSingleton:", error);
                reject(error);
            } finally {
                this._isInitializing = false;
            }
        });

        return this._initPromise;
    }

    public get connection(): Connection {
        if (!this._connection) {
            throw new Error("WhirlpoolSingleton not initialized. Call initialize() first.");
        }
        return this._connection;
    }

    public get wallet(): Wallet {
        if (!this._wallet) {
            throw new Error("WhirlpoolSingleton not initialized or wallet not available. Check FEES_WALLET_SECRET_KEY environment variable.");
        }
        return this._wallet;
    }

    public get context(): any {
        if (!this._context) {
            throw new Error("WhirlpoolSingleton not initialized. Call initialize() first.");
        }
        return this._context;
    }

    public get client(): any {
        if (!this._client) {
            throw new Error("WhirlpoolSingleton not initialized. Call initialize() first.");
        }
        return this._client;
    }

    public async getSdk() {
        return this.loadSdk();
    }

    public isInitialized(): boolean {
        return !!this._context && !!this._client;
    }
}

// Get the singleton instance
export const whirlpoolInstance = WhirlpoolSingleton.getInstance();

// Wrapper functions that ensure initialization
export const getConnection = async (): Promise<Connection> => {
    // Safe fallback if initialization fails
    try {
        await whirlpoolInstance.initialize();
        return whirlpoolInstance.connection;
    } catch (error) {
        console.error("Error getting connection:", error);
        // Return a default connection if initialization fails
        return new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.testnet.sonic.game/');
    }
};

export const getKeyPairAndWallet = async (): Promise<{ keyPair: Keypair, wallet: Wallet }> => {
    await whirlpoolInstance.initialize();
    const wallet = whirlpoolInstance.wallet;
    // @ts-expect-error - accessing private property for this special case
    const keyPair = wallet._signer;
    return { keyPair, wallet };
};

export const getWhirlpoolContext = async (): Promise<any> => {
    await whirlpoolInstance.initialize();
    return whirlpoolInstance.context;
};

export const getWhirlpoolClient = async (): Promise<any> => {
    await whirlpoolInstance.initialize();
    return whirlpoolInstance.client;
};

export const getSdk = async () => {
    return whirlpoolInstance.getSdk();
}; 