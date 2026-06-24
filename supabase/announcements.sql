-- Run this in Supabase SQL Editor to enable the Announcements page

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  category text default 'general',
  emoji text default '📣',
  target_audience text default 'all',
  event_date date,
  is_pinned boolean default false,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If table already exists WITHOUT emoji column, run this instead:
-- alter table announcements add column if not exists emoji text default '📣';

-- Set emoji for existing rows based on category (run after adding column):
-- update announcements set emoji = '🎉' where category = 'holiday' and (emoji is null or emoji = '📣');
-- update announcements set emoji = '📢' where category = 'policy' and (emoji is null or emoji = '📣');
-- update announcements set emoji = '📝' where category = 'training' and (emoji is null or emoji = '📣');
-- update announcements set emoji = '🏥' where category = 'health' and (emoji is null or emoji = '📣');
-- update announcements set emoji = '📣' where category = 'general' and emoji is null;

-- Optional sample data (only if table is empty)
insert into announcements (title, message, category, emoji, target_audience, event_date, is_pinned, created_by)
values
  ('Holiday on 21 June', 'Office closed for all departments. Enjoy your day off!', 'holiday', '🎉', 'all', '2026-06-21', true, 'HR'),
  ('New HR Policy Updated', 'Check your email for revised attendance and leave rules.', 'policy', '📢', 'all', null, false, 'HR'),
  ('Training Session on 25 June', 'Mandatory skill-building workshop for all employees.', 'training', '📝', 'all', '2026-06-25', false, 'HR'),
  ('Annual Medical Checkup', 'Scheduled on 28 June. Bring your ID and health card.', 'health', '🏥', 'all', '2026-06-28', false, 'HR');
