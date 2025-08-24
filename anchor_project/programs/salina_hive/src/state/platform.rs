use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,
    pub fee_bps: u16,
    pub treasury: Pubkey,
    pub campaign_count: u64,
    pub bump: u8,
}

impl Platform {
    pub const SEED: &'static [u8] = b"platform";
} 