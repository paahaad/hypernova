import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Get the connection string from environment variable
const connectionString = process.env.SUPABASE_DATABASE_URL!;

if (!connectionString) {
  console.error('❌ Error: SUPABASE_DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  console.log('🔄 Running pool metrics migration...');
  
  // Read migration SQL
  const migrationPath = path.join(__dirname, 'pool-metrics-migration.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  // Create a new connection
  const sql = postgres(connectionString);
  
  try {
    // Check if the pools table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'tb_pools'
      ) AS pools_exists;
    `;
    
    const poolsTableExists = tableExists[0]?.pools_exists;
    
    if (!poolsTableExists) {
      console.error('❌ tb_pools table does not exist. Please run initial migrations first.');
      return;
    }
    
    console.log('✅ tb_pools table exists, proceeding with migration...');
    
    // Use postgres transaction to ensure consistency
    await sql.begin(async (tx) => {
      try {
        // Run the migration SQL
        await tx.unsafe(migrationSQL);
        console.log('✅ Schema updates completed');

        // Optionally populate with some sample metrics for demonstration
        const pools = await tx`SELECT id FROM tb_pools`;
        
        for (const pool of pools) {
          // Generate some random metrics for each pool
          await tx`
            UPDATE tb_pools
            SET 
              liquidity = ${Math.random() * 1000000},
              volume_24h = ${Math.random() * 100000}
            WHERE id = ${pool.id}
          `;
        }
        
        console.log(`✅ Updated ${pools.length} pools with sample metrics`);
      } catch (error) {
        console.error('❌ Error during migration:', error);
        throw error; // This will cause the transaction to rollback
      }
    });
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 