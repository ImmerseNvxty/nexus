// src/types/index.ts
// Core domain types used throughout the app

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  island_level: number
  xp_total: number
  xp_current: number
  streak_current: number
  streak_best: number
  last_active_date: string | null
  theme: string
  focus_duration: number
  break_duration: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: object | null    // Tiptap JSON
  content_text: string | null
  folder_id: string | null
  color: string
  tags: string[]
  is_pinned: boolean
  is_archived: boolean
  word_count: number
  ai_summary: string | null
  created_at: string
  updated_at: string
  folder?: NoteFolder
}

export interface NoteFolder {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  parent_id: string | null
  created_at: string
}

export interface ClassItem {
  id: string
  user_id: string
  name: string
  code: string | null
  professor: string | null
  location: string | null
  color: string
  credits: number | null
  semester: string | null
  schedule: ClassScheduleSlot[]
  canvas_course_id: string | null
  created_at: string
  updated_at: string
}

export interface ClassScheduleSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  start: string  // "09:00"
  end: string    // "10:30"
}

export type AssignmentStatus = 'todo' | 'in_progress' | 'done' | 'overdue'
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Assignment {
  id: string
  user_id: string
  class_id: string | null
  title: string
  description: string | null
  due_date: string | null
  status: AssignmentStatus
  priority: AssignmentPriority
  estimated_minutes: number | null
  actual_minutes: number | null
  grade: string | null
  xp_reward: number
  ai_breakdown: AITaskBreakdown | null
  created_at: string
  updated_at: string
  class?: ClassItem
}

export interface AITaskBreakdown {
  steps: { step: number; title: string; description: string; minutes: number }[]
  total_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean
  color: string
  class_id: string | null
  assignment_id: string | null
  event_type: 'event' | 'study' | 'class' | 'deadline'
  recurrence: RecurrenceRule | null
  created_at: string
  updated_at: string
  class?: ClassItem
  assignment?: Assignment
}

export interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly'
  days?: string[]
  until?: string
}

export interface FocusSession {
  id: string
  user_id: string
  duration_min: number
  session_type: 'pomodoro' | 'deep' | 'break'
  class_id: string | null
  notes: string | null
  completed: boolean
  xp_earned: number
  started_at: string
  ended_at: string | null
}

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  frequency: string
  target_days: number[]
  created_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  date: string
  created_at: string
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface MoodEntry {
  id: string
  user_id: string
  mood: 1 | 2 | 3 | 4 | 5
  energy: number | null
  note: string | null
  date: string
  created_at: string
}

export interface XPTransaction {
  id: string
  user_id: string
  amount: number
  reason: string
  source_type: string | null
  source_id: string | null
  created_at: string
}

// AI message types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tool?: 'flashcards' | 'summary' | 'breakdown' | 'quiz' | 'planner'
  data?: unknown  // structured data from AI tools
}

export interface Flashcard {
  front: string
  back: string
}

// Dashboard stats
export interface WeeklyStats {
  study_hours: number
  tasks_done: number
  xp_earned: number
  sessions: number
  streak: number
}
