# Pool UI and Database Updates

## Database Updates
1. **Schema Updates**
   - Added new columns to the `tb_pools` table:
     - `liquidity`: numeric value for pool liquidity
     - `volume_24h`: numeric value for 24-hour volume
     - `fees_24h`: numeric value for 24-hour fees
     - `apr_24h`: numeric value for 24-hour APR
     - `tick_spacing`: integer for tick spacing
     - `fee_rate`: integer for fee rate
   - Created indexes for faster querying
     - Index on `liquidity` (descending)
     - Index on `volume_24h` (descending)

2. **Migration**
   - Created SQL migration file: `frontend/src/db/migrations/pool-metrics-migration.sql`
   - Created script to run migration: `frontend/src/db/migrations/run-pool-metrics-migration.ts`
   - Added `migrate:pool-metrics` command to package.json

## API Updates
1. **Added Token Logo Support**
   - Now fetches token logo URIs from the database
   - Passes logo URIs to the frontend

2. **Real Metrics Integration**
   - Replaced mock metrics with real data from the database
   - Added proper currency formatting for liquidity and volume

## UI Updates
1. **Display Token Logos**
   - Added image components with fallback for token logos
   - Improved layout for token display

2. **Table Structure Changes**
   - Removed APR and Fees columns as requested
   - Show Whirlpool address, token info, liquidity and volume
   - Made rows clickable to navigate to pool details

## How to Apply Changes
1. Run the migration:
   ```bash
   npm run migrate:pool-metrics
   ```

2. Restart your application:
   ```bash
   npm run dev
   ```

The updated UI now displays token logos fetched from the database and shows real metrics stored in the database for each pool. 