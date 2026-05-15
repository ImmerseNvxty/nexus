'use client'
// src/components/settings/SettingsClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

interface Props { profile: Profile | null }

export default function SettingsClient({ profile: initialProfile }: Props) {
  const { updateProfile } = useProfileStore()
  const supabase = createClient()
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? '')
  const [focusDuration, setFocusDuration] = useState(initialProfile?.focus_duration ?? 25)
  const [breakDuration, setBreakDuration] = useState(initialProfile?.break_duration ?? 5)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'profile'|'focus'|'account'>('profile')

  async function saveProfile() {
    if (!initialProfile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: fullName, focus_duration: focusDuration, break_duration: breakDuration,
    }).eq('id', initialProfile.id)
    if (error) { toast.error('Failed to save'); setSaving(false); return }
    updateProfile({ full_name: fullName, focus_duration: focusDuration, break_duration: breakDuration })
    toast.success('Settings saved!')
    setSaving(false)
  }

  async function changePassword() {
    const { error } = await supabase.auth.updateUser({ password: prompt('New password:') ?? '' })
    if (error) toast.error(error.message)
    else toast.success('Password updated!')
  }

  async function deleteAccount() {
    if (!confirm('Are you sure? This permanently deletes your account and island. This cannot be undone.')) return
    if (!confirm('Last chance — delete everything?')) return
    toast.error('Please contact support to delete your account.')
  }

  const card = 'glass-card p-5'

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>Settings</h1>
        <p className="text-sm text-[#3a6080] mt-0.5">Manage your Nexus account and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {(['profile','focus','account'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize"
            style={{
              fontFamily: 'var(--font-sora)',
              background: tab === t ? 'rgba(91,196,245,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t ? 'rgba(91,196,245,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: tab === t ? '#5bc4f5' : '#6a9ab8',
            }}>{t}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.div className={card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#5bc4f5] inline-block"/>Profile</div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg,#4fa3e8,#c084fc)', border: '2px solid rgba(91,196,245,0.3)' }}>
              {fullName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>{fullName || 'Explorer'}</div>
              <div className="text-xs text-[#3a6080]">{initialProfile?.email}</div>
              <div className="text-xs text-[#5bc4f5] mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
                Level {initialProfile?.island_level} · {initialProfile?.xp_total?.toLocaleString()} total XP
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-[#6a9ab8] mb-1.5 block" style={{ fontFamily: 'var(--font-sora)' }}>Full name</label>
              <input className="island-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name"/>
            </div>
            <div>
              <label className="text-xs text-[#6a9ab8] mb-1.5 block" style={{ fontFamily: 'var(--font-sora)' }}>Email</label>
              <input className="island-input opacity-50 cursor-not-allowed" value={initialProfile?.email ?? ''} disabled/>
              <p className="text-[10px] text-[#2a5070] mt-1">Email cannot be changed here</p>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary py-2.5 rounded-xl text-sm mt-1">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </motion.div>
      )}

      {tab === 'focus' && (
        <motion.div className={card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#5de8a0] inline-block"/>Focus Preferences</div>
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs text-[#6a9ab8] mb-2 flex justify-between" style={{ fontFamily: 'var(--font-sora)' }}>
                <span>Focus session duration</span><span className="text-[#5bc4f5]">{focusDuration} min</span>
              </label>
              <input type="range" min={5} max={120} step={5} value={focusDuration} onChange={e => setFocusDuration(Number(e.target.value))} className="w-full accent-[#5bc4f5]"/>
              <div className="flex justify-between text-[9px] text-[#2a5070] mt-1">
                <span>5 min</span><span>Pomodoro (25)</span><span>Deep work (50)</span><span>120 min</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#6a9ab8] mb-2 flex justify-between" style={{ fontFamily: 'var(--font-sora)' }}>
                <span>Break duration</span><span className="text-[#5de8a0]">{breakDuration} min</span>
              </label>
              <input type="range" min={1} max={30} value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} className="w-full accent-[#5de8a0]"/>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(91,196,245,0.06)', border: '1px solid rgba(91,196,245,0.15)' }}>
              <div className="text-xs font-semibold text-[#5bc4f5] mb-1" style={{ fontFamily: 'var(--font-sora)' }}>ADHD Tip</div>
              <p className="text-xs text-[#6a9ab8] leading-relaxed">
                For ADHD, shorter sessions (15–25 min) often work better than longer ones. Experiment with what feels sustainable, not what feels ambitious.
              </p>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary py-2.5 rounded-xl text-sm">
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>
      )}

      {tab === 'account' && (
        <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className={card}>
            <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] inline-block"/>Security</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm font-medium text-[#e8f4ff] mb-1">Password</div>
                <div className="text-xs text-[#3a6080] mb-3">Update your account password</div>
                <button onClick={changePassword} className="btn-ghost py-2 px-4 rounded-xl text-sm">Change password</button>
              </div>
            </div>
          </div>

          <div className="glass-card p-5" style={{ border: '1px solid rgba(245,117,106,0.2)' }}>
            <div className="card-label"><span className="w-1.5 h-1.5 rounded-full bg-[#f5756a] inline-block"/>Danger Zone</div>
            <div className="text-sm font-medium text-[#e8f4ff] mb-1">Delete Account</div>
            <p className="text-xs text-[#3a6080] mb-3">Permanently delete your account, island, notes, and all data. This cannot be undone.</p>
            <button onClick={deleteAccount}
              className="py-2 px-4 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(245,117,106,0.12)', border: '1px solid rgba(245,117,106,0.3)', color: '#f5756a' }}>
              Delete my account
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
