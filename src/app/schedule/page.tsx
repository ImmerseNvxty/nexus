// src/app/schedule/page.tsx
import { createClient } from '@/lib/supabase/server'
import ScheduleClient from '@/components/schedule/ScheduleClient'

export default async function SchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: classes }, { data: assignments }] = await Promise.all([
    supabase.from('classes').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('assignments').select('*, class:classes(name,color)').eq('user_id', user!.id).order('due_date', { ascending: true }),
  ])
  return <ScheduleClient initialClasses={classes ?? []} initialAssignments={assignments ?? []} />
}
