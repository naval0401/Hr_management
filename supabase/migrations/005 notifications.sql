-- =============================================
-- 005_notifications.sql
-- Notifications table
-- =============================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  employee_id text references public.employees(employee_id),
  role text,
  type text,
  title text,
  message text,
  is_read boolean default false
);