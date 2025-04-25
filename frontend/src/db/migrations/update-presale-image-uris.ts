import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import fetch from 'node-fetch';

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

// Define metadata interface for proper type checking
interface MetadataProperties {
  image?: string;
  imageUri?: string;
}

interface Metadata {
  image?: string;
  imageUri?: string;
  properties?: MetadataProperties;
}

/**
 * Fetch metadata from URI and extract the image URI
 */
async function fetchMetadata(uri: string): Promise<string | null> {
  try {
    // Skip if URI is invalid
    if (!uri || !uri.startsWith('http')) {
      console.warn(`Invalid URI: ${uri}`);
      return null;
    }
    
    const response = await fetch(uri);
    
    if (!response.ok) {
      console.warn(`Failed to fetch metadata from ${uri}: ${response.status}`);
      return null;
    }
    
    const metadata = await response.json() as Metadata;
    
    // Check if there's an image field in the metadata
    if (metadata.image) {
      return metadata.image;
    } else if (metadata.properties?.image) {
      return metadata.properties.image;
    } else if (metadata.imageUri) {
      return metadata.imageUri;
    } else if (metadata.properties?.imageUri) {
      return metadata.properties.imageUri;
    }
    
    console.warn(`No image field found in metadata from ${uri}`);
    return null;
  } catch (error) {
    console.error(`Error fetching metadata from ${uri}:`, error);
    return null;
  }
}

interface Presale {
  id: string;
  uri: string;
  imageURI: string | null;
}

async function updatePresaleImageURIs() {
  console.log('Starting update of presale image URIs...');
  
  try {
    // Get all presales with URI but no imageURI
    const result = await db.execute(sql`
      SELECT id, uri, "imageURI" FROM tb_presales 
      WHERE uri IS NOT NULL AND uri != ''
    `);

    // Type assertion with proper mapping
    const presales = (result as Record<string, unknown>[]).map(row => ({
      id: row.id as string,
      uri: row.uri as string,
      imageURI: row.imageURI as string | null
    }));
    
    console.log(`Found ${presales.length} presales to process`);
    
    // Process each presale
    for (const presale of presales) {
      console.log(`Processing presale ${presale.id} with URI: ${presale.uri}`);
      
      // Skip if already has imageURI
      if (presale.imageURI) {
        console.log(`Presale ${presale.id} already has imageURI: ${presale.imageURI}`);
        continue;
      }
      
      // Fetch the metadata and extract image URI
      const imageURI = await fetchMetadata(presale.uri);
      
      if (imageURI) {
        // Update the imageURI field
        await db.execute(sql`
          UPDATE tb_presales
          SET "imageURI" = ${imageURI}
          WHERE id = ${presale.id}
        `);
        console.log(`Updated presale ${presale.id} with imageURI: ${imageURI}`);
      } else {
        console.warn(`Could not extract image URI for presale ${presale.id}`);
      }
    }
    
    console.log('Update of presale image URIs completed successfully');
    
    // Close the connection
    await postgresClient.end();
  } catch (error) {
    console.error('Update of presale image URIs failed:', error);
    await postgresClient.end();
    process.exit(1);
  }
}

// Run the update
updatePresaleImageURIs()
  .then(() => {
    console.log('Presale image URIs update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Presale image URIs update failed:', error);
    process.exit(1);
  }); 