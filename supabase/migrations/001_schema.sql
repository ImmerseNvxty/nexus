-- ============================================================
-- Claude Island — Full Database Schema
-- Run this in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  full_name     text,
  avatar_url    text,
  -- Island / gamification state
  island_level  int  default 1,
  xp_total      int  default 0,
  xp_current    int  default 0,  -- XP toward next level
  streak_current int default 0,
  streak_best   int  default 0,
  last_active_date date,
  -- Preferences
  theme         text default 'dark',
  focus_duration int default 25,  -- minutes
  break_duration int default 5,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Row-level security
alter table public.profiles enable row level security;
create policy "Users can read own profile"    on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────
create table public.notes (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null default 'Untitled Note',
  content     jsonb,             -- Tiptap JSON format
  content_text text,             -- Plain text for full-text search
  folder_id   uuid,              -- self-reference below
  color       text default '#f5c842',
  tags        text[] default '{}',
  is_pinned   boolean default false,
  is_archived boolean default false,
  word_count  int default 0,
  ai_summary  text,              -- cached AI summary
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.notes enable row level security;
create policy "Users can CRUD own notes" on public.notes
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index notes_user_id_idx    on public.notes(user_id);
create index notes_folder_id_idx  on public.notes(folder_id);
create index notes_search_idx     on public.notes using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,'')));

-- NOTE FOLDERS
create table public.note_folders (
  id        uuid default uuid_generate_v4() primary key,
  user_id   uuid references public.profiles(id) on delete cascade not null,
  name      text not null,
  color     text default '#5bc4f5',
  icon      text default '📁',
  parent_id uuid references public.note_folders(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.note_folders enable row level security;
create policy "Users can CRUD own folders" on public.note_folders
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add folder FK after table exists
alter table public.notes add constraint notes_folder_fk
  foreign key (folder_id) references public.note_folders(id) on delete set null;

-- ─────────────────────────────────────────
-- CLASSES / COURSES
-- ─────────────────────────────────────────
create table public.classes (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  name            text not null,
  code            text,                -- e.g. "MATH 301"
  professor       text,
  location        text,
  color           text default '#5bc4f5',
  credits         int,
  semester        text,                -- e.g. "Fall 2025"
  -- Weekly schedule (array of day+time pairs)
  schedule        jsonb default '[]',  -- [{day:"Monday",start:"09:00",end:"10:30"}]
  canvas_course_id text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.classes enable row level security;
create policy "Users can CRUD own classes" on public.classes
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- ASSIGNMENTS
-- ─────────────────────────────────────────
create type assignment_status as enum ('todo', 'in_progress', 'done', 'overdue');
create type assignment_priority as enum ('low', 'medium', 'high', 'urgent');

create table public.assignments (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  class_id    uuid references public.classes(id) on delete set null,
  title       text not null,
  description text,
  due_date    timestamptz,
  status      assignment_status default 'todo',
  priority    assignment_priority default 'medium',
  estimated_minutes int,
  actual_minutes    int,
  grade       text,
  xp_reward   int default 50,
  ai_breakdown jsonb,   -- cached AI task breakdown
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.assignments enable row level security;
create policy "Users can CRUD own assignments" on public.assignments
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index assignments_user_id_idx   on public.assignments(user_id);
create index assignments_due_date_idx  on public.assignments(due_date);
create index assignments_status_idx    on public.assignments(status);

-- ─────────────────────────────────────────
-- CALENDAR EVENTS
-- ─────────────────────────────────────────
create table public.calendar_events (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  description text,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  all_day     boolean default false,
  color       text default '#5bc4f5',
  class_id    uuid references public.classes(id) on delete set null,
  assignment_id uuid references public.assignments(id) on delete set null,
  event_type  text default 'event', -- 'event' | 'study' | 'class' | 'deadline'
  recurrence  jsonb,  -- {freq:'weekly', days:['Mon','Wed'], until:'2025-12-31'}
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.calendar_events enable row level security;
create policy "Users can CRUD own events" on public.calendar_events
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index events_user_id_idx   on public.calendar_events(user_id);
create index events_start_time_idx on public.calendar_events(start_time);

-- ─────────────────────────────────────────
-- FOCUS SESSIONS
-- ─────────────────────────────────────────
create table public.focus_sessions (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  duration_min int not null,
  session_type text default 'pomodoro',  -- 'pomodoro' | 'deep' | 'break'
  class_id     uuid references public.classes(id) on delete set null,
  notes        text,
  completed    boolean default true,
  xp_earned    int default 0,
  started_at   timestamptz default now(),
  ended_at     timestamptz
);

alter table public.focus_sessions enable row level security;
create policy "Users can CRUD own sessions" on public.focus_sessions
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- HABITS
-- ─────────────────────────────────────────
create table public.habits (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  icon        text default '⭐',
  color       text default '#5bc4f5',
  frequency   text default 'daily',
  target_days int[] default '{1,2,3,4,5,6,7}',  -- 1=Mon...7=Sun
  created_at  timestamptz default now()
);

alter table public.habits enable row level security;
create policy "Users can CRUD own habits" on public.habits
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.habit_completions (
  id        uuid default uuid_generate_v4() primary key,
  habit_id  uuid references public.habits(id) on delete cascade not null,
  user_id   uuid references public.profiles(id) on delete cascade not null,
  date      date not null,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

alter table public.habit_completions enable row level security;
create policy "Users can CRUD own completions" on public.habit_completions
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- ISLAND / ACHIEVEMENTS
-- ─────────────────────────────────────────
create table public.achievements (
  id          uuid default uuid_generate_v4() primary key,
  key         text unique not null,  -- e.g. 'streak_7', 'notes_50'
  name        text not null,
  description text,
  icon        text,
  xp_reward   int default 100,
  rarity      text default 'common'  -- 'common' | 'rare' | 'epic' | 'legendary'
);

-- Seed achievements
insert into public.achievements (key, name, description, icon, xp_reward, rarity) values
  ('streak_3',    '3-Day Streak',      'Study 3 days in a row',       '🔥', 50,   'common'),
  ('streak_7',    'Week Warrior',      '7-day streak',                '🔥', 100,  'common'),
  ('streak_30',   'Monthly Legend',    '30-day streak',               '💎', 500,  'legendary'),
  ('notes_10',    'Note Taker',        'Create 10 notes',             '📝', 100,  'common'),
  ('notes_50',    'Knowledge Hoarder', 'Create 50 notes',             '📚', 250,  'rare'),
  ('focus_10h',   'Deep Focus',        '10 hours of focus time',      '⏱',  200,  'rare'),
  ('tasks_10',    'Task Crusher',      'Complete 10 assignments',     '✅', 150,  'common'),
  ('tasks_50',    'Assignment Pro',    'Complete 50 assignments',     '🏆', 400,  'epic'),
  ('level_5',     'Island Explorer',   'Reach level 5',               '🏝', 200,  'common'),
  ('level_10',    'Island Builder',    'Reach level 10',              '🏗', 400,  'rare'),
  ('level_20',    'Island Master',     'Reach level 20',              '👑', 1000, 'legendary');

create table public.user_achievements (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  earned_at      timestamptz default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;
create policy "Users can read own achievements" on public.user_achievements
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- MOOD / JOURNAL
-- ─────────────────────────────────────────
create table public.mood_entries (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  mood        int not null check (mood between 1 and 5),
  energy      int check (energy between 0 and 100),
  note        text,
  date        date default current_date,
  created_at  timestamptz default now(),
  unique(user_id, date)
);

alter table public.mood_entries enable row level security;
create policy "Users can CRUD own mood" on public.mood_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- XP TRANSACTIONS LOG
-- ─────────────────────────────────────────
create table public.xp_transactions (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  amount      int not null,
  reason      text not null,
  source_type text,   -- 'assignment' | 'streak' | 'focus' | 'note' | 'achievement'
  source_id   uuid,
  created_at  timestamptz default now()
);

alter table public.xp_transactions enable row level security;
create policy "Users can read own XP log" on public.xp_transactions
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- FUNCTION: Award XP and level up
-- ─────────────────────────────────────────
create or replace function public.award_xp(
  p_user_id uuid,
  p_amount  int,
  p_reason  text,
  p_source_type text default null,
  p_source_id   uuid default null
)
returns jsonb language plpgsql security definer as $$
declare
  v_profile     public.profiles;
  v_new_xp      int;
  v_new_level   int;
  v_xp_for_next int;
  v_leveled_up  boolean := false;
begin
  select * into v_profile from public.profiles where id = p_user_id;

  -- Log the transaction
  insert into public.xp_transactions (user_id, amount, reason, source_type, source_id)
  values (p_user_id, p_amount, p_reason, p_source_type, p_source_id);

  v_new_xp    := v_profile.xp_current + p_amount;
  v_new_level := v_profile.island_level;

  -- Level up formula: each level needs level * 300 XP
  loop
    v_xp_for_next := v_new_level * 300;
    exit when v_new_xp < v_xp_for_next;
    v_new_xp    := v_new_xp - v_xp_for_next;
    v_new_level := v_new_level + 1;
    v_leveled_up := true;
  end loop;

  update public.profiles set
    xp_total     = xp_total + p_amount,
    xp_current   = v_new_xp,
    island_level = v_new_level,
    updated_at   = now()
  where id = p_user_id;

  return jsonb_build_object(
    'xp_earned', p_amount,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up
  );
end;
$$;

-- ─────────────────────────────────────────
-- FUNCTION: Update streak
-- ─────────────────────────────────────────
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_profile public.profiles;
  v_today   date := current_date;
begin
  select * into v_profile from public.profiles where id = p_user_id;

  if v_profile.last_active_date = v_today then
    return; -- Already updated today
  elsif v_profile.last_active_date = v_today - 1 then
    -- Consecutive day
    update public.profiles set
      streak_current  = streak_current + 1,
      streak_best     = greatest(streak_best, streak_current + 1),
      last_active_date = v_today,
      updated_at      = now()
    where id = p_user_id;
  else
    -- Streak broken (or first time)
    update public.profiles set
      streak_current   = 1,
      last_active_date = v_today,
      updated_at       = now()
    where id = p_user_id;
  end if;
end;
$$;

-- Updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_updated_at before update on public.profiles    for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.notes       for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.classes     for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.assignments for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
