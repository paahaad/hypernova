import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

// Get the connection string from environment variable
const connectionString = process.env.SUPABASE_DATABASE_URL!;

if (!connectionString) {
  console.error('❌ Error: SUPABASE_DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Helper function for safe date conversion
function safeDate(input: any): Date {
  const now = new Date();
  
  try {
    if (!input) return now;
    
    if (typeof input === 'number') {
      // Check if it's a reasonable timestamp (between 2020 and 2030)
      if (input > 1577836800 && input < 1893456000) {
        return new Date(input * 1000); // Convert from seconds to milliseconds
      } else if (input > 1577836800000 && input < 1893456000000) {
        return new Date(input); // Already in milliseconds
      }
    } else if (input instanceof Date) {
      if (!isNaN(input.getTime())) {
        return input;
      }
    } else if (typeof input === 'string') {
      const parsed = new Date(input);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      // Try to parse as a number
      const num = parseInt(input);
      if (!isNaN(num)) {
        return safeDate(num);
      }
    }
  } catch (err) {
    console.warn(`Date parsing failed: ${err}`);
  }
  
  // Return current date as fallback
  return now;
}

async function migrateData() {
  console.log('🔄 Starting simple data migration...');
  
  // Create a new connection
  const sql = postgres(connectionString);
  
  try {
    // Check if old tables exist
    const oldTablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'presales'
      ) AS presales_exists,
      EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'pools'
      ) AS pools_exists;
    `;
    
    const presalesExists = oldTablesExist[0]?.presales_exists;
    const poolsExists = oldTablesExist[0]?.pools_exists;
    
    console.log(`Old tables check: presales=${presalesExists}, pools=${poolsExists}`);
    
    // Check if new tables exist
    const newTablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'tb_presales'
      ) AS tb_presales_exists,
      EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'tb_pools'
      ) AS tb_pools_exists;
    `;
    
    const tbPresalesExists = newTablesExist[0]?.tb_presales_exists;
    const tbPoolsExists = newTablesExist[0]?.tb_pools_exists;
    
    console.log(`New tables check: tb_presales=${tbPresalesExists}, tb_pools=${tbPoolsExists}`);
    
    if (!tbPresalesExists || !tbPoolsExists) {
      console.error('❌ New tables are not created yet. Please run migrations first.');
      return;
    }
    
    // If old tables don't exist, there's nothing to migrate
    if (!presalesExists && !poolsExists) {
      console.log('ℹ️ Old tables not found, skipping migration');
      return;
    }
    
    // Use postgres transaction to ensure consistency
    await sql.begin(async (tx) => {
      try {
        // Migrate presales data if the old table exists
        if (presalesExists) {
          console.log('🔄 Migrating presales data...');
          
          // Get all presales from the old table
          const presales = await tx`
            SELECT * FROM presales;
          `;
          
          console.log(`Found ${presales.length} presales to migrate`);
          
          // Process each presale record
          for (const presale of presales) {
            console.log(`Processing presale ID: ${presale.id}`);
            console.log(`End time: ${presale.end_time} (${typeof presale.end_time})`);
            
            // Generate a new UUID for this presale
            const newId = randomUUID();
            
            // Format dates using our safe converter
            const startTime = safeDate(new Date());
            const endTime = safeDate(presale.end_time);
            
            console.log(`Converted end time: ${endTime.toISOString()}`);
            
            // Calculate target amount from token price and total supply if available
            const totalSupply = presale.total_supply || 0;
            const tokenPrice = presale.token_price || 0;
            const targetAmount = totalSupply * tokenPrice;
            
            // Insert the presale record with explicit values
            await tx`
              INSERT INTO tb_presales (
                id, 
                name, 
                symbol,
                uri,
                description,
                total_supply,
                token_price,
                min_purchase,
                max_purchase,
                mint_address,
                presale_address,
                presale_percentage,
                total_raised,
                target_amount,
                start_time,
                end_time,
                status,
                user_address,
                finalized
              ) VALUES (
                ${newId},
                ${presale.name || null},
                ${presale.symbol || null},
                ${presale.uri || null},
                ${presale.description || null},
                ${presale.total_supply || null},
                ${presale.token_price || null},
                ${presale.min_purchase || null},
                ${presale.max_purchase || null},
                ${presale.mint_address || null},
                ${presale.presale_address || null},
                ${presale.presale_percentage || null},
                ${0}, /* Default total_raised to 0 */
                ${targetAmount || 0},
                ${startTime}, 
                ${endTime},
                ${'active'}, /* Default status */
                ${presale.user_address || null},
                ${false} /* Default finalized to false */
              )
              ON CONFLICT (id) DO NOTHING;
            `;
            
            console.log(`✅ Migrated presale ${presale.id} to UUID ${newId}`);
          }
          
          console.log(`✅ Presales migration completed`);
        }
        
        // Migrate pools data if the old table exists
        if (poolsExists) {
          console.log('🔄 Migrating pools data...');
          
          // Get all pools from the old table
          const pools = await tx`
            SELECT * FROM pools;
          `;
          
          console.log(`Found ${pools.length} pools to migrate`);
          
          // Create a mapping from old integer IDs to new UUIDs
          const poolIdMap = new Map();
          
          // Process each pool record
          for (const pool of pools) {
            console.log(`Processing pool ID: ${pool.id}`);
            
            // Generate a new UUID for this pool
            const newId = randomUUID();
            
            // Store the mapping
            poolIdMap.set(pool.id, newId);
            
            // Insert the pool record with explicit values
            await tx`
              INSERT INTO tb_pools (
                id, 
                pool_address, 
                lp_mint
              ) VALUES (
                ${newId},
                ${pool.pool_address || pool.whirlpool_address || 'unknown'},
                ${pool.lp_mint || 'unknown'}
              )
              ON CONFLICT (id) DO NOTHING;
            `;
            
            console.log(`✅ Migrated pool ${pool.id} to UUID ${newId}`);
          }
          
          console.log(`✅ Pools migration completed`);
        }
        
        console.log('✅ Transaction committing...');
      } catch (error) {
        console.error('❌ Error during migration transaction:', error);
        throw error; // This will cause the transaction to rollback
      }
    });
    
    console.log('✅ Data migration completed successfully');
  } catch (error) {
    console.error('❌ Error during data migration:', error);
    throw error;
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the migration
migrateData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }); 