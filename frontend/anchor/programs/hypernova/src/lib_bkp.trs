#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        mint_to, transfer_checked, Mint, TokenAccount,
        TokenInterface, TransferChecked,
    },
};
use solana_program::{program::invoke, system_instruction};

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod hypernova {
    use anchor_spl::token_2022::MintTo;
    // use solana_program::program_option::COption;

    use super::*;

    pub fn initiate_presale(
        ctx: Context<InitiatePresale>,
        _name: String,
        _symbol: String,
        _decimals: u8,
        total_supply: u64,
        presale_percentage: u8,
        token_price: u64,
        start_time: i64,
        end_time: i64,
        min_purchase: u64,
        max_purchase: u64,
    ) -> Result<()> {
        msg!("Init presale");
        require!(
            presale_percentage <= 70,
            LaunchpadError::InvalidPresalePercentage
        );
        require!(total_supply > 0, LaunchpadError::InvalidTotalSupply);
        require!(start_time < end_time, LaunchpadError::InvalidPresaleTime);
        require!(
            min_purchase < max_purchase && max_purchase > 0,
            LaunchpadError::InvalidPurchaseLimits
        );

        let lp_percentage = 20; // Fixed 20% for LP
        let presale_amount = (total_supply * presale_percentage as u64) / 100;
        let lp_amount = (total_supply * lp_percentage as u64) / 100;
        let dev_amount = total_supply - presale_amount - lp_amount;

        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"presale",
            ctx.accounts.developer.to_account_info().key.as_ref(),
            &[ctx.bumps.presale_account],
        ]];

        // msg!("bump details: {}", ctx.accounts.presale_account.bump);
        // msg!("bump details: {}", ctx.bumps.presale_account);

        // msg!("Minting to presale-pool");
        // msg!("{:?}", ctx.accounts.token_mint.to_account_info());
        // if let COption::Some(mint_auth) = ctx.accounts.token_mint.mint_authority{
        //     msg!("{:?}", ctx.accounts.presale_account.to_account_info());
        //     msg!("{:?}", mint_auth);
        // }else{
        //     msg!("Nothing")
        // }
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.presale_pool_account.to_account_info(),
                    authority: ctx.accounts.presale_account.to_account_info(),
                },
                &signer_seeds,
            ),
            presale_amount,
        )?;

        msg!("Mint to LP pool");
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.lp_pool_account.to_account_info(),
                    authority: ctx.accounts.presale_account.to_account_info(),
                },
                &signer_seeds,
            ),
            lp_amount,
        )?;

        msg!("Mintit to developer account");
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.developer_account.to_account_info(),
                    authority: ctx.accounts.presale_account.to_account_info(),
                },
                &signer_seeds,
            ),
            dev_amount,
        )?;

        let presale_info = &mut ctx.accounts.presale_account;
        presale_info.token_mint = ctx.accounts.token_mint.key();
        presale_info.total_supply = total_supply;
        presale_info.presale_amount = presale_amount;
        presale_info.token_price = token_price;
        presale_info.developer = ctx.accounts.developer.key();
        presale_info.start_time = start_time;
        presale_info.end_time = end_time;
        presale_info.min_purchase = min_purchase;
        presale_info.max_purchase = max_purchase;
        presale_info.bump = ctx.bumps.presale_account;
        msg!("{:?}",ctx.accounts.presale_account.to_account_info());

        Ok(())
    }

    pub fn purchase_tokens(ctx: Context<PurchaseTokens>, sol_amount: u64) -> Result<()> {
        let presale_key = ctx.accounts.presale_account.key();
        let presale_bump = ctx.accounts.presale_account.bump;
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
        require!(
            tokens_to_purchase >= ctx.accounts.presale_account.min_purchase,
            LaunchpadError::BelowMinimumPurchase
        );
        require!(
            tokens_to_purchase <= ctx.accounts.presale_account.max_purchase,
            LaunchpadError::AboveMaximumPurchase
        );

        require!(
            tokens_to_purchase <= ctx.accounts.presale_account.presale_amount,
            LaunchpadError::InsufficientTokens
        );

        let transfer_instruction = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.presale_vault.key(),
            sol_amount,
        );
        invoke(
            &transfer_instruction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.presale_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let binding = ctx.accounts.presale_account.developer.key();
        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"presale",
            binding.as_ref(),
            &[ctx.accounts.presale_account.bump],
        ]];

        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.presale_pool_account.to_account_info(),
                    to: ctx.accounts.user.to_account_info(),
                    authority: ctx.accounts.presale_account.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
                &signer_seeds,
            ),
            tokens_to_purchase,
            ctx.accounts.token_mint.decimals,
        )?;

        let presale_info = &mut ctx.accounts.presale_account;
        presale_info.presale_amount -= tokens_to_purchase;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_name: String, _symbol: String, decimals: u8, total_supply: u64, presale_percentage: u8, token_price: u64, 
              start_time: i64, end_time: i64, min_purchase: u64, max_purchase: u64)]
pub struct InitiatePresale<'info> {
    #[account(mut)]
    pub developer: Signer<'info>,

    #[account(
        init,
        payer = developer,
        space = 8 + PresaleInfo::INIT_SPACE,
        seeds = [b"presale", developer.key().as_ref()],
        bump
    )]
    pub presale_account: Box<Account<'info, PresaleInfo>>,

    #[account(
        init,
        payer = developer,
        mint::decimals = decimals,
        mint::authority = presale_account,
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = developer,
        associated_token::mint = token_mint,
        associated_token::authority = presale_account,
    )]
    pub presale_pool_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = developer,
        associated_token::mint = token_mint,
        associated_token::authority = presale_account,
    )]
    pub lp_pool_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = developer,
        associated_token::mint = token_mint,
        associated_token::authority = presale_account
    )]
    pub developer_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PurchaseTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub presale_account: Account<'info, PresaleInfo>,

    #[account(
        mut,
        associated_token::mint = presale_account.token_mint,
        associated_token::authority = presale_account
    )]
    pub presale_pool_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = user
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    // This account must match the one stored on the presale account.
    #[account(
        constraint = token_mint.key() == presale_account.token_mint,
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub presale_vault: SystemAccount<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct PresaleInfo {
    pub token_mint: Pubkey,
    pub total_supply: u64,
    pub presale_amount: u64,
    pub token_price: u64,
    pub developer: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub min_purchase: u64,
    pub max_purchase: u64,
    pub bump: u8,
}

#[error_code]
pub enum LaunchpadError {
    #[msg("Invalid presale percentage")]
    InvalidPresalePercentage,
    #[msg("Invalid total supply")]
    InvalidTotalSupply,
    #[msg("Insufficient tokens in presale pool")]
    InsufficientTokens,
    #[msg("Invalid presale time: start time must be before end time")]
    InvalidPresaleTime,
    #[msg("Invalid purchase limits: min must be less than max and max must be greater than zero")]
    InvalidPurchaseLimits,
    #[msg("Presale has not started yet")]
    PresaleNotStarted,
    #[msg("Presale has already ended")]
    PresaleEnded,
    #[msg("Purchase amount is below minimum allowed")]
    BelowMinimumPurchase,
    #[msg("Purchase amount is above maximum allowed")]
    AboveMaximumPurchase,
}