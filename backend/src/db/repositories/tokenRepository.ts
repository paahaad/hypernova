import { eq } from 'drizzle-orm';
import { db } from '../config';
import { tb_tokens } from '../schema';

export interface Token {
  mint_address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo_uri?: string;
}

export const tokenRepository = {
  /**
   * Create a new token
   */
  async create(tokenData: Token) {
    return db.insert(tb_tokens).values(tokenData);
  },

  /**
   * Find a token by mint address
   */
  async findByMintAddress(mintAddress: string) {
    return db.query.tb_tokens.findFirst({
      where: eq(tb_tokens.mint_address, mintAddress)
    });
  },

  /**
   * Ensure token exists, creating it if it doesn't
   */
  async ensureToken(tokenData: Token) {
    const existing = await this.findByMintAddress(tokenData.mint_address);
    if (!existing) {
      await this.create(tokenData);
      return this.findByMintAddress(tokenData.mint_address);
    }
    return existing;
  }
}; 