'use client'
// src/app/(auth)/signup/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Account created! Check your email to confirm.')
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#041020] font-bold text-lg mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#4fa3e8,#5bc4f5)', boxShadow: '0 0 24px rgba(91,196,245,0.4)' }}>N</div>
        <h1 className="text-2xl font-bold text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>Create your island</h1>
        <p className="text-sm text-[#6a9ab8] mt-1">Free forever. No credit card needed.</p>
      </div>

      <div className="glass-card p-6">
        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium mb-5 transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8f4ff', fontFamily: 'var(--font-sora)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }}/>
          <span className="text-xs text-[#3a6080]">or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }}/>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-[#6a9ab8] mb-1 block" style={{ fontFamily: 'var(--font-sora)' }}>Full name</label>
            <input className="island-input" type="text" placeholder="Alex Chen"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-[#6a9ab8] mb-1 block" style={{ fontFamily: 'var(--font-sora)' }}>Email</label>
            <input className="island-input" type="email" placeholder="you@university.edu"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-[#6a9ab8] mb-1 block" style={{ fontFamily: 'var(--font-sora)' }}>Password</label>
            <input className="island-input" type="password" placeholder="Min. 8 characters"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2.5 mt-1 w-full text-center rounded-xl">
            {loading ? 'Creating island…' : 'Create my island →'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-[#3a6080] mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-[#5bc4f5] hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
