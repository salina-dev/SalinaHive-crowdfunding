use anchor_lang::prelude::*;
use crate::errors::SalinaError;
use crate::state::Campaign;
use crate::constants::{TITLE_MAX_LEN, DESC_MAX_LEN, URL_MAX_LEN};

#[derive(Accounts)]
pub struct UpdateCampaign<'info> {
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator)]
    pub campaign: Account<'info, Campaign>,
}

pub fn handler(ctx: Context<UpdateCampaign>, title: String, description: String, image_url: String) -> Result<()> {
    require!(title.as_bytes().len() <= TITLE_MAX_LEN, SalinaError::TitleTooLong);
    require!(description.as_bytes().len() <= DESC_MAX_LEN, SalinaError::DescriptionTooLong);
    require!(image_url.as_bytes().len() <= URL_MAX_LEN, SalinaError::UrlTooLong);

    let campaign = &mut ctx.accounts.campaign;
    require!(!campaign.is_deleted, SalinaError::CampaignDeleted);

    campaign.title = title;
    campaign.description = description;
    campaign.image_url = image_url;

    Ok(())
} 