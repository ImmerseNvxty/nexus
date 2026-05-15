// src/app/island/page.tsx
import { createClient } from '@/lib/supabase/server'
import IslandPageClient from '@/components/island/IslandPageClient'

export default async function IslandPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: userAchievements },
    { data: allAchievements },
    { data: xpLog },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user!.id),
    supabase.from('achievements').select('*').order('xp_reward'),
    supabase.from('xp_transactions').select('*').eq('user_id', user!.id)
      .order('created_at', { ascending: false }).limit(20),
  ])

  return (
    <IslandPageClient
      profile={profile}
      userAchievements={userAchievements ?? []}
      allAchievements={allAchievements ?? []}
      xpLog={xpLog ?? []}
    />
  )
}
