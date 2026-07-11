-- =============================================
-- 011_advance_salary_request.sql
-- Advance salary requests table
-- =============================================

create table if not exists public.advance_salary_request (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  employee_id uuid,
  month date,
  total_salary numeric,
  advance_amount numeric,
  remaining_salary numeric,
  reason text,
  status text default 'pending'
);