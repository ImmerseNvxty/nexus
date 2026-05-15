'use client'
// src/components/layout/AppShell.tsx
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import { IslandSVG } from '@/components/island/IslandSVG'
import type { Profile } from '@/types'

const NAV = [
  { href: '/dashboard',  icon: '🏠', label: 'Dashboard' },
  { href: '/notes',      icon: '📝', label: 'Notes'     },
  { href: '/schedule',   icon: '🗓',  label: 'Schedule'  },
  { href: '/calendar',   icon: '📅', label: 'Calendar'  },
  { href: '/focus',      icon: '🎯', label: 'Focus'     },
  { href: '/island',     icon: '🏝', label: 'My Island' },
  { href: '/settings',   icon: '⚙️', label: 'Settings'  },
]

interface Props {
  children: React.ReactNode
  profile: Profile | null
}

export default function AppShell({ children, profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { setProfile } = useProfileStore()
  const starsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (profile) setProfile(profile)
  }, [profile, setProfile])

  // Generate stars once
  useEffect(() => {
    if (!starsRef.current) return
    const container = starsRef.current
    for (let i = 0; i < 70; i++) {
      const star = document.createElement('div')
      star.style.cssText = `
        position:absolute;border-radius:50%;background:white;
        width:${Math.random() * 2 + 1}px;height:${Math.random() * 2 + 1}px;
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        opacity:${Math.random() * 0.5 + 0.2};
        animation:twinkle ${2 + Math.random() * 4}s ease-in-out infinite;
        animation-delay:${Math.random() * 4}s;
      `
      container.appendChild(star)
    }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const xpPercent = profile
    ? Math.round((profile.xp_current / (profile.island_level * 300)) * 100)
    : 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* ── Ocean background ── */}
      <div className="ocean-bg">
        <style>{`
          @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.9;transform:scale(1.5)} }
          @keyframes float   { 0%,100%{transform:translateY(0)}        50%{transform:translateY(-10px)} }
          @keyframes shimmer { 0%,100%{transform:translateX(-30%) scaleX(1);opacity:.4} 50%{transform:translateX(10%) scaleX(1.35);opacity:.85} }
        `}</style>
        <div ref={starsRef} className="absolute inset-0 overflow-hidden" style={{ height: '65%' }}/>
        <div className="ocean-surface"/>
        <div className="ocean-shimmer"/>
        {/* Floating island in background */}
        <div className="absolute pointer-events-none"
          style={{ bottom: '30%', left: '50%', transform: 'translateX(-50%)', opacity: 0.18, animation: 'float 7s ease-in-out infinite' }}>
          <IslandSVG level={profile?.island_level ?? 1} width={480}/>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className="relative z-50 flex flex-col items-center w-16 py-4 gap-1.5 flex-shrink-0"
        style={{ background: 'rgba(4,16,31,0.88)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Logo */}
        <Link href="/dashboard" className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-[#041020] mb-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#4fa3e8,#5bc4f5)', boxShadow: '0 0 18px rgba(91,196,245,0.35)', fontFamily: 'var(--font-sora)' }}>
          N
        </Link>

        {/* Nav items */}
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all duration-200"
              style={{
                background: active ? 'rgba(91,196,245,0.15)' : 'transparent',
                color: active ? '#5bc4f5' : '#4a7a9a',
                boxShadow: active ? '0 0 12px rgba(91,196,245,0.2)' : 'none',
                border: active ? '1px solid rgba(91,196,245,0.25)' : '1px solid transparent',
              }}>
              <span>{icon}</span>
              {/* Tooltip */}
              <span className="absolute left-14 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                style={{ background: 'rgba(4,16,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f4ff', fontFamily: 'var(--font-sora)' }}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* Sign out at bottom */}
        <div className="mt-auto">
          <button onClick={handleSignOut}
            className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all"
            style={{ color: '#3a5a7a' }}
            title="Sign out">
            <span>🚪</span>
            <span className="absolute left-14 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ background: 'rgba(4,16,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f4ff', fontFamily: 'var(--font-sora)' }}>
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center px-5 h-14 flex-shrink-0 gap-3"
          style={{ background: 'rgba(4,16,31,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-sm text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>
            {greeting()}, <span style={{ color: '#5bc4f5' }}>{profile?.full_name?.split(' ')[0] ?? 'Explorer'}</span> 👋
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Streak badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', color: '#f5c842', fontFamily: 'var(--font-sora)' }}>
              🔥 {profile?.streak_current ?? 0} day streak
            </div>

            {/* XP bar */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#3a6080]" style={{ fontFamily: 'var(--font-sora)' }}>XP</span>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg,#4fa3e8,#5bc4f5)', boxShadow: '0 0 8px rgba(91,196,245,0.4)' }}/>
              </div>
              <span className="text-xs" style={{ color: '#3a6080', fontFamily: 'var(--font-sora)' }}>{profile?.xp_current ?? 0}</span>
            </div>

            {/* Level badge */}
            <div className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1a0a00]"
              style={{ background: 'linear-gradient(135deg,#f5c842,#e8a000)', fontFamily: 'var(--font-sora)' }}>
              Lv. {profile?.island_level ?? 1}
            </div>

            {/* Avatar */}
            <Link href="/settings">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#4fa3e8,#c084fc)', border: '2px solid rgba(91,196,245,0.3)' }}>
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} className="h-full"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
