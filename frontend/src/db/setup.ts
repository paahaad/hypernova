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
const connectionString = envSUPABASE_DATABASE_URL;

let postgresClient;
let dbInstance;

try {
  if (!connectionString) {
    throw new Error(
      "Database connection URL is not defined. Please set SUPABASE_DATABASE_URL in your .env.local file."
    );
  }

  console.log("Attempting to connect to database with URL:", 
    connectionString.replace(/(:.*@)/g, ':***@')); // Log URL with password masked

  // Create the connection with improved error handling
  postgresClient = postgres(connectionString, {
    max: 10, // Maximum pool size
    idle_timeout: 20, // Connection timeout in seconds
    connect_timeout: 10, // Connect timeout in seconds
    onnotice: (notice) => {
      console.log("Database notice:", notice);
    },
    onparameter: (parameterStatus) => {
      console.log("Database parameter:", parameterStatus);
    },
  });

  // Create the database instance
  dbInstance = drizzleClient(postgresClient);

  // Test the connection immediately
  (async () => {
    try {
      // Perform a simple query to check connection
      await postgresClient`SELECT 1`;
      console.log("✅ Database connection established and verified");
    } catch (error) {
      console.error("❌ Database connection test failed:", error);
      console.error("Please ensure PostgreSQL is running and accessible at the configured URL");
      console.error("Possible solutions:");
      console.error("1. Start PostgreSQL service if it's not running");
      console.error("2. Check database credentials in .env.local file");
      console.error("3. Verify the database exists and is accessible");
      console.error("4. Check network connectivity if using a remote database");
      
      // Re-throw for top-level catch
      throw error;
    }
  })();

  console.log("✅ Database client initialized");
} catch (error: unknown) {
  console.error("❌ Failed to initialize database:", error);
  
  // Type guard for error object
  const isErrorWithCode = (err: unknown): err is { code: string } => 
    typeof err === 'object' && err !== null && 'code' in err;
    
  const isErrorWithMessage = (err: unknown): err is { message: string } => 
    typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string';
  
  if (isErrorWithCode(error) && error.code === 'ECONNREFUSED') {
    console.error("Connection refused. Is PostgreSQL running on the specified host and port?");
  } else if (isErrorWithCode(error) && error.code === 'ENOTFOUND') {
    console.error("Host not found. Check the hostname in your connection string.");
  } else if (isErrorWithMessage(error) && error.message.includes('password authentication')) {
    console.error("Authentication failed. Check your database username and password.");
  } else if (isErrorWithMessage(error) && error.message.includes('does not exist')) {
    console.error("Database does not exist. Create the database or check the connection string.");
  }
  
  console.error("To fix this issue:");
  console.error("1. Ensure PostgreSQL is installed and running");
  console.error("2. Verify your connection string in .env.local file is correct");
  console.error("3. Check that the database exists and is accessible");
  console.error("4. Run the database migrations with: pnpm db:migrate");
  
  // Provide a minimal implementation for development
  console.error("⚠️ Application will not work correctly without a database connection");
  
  // Create a proxy that matches the expected type
  const errorProxy = new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'then') {
        // Special handling for Promise-like behavior
        return null;
      }
      // Return a function that throws an error for any method call
      return () => {
        throw new Error(`Database is not connected. Cannot perform operation: ${String(prop)}`);
      };
    }
  });
  
  // Use type assertion to tell TypeScript this matches the expected database type
  dbInstance = errorProxy as DbClient;
}

// Export the database instance
export const db = dbInstance;
