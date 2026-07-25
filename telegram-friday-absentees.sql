-- ============================================================
-- Weekly Telegram alert: every Friday at 11:00 PM (Cambodia time)
-- send the list of students marked absent (A or A✓) for THAT Friday
-- to your Telegram channel.
--
-- WHY THIS RUNS IN SUPABASE, NOT IN index.html:
-- A browser tab can only run JavaScript while someone has the page
-- open. To fire automatically at 11pm every Friday — even if nobody
-- is looking at the site — the job has to live on the server side.
-- Supabase already gives you that for free via two extensions:
--   - pg_cron  -> runs a job on a schedule (like a server alarm clock)
--   - pg_net   -> lets that job make an HTTP request (to Telegram)
--
-- ONE-TIME SETUP (you only do this once):
-- 1. Open your Supabase project -> SQL Editor -> "New query".
-- 2. Go to Database -> Extensions, search "pg_cron", enable it.
--    Do the same for "pg_net" (it's often already on by default).
-- 3. Paste this WHOLE file into the SQL Editor and click "Run".
-- 4. Done. It will now fire every Friday at 23:00 Cambodia time.
--
-- TO CHANGE THE TIME LATER: edit the '0 16 * * 5' line near the
-- bottom (that's a cron schedule in UTC — see the note above it).
-- TO TEST IT RIGHT NOW without waiting for Friday: run
--   select notify_friday_absentees();
-- in the SQL Editor. It's safe to call any time — it does nothing
-- on any day that isn't currently a Friday in Cambodia.
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function notify_friday_absentees()
returns void
language plpgsql
security definer
as $$
declare
  v_month      text;
  v_first      date;
  v_fridays    date[];
  v_week_idx   int;
  v_lines      text := '';
  v_count      int  := 0;
  v_text       text;
  -- same bot/channel already used for permission-request alerts (supabase-config.js)
  v_bot_token  text := '8679739566:AAGlAmiSXiqLR0LRy3HBgiO1BlQKrihYidQ';
  v_channel_id text := '@ppnlsc_permission';
  rec record;
begin
  -- do all date math in Cambodia's local calendar day, not the server's UTC day
  perform set_config('timezone', 'Asia/Phnom_Penh', true);

  v_month := to_char(current_date, 'YYYY-MM');
  v_first := date_trunc('month', current_date)::date;

  -- every Friday in the current month, in order (mirrors the site's fridaysOf() in supabase-integration.js)
  select array_agg(d order by d)
    into v_fridays
    from generate_series(v_first, (v_first + interval '1 month - 1 day')::date, interval '1 day') d
    where extract(dow from d) = 5;

  -- which one is today? (0-based, matching the site's week_idx column)
  select i - 1 into v_week_idx
    from unnest(v_fridays) with ordinality as t(d, i)
    where t.d = current_date;

  if v_week_idx is null then
    return; -- today isn't a Friday in Cambodia — nothing to send
  end if;

  for rec in
    select s.name, s.gender,
           a.status,
           coalesce(nullif(trim(a.reason), ''), '—') as reason,
           (select count(*) from attendance a2
              where a2.student_id = s.id and a2.month = v_month
                and a2.status in ('A','AP')) as total_absent
    from attendance a
    join students s on s.id = a.student_id
    where a.month = v_month and a.week_idx = v_week_idx
      and a.status in ('A','AP')
    order by s.gender, s.seq
  loop
    v_count := v_count + 1;
    v_lines := v_lines || format(
      '%s. %s (%s)%s — %s  [ខែនេះអវត្តមាន %s ដង]' || E'\n',
      v_count, rec.name, rec.gender,
      case when rec.status = 'AP' then ' ✓' else '' end,
      rec.reason, rec.total_absent
    );
  end loop;

  if v_count = 0 then
    v_text := '✅ វត្តមានប្រជុំថ្ងៃសុក្រ (' || to_char(current_date,'DD/MM/YYYY') || ') — គ្មានសិស្សអវត្តមានទេ!';
  else
    v_text := '🔔 អវត្តមានប្រជុំថ្ងៃសុក្រ (' || to_char(current_date,'DD/MM/YYYY') || ')' || E'\n'
              || 'សរុប ' || v_count || ' នាក់អវត្តមាន:' || E'\n\n' || v_lines;
  end if;

  perform net.http_post(
    url     := 'https://api.telegram.org/bot' || v_bot_token || '/sendMessage',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('chat_id', v_channel_id, 'text', v_text)
  );
end;
$$;

-- Schedule: every Friday at 23:00 Asia/Phnom_Penh (ICT, UTC+7) = 16:00 UTC the same day.
-- cron format is "minute hour day month day-of-week", always in UTC, and day-of-week 5 = Friday.
-- (safe to re-run this whole file any time — this just replaces the old schedule if one exists)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'friday-absentees-notify') then
    perform cron.unschedule('friday-absentees-notify');
  end if;
end $$;

select cron.schedule(
  'friday-absentees-notify',
  '0 16 * * 5',
  $$ select notify_friday_absentees(); $$
);
