// src/app/calendar/page.tsx
import { createClient } from '@/lib/supabase/server'
import CalendarClient from '@/components/calendar/CalendarClient'

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: events }, { data: classes }] = await Promise.all([
    supabase.from('calendar_events').select('*').eq('user_id', user!.id),
    supabase.from('classes').select('*').eq('user_id', user!.id),
  ])
  // Also build class events from recurring schedules
  return <CalendarClient initialEvents={events ?? []} classes={classes ?? []} />
}
