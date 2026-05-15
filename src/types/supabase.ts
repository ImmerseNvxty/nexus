// src/types/supabase.ts
// Auto-generated types from Supabase schema
// Regenerate with: npm run db:generate-types
// This is a minimal stub — the CLI will produce the full version

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; email: string; full_name: string | null; avatar_url: string | null
          island_level: number; xp_total: number; xp_current: number
          streak_current: number; streak_best: number; last_active_date: string | null
          theme: string; focus_duration: number; break_duration: number
          created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; email: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      notes: {
        Row: {
          id: string; user_id: string; title: string; content: Json | null; content_text: string | null
          folder_id: string | null; color: string; tags: string[]; is_pinned: boolean
          is_archived: boolean; word_count: number; ai_summary: string | null
          created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['notes']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['notes']['Row']>
      }
      classes: {
        Row: {
          id: string; user_id: string; name: string; code: string | null; professor: string | null
          location: string | null; color: string; credits: number | null; semester: string | null
          schedule: Json; canvas_course_id: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['classes']['Row']> & { user_id: string; name: string }
        Update: Partial<Database['public']['Tables']['classes']['Row']>
      }
      assignments: {
        Row: {
          id: string; user_id: string; class_id: string | null; title: string
          description: string | null; due_date: string | null
          status: 'todo' | 'in_progress' | 'done' | 'overdue'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          estimated_minutes: number | null; actual_minutes: number | null
          grade: string | null; xp_reward: number; ai_breakdown: Json | null
          created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['assignments']['Row']> & { user_id: string; title: string }
        Update: Partial<Database['public']['Tables']['assignments']['Row']>
      }
      calendar_events: {
        Row: {
          id: string; user_id: string; title: string; description: string | null
          start_time: string; end_time: string; all_day: boolean; color: string
          class_id: string | null; assignment_id: string | null
          event_type: string; recurrence: Json | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['calendar_events']['Row']> & {
          user_id: string; title: string; start_time: string; end_time: string
        }
        Update: Partial<Database['public']['Tables']['calendar_events']['Row']>
      }
      focus_sessions: {
        Row: {
          id: string; user_id: string; duration_min: number; session_type: string
          class_id: string | null; notes: string | null; completed: boolean
          xp_earned: number; started_at: string; ended_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['focus_sessions']['Row']> & { user_id: string; duration_min: number }
        Update: Partial<Database['public']['Tables']['focus_sessions']['Row']>
      }
      habits: {
        Row: { id: string; user_id: string; name: string; icon: string; color: string; frequency: string; target_days: number[]; created_at: string }
        Insert: Partial<Database['public']['Tables']['habits']['Row']> & { user_id: string; name: string }
        Update: Partial<Database['public']['Tables']['habits']['Row']>
      }
      habit_completions: {
        Row: { id: string; habit_id: string; user_id: string; date: string; created_at: string }
        Insert: Partial<Database['public']['Tables']['habit_completions']['Row']> & { habit_id: string; user_id: string; date: string }
        Update: Partial<Database['public']['Tables']['habit_completions']['Row']>
      }
      mood_entries: {
        Row: { id: string; user_id: string; mood: number; energy: number | null; note: string | null; date: string; created_at: string }
        Insert: Partial<Database['public']['Tables']['mood_entries']['Row']> & { user_id: string; mood: number }
        Update: Partial<Database['public']['Tables']['mood_entries']['Row']>
      }
      achievements: {
        Row: { id: string; key: string; name: string; description: string | null; icon: string | null; xp_reward: number; rarity: string }
        Insert: Partial<Database['public']['Tables']['achievements']['Row']> & { key: string; name: string }
        Update: Partial<Database['public']['Tables']['achievements']['Row']>
      }
      user_achievements: {
        Row: { id: string; user_id: string; achievement_id: string; earned_at: string }
        Insert: Partial<Database['public']['Tables']['user_achievements']['Row']> & { user_id: string; achievement_id: string }
        Update: Partial<Database['public']['Tables']['user_achievements']['Row']>
      }
      xp_transactions: {
        Row: { id: string; user_id: string; amount: number; reason: string; source_type: string | null; source_id: string | null; created_at: string }
        Insert: Partial<Database['public']['Tables']['xp_transactions']['Row']> & { user_id: string; amount: number; reason: string }
        Update: Partial<Database['public']['Tables']['xp_transactions']['Row']>
      }
    }
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_amount: number; p_reason: string; p_source_type?: string; p_source_id?: string }
        Returns: Json
      }
      update_streak: {
        Args: { p_user_id: string }
        Returns: void
      }
    }
  }
}
