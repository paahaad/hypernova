// TODO:
// 1. create new wallet in backend
// 2. tranfere sol from PDA to new Wallet
// 3. close the Presale Account and reclaim the rent
use anchor_lang::prelude::*;
use crate::{state::presale::PresaleInfo, ID};

#[derive(Accounts)]
pub struct FinalizeSale<'info> {
    /// CHECK: Use owner constraint to check account is owned by our program
    #[account(
        mut,
        owner = ID,
        close = recipient
    )]
    presale_account: Account<'info, PresaleInfo>,
    
    #[account(mut)]
    recipient: SystemAccount<'info>,
    
    system_program: Program<'info, System>,
}

pub fn finalize_sale(ctx: Context<FinalizeSale>) -> Result<()> {
    let presale_balance = ctx.accounts.presale_account.to_account_info().lamports();
    
    // Transfer all SOL from presale account to recipient
    // This is done by directly modifying the lamports (SOL) of both accounts
    **ctx.accounts.presale_account.to_account_info().try_borrow_mut_lamports()? -= presale_balance;
    **ctx.accounts.recipient.try_borrow_mut_lamports()? += presale_balance;
    
    Ok(())
}
