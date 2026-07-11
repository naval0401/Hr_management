-- =============================================
-- 006_announcements.sql
-- Announcements table
-- =============================================

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  message text not null,
  category text default 'general',
  emoji text default '📣',
  target_audience text default 'all',
  event_date date,
  is_pinned boolean default false,
  created_by text
);