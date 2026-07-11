-- =============================================
-- 008_document_request.sql
-- Document requests table
-- =============================================

create table if not exists public.document_request (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  employee_id uuid references public.employees(id) on delete cascade,
  document_type text,
  reason text,
  status text default 'pending'
);