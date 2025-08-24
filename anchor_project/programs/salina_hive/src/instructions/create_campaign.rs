use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::state::{Campaign, Platform};
use crate::constants::{TITLE_MAX_LEN, DESC_MAX_LEN, URL_MAX_LEN};

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, seeds = [Platform::SEED], bump = platform.bump)]
    pub platform: Account<'info, Platform>,

    #[account(
        init,
        payer = payer,
        seeds = [Campaign::SEED, (platform.campaign_count + 1).to_le_bytes().as_ref()],
        bump,
        space = 8 + Campaign::INIT_SPACE,
    )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn create_campaign_handler(
    ctx: Context<CreateCampaign>,
    title: String,
    description: String,
    goal_lamports: u64,
    deadline_ts: i64,
    image_url: String,
) -> Result<()> {
    require!(title.as_bytes().len() <= TITLE_MAX_LEN, ErrorCode::TitleTooLong);
    require!(description.as_bytes().len() <= DESC_MAX_LEN, ErrorCode::DescriptionTooLong);
    require!(image_url.as_bytes().len() <= URL_MAX_LEN, ErrorCode::UrlTooLong);
    require!(goal_lamports > 0, ErrorCode::InvalidAmount);

    let now = Clock::get()?.unix_timestamp;
    require!(deadline_ts > now, ErrorCode::DeadlineInPast);

    let next_id = ctx.accounts.platform.campaign_count.checked_add(1).unwrap();

    let campaign = &mut ctx.accounts.campaign;
    campaign.platform = ctx.accounts.platform.key();
    campaign.creator = ctx.accounts.payer.key();
    campaign.cid = next_id;
    campaign.title = title;
    campaign.description = description;
    campaign.image_url = image_url;
    campaign.goal_lamports = goal_lamports;
    campaign.raised_lamports = 0;
    campaign.deadline_ts = deadline_ts;
    campaign.donation_count = 0;
    campaign.is_deleted = false;
    campaign.bump = ctx.bumps.campaign;

    // increment campaign counter
    ctx.accounts.platform.campaign_count = next_id;

    Ok(())
} 