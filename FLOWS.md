# PPNLSC Web App — Flow Documentation

**App:** Phnom Penh New Life Student Center (មណ្ឌលនិស្សិតជីវិតថ្មីភ្នំពេញ)
**Type:** Single-page app, single `index.html` + two scripts, no build step, no framework.
**Stack:**
- Frontend: plain HTML/CSS/JS (Khmer-language UI)
- Backend: [Supabase](https://supabase.com) — Postgres, Realtime, Auth, Storage (config in [supabase-config.js](supabase-config.js))
- Export: `html2canvas` + `jsPDF` (CDN) for image/PDF generation
- Notifications: Telegram Bot API (fired from both the browser and a Postgres cron job)

## File map

| File | Role |
|---|---|
| [index.html](index.html) | Markup, CSS, and the "default" JS (nav, rendering, export, UI state) |
| [supabase-config.js](supabase-config.js) | Supabase URL/anon key + Telegram bot token/chat IDs |
| [supabase-integration.js](supabase-integration.js) | Loads **after** the inline script and **overrides** many of its functions to add persistence, auth-gating, and realtime sync |
| [telegram-friday-absentees.sql](telegram-friday-absentees.sql) | One-time SQL setup for a Supabase `pg_cron` job that runs server-side (no browser needed) |
| `leaders/`, `memories/` | Static image/video assets (org chart photos, seed gallery media) |

> **Load order matters.** `index.html`'s inline `<script>` defines the baseline UI functions (e.g. `renderStudents`, `cycle`, `toggleLock`). `supabase-integration.js` is loaded last and **redefines the same function names**, swapping the in-memory/passcode behavior for real database calls and Supabase Auth. Reading only `index.html` gives the wrong picture of how editing/locking actually works today.

---

## 1. Navigation flow

Top nav bar (desktop) / hamburger dropdown (mobile) with 7 tabs. Clicking a tab calls `go(id, btn)`:

1. Hides all `<section>`s, shows the target one, marks the nav button active.
2. Scrolls to top, closes the mobile menu and the floating action button (FAB) menu.
3. Recomputes whether the FAB should be visible for this tab (`updateFabVisibility`) — the FAB only appears on tabs that have an action bar (Students, Attendance, Memories).

Tabs: **ទំព័រដើម (Home) → បញ្ជីសិស្ស (Students) → វត្តមាន (Attendance) → រចនាសម្ព័ន្ធ (Org chart) → អនុស្សាវរីយ៍ (Memories) → ប្រកាសសុំច្បាប់ (Permit list) → មតិយោបល់ (Feedback)**

The **Permission Request form** (`perm`) is a hidden 8th section reachable only via buttons (home hero CTA, home tile) — it has no nav entry.

---

## 2. App boot sequence

On page load, `supabase-integration.js`'s IIFE runs:

```
getSession() → isStaff = !!session
      ↓
CUR_MONTH = this month; MONTH_FRIDAYS computed
      ↓
loadMonths()   → populate month dropdown from distinct attendance.month rows
loadData()     → fetch students + this month's attendance, render tables
loadMemories() → fetch memories rows, resolve Storage public URLs, render gallery + home slideshow
loadPermits()  → fetch permissions rows, render the permit-list tab
      ↓
applyLock() / applySLock() → set lock UI based on isStaff
```

In parallel, a Realtime channel (`ppnlsc-rt`) subscribes to Postgres changes on `students`, `attendance`, `memories`, `permissions` — **any** insert/update/delete on any of those tables (from any browser, or the SQL cron job) triggers the corresponding `load*()` function in **every open tab**, so all connected clients stay in sync without polling.

`sb.auth.onAuthStateChange` also runs continuously: signing in/out flips `isStaff`, re-locks/unlocks the Students and Attendance tabs, and re-renders the permit list (to show/hide delete buttons).

---

## 3. Auth flow (staff sign-in)

The original passcode system (`PASSCODE = "2026"`) defined in `index.html` is **fully overridden** by real Supabase Auth in `supabase-integration.js`. There is no client-side passcode in the live app.

```
User clicks a lock button (Students "ដោះសោកែ", Attendance "ដោះសោ", or Permit-list "ចូលជាអ្នកគ្រប់គ្រង")
      ↓
staffAuth()
  ├─ already signed in? → sb.auth.signOut() → done
  └─ not signed in?     → opens #loginModal (email + password fields)
      ↓
doStaffLogin() → sb.auth.signInWithPassword({email, password})
  ├─ error → show inline error text in the modal
  └─ success → close modal
      ↓
onAuthStateChange fires → isStaff = true → attendLocked/studentLocked = false
      ↓
applyLock() / applySLock() re-render Students & Attendance tables with editable cells,
delete buttons, "add student" buttons enabled; permit list shows 🗑 delete buttons.
```

Staff accounts are created directly in the Supabase project (not via a public sign-up flow in this app). Any signed-in Supabase Auth user is treated as staff — there's no separate role table.

---

## 4. Students tab flow

- **Public (not signed in):** read-only. Clicking a name/gender cell calls `showLock()` → generic "not authorized" modal.
- **Staff (signed in):**
  - Edit a name inline (`contenteditable` → `onblur` → `saveStudentName` → `UPDATE students`).
  - Click gender cell → `toggleGender` → `UPDATE students SET gender=...`.
  - "➕ បន្ថែមសិស្សប្រុស/ស្រី" → `addStudent(gender)` → `INSERT INTO students` with next `seq`.
  - 🗑 per row → `deleteStudent` → confirm() → `DELETE FROM students` (attendance rows cascade-delete in the DB).
  - "📄 បង្កើតជា PDF" → `exportPDF('studentDoc', ...)` → see **Export flow** below.
- Header stat cards (total/male/female) and the summary pills recompute live via `refreshCounts()` on every change, and also update the Home tab's cards.
- Realtime: any change from another browser (or another admin) triggers `loadData()` and re-renders this tab automatically.

---

## 5. Attendance tab flow

- **Month selector** (`monthSel`): populated from distinct `attendance.month` values (plus the current month). Changing it calls `changeMonth(m)` → recomputes that month's Fridays → `loadData()` for the new month.
- **Status cycling** (staff only): clicking a status cell calls `cycle(i,j)`, which cycles:
  `“” → P (present) → A (absent, no permission) → AP (absent, with permission) → “”`
  Clearing back to blank also clears the reason. Each change is immediately `upsert`'d to `attendance` (`onConflict: student_id,month,week_idx`).
- **Reason field**: editable only when a cell is absent-flagged; `onblur` → `saveReason` → upsert.
- Public (not signed in) users see the same table read-only; clicking a cell shows the lock modal.
- **↺ សម្អាតវត្តមាន (Clear)**: staff-only, bulk `UPDATE attendance SET status='', reason=''` for the currently viewed month.
- **Rank table**: auto-derived client-side from `DATA` — ranks students by total absences for the month, lists distinct reasons per student.
- **Export/share bar**: 📷 PNG, 📄 PDF, ✈️ Telegram — see **Export flow**.

---

## 6. Permission Request ("ពាក្យសុំច្បាប់") flow

This is the core "leave request" form, rendered as a live-updating A4 document preview.

1. User opens the form (home hero button or home tile) — no nav entry, section id `perm`.
2. Every field (`oninput`/`onchange`) calls `renderPerm()`, which re-renders the A4 letter (`permDocHTML`) live as the user types. Role radio (សិស្ស/និស្សិត/បុគ្គលិក) toggles which sub-fields show (class+school / year+major+uni / department) via `roleChange()`.
3. Two submit actions:
   - **📷 បង្កើតរូបភាព & ប្រកាស** → `savePermitAndImage()`:
     ```
     savePermit(silent=true)
       ├─ validate name present (else show "fill name" modal, abort)
       ├─ INSERT INTO permissions (...)
       ├─ notifyPermitSaved(d)  → Telegram message to admin chat + public channel
       └─ on success → exportNode('permDoc','image', ...)  → image capture + share/download
     ```
   - **📄 បង្កើត PDF** → `exportNode('permDoc','pdf', ...)` directly (does **not** save to DB — PDF-only export of whatever is currently in the form).
4. Saved submissions become rows in the `permissions` table and immediately appear (via Realtime) in the **ប្រកាសសុំច្បាប់ (Permit list)** tab for every open browser.

**Telegram notification** (`notifyPermitSaved`): fires a `GET` to the Telegram Bot API for each configured target (admin chat ID and/or a public channel), skipped entirely if the token/IDs in `supabase-config.js` are left as placeholders.

---

## 7. Permit list ("ប្រកាសសុំច្បាប់") tab flow

- Loads all `permissions` rows (newest first) into cards showing name, role, reason, date range, submission timestamp.
- **👁 មើល / ទាញយក** → `viewPermit(id)` re-renders that record through the same `permDocHTML()` template into a modal (`#permitView`), with its own PNG/PDF export buttons (`exportNode('permitDoc', ...)`).
- **🔒 ចូលជាអ្នកគ្រប់គ្រង (Admin)** button → same `staffAuth()` sign-in flow as Students/Attendance.
- **🗑 លុប** (delete), staff-only → confirm() → `DELETE FROM permissions` → Realtime removes it everywhere.
- Public visitors can view/export any letter but cannot delete — there's no per-submitter ownership check, any signed-in staff account can delete any letter.

---

## 8. Memories (gallery) tab flow

- `loadMemories()` reads the `memories` table and resolves each row's `storage_path` to a public Supabase Storage URL.
- Grid of thumbnails; clicking one opens a **lightbox** (`openLight`) with a bigger view + a save link.
- **⬇ រក្សាទុក** (download) on any item → `saveMedia(i)` fetches the file as a blob and routes it through the shared **deliver/share flow** (native share sheet on mobile, download link on desktop).
- **➕ បន្ថែមរូបភាព** (staff only): opens a hidden file input → `addMemFiles(files)`:
  ```
  for each file:
    upload to Storage bucket "memories" (random filename)
    INSERT INTO memories (type, storage_path, caption=filename)
  ```
  Realtime then reloads the gallery for everyone, including the uploader.
- The **Home tab slideshow** reuses the same `MEM_DB` image list (auto-advances every 4s; prev/next arrows and dot navigation available).

---

## 9. Org structure tab

Purely static: a hardcoded `LEADERS` array (name/role/photo path) rendered into a head card + grid of subordinate cards. No database, no auth, no user interaction beyond viewing.

---

## 10. Feedback tab flow

Simple form (name optional, category dropdown, message) → **📧 ផ្ញើមតិយោបល់** builds a `mailto:` link (subject + body pre-filled) and navigates to it, handing off to the user's own email client. No data is sent to Supabase; also two static contact links (Telegram, Messenger) to placeholder URLs.

---

## 11. Export / Share flow (shared by Students, Attendance, Permission docs)

All "generate PNG/PDF" buttons funnel through the same pipeline:

```
exportNode(elId, kind, name)
  ├─ add 'export-mode' class (forces fixed A4 width for letters)
  ├─ captureCanvas(el) → html2canvas, waits for web fonts, skips nav/other sections for speed
  ├─ kind==='image' → canvasToBlob(c)      (canvas.toDataURL, base64-decoded — avoids iOS toBlob() hang)
  │  kind==='pdf'   → canvasToPDFBlob(c, fitOnePage)   (jsPDF; letters fit one page, tables paginate if tall)
  └─ deliver(blob, filename, kind)
       ├─ navigator.canShare supports files? → open native OS share sheet (mobile: Save Image/PDF, send to Telegram/Messenger, etc.)
       └─ else → showResult() → in-app modal with an inline preview + a plain "⬇ រក្សាទុក" download link
```

`exportBusy(true/false)` shows/hides a full-screen "កំពុងបង្កើត… សូមរង់ចាំ" (working…) overlay during capture, and every async step is wrapped in `withTimeout` so a stuck capture can't hang the UI forever.

The **Attendance "✈️ Telegram" button** (`share('tg')`) is really just an alias for the PNG export — it opens the same result modal, from which the user manually shares to Telegram via the OS share sheet (there is no direct server-side push for this button, unlike the Friday cron job below).

---

## 12. Server-side flow: weekly Friday absentee alert (no browser required)

Defined in [telegram-friday-absentees.sql](telegram-friday-absentees.sql), set up once via the Supabase SQL editor. Independent of anything in the browser — this is why it lives in Postgres rather than in `index.html`.

```
pg_cron job "friday-absentees-notify" — every Friday 23:00 Asia/Phnom_Penh (16:00 UTC)
      ↓
notify_friday_absentees():
  - computes which Friday (week_idx) "today" is, in Cambodia's calendar
  - queries attendance JOIN students for that month/week where status IN ('A','AP')
  - builds a Khmer-language summary message (or a "no absences" message if none)
      ↓
pg_net.http_post → Telegram Bot API sendMessage → the configured channel (@ppnlsc_permission)
```

Can be triggered manually any time via `select notify_friday_absentees();` in the SQL editor for testing; it's a no-op on any day that isn't Friday in Cambodia.

---

## 13. Cross-cutting UI mechanisms

- **Floating Action Button (FAB):** a single "+" button bottom-right that expands the current tab's action `.bar` as a speed-dial menu (`toggleFab`/`closeFab`), so the row of export/lock buttons doesn't clutter small screens.
- **Lock bars:** every editable table shows a colored strip stating whether it's currently locked (🔒, public) or unlocked (🔓, staff editing) — purely a reflection of `isStaff`.
- **Generic modals:** `#msgModal` (generic error/info popup, e.g. "not authorized", validation errors), `#dlModal` (post-export preview + save/share), `#loginModal` (staff sign-in), `#permitView` (view a saved permit), `#lightbox` (media viewer).
- **Realtime-driven re-render:** because almost every write handler doesn't manually re-render its own tab (it relies on the Postgres Realtime event to call `loadData()`/`loadMemories()`/`loadPermits()` again), the UI is effectively "optimistic update on the writer, authoritative reload via Realtime on everyone."

---

## Notes / observations (not flows, but relevant if you touch this code)

- [supabase-config.js](supabase-config.js) contains a **live Telegram bot token and chat ID in plaintext**, committed alongside the Supabase anon key. The anon key is safe to expose (that's what it's for, protected by RLS), but the bot token is a real credential — anyone with it can send messages as that bot. Worth rotating/moving to a server-side secret if this repo is ever made public.
- There is no per-role distinction beyond "signed in = staff" — any Supabase Auth account can edit students/attendance and delete any permit, not just its own.
