import { pgTable, serial, text, timestamp, numeric, boolean } from 'drizzle-orm/pg-core';

export const pools = pgTable('pools', {
  id: serial('id').primaryKey(),
  whirlpoolAddress: text('whirlpool_address').notNull().unique(),
  tokenMintA: text('token_mint_a').notNull(),
  tokenMintB: text('token_mint_b').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  address: text('address').notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  poolId: serial('pool_id').references(() => pools.id),
  userId: serial('user_id').references(() => users.id),
  amount: numeric('amount').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 