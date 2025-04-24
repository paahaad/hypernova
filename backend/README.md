# Hypernova Backend

This is the backend for the Hypernova application, which integrates with Supabase for database operations.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the root of the `backend` directory with the following variables:
```
# Solana RPC
RPC_ENDPOINT=https://api.testnet.sonic.game/
FEES_WALLET_SECRET_KEY=your_wallet_secret_key

# Server
PORT=4000

# Database 
DATABASE_URL=postgresql://postgres:password@db.example.supabase.co:5432/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Replace the `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` with your actual Supabase credentials.

4. Generate the database schema:
```bash
pnpm db:generate
```

## Database Integration

The backend uses:
- **Supabase**: As the PostgreSQL hosting provider
- **Drizzle ORM**: For database queries and schema management
- **Postgres.js**: As the PostgreSQL client

## Running the Server

```bash
pnpm dev
```

The server will start on port 4000 (or the port specified in your .env file).

## API Documentation

API documentation is available at http://localhost:4000/api-docs when the server is running.

## Database Structure

The backend uses the same schema as the frontend, connecting to the same Supabase database:

- `tb_tokens`: Stores information about tokens
- `tb_presales`: Manages presale events
- `tb_pools`: Tracks liquidity pools
- `tb_liquidity_positions`: Records user liquidity positions
- `tb_swaps`: Logs swap transactions
- `tb_fees`: Tracks pool fees
- `tb_presale_contributions`: Records presale contributions 