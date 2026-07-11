-- =============================================
-- 010_payslips.sql
-- Employee payslips table
-- =============================================

create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references public.employees(id),
  month date not null,
  gross_salary numeric,
  pf_deduction numeric,
  advance_deducted numeric default 0,
  net_pay numeric
);