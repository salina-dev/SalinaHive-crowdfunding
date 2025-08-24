import Link from 'next/link'

export default async function IndexPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome to SalinaHive</h1>
      <p className="text-sm text-muted-foreground">Community-powered crowdfunding on Solana Devnet.</p>
      <Link className="px-3 py-2 rounded bg-black text-white" href="/hive">Open Hive</Link>
    </div>
  )
}
