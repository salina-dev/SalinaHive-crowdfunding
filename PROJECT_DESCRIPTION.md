# Project Description

**Deployed Frontend URL:** [TODO: add Vercel/host link]

**Solana Program ID:** Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP

## Project Overview

### Description
SalinaHive is a community-powered crowdfunding dApp on Solana. Creators can initialize the platform (setting a fee), create campaigns with a goal and deadline, accept donations (with a platform fee routed to a treasury), and withdraw funds either after the deadline or once the goal is met. Donors contribute directly to the campaign account in SOL (converted to lamports on-chain), with transparent PDAs and deterministic addresses.

### Key Features
- **Platform Initialization**: Set platform fee and create the platform PDA
- **Create Campaign**: Deterministic campaign PDA using an incrementing id
- **Donate with Fee Split**: Net funds to campaign, fee to treasury
- **Withdraw Rules**: Allowed on goal reach or deadline pass
- **Update/Delete**: Creator can update metadata; delete if no funds raised

### How to Use the dApp
1. **Connect Wallet** (Devnet)
2. **Initialize Platform** (one-time per cluster)
3. **Create Campaign**: Title, description, image, goal (SOL), deadline (UTC)
4. **Donate**: Enter SOL and donate; fee routed automatically
5. **Withdraw**: When eligible per rules

## Program Architecture

### PDA Usage
- **Platform PDA**: seeds `["platform"]` — holds `authority`, `fee_bps`, `treasury`, `campaign_count`
- **Campaign PDA**: seeds `["campaign", u64::to_le_bytes(cid)]` — `cid` increments from `campaign_count`

### Program Instructions
- `initializePlatform(fee_bps)` — creates `Platform` PDA, sets authority/treasury/fee
- `createCampaign(title, description, goal_lamports, deadline_ts, image_url)` — creates a campaign PDA and increments counter
- `donate(amount)` — transfers net amount to campaign, fee to treasury
- `withdraw()` — creator withdraws available lamports when eligible
- `updateCampaign(title, description, image_url)` — updates metadata
- `deleteCampaign()` — closes campaign if untouched
- `updatePlatformSettings(fee_bps)` — authority updates fee

### Account Structure
```rust
#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub fee_bps: u16,
    pub treasury: Pubkey,
    pub campaign_count: u64,
    pub bump: u8,
}

#[account]
pub struct Campaign {
    pub platform: Pubkey,
    pub creator: Pubkey,
    pub cid: u64,
    pub title: String,
    pub description: String,
    pub image_url: String,
    pub goal_lamports: u64,
    pub raised_lamports: u64,
    pub deadline_ts: i64,
    pub donation_count: u64,
    pub is_deleted: bool,
    pub bump: u8,
}
```

## Testing

### Test Coverage
A TS test suite covers success and failure cases:

**Happy Path Tests:**
- Initialize Platform
- Create Campaign
- Donate (with fee split)
- Withdraw
- Update Campaign
- Update Platform Settings

**Unhappy Path Tests:**
- Create with too-long title
- Donate with zero amount
- Withdraw before eligible state

### Running Tests
```bash
anchor test
```

### Additional Notes for Evaluators
- Program deployed on Devnet and wired to the frontend via bundled IDL/types
- Frontend UX differs from example codebases: SOL-denominated inputs, simplified pages, and deterministic PDA browsing via id