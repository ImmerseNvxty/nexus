'use client'
// src/components/notes/NotesClient.tsx
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import NoteEditor from '@/components/notes/NoteEditor'
import toast from 'react-hot-toast'
import type { Note, NoteFolder } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const COLORS = ['#f5c842','#5bc4f5','#c084fc','#5de8a0','#f5756a','#f5a0c0','#ffffff']
const NOTE_COLORS: Record<string, string> = {
  '#f5c842': 'rgba(245,200,66,0.08)',
  '#5bc4f5': 'rgba(91,196,245,0.08)',
  '#c084fc': 'rgba(192,132,252,0.08)',
  '#5de8a0': 'rgba(93,232,160,0.08)',
  '#f5756a': 'rgba(245,117,106,0.08)',
}

interface Props {
  initialNotes: Note[]
  initialFolders: NoteFolder[]
}

export default function NotesClient({ initialNotes, initialFolders }: Props) {
  const { profile } = useProfileStore()
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [folders] = useState<NoteFolder[]>(initialFolders)
  const [activeId, setActiveId] = useState<string | null>(initialNotes[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const activeNote = notes.find(n => n.id === activeId) ?? null

  // Collect all tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags ?? [])))

  // Filter notes
  const filtered = notes.filter(n => {
    if (activeFolder && n.folder_id !== activeFolder) return false
    if (activeTag && !n.tags?.includes(activeTag)) return false
    if (search) {
      const q = search.toLowerCase()
      return n.title.toLowerCase().includes(q) || (n.content_text ?? '').toLowerCase().includes(q)
    }
    return true
  })

  async function createNote() {
    if (!profile) return
    const { data, error } = await supabase.from('notes').insert({
      user_id: profile.id, title: 'Untitled Note',
      content: null, content_text: '', tags: [],
      folder_id: activeFolder, color: '#5bc4f5',
    }).select().single()
    if (error) { toast.error('Failed to create note'); return }
    setNotes(prev => [data as Note, ...prev])
    setActiveId(data.id)
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id ?? null)
    toast.success('Note deleted')
  }

  async function togglePin(note: Note) {
    const pinned = !note.is_pinned
    await supabase.from('notes').update({ is_pinned: pinned }).eq('id', note.id)
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_pinned: pinned } : n))
  }

  const handleSave = useCallback((updated: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, ...updated } : n))
  }, [activeId])

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Sidebar ── */}
      <div className="flex flex-col w-64 flex-shrink-0 overflow-hidden"
        style={{ background: 'rgba(4,12,26,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Search + new */}
        <div className="p-3 flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="island-input flex-1 text-xs py-2"
            placeholder="🔍 Search notes…"/>
          <button onClick={createNote} className="btn-primary px-3 py-2 rounded-xl text-xs flex-shrink-0">+</button>
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div className="px-3 pb-2">
            <div className="text-[9px] text-[#2a5070] uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-sora)' }}>Folders</div>
            {folders.map(f => (
              <button key={f.id} onClick={() => setActiveFolder(activeFolder === f.id ? null : f.id)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 mb-0.5 transition-all"
                style={{ background: activeFolder === f.id ? 'rgba(91,196,245,0.1)' : 'transparent', color: activeFolder === f.id ? '#5bc4f5' : '#6a9ab8' }}>
                <span>{f.icon}</span>{f.name}
              </button>
            ))}
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="px-3 pb-2">
            <div className="text-[9px] text-[#2a5070] uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-sora)' }}>Tags</div>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className="text-[10px] px-2 py-0.5 rounded-md transition-all"
                  style={{
                    background: activeTag === tag ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${activeTag === tag ? 'rgba(192,132,252,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: activeTag === tag ? '#c084fc' : '#3a6080',
                  }}>#{tag}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="text-[9px] text-[#2a5070] uppercase tracking-wider mb-1.5 px-1" style={{ fontFamily: 'var(--font-sora)' }}>
            {filtered.length} note{filtered.length !== 1 ? 's' : ''}
          </div>
          {filtered.map(note => (
            <motion.button key={note.id} onClick={() => setActiveId(note.id)}
              className="w-full text-left p-2.5 rounded-xl mb-1.5 group transition-all"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: activeId === note.id
                  ? NOTE_COLORS[note.color] ?? 'rgba(91,196,245,0.1)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeId === note.id ? note.color + '55' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: note.color }}/>
                {note.is_pinned && <span className="text-[9px]">📌</span>}
                <span className="text-xs font-medium text-[#e8f4ff] truncate flex-1">{note.title}</span>
              </div>
              <div className="text-[10px] text-[#3a6080] truncate">{note.content_text?.slice(0, 60) || 'Empty note…'}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-[#2a4060]">{formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); togglePin(note) }} className="text-[10px] hover:text-[#f5c842]">📌</button>
                  <button onClick={e => { e.stopPropagation(); deleteNote(note.id) }} className="text-[10px] hover:text-[#f5756a]">🗑</button>
                </div>
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-[#2a5070]">
              {search ? 'No notes match your search' : 'No notes yet — create one!'}
            </div>
          )}
        </div>

        {/* Color picker for active note */}
        {activeNote && (
          <div className="p-3 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-[9px] text-[#2a5070] uppercase tracking-wider" style={{ fontFamily: 'var(--font-sora)' }}>Color</span>
            {COLORS.map(c => (
              <button key={c} onClick={async () => {
                await supabase.from('notes').update({ color: c }).eq('id', activeNote.id)
                handleSave({ color: c })
              }}
                className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                style={{ background: c, outline: activeNote.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}/>
            ))}
          </div>
        )}
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 overflow-hidden">
        {activeNote
          ? <NoteEditor key={activeNote.id} note={activeNote} onSave={handleSave}/>
          : (
            <div className="h-full flex items-center justify-center flex-col gap-3">
              <div className="text-4xl opacity-30">📝</div>
              <p className="text-sm text-[#3a6080]">Select a note or create a new one</p>
              <button onClick={createNote} className="btn-primary px-5 py-2 rounded-xl text-sm">+ New note</button>
            </div>
          )
        }
      </div>
    </div>
  )
}
