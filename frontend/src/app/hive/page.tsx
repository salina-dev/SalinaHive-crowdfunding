'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { WalletButton } from '@/components/solana/solana-provider'
import { useSalinaHive, type PlatformAccount, type CampaignAccount } from '@/lib/actions'
import { ellipsify } from '@/lib/utils'

export default function HivePage() {
  const { fetchPlatform, fetchCampaigns, initializePlatform } = useSalinaHive()
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<PlatformAccount | null>(null)
  const [campaigns, setCampaigns] = useState<{ pda: string; data: CampaignAccount }[]>([])
  const [initBusy, setInitBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const p = await fetchPlatform()
      if (cancelled) return
      setPlatform(p)
      if (p) {
        const list = await fetchCampaigns()
        if (cancelled) return
        setCampaigns(list.map(({ pda, data }) => ({ pda: pda.toBase58(), data })))
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [fetchPlatform, fetchCampaigns])

  async function onInit() {
    setInitBusy(true)
    try {
      await initializePlatform(250)
      const p = await fetchPlatform()
      setPlatform(p)
    } finally {
      setInitBusy(false)
    }
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">SalinaHive — Community-powered crowdfunding</h1>
        <WalletButton />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !platform ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Platform not initialized yet.</p>
          <button onClick={onInit} disabled={initBusy} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
            {initBusy ? 'Initializing...' : 'Initialize Platform (2.5% fee)'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Campaigns: {Number(platform.campaignCount)}</p>
            <Link href="/hive/create" className="px-3 py-2 rounded bg-black text-white">Create Campaign</Link>
          </div>

          <ul className="divide-y border rounded">
            {campaigns.length === 0 && <li className="p-4 text-sm">No campaigns yet.</li>}
            {campaigns.map(({ pda, data }) => (
              <li key={pda} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{data.title}</div>
                  <div className="text-xs text-muted-foreground">{ellipsify(pda, 6)}</div>
                </div>
                <Link href={`/hive/${data.cid}`} className="text-blue-600 underline">Open</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
} 