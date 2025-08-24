use anchor_lang::prelude::*;
use crate::constants::{TITLE_MAX_LEN, DESC_MAX_LEN, URL_MAX_LEN};

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub platform: Pubkey,
    pub creator: Pubkey,
    pub cid: u64,
    #[max_len(TITLE_MAX_LEN)]
    pub title: String,
    #[max_len(DESC_MAX_LEN)]
    pub description: String,
    #[max_len(URL_MAX_LEN)]
    pub image_url: String,
    pub goal_lamports: u64,
    pub raised_lamports: u64,
    pub deadline_ts: i64,
    pub donation_count: u64,
    pub is_deleted: bool,
    pub bump: u8,
}

impl Campaign {
    pub const SEED: &'static [u8] = b"campaign";
} 