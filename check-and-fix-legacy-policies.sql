-- ============================================================================
-- STEP 1 — CHECK: are the old schema.sql-era policies still live?
-- ============================================================================
-- security-rls-setup.sql only drops policies by ITS OWN names (e.g.
-- "students: authenticated can read"). It never drops the original policies
-- created by schema.sql ("public read students", "staff write students", ...).
-- RLS is additive, so if schema.sql ran before security-rls-setup.sql, BOTH
-- sets of policies exist right now — and the old ones are wide open:
--   "public read ..."  -> using (true), no role restriction  -> anon can read
--   "staff write ..."  -> auth.role() = 'authenticated'      -> ANY signed-in
--                          account can write, not just admin
--
-- Run this first. If it returns 0 rows, you're already clean — skip step 2.
select policyname, tablename, roles, cmd
from pg_policies
where schemaname = 'public'
  and policyname in (
    'public read weeks', 'public read students', 'public read attendance', 'public read memories',
    'staff write weeks', 'staff write students', 'staff write attendance', 'staff write memories'
  );

-- ============================================================================
-- STEP 2 — FIX: drop the legacy policies (only the ones step 1 found).
-- Safe to run even if some don't exist (if exists guards each one).
-- The replacement policies from security-rls-setup.sql stay in place, so
-- reads still work for signed-in users and writes still work for admins.
-- ============================================================================
drop policy if exists "public read weeks"      on public.weeks;
drop policy if exists "public read students"   on public.students;
drop policy if exists "public read attendance" on public.attendance;
drop policy if exists "public read memories"   on public.memories;

drop policy if exists "staff write weeks"      on public.weeks;
drop policy if exists "staff write students"   on public.students;
drop policy if exists "staff write attendance" on public.attendance;
drop policy if exists "staff write memories"   on public.memories;

-- `weeks` has no "any signed-in user can read" replacement in
-- security-rls-setup.sql (that file never mentions weeks). Add one so
-- dropping "public read weeks" above doesn't lock everyone out of it.
drop policy if exists "weeks: any signed-in user can read" on public.weeks;
create policy "weeks: any signed-in user can read"
  on public.weeks for select
  to authenticated
  using (true);

-- ============================================================================
-- STEP 3 — VERIFY: re-run this after step 2. It should now return ZERO rows
-- with roles = '{public}' (public = anon + authenticated, i.e. no login
-- required) for students/attendance/memories/weeks.
-- ============================================================================
select policyname, tablename, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('weeks','students','attendance','memories')
order by tablename, policyname;
