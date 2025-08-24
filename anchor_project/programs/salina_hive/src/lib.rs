use anchor_lang::prelude::*;

pub mod constants;
pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;

declare_id!("Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP");

#[program]
pub mod salina_hive {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>, fee_bps: u16, treasury_bump: u8) -> Result<()> {
        initialize_platform::initialize_platform_handler(ctx, fee_bps, treasury_bump)
    }

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        goal_lamports: u64,
        deadline_ts: i64,
        image_url: String,
    ) -> Result<()> {
        create_campaign::create_campaign_handler(ctx, title, description, goal_lamports, deadline_ts, image_url)
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        donate::donate_handler(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw::withdraw_handler(ctx)
    }

    pub fn update_campaign(ctx: Context<UpdateCampaign>, title: String, description: String, image_url: String) -> Result<()> {
        update_campaign::update_campaign_handler(ctx, title, description, image_url)
    }

    pub fn delete_campaign(ctx: Context<DeleteCampaign>) -> Result<()> {
        delete_campaign::delete_campaign_handler(ctx)
    }

    pub fn update_platform_settings(ctx: Context<UpdatePlatformSettings>, fee_bps: u16) -> Result<()> {
        update_platform_settings::update_platform_settings_handler(ctx, fee_bps)
    }
} 