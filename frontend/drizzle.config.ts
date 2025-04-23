import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error('SUPABASE_DATABASE_URL environment variable is required');
}

const connectionString = process.env.SUPABASE_DATABASE_URL;
const { host, port, database, user, password } = parse(connectionString);

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: host || 'localhost',
    port: port ? parseInt(port) : 5432,
    database: database || 'postgres',
    user: user || 'postgres',
    password: password || 'postgres',
    ssl: { rejectUnauthorized: false },
  },
} as Config; 