'use client'
// src/components/island/IslandPageClient.tsx
import { motion } from 'framer-motion'
import { IslandSVG } from '@/components/island/IslandSVG'
import { format, formatDistanceToNow } from 'date-fns'
import type { Profile, Achievement, UserAchievement, XPTransaction } from '@/types'

const RARITY_COLORS: Record<string, string> = {
  common: '#a8cce8', rare: '#5bc4f5', epic: '#c084fc', legendary: '#f5c842',
}
const RARITY_BG: Record<string, string> = {
  common: 'rgba(168,204,232,0.08)', rare: 'rgba(91,196,245,0.1)', epic: 'rgba(192,132,252,0.1)', legendary: 'rgba(245,200,66,0.12)',
}

const ISLAND_BUILDINGS = [
  { level: 1,  icon: '🏛', name: 'Study Tower',    desc: 'Your home base' },
  { level: 3,  icon: '🗼', name: 'Lighthouse',      desc: 'Guides your journey' },
  { level: 5,  icon: '☕', name: 'Island Café',     desc: 'Recharge here' },
  { level: 6,  icon: '🌿', name: 'Garden',          desc: 'Bloom with habits' },
  { level: 8,  icon: '🔭', name: 'Observatory',     desc: 'See the big picture' },
  { level: 10, icon: '📚', name: 'Library',         desc: 'Knowledge is power' },
  { level: 12, icon: '⛵', name: 'Harbour',         desc: 'Set sail for goals' },
  { level: 15, icon: '🏰', name: 'Island Castle',   desc: 'Ruler of learning' },
  { level: 18, icon: '🌌', name: 'Planetarium',     desc: 'Beyond limits' },
  { level: 20, icon: '👑', name: 'Hall of Fame',    desc: 'Legendary status' },
]

interface Props {
  profile: Profile | null
  userAchievements: (UserAchievement & { achievement?: Achievement })[]
  allAchievements: Achievement[]
  xpLog: XPTransaction[]
}

export default function IslandPageClient({ profile, userAchievements, allAchievements, xpLog }: Props) {
  const level = profile?.island_level ?? 1
  const xpCurrent = profile?.xp_current ?? 0
  const xpForNext = level * 300
  const xpPct = Math.round((xpCurrent / xpForNext) * 100)
  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id))
  const totalXP = profile?.xp_total ?? 0

  const nextBuilding = ISLAND_BUILDINGS.find(b => b.level > level)

  return (
    <div className="p-4 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>

      {/* ── Island Preview ── (spans 2 cols, 2 rows) */}
      <motion.div className="glass-card p-5 flex flex-col items-center" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-label w-full"><span className="w-1.5 h-1.5 rounded-full bg-[#5de8a0] inline-block"/>Your Island — Level {level}</div>

        {/* Island SVG */}
        <div style={{ animation: 'float 6s ease-in-out infinite', marginBottom: 8 }}>
          <IslandSVG level={level} width={420} />
        </div>
        <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>

        {/* XP Progress */}
        <div className="w-full mt-2">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#6a9ab8]" style={{ fontFamily: 'var(--font-sora)' }}>Level {level}</span>
            <span className="text-[#3a6080]">{xpCurrent.toLocaleString()} / {xpForNext.toLocaleString()} XP</span>
            <span className="text-[#6a9ab8]" style={{ fontFamily: 'var(--font-sora)' }}>Level {level + 1}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              style={{ background: 'linear-gradient(90deg,#4fa3e8,#5bc4f5)', boxShadow: '0 0 10px rgba(91,196,245,0.5)' }}/>
          </div>
          <div className="text-center text-xs text-[#3a6080] mt-1">{xpForNext - xpCurrent} XP until Level {level + 1}</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 w-full mt-4">
          {[
            { val: totalXP.toLocaleString(), label: 'Total XP',     color: '#f5c842' },
            { val: profile?.streak_current ?? 0, label: 'Day streak', color: '#f5756a' },
            { val: earnedIds.size,            label: 'Achievements', color: '#c084fc' },
            { val: `${Math.round((earnedIds.size / allAchievements.length) * 100)}%`, label: 'Completion', color: '#5de8a0' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: s.color }}>{s.val}</div>
              <div className="text-[9px] text-[#2a5070] uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Next unlock */}
        {nextBuilding && (
          <div className="w-full mt-4 rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.2)' }}>
            <span className="text-3xl">{nextBuilding.icon}</span>
            <div>
              <div className="text-xs font-semibold text-[#f5c842]" style={{ fontFamily: 'var(--font-sora)' }}>
                Next unlock: {nextBuilding.name}
              </div>
              <div className="text-[10px] text-[#6a8050]">{nextBuilding.desc} · Reach Level {nextBuilding.level}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-[#f5c842]" style={{ fontFamily: 'var(--font-sora)' }}>Lv. {nextBuilding.level}</div>
              <div className="text-[10px] text-[#3a6080]">{(nextBuilding.level - level)} more lvl{nextBuilding.level - level > 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Buildings unlocked ── */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#7ec8f5] inline-block"/>Island Buildings</div>
        <div className="flex flex-col gap-1.5">
          {ISLAND_BUILDINGS.map(b => {
            const unlocked = level >= b.level
            return (
              <div key={b.level} className="flex items-center gap-2.5 p-2 rounded-lg transition-all"
                style={{
                  background: unlocked ? 'rgba(91,196,245,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${unlocked ? 'rgba(91,196,245,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  opacity: unlocked ? 1 : 0.45,
                }}>
                <span className="text-xl" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: unlocked ? '#e8f4ff' : '#3a6080' }}>{b.name}</div>
                  <div className="text-[9px] text-[#2a5070]">{b.desc}</div>
                </div>
                <div className="text-[9px] rounded-md px-1.5 py-0.5 flex-shrink-0"
                  style={{
                    background: unlocked ? 'rgba(93,232,160,0.12)' : 'rgba(255,255,255,0.06)',
                    color: unlocked ? '#5de8a0' : '#2a5070',
                    fontFamily: 'var(--font-sora)',
                  }}>
                  {unlocked ? '✓ Lv.' + b.level : 'Lv.' + b.level}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── XP Log ── */}
      <motion.div className="glass-card p-4 overflow-y-auto" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] inline-block"/>XP History</div>
        {xpLog.length === 0
          ? <div className="text-xs text-[#2a5070] text-center py-6">No XP earned yet — complete tasks and focus sessions!</div>
          : (
            <div className="flex flex-col gap-1.5">
              {xpLog.map(tx => (
                <div key={tx.id} className="flex items-center gap-2.5 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-base">
                    {tx.source_type === 'assignment' ? '✅' : tx.source_type === 'focus' ? '⏱' : tx.source_type === 'streak' ? '🔥' : tx.source_type === 'achievement' ? '🏆' : '⭐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#a8cce8] truncate">{tx.reason}</div>
                    <div className="text-[9px] text-[#2a5070]">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-sm font-bold flex-shrink-0" style={{ color: '#f5c842', fontFamily: 'var(--font-sora)' }}>
                    +{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </motion.div>

      {/* ── Achievements ── (spans 3 cols) */}
      <motion.div className="glass-card p-4" style={{ gridColumn: 'span 3' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] inline-block"/>
          Achievements — {earnedIds.size} / {allAchievements.length} earned
        </div>
        <div className="grid grid-cols-6 gap-2">
          {allAchievements.map(ach => {
            const earned = earnedIds.has(ach.id)
            const earnedAt = userAchievements.find(ua => ua.achievement_id === ach.id)?.earned_at
            return (
              <div key={ach.id}
                className="rounded-xl p-3 text-center transition-all"
                title={earned ? `Earned ${earnedAt ? format(new Date(earnedAt), 'MMM d, yyyy') : ''}` : ach.description ?? ''}
                style={{
                  background: earned ? RARITY_BG[ach.rarity] : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${earned ? RARITY_COLORS[ach.rarity] + '44' : 'rgba(255,255,255,0.06)'}`,
                  opacity: earned ? 1 : 0.4,
                  filter: earned ? 'none' : 'grayscale(0.8)',
                }}>
                <div className="text-2xl mb-1.5">{ach.icon ?? '⭐'}</div>
                <div className="text-[10px] font-semibold leading-tight" style={{ color: earned ? RARITY_COLORS[ach.rarity] : '#3a6080', fontFamily: 'var(--font-sora)' }}>
                  {ach.name}
                </div>
                <div className="text-[8px] mt-1 capitalize" style={{ color: RARITY_COLORS[ach.rarity], opacity: 0.7 }}>{ach.rarity}</div>
                {earned && (
                  <div className="text-[8px] text-[#5de8a0] mt-0.5">+{ach.xp_reward} XP</div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

    </div>
  )
}
