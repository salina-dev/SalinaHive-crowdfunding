use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::state::Campaign;

#[derive(Accounts)]
pub struct DeleteCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator, close = creator)]
    pub campaign: Account<'info, Campaign>,
}

pub fn delete_campaign_handler(ctx: Context<DeleteCampaign>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    require!(campaign.raised_lamports == 0, ErrorCode::WithdrawNotAllowed);
    campaign.is_deleted = true;
    Ok(())
} 