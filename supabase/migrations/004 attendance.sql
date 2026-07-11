-- =============================================
-- 004_attendance.sql
-- Employee attendance table
-- =============================================

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  employee_id text not null references public.employees(employee_id),
  employee_name text,
  date date default now(),
  check_in timestamptz,
  check_out timestamptz,
  status text
);