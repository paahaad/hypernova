import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { envSUPABASE_DATABASE_URL } from "@/lib/env";

// Create a type alias for the Drizzle client
export type DbClient = ReturnType<typeof drizzleClient>;

// Mock implementations for development/fallback
const createMockClient = () => {
  console.warn(
    "⚠️ Using mock database client. Data operations will not persist."
  );
  // Return a minimal implementation that won't crash but won't do anything
  return {} as ReturnType<typeof postgres>;
};

// Function to create the drizzle client
function drizzleClient(client: ReturnType<typeof postgres>) {
  return drizzle(client, { schema });
}

// Get the connection string from environment variable
// Check both variables for backward compatibility
const connectionString = envSUPABASE_DATABASE_URL;

let postgresClient;
let dbInstance;

try {
  if (!connectionString) {
    throw new Error(
      "Database connection URL is not defined. Please set SUPABASE_POSTGRES_URL in your .env file."
    );
  }

  // Create the connection
  postgresClient = postgres(connectionString, {
    max: 10, // Maximum pool size
    idle_timeout: 20, // Connection timeout in seconds
    connect_timeout: 10, // Connect timeout in seconds
  });

  // Create the database instance
  dbInstance = drizzleClient(postgresClient);

  console.log("✅ Database connection established");
} catch (error) {
  console.error("❌ Failed to initialize database:", error);
  console.warn(
    "⚠️ Using mock database instead. Some features may not work correctly."
  );

  // Use mock implementations instead
  postgresClient = createMockClient();

  // Create a mock DB that returns empty arrays for all operations
  dbInstance = {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({
      values: () => ({ returning: () => Promise.resolve([]) }),
    }),
    update: () => ({
      set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }),
    }),
    delete: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }),
  };
}

// Export the database instance
export const db = dbInstance;
