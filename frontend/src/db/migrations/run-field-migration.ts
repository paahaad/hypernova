import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config();

// Get database connection string
const connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error("Database connection URL is not defined. Please set SUPABASE_DATABASE_URL in your .env file.");
  process.exit(1);
}

// Create postgres client
const postgresClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle client
const db = drizzle(postgresClient);

async function addFieldsMigration() {
  console.log('Starting field migration for frontend...');
  
  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Add presaleCompleted to tb_tokens
      await tx.execute(sql`
        ALTER TABLE tb_tokens
        ADD COLUMN IF NOT EXISTS "presaleCompleted" BOOLEAN DEFAULT FALSE;
      `);
      console.log('Added presaleCompleted to tb_tokens');

      // Add imageURI to tb_presales
      await tx.execute(sql`
        ALTER TABLE tb_presales
        ADD COLUMN IF NOT EXISTS "imageURI" TEXT;
      `);
      console.log('Added imageURI to tb_presales');

      // Add tokenA_mint_address and tokenB_mint_address to tb_pools
      await tx.execute(sql`
        ALTER TABLE tb_pools
        ADD COLUMN IF NOT EXISTS "tokenA_mint_address" TEXT;
      `);
      await tx.execute(sql`
        ALTER TABLE tb_pools
        ADD COLUMN IF NOT EXISTS "tokenB_mint_address" TEXT;
      `);
      console.log('Added tokenA_mint_address and tokenB_mint_address to tb_pools');

      // Check if any pools have missing token_a_id or token_b_id values
      const missingTokensCount = await tx.execute(sql`
        SELECT COUNT(*) as count FROM tb_pools 
        WHERE token_a_id IS NULL OR token_b_id IS NULL;
      `);
      
      if (missingTokensCount[0] && Number(missingTokensCount[0].count) > 0) {
        console.log(`Found ${missingTokensCount[0].count} pools with missing token references. Fixing...`);
        
        // For missing token_a_id rows, set a fallback or skip NOT NULL constraint
        await tx.execute(sql`
          DELETE FROM tb_pools
          WHERE token_a_id IS NULL OR token_b_id IS NULL;
        `);
        console.log('Removed pool records with missing token references');
      }

      // Update the tokenA_mint_address and tokenB_mint_address columns with data from tb_tokens
      await tx.execute(sql`
        UPDATE tb_pools
        SET "tokenA_mint_address" = t1.mint_address
        FROM tb_tokens t1
        WHERE tb_pools.token_a_id = t1.id AND tb_pools."tokenA_mint_address" IS NULL;
      `);

      await tx.execute(sql`
        UPDATE tb_pools
        SET "tokenB_mint_address" = t2.mint_address
        FROM tb_tokens t2
        WHERE tb_pools.token_b_id = t2.id AND tb_pools."tokenB_mint_address" IS NULL;
      `);
      console.log('Updated tokenA_mint_address and tokenB_mint_address with data from tb_tokens');

      // Check for any remaining NULL values
      const nullCheck = await tx.execute(sql`
        SELECT COUNT(*) as count FROM tb_pools 
        WHERE "tokenA_mint_address" IS NULL OR "tokenB_mint_address" IS NULL;
      `);
      
      if (nullCheck[0] && Number(nullCheck[0].count) > 0) {
        console.log(`Warning: Still have ${nullCheck[0].count} rows with null mint addresses. Setting defaults...`);
        
        // Set a default value for any remaining nulls
        await tx.execute(sql`
          UPDATE tb_pools
          SET "tokenA_mint_address" = 'unknown_mint_address'
          WHERE "tokenA_mint_address" IS NULL;
        `);
        
        await tx.execute(sql`
          UPDATE tb_pools
          SET "tokenB_mint_address" = 'unknown_mint_address'
          WHERE "tokenB_mint_address" IS NULL;
        `);
      }

      // Make tokenA_mint_address and tokenB_mint_address NOT NULL after populating data
      await tx.execute(sql`
        ALTER TABLE tb_pools
        ALTER COLUMN "tokenA_mint_address" SET NOT NULL;
      `);
      await tx.execute(sql`
        ALTER TABLE tb_pools
        ALTER COLUMN "tokenB_mint_address" SET NOT NULL;
      `);
      console.log('Set tokenA_mint_address and tokenB_mint_address to NOT NULL');
    });

    console.log('Frontend migration completed successfully');
    
    // Close the connection
    await postgresClient.end();
  } catch (error) {
    console.error('Frontend migration failed:', error);
    await postgresClient.end();
    process.exit(1);
  }
}

// Run the migration
addFieldsMigration()
  .then(() => {
    console.log('Frontend field migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Frontend field migration failed:', error);
    process.exit(1);
  }); 