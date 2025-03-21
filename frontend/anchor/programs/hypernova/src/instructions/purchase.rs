use solana_program::{program::invoke, system_instruction};

use crate::state::presale::PresaleInfo;
use {
    crate::error::*,
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint, Token, TokenAccount},
        token_interface::{
            transfer_checked, TransferChecked,
        },
    },
};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct PurchaseTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub presale_account: Box<Account<'info, PresaleInfo>>,

    #[account(
        mut,
        seeds = [b"mint", presale_account.developer.as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub mint_account: Account<'info, Mint>,

    /// CHECK: This is a safe account that we're just transferring SOL to
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint_account,
        associated_token::authority = user,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = mint_account,
    )]
    pub associated_token_presale: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn purchase_tokens(ctx: Context<PurchaseTokens>, id: u64, sol_amount: u64) -> Result<()> {

    let tokens_to_purchase = sol_amount / ctx.accounts.presale_account.token_price;

    // Check if presale is active
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time >= ctx.accounts.presale_account.start_time,
        LaunchpadError::PresaleNotStarted
    );
    require!(
        current_time <= ctx.accounts.presale_account.end_time,
        LaunchpadError::PresaleEnded
    );

    // Check purchase limits
    // require!(
    //     tokens_to_purchase >= ctx.accounts.presale_account.min_purchase,
    //     LaunchpadError::BelowMinimumPurchase
    // );
    // require!(
    //     tokens_to_purchase <= ctx.accounts.presale_account.max_purchase,
    //     LaunchpadError::AboveMaximumPurchase
    // );

    require!(
        tokens_to_purchase <= ctx.accounts.presale_account.available,
        LaunchpadError::InsufficientTokens
    );

    // Tranfer sol
    let transfer_instruction = system_instruction::transfer(
        &ctx.accounts.user.key(),
        &&ctx.accounts.vault.key(),
        sol_amount * 1000000000,
    );
    invoke(
        &transfer_instruction,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    msg!("Sol tranfer success!");

    
    // PDA signer seeds
    let developer = ctx.accounts.presale_account.developer;
    let binding = id.to_le_bytes();
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"mint",
        developer.as_ref(),  // Must be the developer key, not the mint key
        binding.as_ref(),
        &[ctx.bumps.mint_account],
    ]];

    msg!("{:?}",ctx.accounts.presale_account.to_account_info());
    // // PDA signer seeds
    // let binding = id.to_le_bytes();
    // let signer_seeds: &[&[&[u8]]] = &[&[
    //     b"mint",
    //     ctx.accounts.mint_account.to_account_info().key.as_ref(),
    //     binding.as_ref(),
    //     &[ctx.accounts.presale_account.bump],
    // ]];

    // from mint ATA to user ATA
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.associated_token_presale.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.mint_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
            },
            &signer_seeds,
        ),
        tokens_to_purchase,
        ctx.accounts.mint_account.decimals,
    )?;

    let presale_info = &mut ctx.accounts.presale_account;
    presale_info.available -= tokens_to_purchase;

    Ok(())
}
