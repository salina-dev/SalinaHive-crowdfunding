use anchor_lang::prelude::*;
use crate::state::Platform;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        seeds = [Platform::SEED],
        bump,
        space = 8 + Platform::INIT_SPACE,
    )]
    pub platform: Account<'info, Platform>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_platform_handler(ctx: Context<InitializePlatform>, fee_bps: u16, _treasury_bump: u8) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    platform.authority = ctx.accounts.payer.key();
    platform.fee_bps = fee_bps;
    platform.treasury = platform.key();
    platform.campaign_count = 0;
    platform.bump = ctx.bumps.platform;
    Ok(())
} 