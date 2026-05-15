// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all dashboard data in parallel
  const [
    { data: assignments },
    { data: classes },
    { data: events },
    { data: focusSessions },
    { data: habits },
    { data: habitCompletions },
    { data: moodEntry },
    { data: xpLog },
  ] = await Promise.all([
    supabase.from('assignments').select('*, class:classes(name,color)').eq('user_id', user!.id)
      .neq('status', 'done').order('due_date', { ascending: true }).limit(8),
    supabase.from('classes').select('*').eq('user_id', user!.id),
    supabase.from('calendar_events').select('*').eq('user_id', user!.id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true }).limit(10),
    supabase.from('focus_sessions').select('*').eq('user_id', user!.id)
      .gte('started_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('habits').select('*').eq('user_id', user!.id),
    supabase.from('habit_completions').select('*').eq('user_id', user!.id)
      .gte('date', new Date(Date.now() - 49 * 86400000).toISOString().split('T')[0]),
    supabase.from('mood_entries').select('*').eq('user_id', user!.id)
      .eq('date', new Date().toISOString().split('T')[0]).maybeSingle(),
    supabase.from('xp_transactions').select('amount').eq('user_id', user!.id)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ])

  // Weekly study hours
  const weeklyStudyMin = (focusSessions ?? []).reduce((acc, s) => acc + (s.duration_min ?? 0), 0)
  const weeklyXP = (xpLog ?? []).reduce((acc, x) => acc + (x.amount ?? 0), 0)

  return (
    <DashboardClient
      assignments={assignments ?? []}
      classes={classes ?? []}
      upcomingEvents={events ?? []}
      weeklyStudyHours={Math.round((weeklyStudyMin / 60) * 10) / 10}
      weeklyXP={weeklyXP}
      habits={habits ?? []}
      habitCompletions={habitCompletions ?? []}
      todayMood={moodEntry ?? null}
    />
  )
}
