import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_presale_contributions } from '../schema';
import { transformDatabaseResults, removeHypPrefix } from '../utils';

export class PresaleContributionsRepository extends BaseRepository {
  async findAll() {
    const contributions = await this.db.select().from(tb_presale_contributions);
    return transformDatabaseResults(contributions);
  }

  async findById(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const contributions = await this.db
      .select()
      .from(tb_presale_contributions)
      .where(eq(tb_presale_contributions.id, dbId))
      .limit(1);
    
    return transformDatabaseResults(contributions);
  }

  async findByPresaleId(presaleId: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPresaleId = removeHypPrefix(presaleId);
    
    const contributions = await this.db
      .select()
      .from(tb_presale_contributions)
      .where(eq(tb_presale_contributions.presale_id, dbPresaleId));
    
    return transformDatabaseResults(contributions);
  }

  async findByUserWallet(userWallet: string) {
    const contributions = await this.db
      .select()
      .from(tb_presale_contributions)
      .where(eq(tb_presale_contributions.user_wallet, userWallet));
    
    return transformDatabaseResults(contributions);
  }

  async findByPresaleAndUser(presaleId: string, userWallet: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbPresaleId = removeHypPrefix(presaleId);
    
    const contributions = await this.db
      .select()
      .from(tb_presale_contributions)
      .where(
        and(
          eq(tb_presale_contributions.presale_id, dbPresaleId),
          eq(tb_presale_contributions.user_wallet, userWallet)
        )
      );
    
    return transformDatabaseResults(contributions);
  }

  async create(data: {
    presale_id: string;
    user_wallet: string;
    amount: string;
  }) {
    // Clean any IDs in the data
    const cleanedData = {
      ...data,
      presale_id: removeHypPrefix(data.presale_id),
    };
    
    const newContributions = await this.db.insert(tb_presale_contributions).values(cleanedData).returning();
    return transformDatabaseResults(newContributions);
  }

  async delete(id: string) {
    // Remove 'hyp_' prefix if present before querying the database
    const dbId = removeHypPrefix(id);
    
    const deletedContributions = await this.db
      .delete(tb_presale_contributions)
      .where(eq(tb_presale_contributions.id, dbId))
      .returning();
    
    return transformDatabaseResults(deletedContributions);
  }
} 