use anchor_lang::prelude::*;
use crate::state::Platform;

#[derive(Accounts)]
pub struct UpdatePlatformSettings<'info> {
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority, seeds = [Platform::SEED], bump = platform.bump)]
    pub platform: Account<'info, Platform>,
}

pub fn update_platform_settings_handler(ctx: Context<UpdatePlatformSettings>, fee_bps: u16) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    platform.fee_bps = fee_bps;
    Ok(())
} 