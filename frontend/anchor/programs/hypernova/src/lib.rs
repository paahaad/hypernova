#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::*;

pub mod error;
pub mod instructions;
pub mod state;

declare_id!("EH8YMDtK1rWdAbF6La4v55ehDRzDxF4bZ47n8X3kXRMJ");

#[program]
pub mod hypernova {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        id: u64,
        start_time: i64,
        end_time: i64,
        ticker: i64,

        token_name: String,
        token_symbol: String,
        token_uri: String,

        total_supply: u64,
        token_price: u64,
        min_purchase: u64,
        max_purchase: u64,
        presale_percentage: i8,
    ) -> Result<()> {
        create::create_token(
            ctx,
            id,
            start_time,
            end_time,
            ticker,
            token_name,
            token_symbol,
            token_uri,
            total_supply,
            token_price,
            min_purchase,
            max_purchase,
            presale_percentage,
        )
    }

    pub fn mint_token(ctx: Context<MintToken>, id: u64) -> Result<()> {
        mint::mint_token(ctx, id)
    }

    pub fn purchase(ctx: Context<PurchaseTokens>, id: u64, sol_amount: u64) -> Result<()> {
        purchase::purchase_tokens(ctx, id, sol_amount)
    }
}
