import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_tokens } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class TokensRepository extends BaseRepository {
  async findAll() {
    const tokens = await this.db.select().from(tb_tokens);
    return transformDatabaseResults(tokens);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const tokens = await this.db
      .select()
      .from(tb_tokens)
      .where(eq(tb_tokens.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(tokens);
  }

  async findByMintAddress(mintAddress: string) {
    const tokens = await this.db
      .select()
      .from(tb_tokens)
      .where(eq(tb_tokens.mint_address, mintAddress))
      .limit(1);
    
    return transformDatabaseResults(tokens);
  }

  async create(data: {
    mint_address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo_uri?: string;
  }) {
    const newTokens = await this.db.insert(tb_tokens).values(data).returning();
    return transformDatabaseResults(newTokens);
  }

  async update(id: string, data: Partial<typeof tb_tokens.$inferInsert>) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const updatedTokens = await this.db
      .update(tb_tokens)
      .set({ ...data, updated_at: new Date() })
      .where(eq(tb_tokens.id, dbId))
      .returning();
    
    return transformDatabaseResults(updatedTokens);
  }

  async delete(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedTokens = await this.db
      .delete(tb_tokens)
      .where(eq(tb_tokens.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedTokens);
  }
} 