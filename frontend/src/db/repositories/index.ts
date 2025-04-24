import { db } from '../setup';
import { TokensRepository } from './tokens.repository';
import { PresalesRepository } from './presales.repository';
import { PoolsRepository } from './pools.repository';
import { LiquidityPositionsRepository } from './liquidity-positions.repository';
import { SwapsRepository } from './swaps.repository';
import { FeesRepository } from './fees.repository';
import { PresaleContributionsRepository } from './presale-contributions.repository';

// Create instances of all repositories
export const repositories = {
  tokens: new TokensRepository(db),
  presales: new PresalesRepository(db),
  pools: new PoolsRepository(db),
  liquidityPositions: new LiquidityPositionsRepository(db),
  swaps: new SwapsRepository(db),
  fees: new FeesRepository(db),
  presaleContributions: new PresaleContributionsRepository(db),
};

// Export individual repositories
export const {
  tokens,
  presales,
  pools,
  liquidityPositions,
  swaps,
  fees,
  presaleContributions,
} = repositories; 