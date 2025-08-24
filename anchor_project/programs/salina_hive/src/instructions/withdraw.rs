use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::state::Campaign;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut, has_one = creator)]
    pub campaign: Account<'info, Campaign>,
}

pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let clock = Clock::get()?;
    let campaign = &mut ctx.accounts.campaign;

    // allow withdraw if goal reached or deadline passed
    let can_withdraw = campaign.raised_lamports >= campaign.goal_lamports
        || clock.unix_timestamp >= campaign.deadline_ts;
    require!(can_withdraw, ErrorCode::WithdrawNotAllowed);

    // compute withdrawable lamports (all lamports minus rent for this account)
    let rent = Rent::get()?;
    let data_len = campaign.to_account_info().data_len();
    let min_balance = rent.minimum_balance(data_len);
    let current = **campaign.to_account_info().lamports.borrow();

    if current > min_balance {
        let amount = current.saturating_sub(min_balance);
        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += amount;
    }

    Ok(())
} 