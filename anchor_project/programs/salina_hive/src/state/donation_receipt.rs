use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DonationReceipt {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
    pub donated_at: i64,
}

impl DonationReceipt {
    pub const SEED: &'static [u8] = b"donation";
} 