# SalinaHive Anchor Program

SalinaHive — Community-powered crowdfunding on Solana.

## Program

- Program ID: `Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP`
- Framework: Anchor 0.31.x
- Cluster: Devnet

## Prerequisites

- Docker (recommended; School of Solana image) or local toolchain
- Node 18+
- Solana CLI and Anchor CLI compatible with 0.31.x

## Using Docker (recommended)

Start container with repository mounted:

```bash
# Intel Mac / x86_64
docker pull ackeeblockchain/school-of-solana:latest
# Start container with bind mount at /work
docker run -d --name school-of-solana -p 8899:8899 -p 9900:9900 -p 8000:8000 -p 8080:8080 -v $(pwd):/work ackeeblockchain/school-of-solana:latest tail -f /dev/null

# Exec into container
docker exec -it school-of-solana bash
cd /work/anchor_project
```

## Build

```bash
anchor build
```

If you see toolchain warnings, ensure Anchor deps are 0.31.x. This repo pins those in `programs/salina_hive/Cargo.toml`.

## Tests

A TypeScript test suite is provided in `tests/salina_hive.spec.ts` covering initialize, create, donate, withdraw, updates and unhappy paths.

```bash
# From anchor_project/
anchor test
```

If the local test validator is slow to start in your environment, increase `[test.startup_wait]` in `Anchor.toml` or run a validator separately and pass `--skip-local-validator`.

## Deploy to Devnet

```bash
# Inside container or local env with Solana CLI
solana config set --url https://api.devnet.solana.com
solana-keygen new -f --no-bip39-passphrase  # if you don't have a key
solana airdrop 2

# Build shared object, then deploy
anchor build
anchor deploy --provider.cluster devnet
```

After deployment, confirm the program address matches `Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP`.

## Instructions

- initializePlatform(fee_bps)
- createCampaign(title, description, goal_lamports, deadline_ts, image_url)
- donate(amount)
- withdraw()
- updateCampaign(title, description, image_url)
- deleteCampaign()
- updatePlatformSettings(fee_bps)

## PDAs

- Platform PDA: `find_program_address(["platform"])`
- Campaign PDA: `find_program_address(["campaign", u64::to_le_bytes(cid)])` where `cid` is an auto-incrementing campaign id stored on the platform account

## Accounts

- Platform: authority, fee_bps, treasury, campaign_count, bump
- Campaign: platform, creator, cid, title, description, image_url, goal_lamports, raised_lamports, deadline_ts, donation_count, is_deleted, bump

## Notes

- Donations split a fee to the platform treasury per `fee_bps` and the remainder to the campaign account
- Withdraws are allowed when the goal is reached or the deadline has passed
