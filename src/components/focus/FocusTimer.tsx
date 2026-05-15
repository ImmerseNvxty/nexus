'use client'
// src/components/focus/FocusTimer.tsx
import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFocusStore, useProfileStore } from '@/store'
import toast from 'react-hot-toast'

const MODES = [
  { label: 'Pomodoro', key: 'pomodoro' as const, min: 25 },
  { label: 'Deep',     key: 'deep'     as const, min: 50 },
  { label: 'Break',    key: 'break'    as const, min: 5  },
]

export default function FocusTimer({ compact = false }: { compact?: boolean }) {
  const { mode, durationSec, remainingSec, isRunning, sessionsToday, setMode, setRemaining, setRunning, incrementSessions, addFocusMinutes, reset } = useFocusStore()
  const { profile, updateProfile } = useProfileStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleComplete = useCallback(async () => {
    setRunning(false)
    incrementSessions()
    const durationMin = durationSec / 60
    addFocusMinutes(durationMin)
    toast.success(`🎉 ${mode === 'break' ? 'Break' : 'Focus session'} complete! +${mode === 'break' ? 10 : 30} XP`)

    if (profile && mode !== 'break') {
      const supabase = createClient()
      await supabase.from('focus_sessions').insert({
        user_id: profile.id, duration_min: durationMin,
        session_type: mode, completed: true, xp_earned: 30,
        ended_at: new Date().toISOString(),
      })
      await supabase.rpc('award_xp', { p_user_id: profile.id, p_amount: 30, p_reason: 'Focus session completed', p_source_type: 'focus' })
      updateProfile({ xp_current: profile.xp_current + 30, xp_total: profile.xp_total + 30 })
    }
    reset()
  }, [mode, durationSec, profile, setRunning, incrementSessions, addFocusMinutes, reset, updateProfile])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { handleComplete(); return 0 }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, handleComplete, setRemaining])

  const mins = String(Math.floor(remainingSec / 60)).padStart(2, '0')
  const secs = String(remainingSec % 60).padStart(2, '0')
  const pct = remainingSec / durationSec
  const circumference = 2 * Math.PI * (compact ? 45 : 60)
  const strokeDash = circumference * (1 - pct)
  const ringSize = compact ? 100 : 140

  return (
    <div className="flex flex-col items-center">
      {/* Mode pills */}
      <div className="flex gap-1.5 mb-3 w-full">
        {MODES.map(m => (
          <button key={m.key} onClick={() => { setMode(m.key, m.min); }}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all"
            style={{
              fontFamily: 'var(--font-sora)',
              background: mode === m.key ? 'rgba(91,196,245,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${mode === m.key ? 'rgba(91,196,245,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: mode === m.key ? '#5bc4f5' : '#3a6080',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg viewBox={`0 0 ${ringSize} ${ringSize}`} width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={ringSize/2} cy={ringSize/2} r={ringSize/2 - 8} fill="none"
            stroke="rgba(255,255,255,0.07)" strokeWidth="6"/>
          <circle cx={ringSize/2} cy={ringSize/2} r={ringSize/2 - 8} fill="none"
            stroke={mode === 'break' ? '#5de8a0' : '#5bc4f5'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 6px ${mode === 'break' ? 'rgba(93,232,160,0.5)' : 'rgba(91,196,245,0.5)'})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-semibold text-[#e8f4ff]`} style={{ fontFamily: 'var(--font-sora)', fontSize: compact ? 22 : 32 }}>
            {mins}:{secs}
          </div>
          <div className="text-[9px] text-[#3a6080] uppercase tracking-wider mt-0.5">{mode}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-3">
        <button onClick={() => setRunning(!isRunning)}
          className="btn-primary px-5 py-2 rounded-xl text-xs flex items-center gap-1.5">
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={reset} className="btn-ghost px-3 py-2 rounded-xl text-xs">↺</button>
      </div>
      <div className="text-xs text-[#3a6080] mt-2" style={{ fontFamily: 'var(--font-sora)' }}>
        Sessions today: <span style={{ color: '#5bc4f5' }}>{sessionsToday}</span>
      </div>
    </div>
  )
}
