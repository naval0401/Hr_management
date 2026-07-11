-- =============================================
-- 007_documents.sql
-- Employee documents table
-- =============================================

create table if not exists public.documents (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  title text not null,
  file_url text not null,
  uploaded_by text not null,
  document_type text,
  request_id bigint
);