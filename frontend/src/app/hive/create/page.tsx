'use client'

import { useState } from 'react'
import { useSalinaHive } from '@/lib/actions'
import { useRouter } from 'next/navigation'

export default function HiveCreatePage() {
  const { createCampaign } = useSalinaHive()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [goal, setGoal] = useState(0)
  const [deadline, setDeadline] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const ts = Math.floor(new Date(deadline).getTime() / 1000)
      const lamports = Math.round(goal * 1_000_000_000)
      const pda = await createCampaign({ title, description, goalLamports: lamports, deadlineTs: ts, imageUrl })
      router.push('/hive')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold">Create Campaign</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm">Title</span>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Short campaign title" className="w-full border rounded px-3 py-2" required maxLength={64} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm">Description</span>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What are you building?" className="w-full border rounded px-3 py-2" required maxLength={512} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm">Image URL (optional)</span>
          <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..." className="w-full border rounded px-3 py-2" maxLength={160} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm">Goal in SOL</span>
          <input type="number" value={goal} onChange={e=>setGoal(Number(e.target.value))} placeholder="e.g. 1.5" className="w-full border rounded px-3 py-2" min={0} step="0.000000001" required />
          <span className="text-xs text-muted-foreground">We will convert SOL → lamports on-chain</span>
        </label>
        <label className="block space-y-1">
          <span className="text-sm">Deadline</span>
          <input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <span className="text-xs text-muted-foreground">UTC time; must be in the future</span>
        </label>
        <button disabled={busy} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">{busy?'Submitting...':'Create'}</button>
      </form>
    </main>
  )
} 