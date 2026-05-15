'use client'
// src/components/landing/LandingPage.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { IslandSVG } from '@/components/island/IslandSVG'

const features = [
  { icon: '📅', title: 'Smart Calendar', desc: 'Drag-and-drop events, weekly/monthly views, class schedules, deadline tracking.' },
  { icon: '📝', title: 'Rich Notes', desc: 'Full rich-text editor with folders, tags, images, highlights, and instant search.' },
  { icon: '🎯', title: 'Focus Timer', desc: 'Pomodoro & deep work modes with ambient sounds to keep you in the zone.' },
  { icon: '🔥', title: 'Streak System', desc: 'ADHD-friendly momentum meter — missing a day never kills your progress.' },
  { icon: '🏝', title: 'Your Island', desc: 'A growing productivity island that evolves as you complete tasks and hit streaks.' },
  { icon: '📊', title: 'Progress Stats', desc: 'Weekly study hours, assignment completion, XP earned — all in one view.' },
]

const stats = [
  { value: '14.5h', label: 'Avg study hours/week' },
  { value: '94%', label: 'Assignment completion' },
  { value: '21 days', label: 'Longest streak' },
  { value: '3,240', label: 'XP earned this month' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(180deg,#04101f 0%,#0a1628 60%,#0d2240 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%', top: Math.random() * 70 + '%',
              opacity: Math.random() * 0.6 + 0.2,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + 's',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%,100%{transform:translateX(-30%) scaleX(1);opacity:.5} 50%{transform:translateX(10%) scaleX(1.4);opacity:1} }
      `}</style>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#041020] font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#4fa3e8,#5bc4f5)', boxShadow: '0 0 20px rgba(91,196,245,0.35)' }}>
            N
          </div>
          <span className="font-semibold text-[15px] text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>Nexus</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#6a9ab8]">
          <a href="#features" className="hover:text-[#e8f4ff] transition-colors">Features</a>
          <a href="#how" className="hover:text-[#e8f4ff] transition-colors">How it works</a>
          <a href="#stats" className="hover:text-[#e8f4ff] transition-colors">Stats</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm px-4 py-2 rounded-xl">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2 rounded-xl">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-12 pb-0 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'rgba(91,196,245,0.1)', border: '1px solid rgba(91,196,245,0.25)', color: '#5bc4f5', fontFamily: 'var(--font-sora)' }}>
            ✨ The student productivity OS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5 text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>
            Your personal<br />
            <span style={{ background: 'linear-gradient(135deg,#4fa3e8,#5bc4f5,#7ec8f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              productivity island
            </span>
          </h1>
          <p className="text-lg text-[#a8cce8] max-w-2xl mx-auto mb-8 leading-relaxed">
            Nexus is a calming, ADHD-friendly student dashboard — combining notes, schedule, calendar, focus timer, and streak tracking into one beautiful, growing world.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="btn-primary px-7 py-3 rounded-xl text-base">
              Start building your island →
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 rounded-xl text-base text-[#a8cce8]">
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Island hero */}
        <motion.div className="relative mt-12 mx-auto" style={{ width: '100%', maxWidth: 640 }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <div style={{ animation: 'float 6s ease-in-out infinite' }}>
            <IslandSVG level={14} />
          </div>
          {/* Ocean shimmer */}
          <div className="absolute" style={{ bottom: 0, left: '-50%', right: '-50%', height: 2,
            background: 'linear-gradient(90deg,transparent,rgba(91,196,245,0.5),transparent)',
            animation: 'shimmer 6s ease-in-out infinite' }} />
        </motion.div>
      </section>

      {/* Stats bar */}
      <section id="stats" className="relative z-10 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} className="glass-card p-5 text-center"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-sora)', background: 'linear-gradient(135deg,#4fa3e8,#5bc4f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </div>
              <div className="text-xs text-[#6a9ab8]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-[#e8f4ff] mb-3" style={{ fontFamily: 'var(--font-sora)' }}>
              Everything you need, nothing you don't
            </h2>
            <p className="text-[#6a9ab8]">Built for students with ADHD in mind — clear, calm, and distraction-free</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} className="glass-card p-6"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#e8f4ff] mb-2" style={{ fontFamily: 'var(--font-sora)' }}>{f.title}</h3>
                <p className="text-sm text-[#6a9ab8] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 className="text-3xl font-bold text-[#e8f4ff] mb-12" style={{ fontFamily: 'var(--font-sora)' }}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            How your island grows
          </motion.h2>
          <div className="flex flex-col gap-6">
            {[
              { step: '01', title: 'Sign up and set up your classes', desc: 'Add your courses, professors, schedules, and assignment deadlines in minutes.' },
              { step: '02', title: 'Study, focus, take notes', desc: 'Use the Pomodoro timer, write rich notes, and track your daily habits.' },
              { step: '03', title: 'Complete tasks & build streaks', desc: 'Every completed assignment and focus session earns XP and grows your island.' },
              { step: '04', title: 'Unlock buildings & level up', desc: 'Your island evolves with new trees, buildings and decorations as you progress.' },
            ].map((item, i) => (
              <motion.div key={i} className="glass-card p-6 text-left flex items-start gap-5"
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-2xl font-bold flex-shrink-0" style={{ fontFamily: 'var(--font-sora)', color: 'rgba(91,196,245,0.3)' }}>{item.step}</div>
                <div>
                  <h3 className="font-semibold text-[#e8f4ff] mb-1" style={{ fontFamily: 'var(--font-sora)' }}>{item.title}</h3>
                  <p className="text-sm text-[#6a9ab8]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-[#e8f4ff] mb-4" style={{ fontFamily: 'var(--font-sora)' }}>
            Ready to build your island?
          </h2>
          <p className="text-[#6a9ab8] mb-8 text-lg">Join thousands of students who study smarter with Nexus.</p>
          <Link href="/signup" className="btn-primary px-8 py-4 rounded-xl text-base inline-block">
            Get started — it's free →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-8 border-t text-center text-sm text-[#3a6080]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'var(--font-sora)' }}>Nexus</span> — Built for students, by students. Study smarter. 🏝
      </footer>
    </div>
  )
}
