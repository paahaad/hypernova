import { pgTable, text, timestamp, uuid, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// Custom UUID generation function that prefixes with 'hyp_'
const hypUuid = () => sql`gen_random_uuid()`; // We'll handle the prefix in the application layer

// Tokens table
export const tb_tokens = pgTable('tb_tokens', {
  id: uuid('id').primaryKey().default(hypUuid()),
  mint_address: text('mint_address').unique().notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  decimals: integer('decimals').notNull(),
  logo_uri: text('logo_uri'),
  presaleCompleted: boolean('presaleCompleted').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Token relations
export const tokensRelations = relations(tb_tokens, ({ many }) => ({
  poolsAsTokenA: many(tb_pools, { relationName: 'pool_token_a' }),
  poolsAsTokenB: many(tb_pools, { relationName: 'pool_token_b' }),
  swapsAsTokenIn: many(tb_swaps, { relationName: 'swap_token_in' }),
  swapsAsTokenOut: many(tb_swaps, { relationName: 'swap_token_out' })
}));

// Presales table
export const tb_presales = pgTable('tb_presales', {
  id: uuid('id').primaryKey().default(hypUuid()),
  token_id: uuid('token_id').references(() => tb_tokens.id),
  name: text('name'),
  symbol: text('symbol'),
  uri: text('uri'),
  imageURI: text('imageURI'),
  description: text('description'),
  total_supply: numeric('total_supply'),
  token_price: numeric('token_price'),
  min_purchase: numeric('min_purchase'),
  max_purchase: numeric('max_purchase'),
  mint_address: text('mint_address').unique(),
  presale_address: text('presale_address').unique().notNull(),
  presale_percentage: numeric('presale_percentage'),
  total_raised: numeric('total_raised').notNull(),
  target_amount: numeric('target_amount').notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  status: text('status').notNull().default('active'), // 'active', 'completed', 'cancelled'
  user_address: text('user_address'),
  finalized: boolean('finalized').default(false),
  recipient_wallet: text('recipient_wallet'),
  finalized_at: timestamp('finalized_at'),
  finalize_tx: text('finalize_tx'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Presale relations
export const presalesRelations = relations(tb_presales, ({ one, many }) => ({
  token: one(tb_tokens, {
    fields: [tb_presales.token_id],
    references: [tb_tokens.id]
  }),
  contributions: many(tb_presale_contributions)
}));

// Pools table
export const tb_pools = pgTable('tb_pools', {
  id: uuid('id').primaryKey().default(hypUuid()),
  pool_address: text('pool_address').unique().notNull(),
  token_a_id: uuid('token_a_id').references(() => tb_tokens.id),
  token_b_id: uuid('token_b_id').references(() => tb_tokens.id),
  tokenA_mint_address: text('tokenA_mint_address').notNull(),
  tokenB_mint_address: text('tokenB_mint_address').notNull(),
  lp_mint: text('lp_mint').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Pool relations
export const poolsRelations = relations(tb_pools, ({ one, many }) => ({
  tokenA: one(tb_tokens, {
    fields: [tb_pools.token_a_id],
    references: [tb_tokens.id],
    relationName: 'pool_token_a'
  }),
  tokenB: one(tb_tokens, {
    fields: [tb_pools.token_b_id],
    references: [tb_tokens.id],
    relationName: 'pool_token_b'
  }),
  liquidityPositions: many(tb_liquidity_positions),
  swaps: many(tb_swaps),
  fees: many(tb_fees)
}));

// Liquidity positions table
export const tb_liquidity_positions = pgTable('tb_liquidity_positions', {
  id: uuid('id').primaryKey().default(hypUuid()),
  user_wallet: text('user_wallet').notNull(),
  pool_id: uuid('pool_id').references(() => tb_pools.id),
  amount_token_a: numeric('amount_token_a').notNull(),
  amount_token_b: numeric('amount_token_b').notNull(),
  lp_tokens: numeric('lp_tokens').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Liquidity position relations
export const liquidityPositionsRelations = relations(tb_liquidity_positions, ({ one }) => ({
  pool: one(tb_pools, {
    fields: [tb_liquidity_positions.pool_id],
    references: [tb_pools.id]
  })
}));

// Swaps table
export const tb_swaps = pgTable('tb_swaps', {
  id: uuid('id').primaryKey().default(hypUuid()),
  pool_id: uuid('pool_id').references(() => tb_pools.id),
  user_wallet: text('user_wallet').notNull(),
  amount_in: numeric('amount_in').notNull(),
  amount_out: numeric('amount_out').notNull(),
  token_in_id: uuid('token_in_id').references(() => tb_tokens.id),
  token_out_id: uuid('token_out_id').references(() => tb_tokens.id),
  tx_hash: text('tx_hash').unique().notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

// Swap relations
export const swapsRelations = relations(tb_swaps, ({ one }) => ({
  pool: one(tb_pools, {
    fields: [tb_swaps.pool_id],
    references: [tb_pools.id]
  }),
  tokenIn: one(tb_tokens, {
    fields: [tb_swaps.token_in_id],
    references: [tb_tokens.id],
    relationName: 'swap_token_in'
  }),
  tokenOut: one(tb_tokens, {
    fields: [tb_swaps.token_out_id],
    references: [tb_tokens.id],
    relationName: 'swap_token_out'
  })
}));

// Fees table
export const tb_fees = pgTable('tb_fees', {
  id: uuid('id').primaryKey().default(hypUuid()),
  pool_id: uuid('pool_id').references(() => tb_pools.id),
  user_wallet: text('user_wallet').notNull(),
  unclaimed_fee_a: numeric('unclaimed_fee_a').notNull(),
  unclaimed_fee_b: numeric('unclaimed_fee_b').notNull(),
  last_claimed_at: timestamp('last_claimed_at')
});

// Fee relations
export const feesRelations = relations(tb_fees, ({ one }) => ({
  pool: one(tb_pools, {
    fields: [tb_fees.pool_id],
    references: [tb_pools.id]
  })
}));

// Presale contributions table
export const tb_presale_contributions = pgTable('tb_presale_contributions', {
  id: uuid('id').primaryKey().default(hypUuid()),
  presale_id: uuid('presale_id').references(() => tb_presales.id),
  user_wallet: text('user_wallet').notNull(),
  amount: numeric('amount').notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

// Presale contribution relations
export const presaleContributionsRelations = relations(tb_presale_contributions, ({ one }) => ({
  presale: one(tb_presales, {
    fields: [tb_presale_contributions.presale_id],
    references: [tb_presales.id]
  })
})); 