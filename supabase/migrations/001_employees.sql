-- =============================================
-- 001_employees.sql
-- Core employees table
-- =============================================

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id text unique,
  employee_name text,
  email text,
  phone text,
  designation text,
  department text,
  date_of_joining date,
  date_of_birth date,
  status boolean default true,
  role text,
  employment_type text,
  address text,
  blood_group text,
  skills text,
  emergency_contact_name text,
  emergency_contact_phone text,
  documents_notes text,
  keycloak_id text,
  reporting_manager uuid references public.employees(id)
);

