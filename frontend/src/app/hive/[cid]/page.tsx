'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSalinaHive } from '@/lib/actions'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'

export default function HiveDetailPage() {
  const params = useParams<{ cid: string }>()
  const cid = Number(params.cid)
  const { findCampaignPdaById, fetchCampaign, donate, withdraw } = useSalinaHive()
  const [campaign, setCampaign] = useState<any | null>(null)
  const [amount, setAmount] = useState(0) // in SOL
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const [pda] = findCampaignPdaById(cid)
      try {
        const data = await fetchCampaign(pda)
        setCampaign({ pda, data })
      } catch {
        setCampaign(null)
      }
    })()
  }, [cid])

  async function onDonate(e: React.FormEvent) {
    e.preventDefault()
    if (!campaign) return
    setBusy(true)
    try {
      await donate(campaign.pda as PublicKey, Math.round(amount * LAMPORTS_PER_SOL))
      const data = await fetchCampaign(campaign.pda)
      setCampaign({ ...campaign, data })
    } finally {
      setBusy(false)
    }
  }

  async function onWithdraw() {
    if (!campaign) return
    setBusy(true)
    try {
      await withdraw(campaign.pda as PublicKey)
      router.push('/hive')
    } finally {
      setBusy(false)
    }
  }

  if (!campaign) return <main className="container mx-auto max-w-2xl px-4 py-8">Not found</main>

  const c = campaign.data
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold">{c.title}</h1>
      {c.imageUrl && <img src={c.imageUrl} alt="" className="rounded w-full" />}
      <p className="text-sm text-muted-foreground">{c.description}</p>
      <div className="text-sm">Raised: {Number(c.raisedLamports)/LAMPORTS_PER_SOL} SOL / Goal: {Number(c.goalLamports)/LAMPORTS_PER_SOL} SOL</div>
      <form onSubmit={onDonate} className="flex items-center gap-2">
        <input type="number" min={1} value={amount} onChange={e=>setAmount(Number(e.target.value))} className="border rounded px-3 py-2" placeholder="Lamports" />
        <button disabled={busy} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">{busy?'Processing...':'Donate'}</button>
      </form>
      <button onClick={onWithdraw} disabled={busy} className="px-3 py-2 rounded bg-gray-800 text-white disabled:opacity-50">Withdraw</button>
    </main>
  )
} 