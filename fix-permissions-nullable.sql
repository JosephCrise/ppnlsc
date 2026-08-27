-- ============================================================================
-- Fix: "null value in column \"student_class\" of relation \"permissions\"
--       violates not-null constraint"
--
-- Cause: the `permissions` table was created with NOT NULL on columns that are
-- role-conditional. A permission letter fills only ONE role block:
--     role = 'student' -> student_class, school
--     role = 'uni'     -> year_no, major, uni
--     role = 'staff'   -> dept
-- The other blocks are always empty, and savePermit() (supabase-integration.js)
-- sends them as NULL. Only `name` and `role` are actually required.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> Run).
-- Safe to re-run: DROP NOT NULL is idempotent, and it never touches existing rows.
-- ============================================================================

-- Role-conditional fields
alter table public.permissions alter column student_class drop not null;
alter table public.permissions alter column school        drop not null;
alter table public.permissions alter column year_no       drop not null;
alter table public.permissions alter column major         drop not null;
alter table public.permissions alter column uni           drop not null;
alter table public.permissions alter column dept          drop not null;

-- Other optional form fields (blank-able in the UI)
alter table public.permissions alter column no            drop not null;
alter table public.permissions alter column sex           drop not null;
alter table public.permissions alter column age           drop not null;
alter table public.permissions alter column phone         drop not null;
alter table public.permissions alter column to_whom       drop not null;
alter table public.permissions alter column from_date     drop not null;
alter table public.permissions alter column to_date       drop not null;
alter table public.permissions alter column reason        drop not null;
alter table public.permissions alter column place         drop not null;
alter table public.permissions alter column write_date    drop not null;

-- Keep the two fields the app genuinely requires (savePermit validates `name`,
-- and `role` always defaults to 'uni'), so bad rows still can't be written.
-- Applied only if no existing row would violate it, so a legacy null row can
-- never roll back the DROP NOT NULL statements above.
do $$
begin
  if not exists (select 1 from public.permissions where name is null) then
    alter table public.permissions alter column name set not null;
  else
    raise notice 'skipped: name set not null (existing rows have null name)';
  end if;

  if not exists (select 1 from public.permissions where role is null) then
    alter table public.permissions alter column role set not null;
  else
    raise notice 'skipped: role set not null (existing rows have null role)';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Verify: every listed column should now show is_nullable = 'YES',
-- except name and role.
-- ---------------------------------------------------------------------------
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'permissions'
order by ordinal_position;
