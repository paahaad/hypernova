use {
    crate::state::presale::PresaleInfo, anchor_lang::prelude::*, anchor_spl::{
        associated_token::AssociatedToken,
        token::{mint_to, Mint, MintTo, Token, TokenAccount},
    }
};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // Mint account address is a PDA
    #[account(
        mut,
        seeds = [b"mint", payer.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub mint_account: Account<'info, Mint>,

    // Create Associated Token Account, if needed
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = payer,
    )]
    pub associated_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = mint_account,
    )]
    pub associated_token_presale: Box<Account<'info, TokenAccount>>,

    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint_account,
    //     associated_token::authority = mint_account,
    // )]
    // pub associated_token_lp: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [b"presale", mint_account.key().as_ref()],
        bump = presale_account.bump
    )]
    pub presale_account: Box<Account<'info, PresaleInfo>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn mint_token(ctx: Context<MintToken>, id: u64) -> Result<()> {
    msg!("Minting token to associated token account...");
    
    let mint_key = ctx.accounts.mint_account.key();
    let token_account_key = ctx.accounts.associated_token_account.key();
    let decimals = ctx.accounts.mint_account.decimals;
    
    msg!("Mint: {}", mint_key);
    msg!("Token Address: {}", token_account_key);

    let binding = ctx.accounts.presale_account.developer.key();
    let binding_id = id.to_le_bytes();

    let signer_seeds: &[&[&[u8]]] = &[&[b"mint", binding.as_ref(), binding_id.as_ref(), &[ctx.bumps.mint_account]]];
    let decimal_multiplier = 10u64.pow(decimals as u32);

    let total_supply = ctx.accounts.presale_account.total_supply;
    let presale_amount = ctx.accounts.presale_account.available;
    
    let lp_amount = total_supply / 5; // 20% = 1/5
    let developer_amount = total_supply.saturating_sub(presale_amount + lp_amount);

    let token_program = ctx.accounts.token_program.to_account_info();
    let mint_info = ctx.accounts.mint_account.to_account_info();
    let mint_authority = ctx.accounts.mint_account.to_account_info();

    // Mint to developer
    mint_to(
        CpiContext::new(
            token_program.clone(),
            MintTo {
                mint: mint_info.clone(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: mint_authority.clone(),
            },
        )
        .with_signer(signer_seeds),
        developer_amount * decimal_multiplier,
    )?;

    // // Mint to LP
    // mint_to(
    //     CpiContext::new(
    //         token_program.clone(),
    //         MintTo {
    //             mint: mint_info.clone(),
    //             to: ctx.accounts.associated_token_lp.to_account_info(),
    //             authority: mint_authority.clone(),
    //         },
    //     )
    //     .with_signer(signer_seeds),
    //     lp_amount * decimal_multiplier,
    // )?;

    // Mint to presale
    mint_to(
        CpiContext::new(
            token_program,
            MintTo {
                mint: mint_info,
                to: ctx.accounts.associated_token_presale.to_account_info(),
                authority: mint_authority,
            },
        )
        .with_signer(signer_seeds),
        presale_amount * decimal_multiplier,
    )?;

    // Update presale account
    let presale_info = &mut ctx.accounts.presale_account;
    presale_info.total_supply = 0;
    presale_info.associated_token_presale = token_account_key;
    // presale_info.asociate_token_lp = ctx.accounts.associated_token_lp.key();
    
    msg!("Token minted successfully.");
    Ok(())
}