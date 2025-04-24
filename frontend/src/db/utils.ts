/**
 * Database utility functions
 */

import { randomUUID } from 'crypto';

/**
 * Generates a UUID with the 'hyp_' prefix
 * Note: This is for application layer use, as databases typically use 
 * standard UUID format internally
 */
export function generateHypUuid(): string {
  return `hyp_${randomUUID().replace(/-/g, '')}`;
}

/**
 * Adds 'hyp_' prefix to a UUID if it doesn't already have it
 */
export function ensureHypPrefix(uuid: string): string {
  if (uuid.startsWith('hyp_')) {
    return uuid;
  }
  return `hyp_${uuid}`;
}

/**
 * Removes 'hyp_' prefix from a UUID if present
 */
export function removeHypPrefix(uuid: string): string {
  if (uuid.startsWith('hyp_')) {
    return uuid.substring(4);
  }
  return uuid;
}

/**
 * Transforms database results to ensure all UUIDs have 'hyp_' prefix
 */
export function transformDatabaseResults<T extends { id?: string } & Record<string, any>>(
  results: T[]
): T[] {
  return results.map((item) => {
    // Create a copy of the item that can be modified
    const transformed = { ...item } as any;
    
    // Add hyp_ prefix to id if it exists
    if (transformed.id && typeof transformed.id === 'string') {
      transformed.id = ensureHypPrefix(transformed.id);
    }
    
    // Process other UUID fields that might reference other entities
    Object.keys(transformed).forEach((key) => {
      if (
        key.endsWith('_id') && 
        transformed[key] && 
        typeof transformed[key] === 'string'
      ) {
        transformed[key] = ensureHypPrefix(transformed[key]);
      }
    });
    
    return transformed as T;
  });
} 