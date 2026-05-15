// src/store/index.ts
// Global app state with Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Note, NoteFolder, ClassItem, Assignment, CalendarEvent, ChatMessage } from '@/types'

// ─── Auth / Profile Store ──────────────────────────────────────────────────
interface ProfileStore {
  profile: Profile | null
  setProfile: (p: Profile | null) => void
  updateProfile: (updates: Partial<Profile>) => void
  addXP: (amount: number) => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({ profile: state.profile ? { ...state.profile, ...updates } : null })),
      addXP: (amount) =>
        set((state) => {
          if (!state.profile) return state
          const newXPCurrent = state.profile.xp_current + amount
          const xpForNext = state.profile.island_level * 300
          if (newXPCurrent >= xpForNext) {
            return {
              profile: {
                ...state.profile,
                xp_total: state.profile.xp_total + amount,
                xp_current: newXPCurrent - xpForNext,
                island_level: state.profile.island_level + 1,
              },
            }
          }
          return {
            profile: {
              ...state.profile,
              xp_total: state.profile.xp_total + amount,
              xp_current: newXPCurrent,
            },
          }
        }),
    }),
    { name: 'ci-profile' }
  )
)

// ─── Notes Store ───────────────────────────────────────────────────────────
interface NotesStore {
  notes: Note[]
  folders: NoteFolder[]
  activeNoteId: string | null
  searchQuery: string
  activeTag: string | null
  activeFolderId: string | null
  setNotes: (notes: Note[]) => void
  setFolders: (folders: NoteFolder[]) => void
  upsertNote: (note: Note) => void
  deleteNote: (id: string) => void
  setActiveNote: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setActiveTag: (tag: string | null) => void
  setActiveFolderId: (id: string | null) => void
}

export const useNotesStore = create<NotesStore>()((set) => ({
  notes: [],
  folders: [],
  activeNoteId: null,
  searchQuery: '',
  activeTag: null,
  activeFolderId: null,
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  upsertNote: (note) =>
    set((state) => {
      const idx = state.notes.findIndex((n) => n.id === note.id)
      if (idx >= 0) {
        const updated = [...state.notes]
        updated[idx] = note
        return { notes: updated }
      }
      return { notes: [note, ...state.notes] }
    }),
  deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  setActiveNote: (id) => set({ activeNoteId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveTag: (activeTag) => set({ activeTag }),
  setActiveFolderId: (activeFolderId) => set({ activeFolderId }),
}))

// ─── Schedule Store ────────────────────────────────────────────────────────
interface ScheduleStore {
  classes: ClassItem[]
  assignments: Assignment[]
  setClasses: (classes: ClassItem[]) => void
  setAssignments: (assignments: Assignment[]) => void
  upsertClass: (c: ClassItem) => void
  deleteClass: (id: string) => void
  upsertAssignment: (a: Assignment) => void
  deleteAssignment: (id: string) => void
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void
}

export const useScheduleStore = create<ScheduleStore>()((set) => ({
  classes: [],
  assignments: [],
  setClasses: (classes) => set({ classes }),
  setAssignments: (assignments) => set({ assignments }),
  upsertClass: (c) =>
    set((state) => {
      const idx = state.classes.findIndex((x) => x.id === c.id)
      if (idx >= 0) { const updated = [...state.classes]; updated[idx] = c; return { classes: updated } }
      return { classes: [c, ...state.classes] }
    }),
  deleteClass: (id) => set((state) => ({ classes: state.classes.filter((c) => c.id !== id) })),
  upsertAssignment: (a) =>
    set((state) => {
      const idx = state.assignments.findIndex((x) => x.id === a.id)
      if (idx >= 0) { const updated = [...state.assignments]; updated[idx] = a; return { assignments: updated } }
      return { assignments: [a, ...state.assignments] }
    }),
  deleteAssignment: (id) => set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) })),
  updateAssignmentStatus: (id, status) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, status } : a)),
    })),
}))

// ─── Calendar Store ────────────────────────────────────────────────────────
interface CalendarStore {
  events: CalendarEvent[]
  view: 'month' | 'week' | 'day'
  selectedDate: Date
  setEvents: (events: CalendarEvent[]) => void
  upsertEvent: (event: CalendarEvent) => void
  deleteEvent: (id: string) => void
  setView: (view: 'month' | 'week' | 'day') => void
  setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarStore>()((set) => ({
  events: [],
  view: 'week',
  selectedDate: new Date(),
  setEvents: (events) => set({ events }),
  upsertEvent: (event) =>
    set((state) => {
      const idx = state.events.findIndex((e) => e.id === event.id)
      if (idx >= 0) { const updated = [...state.events]; updated[idx] = event; return { events: updated } }
      return { events: [event, ...state.events] }
    }),
  deleteEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
  setView: (view) => set({ view }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}))

// ─── AI Chat Store ─────────────────────────────────────────────────────────
interface AIChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  activeContext: 'general' | 'notes' | 'assignments' | 'schedule'
  addMessage: (msg: ChatMessage) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
  setContext: (ctx: AIChatStore['activeContext']) => void
}

export const useAIChatStore = create<AIChatStore>()((set) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm your Claude Island AI assistant 🏝️ I can help you break down assignments, generate flashcards, summarize notes, build study schedules, and give ADHD-friendly focus tips. What do you need?",
      timestamp: new Date(),
    },
  ],
  isLoading: false,
  activeContext: 'general',
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
  setContext: (activeContext) => set({ activeContext }),
}))

// ─── Focus Timer Store ─────────────────────────────────────────────────────
interface FocusStore {
  mode: 'pomodoro' | 'deep' | 'break'
  durationSec: number
  remainingSec: number
  isRunning: boolean
  sessionsToday: number
  totalFocusMinToday: number
  setMode: (mode: FocusStore['mode'], durationMin: number) => void
  setRemaining: (sec: number) => void
  setRunning: (running: boolean) => void
  incrementSessions: () => void
  addFocusMinutes: (min: number) => void
  reset: () => void
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      mode: 'pomodoro',
      durationSec: 25 * 60,
      remainingSec: 25 * 60,
      isRunning: false,
      sessionsToday: 0,
      totalFocusMinToday: 0,
      setMode: (mode, durationMin) =>
        set({ mode, durationSec: durationMin * 60, remainingSec: durationMin * 60, isRunning: false }),
      setRemaining: (remainingSec) => set({ remainingSec }),
      setRunning: (isRunning) => set({ isRunning }),
      incrementSessions: () => set((s) => ({ sessionsToday: s.sessionsToday + 1 })),
      addFocusMinutes: (min) => set((s) => ({ totalFocusMinToday: s.totalFocusMinToday + min })),
      reset: () => set((s) => ({ remainingSec: s.durationSec, isRunning: false })),
    }),
    { name: 'ci-focus' }
  )
)

// ─── UI Store ──────────────────────────────────────────────────────────────
interface UIStore {
  sidebarCollapsed: boolean
  activeModal: string | null
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  setSidebarCollapsed: (v: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  showToast: (message: string, type?: UIStore['toast'] extends null ? never : UIStore['toast']['type']) => void
  dismissToast: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  toast: null,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  dismissToast: () => set({ toast: null }),
}))
