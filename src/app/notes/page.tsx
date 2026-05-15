// src/app/notes/page.tsx
import { createClient } from '@/lib/supabase/server'
import NotesClient from '@/components/notes/NotesClient'

export default async function NotesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: notes }, { data: folders }] = await Promise.all([
    supabase.from('notes').select('*').eq('user_id', user!.id)
      .eq('is_archived', false).order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false }),
    supabase.from('note_folders').select('*').eq('user_id', user!.id).order('name'),
  ])

  return <NotesClient initialNotes={notes ?? []} initialFolders={folders ?? []} />
}
