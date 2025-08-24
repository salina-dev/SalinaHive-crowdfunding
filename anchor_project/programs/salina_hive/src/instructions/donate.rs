use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::errors::SalinaError;
use crate::state::{Campaign, Platform};

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(mut, seeds = [Platform::SEED], bump = platform.bump)]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    /// CHECK: validated against platform.treasury
    #[account(mut, address = platform.treasury)]
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Donate>, amount: u64) -> Result<()> {
    require!(amount > 0, SalinaError::InvalidAmount);

    let platform = &ctx.accounts.platform;
    let campaign = &mut ctx.accounts.campaign;

    // fee split
    let fee = (amount as u128)
        .saturating_mul(platform.fee_bps as u128)
        .checked_div(10_000)
        .unwrap_or(0) as u64;
    let net = amount.saturating_sub(fee);

    // transfer net to campaign
    let cpi_ctx_net = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.donor.to_account_info(),
            to: campaign.to_account_info(),
        },
    );
    transfer(cpi_ctx_net, net)?;

    // transfer fee to treasury (platform authority or platform account)
    if fee > 0 {
        let cpi_ctx_fee = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.donor.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        transfer(cpi_ctx_fee, fee)?;
    }

    campaign.raised_lamports = campaign
        .raised_lamports
        .saturating_add(net);
    campaign.donation_count = campaign.donation_count.saturating_add(1);

    Ok(())
} 