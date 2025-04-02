# Hypernova

A Solana-based DeFi platform built with Next.js and Express.js.

## Core Technologies

### Solana Development
- **@coral-xyz/anchor** (v0.28.0/0.31.0)
  - Core framework for Solana smart contract development
  - Provides a high-level interface for interacting with Solana programs
  - Used for program deployment and interaction

- **@solana/web3.js** (v1.98.0)
  - Core Solana web3 library
  - Handles connection management, transaction building, and account interactions
  - Essential for all Solana blockchain interactions

- **@solana/spl-token** (v0.4.12/0.4.13)
  - Standard library for SPL token operations
  - Used for token account management and transfers
  - Essential for handling SPL token operations

### DeFi Integration
- **@orca-so/whirlpools-sdk** (v0.13.17)
  - Orca Whirlpools SDK for liquidity pool operations
  - Used for creating and managing liquidity pools
  - Handles pool creation, swaps, and liquidity provision

- **@orca-so/common-sdk** (v0.6.11)
  - Common utilities for Orca protocol integration
  - Provides shared functionality for Orca operations

### Backend Technologies
- **Express.js** (v4.21.2)
  - Web application framework for Node.js
  - Used for building the REST API

- **TypeScript** (v5.8.2)
  - Type-safe JavaScript
  - Used throughout the project for better development experience

- **Swagger/OpenAPI**
  - **swagger-jsdoc** (v6.2.8)
  - **swagger-ui-express** (v5.0.1)
  - Used for API documentation

### Frontend Technologies
- **Next.js** (v14.2.16)
  - React framework for production
  - Used for building the frontend application

- **React** (v18)
  - UI library for building user interfaces

### Utility Libraries
- **bs58** (v6.0.0)
  - Base58 encoding/decoding
  - Used for Solana address encoding

- **decimal.js** (v10.5.0)
  - Decimal arithmetic library
  - Used for precise financial calculations

## Project Structure

```
hypernova/
├── backend/           # Express.js backend
│   ├── src/
│   │   ├── client/   # Solana client setup
│   │   ├── functions/# Business logic
│   │   └── types/    # TypeScript types
│   └── package.json
└── frontend/         # Next.js frontend
    ├── src/
    │   ├── lib/      # Shared libraries
    │   └── components/# React components
    └── package.json
```

## API Documentation

### Backend APIs (Express)

#### Pool Management
- **POST /pool**
  - Creates a new Whirlpool
  - Required fields: `tokenMintA`, `tokenMintB`, `userAddress`
  - Returns: `whirlpoolAddress`, transaction signature

- **POST /liquidity/add**
  - Adds liquidity to a Whirlpool
  - Required fields: `whirlpoolAddress`, `tokenAmountA`, `tokenAmountB`, `priceLower`, `priceUpper`, `userAddress`
  - Returns: Transaction signature

- **POST /liquidity/remove**
  - Removes liquidity from a Whirlpool position
  - Required fields: `whirlpoolAddress`, `positionAddress`, `liquidityAmount`
  - Returns: Transaction signature

- **GET /health**
  - Health check endpoint
  - Returns: API status

### Frontend APIs (Next.js)

#### Presale Management
- **GET /api/presale**
  - Fetches all presale listings
  - Returns: List of presale tokens

- **POST /api/presale**
  - Creates a new presale token
  - Required fields: `name`, `symbol`, `uri`, `totalSupply`, `tokenPrice`, `minPurchase`, `maxPurchase`, `presalePercentage`, `endTime`, `userAddress`
  - Returns: Transaction signature

- **GET /api/presale/[mint_address]**
  - Fetches specific presale token details
  - Returns: Presale token information

- **POST /api/presale/[mint_address]**
  - Calculates token amount for purchase
  - Required fields: `solAmount`
  - Returns: Calculated token amount and price information

- **POST /api/presale/buy**
  - Executes presale token purchase
  - Required fields: `mintAddress`, `amount`, `userAddress`
  - Returns: Transaction signature

#### Pool Management
- **GET /api/pools**
  - Fetches all liquidity pools
  - Returns: List of pools

- **POST /api/pools**
  - Creates a new liquidity pool
  - Required fields: `tokenMintA`, `tokenMintB`, `userAddress`
  - Returns: Pool address and transaction signature

- **GET /api/pools/[address]**
  - Fetches specific pool details
  - Returns: Pool information

- **POST /api/pools/add-liquidity**
  - Adds liquidity to a pool
  - Required fields: `poolAddress`, `tokenAAmount`, `tokenBAmount`, `priceLower`, `priceUpper`, `userAddress`
  - Returns: Transaction signature

## Key Features

1. **Solana Program Integration**
   - Custom program deployment and interaction
   - Token creation and management
   - Presale functionality

2. **DeFi Operations**
   - Liquidity pool creation and management
   - Token swaps
   - Liquidity provision

3. **API Services**
   - RESTful API endpoints
   - Swagger documentation
   - Type-safe API interactions

## Getting Started

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. Set up environment variables:
   - Create `.env` files in both backend and frontend directories
   - Add required Solana RPC URLs and other configuration

3. Start development servers:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## Environment Variables

Required environment variables:

```
# Backend
RPC_URL=your_solana_rpc_url
PROGRAM_ID=your_program_id

# Frontend
NEXT_PUBLIC_RPC_URL=your_solana_rpc_url
NEXT_PUBLIC_PROGRAM_ID=your_program_id
BACKEND_URL=http://localhost:4000
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.