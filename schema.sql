-- =============================================================
-- Phnom Penh New Life Student Center — Supabase schema
-- Run this in Supabase Studio  ->  SQL Editor  ->  New query
-- =============================================================

-- ---------- 1. TABLES ----------------------------------------

-- Weeks (the 4 Fridays). Editable so the term can roll forward.
create table if not exists public.weeks (
  idx        int primary key,                 -- 0..3
  label      text not null,                   -- Khmer label e.g. "សុក្រ ៥ មិថុនា"
  updated_at timestamptz not null default now()
);

-- Students
create table if not exists public.students (
  id         uuid primary key default gen_random_uuid(),
  seq        int  not null,                   -- display order (ល.រ)
  name       text not null default '',
  gender     char(1) not null default 'M' check (gender in ('M','F')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Attendance: one row per (student, week)
create table if not exists public.attendance (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  week_idx   int  not null references public.weeks(idx)   on delete cascade,
  status     text not null default '' check (status in ('','P','A')),
  reason     text not null default '',
  updated_at timestamptz not null default now(),
  unique (student_id, week_idx)
);

-- Memories (gallery). Files live in Storage bucket 'memories'.
create table if not exists public.memories (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('image','video')),
  storage_path text not null,                 -- path inside the 'memories' bucket
  caption      text not null default '',
  created_at   timestamptz not null default now()
);

-- ---------- 2. updated_at TRIGGER ----------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists t_students_touch  on public.students;
drop trigger if exists t_attend_touch    on public.attendance;
create trigger t_students_touch before update on public.students
  for each row execute function public.touch_updated_at();
create trigger t_attend_touch   before update on public.attendance
  for each row execute function public.touch_updated_at();

-- ---------- 3. ROW LEVEL SECURITY ----------------------------
-- Public (anon) can READ everything. Only signed-in staff can WRITE.
alter table public.weeks      enable row level security;
alter table public.students   enable row level security;
alter table public.attendance enable row level security;
alter table public.memories   enable row level security;

-- Public read
create policy "public read weeks"      on public.weeks      for select using (true);
create policy "public read students"   on public.students   for select using (true);
create policy "public read attendance" on public.attendance for select using (true);
create policy "public read memories"   on public.memories   for select using (true);

-- Staff write (any authenticated user = staff you invited)
create policy "staff write weeks"      on public.weeks      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff write students"   on public.students   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff write attendance" on public.attendance for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff write memories"   on public.memories   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- 4. REALTIME --------------------------------------
-- Push live changes to every open browser.
alter publication supabase_realtime add table public.students;
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.memories;
alter publication supabase_realtime add table public.weeks;

-- ---------- 5. SEED DATA -------------------------------------
insert into public.weeks (idx, label) values
  (0, 'សុក្រ ៥ មិថុនា'),
  (1, 'សុក្រ ១២ មិថុនា'),
  (2, 'សុក្រ ១៩ មិថុនា'),
  (3, 'សុក្រ ២៦ មិថុនា')
on conflict (idx) do nothing;

insert into public.students (seq, name, gender) values
  (1, 'Chhay Kimhou', 'M'),
  (2, 'Chea Meng', 'M'),
  (3, 'Chea Theara', 'M'),
  (4, 'Em Souleang', 'M'),
  (5, 'Em Mengleang', 'M'),
  (6, 'Hour Senghout', 'M'),
  (7, 'Hian Yan', 'M'),
  (8, 'Hean Yun', 'M'),
  (9, 'Kham Yuen', 'M'),
  (10, 'Khut Chinhhou', 'M'),
  (11, 'Ly Vanda', 'M'),
  (12, 'Lorn Yuhan', 'M'),
  (13, 'Nhao Trenchailin', 'M'),
  (14, 'Sam Sophanna', 'M'),
  (15, 'Sorn Phalla', 'M'),
  (16, 'Sreng Mengheang', 'M'),
  (17, 'Thoeun Ratha', 'M'),
  (18, 'Pek Vathana', 'M'),
  (19, 'Por Visal', 'M'),
  (20, 'Por Prasith', 'M'),
  (21, 'Porcha Phannit', 'M'),
  (22, 'Vang Daro', 'M'),
  (23, 'Chhoeun Pichviriya', 'F'),
  (24, 'Chhay Chantevy', 'F'),
  (25, 'Chhon Maey', 'F'),
  (26, 'Hok Siyean', 'F'),
  (27, 'Hou Chhunhoung', 'F'),
  (28, 'Meas Kimsour', 'F'),
  (29, 'Mao Sreypich', 'F'),
  (30, 'Pek Thida', 'F'),
  (31, 'Song Piseth', 'F'),
  (32, 'Sorn Chandara', 'F'),
  (33, 'Sorn Srey Ang', 'F'),
  (34, 'Sorn Sreypich', 'F'),
  (35, 'Seun Nary', 'F'),
  (36, 'Seiha Chankoltola', 'F'),
  (37, 'Thy Sothavy', 'F'),
  (38, 'Then Monida', 'F');

-- Pre-create empty attendance cells for every (student, week)
insert into public.attendance (student_id, week_idx)
select s.id, w.idx from public.students s cross join public.weeks w
on conflict (student_id, week_idx) do nothing;
