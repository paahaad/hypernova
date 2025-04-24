import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { parse } from 'pg-connection-string';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables
dotenv.config();

// Direct PostgreSQL connection for Drizzle
if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error('SUPABASE_DATABASE_URL environment variable is required');
}

const connectionString = process.env.SUPABASE_DATABASE_URL;
const { host, port, database, user, password } = parse(connectionString);

// For migrations and schema changes
export const migrationClient = postgres(connectionString, { max: 1 });

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    // Try to run a simple query
    await queryClient`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}