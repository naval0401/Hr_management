-- =============================================
-- 003_leaves.sql
-- Leave requests table
-- =============================================

create table if not exists public.leaves (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  user_id text,
  role text,
  from_date date,
  to_date date,
  reason text,
  status text default 'pending',
  manager_status text default 'pending',
  hr_status text default 'pending'
);