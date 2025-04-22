/**
 * Database migration script
 * This script applies database migrations to set up the schema
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the connection string from environment variable
const connectionString = process.env.SUPABASE_POSTGRES_URL!;

if (!connectionString) {
  console.error('Error: SUPABASE_POSTGRES_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Create a new connection
    const connection = postgres(connectionString);
    
    // Create a drizzle instance
    const db = drizzle(connection);
    
    // Run migrations
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    
    console.log('✅ Database migration completed successfully!');
    
    // Close the connection
    await connection.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running database migration:', error);
    process.exit(1);
  }
}

main(); 