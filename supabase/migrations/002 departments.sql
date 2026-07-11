-- =============================================
-- 002_departments.sql
-- Departments table
-- =============================================

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null unique,
  description text,
  manager_id uuid references public.employees(id)
);