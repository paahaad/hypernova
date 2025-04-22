import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { tb_presale_contributions } from '../schema';

export class PresaleContributionsRepository extends BaseRepository {
  async findAll() {
    return await this.db.select().from(tb_presale_contributions);
  }

  async findById(id: string) {
    return await this.db
      .select()
      .from(tb_presale_contributions)
      .where(eq(tb_presale_contributions.id, id))
      .limit(1);
  }

  async findByPresaleId(presaleId: string) {
    return await this.db
      .select()
      .from(tb_presale_contributions)
      .where(eq(tb_presale_contributions.presale_id, presaleId));
  }

  async findByUserWallet(userWallet: string) {
    return await this.db
      .select()
      .from(tb_presale_contributions)
      .where(eq(tb_presale_contributions.user_wallet, userWallet));
  }

  async findByPresaleAndUser(presaleId: string, userWallet: string) {
    return await this.db
      .select()
      .from(tb_presale_contributions)
      .where(
        and(
          eq(tb_presale_contributions.presale_id, presaleId),
          eq(tb_presale_contributions.user_wallet, userWallet)
        )
      );
  }

  async create(data: {
    presale_id: string;
    user_wallet: string;
    amount: number;
  }) {
    return await this.db.insert(tb_presale_contributions).values(data).returning();
  }

  async delete(id: string) {
    return await this.db
      .delete(tb_presale_contributions)
      .where(eq(tb_presale_contributions.id, id))
      .returning();
  }
} 