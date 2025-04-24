   // frontend/src/db/migrations/migrate-existing-data.ts
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';
   import { sql } from 'drizzle-orm';
   import * as dotenv from 'dotenv';

   // Load environment variables
   dotenv.config();

   // Get the connection string from environment variable
   const connectionString = process.env.SUPABASE_DATABASE_URL!;

   if (!connectionString) {
     console.error('❌ Error: SUPABASE_DATABASE_URL environment variable is not set');
     process.exit(1);
   }

   async function migrateData() {
     console.log('🔄 Starting data migration from old tables to new ones...');
     
     // Create a new connection
     const connection = postgres(connectionString);
     
     // Create a drizzle instance
     const db = drizzle(connection);
     
     try {
       // Check if old tables exist
       const oldTablesExist = await db.execute(sql`
         SELECT EXISTS (
           SELECT FROM information_schema.tables WHERE table_name = 'presales'
         ) AS presales_exists,
         EXISTS (
           SELECT FROM information_schema.tables WHERE table_name = 'pools'
         ) AS pools_exists;
       `);
       
       const presalesExists = oldTablesExist[0]?.presales_exists;
       const poolsExists = oldTablesExist[0]?.pools_exists;
       
       console.log(`Old tables check: presales=${presalesExists}, pools=${poolsExists}`);
       
       // Check if new tables exist
       const newTablesExist = await db.execute(sql`
         SELECT EXISTS (
           SELECT FROM information_schema.tables WHERE table_name = 'tb_presales'
         ) AS tb_presales_exists,
         EXISTS (
           SELECT FROM information_schema.tables WHERE table_name = 'tb_pools'
         ) AS tb_pools_exists;
       `);
       
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
       
       // Create a transaction using postgres-js's API
       await connection.begin(async sql => {
         try {
           // Create a helper function to convert integer to UUID
           console.log('🛠️ Creating helper function for integer to UUID conversion...');
           await sql`
             CREATE OR REPLACE FUNCTION int_to_uuid(i integer) RETURNS uuid AS $$
             BEGIN
               -- Use MD5 to create deterministic UUIDs from integers
               RETURN uuid_in(overlay(overlay(md5(i::text) placing '4' from 13) placing '8' from 17)::cstring);
             END;
             $$ LANGUAGE plpgsql;
           `;

           // Create a timestamp conversion helper function
           await sql`
             CREATE OR REPLACE FUNCTION epoch_to_timestamp(epoch bigint) RETURNS timestamp AS $$
             BEGIN
               RETURN to_timestamp(epoch);
             EXCEPTION WHEN OTHERS THEN
               RETURN NOW();
             END;
             $$ LANGUAGE plpgsql;
           `;
           
           // Migrate presales data if the old table exists
           if (presalesExists) {
             console.log('🔄 Migrating presales data...');
             
             // Get columns from the old presales table
             const presalesColumns = await sql`
               SELECT column_name, data_type
               FROM information_schema.columns
               WHERE table_name = 'presales'
               ORDER BY ordinal_position;
             `;
             
             const presalesColumnNames = presalesColumns.map(col => col.column_name);
             const presalesColumnTypes = presalesColumns.reduce((acc, col) => {
               acc[col.column_name] = col.data_type;
               return acc;
             }, {});
             
             console.log('Available columns in presales:', presalesColumnNames);
             console.log('Column types:', presalesColumnTypes);
             
             // Current time for default values
             const currentTime = Math.floor(Date.now() / 1000);
             
             // First fetch a sample to understand the data
             const sampleData = await sql`
               SELECT * FROM presales LIMIT 1;
             `;
             
             console.log('Sample presale data:', sampleData[0]);
             
             // Create new presales using a different approach
             // Insert records one by one to handle type conversions more carefully
             const allPresales = await sql`SELECT * FROM presales`;
             
             console.log(`Found ${allPresales.length} presales to migrate`);
             
             for (const presale of allPresales) {
               // Convert Unix timestamp to real timestamp if necessary
               let endTimeQuery;
               if (typeof presale.end_time === 'number') {
                 // Use PostgreSQL's to_timestamp function directly in the SQL query
                 endTimeQuery = sql`to_timestamp(${presale.end_time.toString()})`;
               } else if (typeof presale.end_time === 'string' && !isNaN(parseInt(presale.end_time))) {
                 // If it's a string that can be parsed as a number, convert to integer first
                 endTimeQuery = sql`to_timestamp(${presale.end_time})`;
               } else {
                 // Default to current time if we can't parse it
                 endTimeQuery = sql`NOW()`;
               }
               
               console.log(`End time for presale ${presale.id}: ${presale.end_time} (${typeof presale.end_time})`);
               
               // Generate a UUID from the integer ID
               const id = await sql`SELECT int_to_uuid(${presale.id}) as uuid`;
               const uuid = id[0].uuid;
               
               console.log(`Migrating presale ${presale.id} to UUID ${uuid}`);
               
               await sql`
                 INSERT INTO tb_presales(
                   id, name, symbol, uri, description, total_supply, 
                   token_price, min_purchase, max_purchase, mint_address, 
                   presale_address, presale_percentage, end_time, 
                   user_address, total_raised, target_amount, start_time, 
                   status, finalized
                 ) VALUES (
                   ${uuid},
                   ${presale.name},
                   ${presale.symbol},
                   ${presale.uri},
                   ${presale.description},
                   ${presale.total_supply},
                   ${presale.token_price},
                   ${presale.min_purchase},
                   ${presale.max_purchase},
                   ${presale.mint_address},
                   ${presale.presale_address},
                   ${presale.presale_percentage},
                   ${endTimeQuery},
                   ${presale.user_address},
                   0,
                   COALESCE(${presale.total_supply * presale.token_price}, 0),
                   NOW(),
                   'active',
                   false
                 )
                 ON CONFLICT (id) DO NOTHING;
               `;
             }
             
             console.log(`✅ Presales migration completed`);
           }
           
           // Migrate pools data if the old table exists
           if (poolsExists) {
             console.log('🔄 Migrating pools data...');
             
             // Get columns from the old pools table
             const poolsColumns = await sql`
               SELECT column_name, data_type
               FROM information_schema.columns
               WHERE table_name = 'pools'
               ORDER BY ordinal_position;
             `;
             
             const poolsColumnNames = poolsColumns.map(col => col.column_name);
             const poolsColumnTypes = poolsColumns.reduce((acc, col) => {
               acc[col.column_name] = col.data_type;
               return acc;
             }, {});
             
             console.log('Available columns in pools:', poolsColumnNames);
             console.log('Column types:', poolsColumnTypes);
             
             // Get all pools
             const allPools = await sql`SELECT * FROM pools`;
             
             console.log(`Found ${allPools.length} pools to migrate`);
             
             // Check if the table has the expected structure
             const hasExpectedColumns = poolsColumnNames.includes('id');
             
             if (!hasExpectedColumns) {
               console.log('Pool table has different structure than expected. Adapting migration strategy.');
               
               // For each pool in the existing table
               for (let index = 0; index < allPools.length; index++) {
                 const pool = allPools[index];
                 
                 // Generate a deterministic UUID based on index
                 const id = await sql`SELECT int_to_uuid(${index + 1}) as uuid`;
                 const uuid = id[0].uuid;
                 
                 console.log(`Migrating pool at index ${index} to UUID ${uuid}`);
                 console.log('Pool data:', JSON.stringify(pool));
                 
                 // Check which columns exist and use them accordingly
                 const poolAddress = pool.whirlpool_address || pool.pool_address || null;
                 
                 if (!poolAddress) {
                   console.log(`Skipping pool at index ${index} - no pool address found`);
                   continue;
                 }
                 
                 // Insert with the available data
                 await sql`
                   INSERT INTO tb_pools(
                     id, pool_address, lp_mint
                   ) VALUES (
                     ${uuid},
                     ${poolAddress},
                     'unknown'
                   )
                   ON CONFLICT (id) DO NOTHING;
                 `;
               }
             } else {
               // Original migration path for expected schema
               for (const pool of allPools) {
                 // Generate UUIDs from integer IDs
                 const id = await sql`SELECT int_to_uuid(${pool.id}) as uuid`;
                 const uuid = id[0].uuid;
                 
                 // Generate UUIDs for related token IDs if they exist
                 let tokenAId = null;
                 if (pool.token_a_id) {
                   const tokenA = await sql`SELECT int_to_uuid(${pool.token_a_id}) as uuid`;
                   tokenAId = tokenA[0].uuid;
                 }
                 
                 let tokenBId = null;
                 if (pool.token_b_id) {
                   const tokenB = await sql`SELECT int_to_uuid(${pool.token_b_id}) as uuid`;
                   tokenBId = tokenB[0].uuid;
                 }
                 
                 console.log(`Migrating pool ${pool.id} to UUID ${uuid}`);
                 
                 await sql`
                   INSERT INTO tb_pools(
                     id, pool_address, token_a_id, token_b_id, lp_mint
                   ) VALUES (
                     ${uuid},
                     ${pool.pool_address},
                     ${tokenAId},
                     ${tokenBId},
                     COALESCE(${pool.lp_mint}, 'unknown')
                   )
                   ON CONFLICT (id) DO NOTHING;
                 `;
               }
             }
             
             console.log(`✅ Pools migration completed`);
           }
           
           // Clean up helper functions
           await sql`DROP FUNCTION IF EXISTS int_to_uuid(integer);`;
           await sql`DROP FUNCTION IF EXISTS epoch_to_timestamp(bigint);`;
           
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
       await connection.end();
     }
   }

   // Run the migration
   migrateData()
     .then(() => process.exit(0))
     .catch(err => {
       console.error('❌ Migration failed:', err);
       process.exit(1);
     });