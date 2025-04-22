import { eq } from 'drizzle-orm';
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

  async findByPresaleAddress(presaleAddress: string) {
    const presales = await this.db
      .select()
      .from(tb_presales)
      .where(eq(tb_presales.presale_address, presaleAddress))
      .limit(1);
    
    return transformDatabaseResults(presales);
  }

  async create(data: {
    token_id: string;
    presale_address: string;
    total_raised: number;
    target_amount: number;
    start_time: Date;
    end_time: Date;
    status?: string;
  }) {
    // Make sure token_id doesn't have the hyp_ prefix
    const cleanedData = {
      ...data,
      token_id: removeHypPrefix(data.token_id)
    };
    
    const newPresales = await this.db.insert(tb_presales).values(cleanedData).returning();
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