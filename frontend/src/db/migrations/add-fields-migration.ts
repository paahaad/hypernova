import { db } from '../setup';
import { sql } from 'drizzle-orm';

export async function addFieldsMigration() {
  console.log('Starting field migration...');
  
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

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addFieldsMigration()
    .then(() => {
      console.log('Field migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Field migration failed:', error);
      process.exit(1);
    });
} 