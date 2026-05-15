// src/app/focus/page.tsx
import { createClient } from '@/lib/supabase/server'
import FocusPageClient from '@/components/focus/FocusPageClient'

export default async function FocusPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: sessions } = await supabase.from('focus_sessions').select('*')
    .eq('user_id', user!.id)
    .gte('started_at', new Date(Date.now() - 7 * 86400000).toISOString())
    .order('started_at', { ascending: false })
  return <FocusPageClient recentSessions={sessions ?? []} />
}
