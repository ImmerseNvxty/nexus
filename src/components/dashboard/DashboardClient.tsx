'use client'
// src/components/dashboard/DashboardClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import FocusTimer from '@/components/focus/FocusTimer'
import HeatmapGrid from '@/components/dashboard/HeatmapGrid'
import MoodCheckin from '@/components/dashboard/MoodCheckin'
import BrainDump from '@/components/dashboard/BrainDump'
import type { Assignment, ClassItem, CalendarEvent, Habit, HabitCompletion, MoodEntry } from '@/types'

interface Props {
  assignments: (Assignment & { class?: { name: string; color: string } | null })[]
  classes: ClassItem[]
  upcomingEvents: CalendarEvent[]
  weeklyStudyHours: number
  weeklyXP: number
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  todayMood: MoodEntry | null
}

function dueBadge(due: string | null) {
  if (!due) return null
  const d = new Date(due)
  const days = differenceInDays(d, new Date())
  if (isToday(d)) return { label: 'Today', cls: 'badge-red' }
  if (isTomorrow(d)) return { label: 'Tomorrow', cls: 'badge-red' }
  if (days <= 3) return { label: `${days}d`, cls: 'badge-red' }
  if (days <= 7) return { label: `${days}d`, cls: 'badge-gold' }
  return { label: `${days}d`, cls: 'badge-blue' }
}

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#f5756a', high: '#f5c842', medium: '#5bc4f5', low: '#5de8a0',
}

export default function DashboardClient({ assignments, classes, upcomingEvents, weeklyStudyHours, weeklyXP, habits, habitCompletions, todayMood }: Props) {
  const { profile, updateProfile } = useProfileStore()
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  async function markDone(id: string) {
    setDoneIds(prev => new Set([...prev, id]))
    await supabase.from('assignments').update({ status: 'done' }).eq('id', id)
    // Award XP
    if (profile) {
      await supabase.rpc('award_xp', {
        p_user_id: profile.id, p_amount: 50,
        p_reason: 'Assignment completed', p_source_type: 'assignment', p_source_id: id,
      })
      updateProfile({ xp_current: profile.xp_current + 50, xp_total: profile.xp_total + 50 })
    }
  }

  // Today's classes from schedule
  const todayName = format(new Date(), 'EEEE')
  const todayClasses = classes
    .filter(c => c.schedule?.some((s: { day: string }) => s.day === todayName))
    .slice(0, 4)

  const card = 'glass-card p-4'

  return (
    <div className="p-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto' }}>

      {/* ── Streak card ── */}
      <motion.div className={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] inline-block"/>Daily Streak</div>
        <div className="flex items-end gap-3">
          <div>
            <div className="text-5xl font-bold leading-none" style={{ fontFamily: 'var(--font-sora)', background: 'linear-gradient(135deg,#f5c842,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {profile?.streak_current ?? 0}
            </div>
            <div className="text-xs text-[#6a9ab8] mt-1">day streak 🔥</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-[#3a6080]">Best</div>
            <div className="text-xl font-bold text-[#a8cce8]" style={{ fontFamily: 'var(--font-sora)' }}>{profile?.streak_best ?? 0}</div>
          </div>
        </div>
        {/* Flame row */}
        <div className="flex gap-1 mt-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="text-lg" style={{ opacity: i < (profile?.streak_current ?? 0) % 7 || (profile?.streak_current ?? 0) >= 7 ? 1 : 0.2 }}>🔥</span>
          ))}
        </div>
        {/* Momentum meter */}
        <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', color: '#f5c842' }}>
          {(profile?.streak_current ?? 0) >= 7
            ? '⚡ You\'re on fire! Island growing fast.'
            : (profile?.streak_current ?? 0) >= 3
              ? '⚡ Momentum building — keep going!'
              : '🌱 Start your streak today!'}
        </div>
      </motion.div>

      {/* ── Focus timer ── */}
      <motion.div className={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#5de8a0] inline-block"/>Focus Timer</div>
        <FocusTimer compact />
      </motion.div>

      {/* ── This week stats ── */}
      <motion.div className={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#5bc4f5] inline-block"/>This Week</div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { val: `${weeklyStudyHours}h`, label: 'Study hrs' },
            { val: assignments.filter(a => !doneIds.has(a.id)).length.toString(), label: 'Pending' },
            { val: `+${weeklyXP}`, label: 'XP earned', color: '#f5c842' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: s.color ?? '#e8f4ff' }}>{s.val}</div>
              <div className="text-[9px] text-[#3a6080] mt-0.5 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Class progress bars */}
        {classes.slice(0, 3).map(c => (
          <div key={c.id} className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-[#a8cce8] w-20 truncate">{c.code ?? c.name}</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full" style={{ width: `${50 + Math.random() * 40}%`, background: c.color ?? '#5bc4f5' }}/>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Upcoming assignments ── (spans 2 cols) */}
      <motion.div className={card} style={{ gridColumn: 'span 2' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5756a] inline-block"/>Upcoming Assignments</div>
        <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {assignments.filter(a => !doneIds.has(a.id)).slice(0, 6).map(a => {
            const badge = dueBadge(a.due_date)
            return (
              <div key={a.id} className="flex items-center gap-3 py-2.5 group">
                <button onClick={() => markDone(a.id)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ borderColor: PRIORITY_COLOR[a.priority] ?? '#5bc4f5' }}>
                  <span className="opacity-0 group-hover:opacity-100 text-xs">✓</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#e8f4ff] truncate">{a.title}</div>
                  <div className="text-xs text-[#3a6080] mt-0.5">{a.class?.name ?? 'No class'}</div>
                </div>
                {badge && <span className={`badge ${badge.cls} flex-shrink-0`}>{badge.label}</span>}
              </div>
            )
          })}
          {assignments.filter(a => !doneIds.has(a.id)).length === 0 && (
            <div className="py-6 text-center text-sm text-[#3a6080]">🎉 All caught up! No pending assignments.</div>
          )}
        </div>
      </motion.div>

      {/* ── Activity heatmap ── */}
      <motion.div className={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] inline-block"/>Activity Map</div>
        <HeatmapGrid completions={habitCompletions} />
      </motion.div>

      {/* ── Today's schedule ── */}
      <motion.div className={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#7ec8f5] inline-block"/>Today's Classes</div>
        {todayClasses.length === 0 && (
          <div className="text-xs text-[#3a6080] py-4 text-center">No classes today 🎉</div>
        )}
        <div className="flex flex-col gap-2">
          {todayClasses.map((c, i) => {
            const slot = c.schedule?.find((s: { day: string }) => s.day === todayName)
            const isNext = i === 0
            return (
              <div key={c.id} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isNext ? 'rgba(93,232,160,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isNext ? '0 0 12px rgba(93,232,160,0.1)' : 'none' }}>
                <div className="text-xs text-[#3a6080] w-14 flex-shrink-0" style={{ fontFamily: 'var(--font-sora)' }}>
                  {slot?.start ?? '--:--'}
                </div>
                <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: c.color ?? '#5bc4f5' }}/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#e8f4ff] truncate">{c.name}</div>
                  <div className="text-[10px] text-[#3a6080]">📍 {c.location ?? 'TBD'}</div>
                </div>
                {isNext && <span className="badge badge-green text-[9px]">NEXT</span>}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Mood check-in ── */}
      <motion.div className={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5a0c0] inline-block"/>Mood Check-in</div>
        <MoodCheckin initial={todayMood} />
      </motion.div>

      {/* ── Brain dump ── (spans 2 cols) */}
      <motion.div className={card} style={{ gridColumn: 'span 2' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] inline-block"/>Brain Dump</div>
        <BrainDump />
      </motion.div>

    </div>
  )
}
