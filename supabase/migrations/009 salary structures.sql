-- =============================================
-- 009_salary_structures.sql
-- Employee salary structures table
-- =============================================

create table if not exists public.salary_structures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references public.employees(id),
  gross_salary numeric not null,
  pf_deduction numeric default 0,
  net_salary numeric not null,
  effective_from date default current_date
);