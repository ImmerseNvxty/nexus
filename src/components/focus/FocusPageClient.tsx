'use client'
// src/components/focus/FocusPageClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import FocusTimer from '@/components/focus/FocusTimer'
import { useFocusStore } from '@/store'
import { format } from 'date-fns'
import type { FocusSession } from '@/types'

const SOUNDS = [
  { id: 'ocean',   label: '🌊 Ocean Waves',   desc: 'Calming sea ambience' },
  { id: 'rain',    label: '🌧 Rain on Glass',  desc: 'Steady rainfall sounds' },
  { id: 'cafe',    label: '☕ Coffee Shop',    desc: 'Soft background chatter' },
  { id: 'forest',  label: '🌲 Forest',         desc: 'Birds and rustling leaves' },
  { id: 'lofi',    label: '🎵 Lo-Fi Beats',    desc: 'Chill study music' },
  { id: 'white',   label: '〰️ White Noise',    desc: 'Pure focus sound' },
]

const ADHD_TIPS = [
  { icon: '🎯', title: 'Implementation Intentions', tip: '"At 3 PM I will open my Stats notes and do problem 8.1." Specific when/where plans work.' },
  { icon: '👥', title: 'Body Doubling', tip: 'Work alongside someone else — even virtually. The presence of another person boosts focus.' },
  { icon: '🧩', title: 'Task Batching', tip: 'Group similar small tasks together. Answer all emails, then all texts, then all readings.' },
  { icon: '⏰', title: 'Timeboxing', tip: 'Give each task a strict time limit. Open-ended tasks expand forever. Deadlines focus the brain.' },
  { icon: '🔔', title: 'Transition Alarms', tip: 'Set an alarm 5 min before switching tasks. Surprise transitions break ADHD flow states.' },
  { icon: '📝', title: 'Externalise Working Memory', tip: 'Write everything down. Your brain isn\'t a good hard drive — paper and notes are.' },
]

interface Props { recentSessions: FocusSession[] }

export default function FocusPageClient({ recentSessions }: Props) {
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(60)
  const { sessionsToday, totalFocusMinToday } = useFocusStore()

  const weeklyMin = recentSessions.reduce((acc, s) => acc + (s.duration_min ?? 0), 0)
  const totalSessions = recentSessions.length

  return (
    <div className="p-4 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>

      {/* ── Big timer ── */}
      <motion.div className="glass-card p-6 flex flex-col items-center" style={{ gridRow: 'span 2' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-label w-full"><span className="w-1.5 h-1.5 rounded-full bg-[#5de8a0] inline-block"/>Focus Session</div>
        <FocusTimer compact={false} />
        {/* Session stats */}
        <div className="grid grid-cols-2 gap-2 w-full mt-5">
          {[
            { val: sessionsToday, label: 'Today', color: '#5bc4f5' },
            { val: `${totalFocusMinToday}m`, label: 'Focus time', color: '#5de8a0' },
            { val: totalSessions, label: 'This week', color: '#c084fc' },
            { val: `${Math.round(weeklyMin / 60 * 10) / 10}h`, label: 'Weekly hrs', color: '#f5c842' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: s.color }}>{s.val}</div>
              <div className="text-[9px] text-[#2a5070] uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Ambient sounds ── */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] inline-block"/>Ambient Sound</div>
        <div className="flex flex-col gap-1.5">
          {SOUNDS.map(s => (
            <button key={s.id} onClick={() => setActiveSound(activeSound === s.id ? null : s.id)}
              className="flex items-center justify-between p-2.5 rounded-xl transition-all text-left"
              style={{
                background: activeSound === s.id ? 'rgba(91,196,245,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeSound === s.id ? 'rgba(91,196,245,0.35)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div>
                <div className="text-xs font-medium text-[#e8f4ff]">{s.label}</div>
                <div className="text-[9px] text-[#3a6080]">{s.desc}</div>
              </div>
              {activeSound === s.id && (
                <div className="flex gap-0.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-0.5 rounded-full bg-[#5bc4f5]"
                      style={{ height: 8 + Math.random() * 12, animation: `equalize ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` }}/>
                  ))}
                  <style>{`@keyframes equalize { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }`}</style>
                </div>
              )}
            </button>
          ))}
        </div>
        {activeSound && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[#3a6080] mb-1">
              <span>Volume</span><span style={{ color: '#5bc4f5', fontFamily: 'var(--font-sora)' }}>{volume}%</span>
            </div>
            <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-[#5bc4f5]"/>
          </div>
        )}
      </motion.div>

      {/* ── ADHD Tips ── */}
      <motion.div className="glass-card p-4 overflow-y-auto" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] inline-block"/>ADHD Focus Tips</div>
        <div className="flex flex-col gap-2">
          {ADHD_TIPS.map((tip, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{tip.icon}</span>
                <span className="text-xs font-semibold text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>{tip.title}</span>
              </div>
              <p className="text-[11px] text-[#6a9ab8] leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Session history ── */}
      <motion.div className="glass-card p-4" style={{ gridColumn: 'span 2' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#5bc4f5] inline-block"/>Recent Sessions</div>
        {recentSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#2a5070]">No sessions yet — start your first focus session! 🎯</div>
        ) : (
          <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 0.08 } as React.CSSProperties}>
            {recentSessions.slice(0, 8).map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <div className="text-lg">{s.session_type === 'pomodoro' ? '🍅' : s.session_type === 'deep' ? '🔭' : '☕'}</div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-[#e8f4ff] capitalize">{s.session_type} session</div>
                  <div className="text-[10px] text-[#3a6080]">{format(new Date(s.started_at), 'EEE MMM d, h:mm a')}</div>
                </div>
                <div className="text-xs text-right" style={{ fontFamily: 'var(--font-sora)' }}>
                  <div className="text-[#5bc4f5]">{s.duration_min} min</div>
                  <div className="text-[#f5c842] text-[10px]">+{s.xp_earned} XP</div>
                </div>
                <div className="rounded-md px-2 py-0.5 text-[9px]"
                  style={{ background: s.completed ? 'rgba(93,232,160,0.12)' : 'rgba(245,117,106,0.12)', color: s.completed ? '#5de8a0' : '#f5756a' }}>
                  {s.completed ? '✓ Done' : '✗ Stopped'}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
