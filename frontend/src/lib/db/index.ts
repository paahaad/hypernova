import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// Create the connection
const client = postgres(databaseUrl);

// Create the Drizzle client
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof schema; 