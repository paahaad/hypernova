/**
 * Hypernova DEX API Client
 * This file provides a unified API client for interacting with the DEX backend.
 */

// Base API URLs
const API_BASE = '/api';

// Types
type TokenData = {
  mint_address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo_uri?: string;
};

type PresaleData = {
  token_id?: string;
  mint_address?: string;
  presale_address: string;
  total_raised: number;
  target_amount: number;
  start_time: string | Date;
  end_time: string | Date;
  status?: 'active' | 'completed' | 'cancelled';
  imageURI?: string;
};

type PoolData = {
  pool_address: string;
  token_a_id: string;
  token_b_id: string;
  lp_mint: string;
};

type LiquidityData = {
  user_wallet: string;
  pool_id: string;
  amount_token_a: number;
  amount_token_b: number;
  lp_tokens: number;
};

type SwapData = {
  pool_id: string;
  user_wallet: string;
  amount_in: number;
  amount_out: number;
  token_in_id: string;
  token_out_id: string;
  tx_hash: string;
};

type PresaleContributionData = {
  presale_id: string;
  user_wallet: string;
  amount: number;
};

// Helper function for API requests
async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    console.log(`API Request to ${url}:`, JSON.stringify(data));
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${url}`, options);
  const result = await response.json();

  if (!response.ok) {
    console.error(`API Error from ${url}:`, result);
    throw new Error(result.error || 'An error occurred');
  }

  return result.data;
}

// Tokens API
export const TokensApi = {
  getAll: () => apiRequest<TokenData[]>('/tokens'),
  getById: (id: string) => apiRequest<TokenData>(`/tokens/${id}`),
  create: (data: TokenData) => apiRequest<TokenData>('/tokens', 'POST', data),
  update: (id: string, data: Partial<TokenData>) => 
    apiRequest<TokenData>(`/tokens/${id}`, 'PATCH', data),
  delete: (id: string) => apiRequest<TokenData>(`/tokens/${id}`, 'DELETE'),
};

// Presales API
export const PresalesApi = {
  getAll: () => apiRequest<PresaleData[]>('/presales'),
  getById: (id: string) => apiRequest<PresaleData>(`/presales/${id}`),
  create: (data: PresaleData) => apiRequest<PresaleData>('/presales', 'POST', data),
  update: (id: string, data: Partial<PresaleData>) => 
    apiRequest<PresaleData>(`/presales/${id}`, 'PATCH', data),
  getContributions: (id: string) => 
    apiRequest<PresaleContributionData[]>(`/presales/${id}/contributions`),
  contribute: (id: string, data: { user_wallet: string; amount: number }) => 
    apiRequest<PresaleContributionData>(`/presales/${id}/contribute`, 'POST', data),
};

// Pools API
export const PoolsApi = {
  getAll: () => apiRequest<PoolData[]>('/pools'),
  getById: (id: string) => apiRequest<PoolData>(`/pools/${id}`),
  create: (data: PoolData) => apiRequest<PoolData>('/pools', 'POST', data),
  update: (id: string, data: Partial<PoolData>) => 
    apiRequest<PoolData>(`/pools/${id}`, 'PATCH', data),
};

// Liquidity API
export const LiquidityApi = {
  getAll: () => apiRequest<LiquidityData[]>('/liquidity'),
  getByUser: (wallet: string) => apiRequest<LiquidityData[]>(`/liquidity/user/${wallet}`),
  add: (data: LiquidityData) => apiRequest<LiquidityData>('/liquidity/add', 'POST', data),
  remove: (data: { id: string; amount: number }) => 
    apiRequest<LiquidityData>('/liquidity/remove', 'POST', data),
};

// Swaps API
export const SwapsApi = {
  getAll: () => apiRequest<SwapData[]>('/swaps'),
  getByPool: (poolId: string) => apiRequest<SwapData[]>(`/swaps/pool/${poolId}`),
  getByUser: (wallet: string) => apiRequest<SwapData[]>(`/swaps/user/${wallet}`),
  execute: (data: Omit<SwapData, 'id'>) => apiRequest<SwapData>('/swaps/execute', 'POST', data),
};

// Fees API
export const FeesApi = {
  getByUser: (wallet: string) => apiRequest<any>(`/fees/user/${wallet}`),
  claim: (data: { user_wallet: string; pool_id: string }) => 
    apiRequest<any>('/fees/claim', 'POST', data),
};

// Export all APIs as a single object
export const HypernovaApi = {
  tokens: TokensApi,
  presales: PresalesApi,
  pools: PoolsApi,
  liquidity: LiquidityApi,
  swaps: SwapsApi,
  fees: FeesApi,
};

export default HypernovaApi; 