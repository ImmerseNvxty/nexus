'use client'
// src/components/dashboard/MoodCheckin.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import toast from 'react-hot-toast'
import type { MoodEntry } from '@/types'

const MOODS = [
  { val: 1, emoji: '😩', label: 'Rough' },
  { val: 2, emoji: '😐', label: 'Meh' },
  { val: 3, emoji: '🙂', label: 'Okay' },
  { val: 4, emoji: '😊', label: 'Good' },
  { val: 5, emoji: '🤩', label: 'Amazing' },
]

export default function MoodCheckin({ initial }: { initial: MoodEntry | null }) {
  const { profile } = useProfileStore()
  const [mood, setMood] = useState<number>(initial?.mood ?? 0)
  const [energy, setEnergy] = useState<number>(initial?.energy ?? 70)
  const [saved, setSaved] = useState(!!initial)

  async function save(m: number) {
    if (!profile) return
    setMood(m)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('mood_entries').upsert({ user_id: profile.id, mood: m, energy, date: today }, { onConflict: 'user_id,date' })
    setSaved(true)
    toast.success('Mood saved!')
  }

  return (
    <div>
      <p className="text-xs text-[#6a9ab8] mb-3">How are you feeling right now?</p>
      <div className="flex gap-2 justify-between">
        {MOODS.map(m => (
          <button key={m.val} onClick={() => save(m.val)}
            className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all"
            style={{
              background: mood === m.val ? 'rgba(91,196,245,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${mood === m.val ? 'rgba(91,196,245,0.35)' : 'rgba(255,255,255,0.07)'}`,
              transform: mood === m.val ? 'scale(1.08)' : 'scale(1)',
            }}>
            <span className="text-xl">{m.emoji}</span>
            <span className="text-[9px] text-[#3a6080]">{m.label}</span>
          </button>
        ))}
      </div>
      {mood > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[#3a6080] mb-1">
            <span>Energy</span><span style={{ color: '#5bc4f5', fontFamily: 'var(--font-sora)' }}>{energy}%</span>
          </div>
          <input type="range" min={0} max={100} value={energy}
            onChange={e => setEnergy(Number(e.target.value))}
            onMouseUp={() => saved && save(mood)}
            className="w-full accent-[#5bc4f5]"/>
        </div>
      )}
    </div>
  )
}
