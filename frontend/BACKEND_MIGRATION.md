# Backend Migration Guide

## Migration Complete

The backend functionality has been fully migrated to Next.js API routes, eliminating the need for a standalone Express backend server. This simplifies our architecture by having all code in one project while maintaining API compatibility for the frontend.

## Singleton Pattern for SDK Initialization

We've implemented a Singleton Pattern for the Whirlpool SDK initialization that addresses several concerns:

1. **Lazy Initialization**: The SDK is initialized only when needed, not during module loading
2. **Dynamic Imports**: To prevent SDK initialization during Next.js build/load phase, we use dynamic imports
3. **Connection Management**: The connection to the Solana network is managed centrally
4. **Context Creation**: The Whirlpool context is created once and reused

### Why Dynamic Imports Were Necessary

Initially, we implemented a standard singleton pattern, but encountered "Account not found: WhirlpoolsConfig" errors. This occurred because:

1. In Next.js server components/API routes, all imported modules are processed during build/load phase
2. The Orca Whirlpool SDK attempts to access Solana accounts during initialization
3. Even with lazy initialization in the singleton, imports were still being processed

The solution was to use dynamic imports (`import()`) to ensure the SDK is loaded only when explicitly called, avoiding any initialization during the module loading phase.

## API Endpoints

The following API endpoints are available in the Next.js API routes:

- `POST /api/pools` - Create a new pool
- `GET /api/pools` - List all pools
- `GET /api/pools/[address]` - Get details for a specific pool
- `POST /api/pools/add-liquidity` - Add liquidity to a pool
- `POST /api/pools/swap` - Swap tokens in a pool

## Environment Variables

The following environment variables are required for Whirlpool operations:

```
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
FEES_WALLET_SECRET_KEY="your-fees-wallet-secret-key-here"
```

Note: `BACKEND_URL` is no longer needed as there is no separate backend.

## Frontend API Usage

No changes are needed for the frontend code interacting with these endpoints. The API contracts remain the same, with the implementation now handled by Next.js API routes.

## Implementation Files

The implementation can be found in the following files:

- `/frontend/src/lib/whirlpool/client.ts` - Singleton implementation with dynamic imports
- `/frontend/src/lib/whirlpool/functions/createPool.ts` - Create pool functionality
- `/frontend/src/lib/whirlpool/functions/addLiquidity.ts` - Add liquidity functionality
- `/frontend/src/lib/whirlpool/functions/swap.ts` - Swap functionality
- `/frontend/src/app/api/pools/route.ts` - API routes for pool creation and listing
- `/frontend/src/app/api/pools/[address]/route.ts` - API route for pool details
- `/frontend/src/app/api/pools/add-liquidity/route.ts` - API route for adding liquidity
- `/frontend/src/app/api/pools/swap/route.ts` - API route for swapping tokens

## Shutting Down the Old Backend

The standalone Express backend can now be safely shut down. All functionality has been migrated to the Next.js API routes.

## Summary of Changes Made

1. Implemented a Singleton Pattern with dynamic imports for Whirlpool SDK initialization
2. Updated all business logic functions (createPool, addLiquidity, swap) to use dynamic imports
3. Removed the need for the `BACKEND_URL` environment variable
4. Enhanced error handling across API routes
5. Maintained API compatibility for frontend code

This solution provides a streamlined approach to the backend functionality, combining all code into one project while effectively managing the initialization issues with the Whirlpool SDK in Next.js server components. 