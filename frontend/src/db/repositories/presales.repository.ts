import { eq, and, lt } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_presales } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class PresalesRepository extends BaseRepository {
  async findAll() {
    const presales = await this.db.select().from(tb_presales);
    return transformDatabaseResults(presales);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const presales = await this.db
      .select()
      .from(tb_presales)
      .where(eq(tb_presales.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(presales);
  }

  async findByTokenId(tokenId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbTokenId = removeHypPrefix(tokenId);
    
    const presales = await this.db
      .select()
      .from(tb_presales)
      .where(eq(tb_presales.token_id, dbTokenId));
    
    return transformDatabaseResults(presales);
  }

  async findByMintAddress(mintAddress: string) {
    const presales = await this.db
      .select()
      .from(tb_presales)
      .where(eq(tb_presales.mint_address, mintAddress))
      .limit(1);
    
    return transformDatabaseResults(presales);
  }

  async findByPresaleAddress(presaleAddress: string) {
    const presales = await this.db
      .select()
      .from(tb_presales)
      .where(eq(tb_presales.presale_address, presaleAddress))
      .limit(1);
    
    return transformDatabaseResults(presales);
  }

  async findEndedNotFinalized(currentTime: number) {
    const presales = await this.db
      .select()
      .from(tb_presales)
      .where(
        and(
          lt(tb_presales.end_time, new Date(currentTime * 1000)), // Convert UNIX timestamp to Date
          eq(tb_presales.finalized, false)
        )
      );
    
    return transformDatabaseResults(presales);
  }

  async create(data: {
    name?: string;
    symbol?: string;
    uri?: string;
    description?: string;
    total_supply?: number;
    token_price?: number;
    min_purchase?: number;
    max_purchase?: number;
    mint_address?: string;
    presale_address?: string;
    presale_percentage?: number;
    end_time?: number;
    user_address?: string;
    finalized?: boolean;
    id?: string;
    token_id?: string;
    total_raised?: number;
    target_amount?: number;
    start_time?: Date;
    status?: string;
  }) {
    // Make sure token_id doesn't have the hyp_ prefix if it exists
    const cleanedData = { ...data };
    if (cleanedData.token_id) {
      cleanedData.token_id = removeHypPrefix(cleanedData.token_id);
    }
    
    // Convert end_time from timestamp to Date if provided
    if (cleanedData.end_time) {
      // Keep the original end_time value
      const timestamp = cleanedData.end_time;
      // Remove it from the cleanedData object
      delete cleanedData.end_time;
      
      // Use type assertion to help TypeScript understand the structure
      const dbValues = {
        ...cleanedData,
        end_time: new Date(timestamp * 1000)
      };
      
      const newPresales = await this.db.insert(tb_presales).values(dbValues as any).returning();
      return transformDatabaseResults(newPresales);
    }

    const newPresales = await this.db.insert(tb_presales).values(cleanedData as any).returning();
    return transformDatabaseResults(newPresales);
  }

  async update(id: string, data: Partial<typeof tb_presales.$inferInsert>) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    // Clean any IDs in the data
    const cleanedData = { ...data };
    if (cleanedData.token_id) {
      cleanedData.token_id = removeHypPrefix(cleanedData.token_id);
    }
    
    const updatedPresales = await this.db
      .update(tb_presales)
      .set({ ...cleanedData, updated_at: new Date() })
      .where(eq(tb_presales.id, dbId))
      .returning();
    
    return transformDatabaseResults(updatedPresales);
  }

  async updateByPresaleAddress(presaleAddress: string, data: Partial<typeof tb_presales.$inferInsert>) {
    const cleanedData = { ...data };
    if (cleanedData.token_id) {
      cleanedData.token_id = removeHypPrefix(cleanedData.token_id);
    }
    
    const updatedPresales = await this.db
      .update(tb_presales)
      .set({ ...cleanedData, updated_at: new Date() })
      .where(eq(tb_presales.presale_address, presaleAddress))
      .returning();
    
    return transformDatabaseResults(updatedPresales);
  }

  async delete(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedPresales = await this.db
      .delete(tb_presales)
      .where(eq(tb_presales.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedPresales);
  }
} 