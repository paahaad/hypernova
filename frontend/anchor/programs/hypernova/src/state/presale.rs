use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PresaleInfo {
    pub start_time: i64,
    pub end_time: i64,
    pub ticker: i64,

    pub token_mint: Pubkey,
    pub total_supply: u64,
    pub available: u64,
    pub token_price: u64,
    pub developer: Pubkey,
    
    pub min_purchase: u64,
    pub max_purchase: u64,
    pub bump: u8,

    pub vault: Pubkey,
    pub associated_token_presale: Pubkey,
    pub asociate_token_lp: Pubkey,
}