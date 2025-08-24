# SalinaHive Frontend

Next.js app for SalinaHive — crowdfunding on Solana Devnet.

## Quickstart

```bash
cd frontend
npm install
# set Devnet RPC (optional; defaults to Devnet)
echo "NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com" > .env.local
npm run dev
```

Open http://localhost:3000 and click "Open Hive".

## Usage

1. Connect wallet (top-right)
2. Initialize platform (once) — sets platform account and fee
3. Create a campaign — inputs use SOL and deadline (UTC)
4. Open a campaign — donate in SOL, withdraw when eligible

## Program

- Program ID: `Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP`
- IDL: `src/idl/salina_hive.json`
- Types: `src/idl/salina_hive.ts`

## Structure

- `src/app/hive` — list, create, and detail pages
- `src/lib/actions.ts` — Anchor client actions
- `src/components/solana/solana-provider.tsx` — wallet/connection provider

## Notes

- Amounts are input in SOL and converted to lamports
- Transactions wait for confirmation and log a Devnet Explorer link in the console
