use crate::state::presale::PresaleInfo;
use {
    crate::error::LaunchpadError,
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
            CreateMetadataAccountsV3, Metadata,
        },
        token::{Mint, Token},
    },
};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // Create mint account
    // Same PDA as address of the account and mint/freeze authority
    #[account(
        init,
        seeds = [b"mint", payer.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
        payer = payer,
        mint::decimals = 9,
        mint::authority = mint_account.key(),
        mint::freeze_authority = mint_account.key(),

    )]
    pub mint_account: Account<'info, Mint>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + PresaleInfo::INIT_SPACE,
        seeds = [b"presale", mint_account.key().as_ref()],
        bump
    )]
    pub presale_account: Box<Account<'info, PresaleInfo>>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

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
    msg!("Creating metadata account");

    // PDA signer seeds
    let binding = id.to_le_bytes();
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"mint",
        ctx.accounts.payer.to_account_info().key.as_ref(),
        binding.as_ref(),
        &[ctx.bumps.mint_account],
    ]];

    // Cross Program Invocation (CPI) signed by PDA
    // Invoking the create_metadata_account_v3 instruction on the token metadata program
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                mint_authority: ctx.accounts.mint_account.to_account_info(), // PDA is mint authority
                update_authority: ctx.accounts.mint_account.to_account_info(), // PDA is update authority
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        DataV2 {
            name: token_name,
            symbol: token_symbol,
            uri: token_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        false, // Is mutable
        false, // Update authority is signer
        None,  // Collection details
    )?;

    let presale_info = &mut ctx.accounts.presale_account;

    presale_info.start_time = start_time;
    presale_info.end_time = end_time;
    presale_info.ticker = ticker;

    presale_info.token_mint = ctx.accounts.mint_account.key();
    presale_info.total_supply = total_supply;
    presale_info.available = total_supply * presale_percentage as u64 / 100;
    presale_info.token_price = token_price;
    presale_info.developer = ctx.accounts.payer.key();
    
    presale_info.min_purchase = min_purchase;
    presale_info.min_purchase = max_purchase;
    presale_info.bump = ctx.bumps.presale_account;

    presale_info.vault = Pubkey::try_from("2P2HLwVkfrzLNzFVxC91ek8dC6e2C6n25zDoY5vU5g9S").unwrap();
    presale_info.associated_token_presale = Pubkey::try_from("2P2HLwVkfrzLNzFVxC91ek8dC6e2C6n25zDoY5vU5g9S").unwrap();
    presale_info.asociate_token_lp = Pubkey::try_from("2P2HLwVkfrzLNzFVxC91ek8dC6e2C6n25zDoY5vU5g9S").unwrap();


    msg!("Token created successfully.");

    Ok(())
}

// pub struct PresaleInfo {
//     pub start_time: i64,
//     pub end_time: i64,
//     pub tiker: i64,

//     pub token_mint: Pubkey,
//     pub total_supply: u64,
//     pub available: u64,
//     pub token_price: u64,
//     pub developer: Pubkey,

//     pub min_purchase: u64,
//     pub max_purchase: u64,
//     pub bump: u8,

//     pub vault: Pubkey,
// }
