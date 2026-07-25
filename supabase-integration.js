/* ============================================================
   Live data layer — Phnom Penh New Life Student Center
   Replaces the in-memory arrays with Supabase (Postgres + Realtime
   + Auth + Storage). This script loads AFTER the main inline script,
   so its function declarations override the originals.

   What changes vs. the static version:
   - students / attendance / memories come from the database
   - every edit is persisted and pushed live to all open browsers
   - the "passcode" lock is replaced by real staff sign-in (Auth)
   - public visitors get read-only; only signed-in staff can edit
   ============================================================ */

let STUDENTS = [];     // [{id, seq, name, gender, updated_at}]
let MEM_DB   = [];     // [{type, src, cap}]
let isStaff  = false;  // true once a signed-in user is present

/* ---------- AUTH: username -> email mapping ----------
   Supabase Auth accounts are created by the admin in Supabase Studio
   (Authentication -> Users -> Add user) using <username>@AUTH_EMAIL_DOMAIN
   as the email and a real password. End users only ever see/type the
   username, never the fake email. */
const AUTH_EMAIL_DOMAIN = "ppnlsc.local";
function usernameToEmail(u){
  return (u || "").trim().toLowerCase().replace(/\s+/g, "") + "@" + AUTH_EMAIL_DOMAIN;
}

function toast(m){
  console.warn("[PPNLSC]", m);
  if (window.msgModal) {
    window.msgTitle.textContent = "មានបញ្ហា (error)";
    window.msgText.textContent  = m;
    window.msgModal.classList.add("show");
  }
}

function fmtStamp(ts){
  return ts ? "ផ្លាស់ប្ដូរចុងក្រោយ " + new Date(ts).toLocaleString("en-GB") : "";
}

/* ---------- monthly attendance ---------- */
const KH_DIGITS = ["០","១","២","៣","៤","៥","៦","៧","៨","៩"];
const KH_MONTHS = ["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"];
function khNum(n){ return String(n).replace(/\d/g, d => KH_DIGITS[+d]); }
function curMonthStr(){ const t = new Date(); return t.getFullYear() + "-" + String(t.getMonth()+1).padStart(2,"0"); }
let CUR_MONTH = curMonthStr();
let MONTH_FRIDAYS = [];          // [{idx, day, label}]

// every Friday in a given "YYYY-MM"
function fridaysOf(monthStr){
  const [y,m] = monthStr.split("-").map(Number);
  const out=[]; const d=new Date(y, m-1, 1);
  while(d.getMonth() === m-1){ if(d.getDay()===5) out.push(d.getDate()); d.setDate(d.getDate()+1); }
  return out.map((day,idx) => ({ idx, day, month: m, label: "សុក្រ " + khNum(day) + " " + KH_MONTHS[m-1] }));
}
function monthLabelKh(monthStr){
  const [y,m] = monthStr.split("-").map(Number);
  return "ខែ " + KH_MONTHS[m-1] + " ឆ្នាំ " + khNum(y);
}

// header built from the selected month's Fridays (4 or 5 columns) — one column per week,
// "day/month" label; the full "សុក្រ ៣ កក្កដា" label lives in each <th title="">.
function renderAttHead(){
  const head = window.attHead; if(!head) return;
  if(!MONTH_FRIDAYS.length) MONTH_FRIDAYS = fridaysOf(CUR_MONTH);
  let h = '<tr><th>ល.រ</th><th>ឈ្មោះសិស្ស</th><th>ភេទ</th>';
  MONTH_FRIDAYS.forEach(f => h += `<th class="wk" title="${f.label}">${khNum(f.day)}/${khNum(f.month)}</th>`);
  h += '<th>វត្តមាន</th><th>អវត្តមាន</th></tr>';
  head.innerHTML = h;
  const sub = document.querySelector('#attendDoc .docsub');
  if(sub) sub.textContent = monthLabelKh(CUR_MONTH) + " — ប្រជុំរៀងរាល់ថ្ងៃសុក្រ";
}

function changeMonth(m){
  CUR_MONTH = m;
  MONTH_FRIDAYS = fridaysOf(CUR_MONTH);
  loadData();
}
async function loadMonths(){
  const sel = document.getElementById("monthSel"); if(!sel) return;
  const { data } = await sb.from("attendance").select("month");
  const set = new Set((data||[]).map(r => r.month).filter(Boolean));
  set.add(curMonthStr()); set.add(CUR_MONTH);
  const months = Array.from(set).sort().reverse();   // newest first
  sel.innerHTML = months.map(m => `<option value="${m}" ${m===CUR_MONTH?"selected":""}>${monthLabelKh(m)}</option>`).join("");
}

/* ---------- LOAD: students + attendance (for CUR_MONTH) ---------- */
async function loadData(){
  if(!MONTH_FRIDAYS.length) MONTH_FRIDAYS = fridaysOf(CUR_MONTH);
  const nW = MONTH_FRIDAYS.length;
  const [{ data: students, error: e1 }, { data: att, error: e2 }] = await Promise.all([
    sb.from("students").select("*").order("seq"),
    sb.from("attendance").select("*").eq("month", CUR_MONTH)
  ]);
  if (e1) return toast(e1.message);
  if (e2) return toast(e2.message);

  STUDENTS = students || [];
  // sort: all males (M) first, then females (F); keep seq order within each group
  STUDENTS.sort((a, b) => (a.gender !== b.gender) ? (a.gender === "M" ? -1 : 1) : ((a.seq || 0) - (b.seq || 0)));
  DATA = STUDENTS.map(s => ({
    id: s.id, name: s.name, gender: s.gender,
    att: Array.from({ length: nW }, () => ({ s: "", r: "" }))
  }));
  (att || []).forEach(a => {
    const i = STUDENTS.findIndex(s => s.id === a.student_id);
    if (i >= 0 && a.week_idx >= 0 && a.week_idx < nW)
      DATA[i].att[a.week_idx] = { s: a.status || "", r: a.reason || "" };
  });

  const stamps = STUDENTS.map(s => s.updated_at)
    .concat((att || []).map(a => a.updated_at)).filter(Boolean).sort();
  const last = stamps[stamps.length - 1];
  if (window.sStamp) sStamp.textContent = fmtStamp(last);
  if (window.aStamp) aStamp.textContent = fmtStamp(last);

  renderAttHead(); renderStudents(); renderAtt(); refreshCounts();
}

/* ---------- LOAD: memories (Storage public URLs) ---------- */
async function loadMemories(){
  const { data, error } = await sb.from("memories").select("*").order("created_at", { ascending: false });
  if (error) return toast(error.message);
  // Signed URLs (1hr expiry) instead of public URLs: the "memories" bucket must be set
  // to private in Supabase Storage, otherwise files stay fetchable by anyone with the link
  // regardless of login. See security-rls-setup.sql.
  MEM_DB = await Promise.all((data || []).map(async m => {
    const { data: signed } = await sb.storage.from("memories").createSignedUrl(m.storage_path, 3600);
    return { type: m.type, src: signed ? signed.signedUrl : "", cap: m.caption };
  }));
  renderGallery(); buildSlideshow();
}

/* ---------- RENDER overrides (add persistence hooks) ---------- */
function renderStudents(){
  const b = window.studentBody; if (!b) return; b.innerHTML = "";
  DATA.forEach((d, i) => {
    const initial = (d.name || "?").trim().charAt(0).toUpperCase() || "?";
    const nameEl = !isStaff
      ? `<div class="sname" onclick="showLock()">${d.name}</div>`
      : `<div class="sname" contenteditable onblur="saveStudentName(${i}, this.innerText)">${d.name}</div>`;
    const genderEl = `<div class="sgender ${d.gender}" onclick="${!isStaff ? "showLock()" : "toggleGender(" + i + ")"}" title="ចុចដើម្បីប្ដូរ M/F">${d.gender}</div>`;
    const delEl = isStaff ? `<button class="rowdel" onclick="deleteStudent(${i})" title="លុបសិស្ស">🗑</button>` : "";
    b.innerHTML += `<div class="srow">
      <div class="sidx">${i + 1}</div>
      <div class="savatar ${d.gender}">${initial}</div>
      ${nameEl}
      ${genderEl}
      ${delEl}
    </div>`;
  });
  refreshCounts();
}

function renderAtt(){
  const b = window.attBody; if (!b) return; b.innerHTML = "";
  DATA.forEach((d, i) => {
    let row = `<td>${i + 1}</td><td class="name">${d.name || '<i style=color:#bbb>—</i>'}</td><td class="gender ${d.gender}">${d.gender}</td>`;
    d.att.forEach((w, j) => {
      const s = w.s || "";
      const label = s === "" ? "·" : s === "P" ? "✓" : s === "AP" ? "A✓" : "A";   // AP = absent WITH permission
      const showReason = s === "A" || s === "AP";   // only absences carry a reason — present/blank stay a single quiet badge
      const reasonHtml = !showReason ? "" : !isStaff
        ? `<div class="reason" onclick="showLock()">${w.r}</div>`
        : `<div class="reason" contenteditable onblur="saveReason(${i},${j}, this.innerText)">${w.r}</div>`;
      row += `<td class="wkcell"><div class="badge ${s || "blank"} ${!isStaff ? "lock" : ""}" onclick="cycle(${i},${j})">${label}</div>${reasonHtml}</td>`;
    });
    const p = d.att.filter(w => w.s === "P").length;
    const a = d.att.filter(w => w.s === "A" || w.s === "AP").length;   // total absences (with or without permission)
    row += `<td class="present">${p}</td><td class="absent">${a}</td>`;
    b.innerHTML += `<tr>${row}</tr>`;
  });
  renderRank();
}

function renderGallery(){
  const all = MEM_DB; window._galleryAll = all;
  const w = window.galleryWrap; if (!w) return;
  if (!all.length){
    w.innerHTML = '<div class="empty">មិនទាន់មានរូបភាព។<br>ចុច «➕ បន្ថែមរូបភាព» ដើម្បីបង្ហោះ (សម្រាប់បុគ្គលិក)។</div>';
    return;
  }
  w.innerHTML = '<div class="gallery">' + all.map((m, i) => {
    const thumb = m.type === "video"
      ? `<div class="thumb"><video src="${m.src}" preload="metadata" muted></video><div class="play">▶</div></div>`
      : `<img src="${m.src}" alt="${m.cap || ""}" loading="lazy">`;
    const dl = `<a class="dl" href="javascript:void(0)" onclick="event.stopPropagation();saveMedia(${i})">⬇ រក្សាទុក</a>`;
    return `<figure><div onclick="openLight(${i})">${thumb}${m.cap ? `<figcaption>${m.cap}</figcaption>` : ""}</div>${dl}</figure>`;
  }).join("") + "</div>";
}

function slideImages(){ return MEM_DB.filter(m => m.type === "image"); }

/* ---------- WRITE: attendance ---------- */
function cycle(i, j){
  if (!isStaff) { showLock(); return; }
  const cur = DATA[i].att[j].s;
  // cycle: blank -> P (present) -> A (absent, no permission) -> AP (absent, with permission) -> blank
  const ns = cur === "" ? "P" : cur === "P" ? "A" : cur === "A" ? "AP" : "";
  DATA[i].att[j].s = ns;
  if (ns === "P" || ns === "") DATA[i].att[j].r = "";   // a reason only applies to an absence
  renderAtt();
  sb.from("attendance")
    .upsert({ student_id: DATA[i].id, month: CUR_MONTH, week_idx: j, status: ns, reason: DATA[i].att[j].r },
            { onConflict: "student_id,month,week_idx" })
    .then(({ error }) => { if (error) toast(error.message); });
}

function saveReason(i, j, txt){
  const r = (txt || "").trim();
  DATA[i].att[j].r = r;
  sb.from("attendance")
    .upsert({ student_id: DATA[i].id, month: CUR_MONTH, week_idx: j, reason: r },
            { onConflict: "student_id,month,week_idx" })
    .then(({ error }) => { if (error) toast(error.message); });
}

async function clearAtt(){
  if (!isStaff) { showLock(); return; }
  // clears only the month currently shown
  const { error } = await sb.from("attendance").update({ status: "", reason: "" }).eq("month", CUR_MONTH);
  if (error) toast(error.message);   // realtime reloads every client
}

/* ---------- WRITE: students ---------- */
function saveStudentName(i, txt){
  const name = (txt || "").trim();
  DATA[i].name = name; refreshCounts();
  sb.from("students").update({ name }).eq("id", DATA[i].id)
    .then(({ error }) => { if (error) toast(error.message); });
}

function toggleGender(i){
  if (!isStaff) { showLock(); return; }
  const g = DATA[i].gender === "M" ? "F" : "M";
  DATA[i].gender = g; renderStudents();
  sb.from("students").update({ gender: g }).eq("id", DATA[i].id)
    .then(({ error }) => { if (error) toast(error.message); });
}

async function deleteStudent(i){
  if (!isStaff) { showLock(); return; }
  const d = DATA[i]; if (!d || !d.id) return;
  if (!confirm("លុបសិស្ស «" + (d.name || "—") + "» ? (ការលុបមិនអាចត្រឡប់វិញបានទេ)")) return;
  const { error } = await sb.from("students").delete().eq("id", d.id);   // attendance rows cascade-delete
  if (error) toast(error.message);   // realtime reloads the list + counts
}

async function addStudent(gender){
  if (!isStaff) { showLock(); return; }
  const g = (gender === "F") ? "F" : "M";
  const seq = STUDENTS.reduce((m, s) => Math.max(m, s.seq), 0) + 1;
  const { error } = await sb.from("students").insert({ seq, name: "", gender: g });
  if (error) return toast(error.message);
  // attendance cells are created on demand when you mark them (per month). realtime reloads.
}

/* ---------- WRITE: memories upload (Storage) ---------- */
async function addMemFiles(files){
  for (const f of files) {
    const type = f.type.startsWith("video") ? "video" : "image";
    const ext  = (f.name.split(".").pop() || "bin").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await sb.storage.from("memories").upload(path, f, { upsert: false });
    if (upErr) { toast(upErr.message); continue; }
    const { error: insErr } = await sb.from("memories")
      .insert({ type, storage_path: path, caption: f.name.replace(/\.[^.]+$/, "") });
    if (insErr) toast(insErr.message);
  }
  // realtime reloads the gallery
}

/* ---------- AUTH: sign in / out ---------- */
async function staffAuth(){
  const { data: { session } } = await sb.auth.getSession();
  if (session) { await sb.auth.signOut(); return; }   // signed in -> sign out (triggers full gate + reload)
  // open the in-app re-login popup (no browser prompt)
  const m = document.getElementById("loginModal"); if (!m) return;
  document.getElementById("loginErr").style.display = "none";
  document.getElementById("loginPass").value = "";
  m.classList.add("show");
  setTimeout(() => { const e=document.getElementById("loginUser"); if(e) e.focus(); }, 50);
}
function closeLogin(){ const m=document.getElementById("loginModal"); if(m) m.classList.remove("show"); }
async function doStaffLogin(){
  const username = (document.getElementById("loginUser").value || "").trim();
  const password = document.getElementById("loginPass").value || "";
  const err = document.getElementById("loginErr");
  if (!username || !password) { err.textContent = "សូមបញ្ចូលឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់។"; err.style.display = "block"; return; }
  const { error } = await sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (error) { err.textContent = "ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។"; err.style.display = "block"; return; }
  closeLogin();   // onAuthStateChange updates the rest of the UI
}
// The lock buttons now trigger sign-in/out instead of a client passcode.
function toggleLock(){ staffAuth(); }
function toggleSLock(){ staffAuth(); }

/* ---------- AUTH GATE: full-screen login blocking the whole app ---------- */
let guestMode = false;   // true while someone is filling the public permission form without an account

function showGate(){
  const g = document.getElementById("authGate"); if (!g) return;
  g.classList.remove("hide");
  document.getElementById("gateErr").style.display = "none";
  document.getElementById("gateUser").value = "";
  document.getElementById("gatePass").value = "";
  guestMode = false;
  setTimeout(() => { const e=document.getElementById("gateUser"); if(e) e.focus(); }, 50);
}
function hideGate(){
  const g = document.getElementById("authGate"); if (g) g.classList.add("hide");
}
async function doGateLogin(){
  const username = (document.getElementById("gateUser").value || "").trim();
  const password = document.getElementById("gatePass").value || "";
  const err = document.getElementById("gateErr");
  if (!username || !password) { err.textContent = "សូមបញ្ចូលឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់។"; err.style.display = "block"; return; }
  const { error } = await sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (error) { err.textContent = "ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។"; err.style.display = "block"; return; }
  // onAuthStateChange hides the gate and boots the app
}
// Lets someone submit a leave request without an account. Only the "perm" form
// is usable in this mode — protected data is never fetched until a real sign-in happens.
function openGuestPermit(){
  guestMode = true;
  hideGate();
  go("perm", null);
}

/* ---------- ប្រកាសសុំច្បាប់ (permission letters) ---------- */
let PERMITS = [];
function escHtml(v){ return (v==null?"":String(v)).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

// Save the current form as a public submission. Returns true on success.
async function savePermit(silent){
  const d = collectPerm();
  if(!d.name || !d.name.trim()){
    window.msgTitle.textContent = "សូមបំពេញឈ្មោះ";
    window.msgText.textContent  = "សូមបញ្ចូលឈ្មោះមុននឹងរក្សាទុក។";
    window.msgModal.classList.add("show"); return false;
  }
  const nn  = v => (v === "" || v == null) ? null : v;
  const num = v => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };
  const row = {
    no:nn(d.no), name:d.name, sex:nn(d.sex), age:num(d.age), phone:nn(d.phone), role:d.role,
    student_class:nn(d.klass), school:nn(d.school), year_no:nn(d.year), major:nn(d.major), uni:nn(d.uni), dept:nn(d.dept),
    to_whom:nn(d.to_whom), from_date:nn(d.from_date), to_date:nn(d.to_date), reason:nn(d.reason),
    place:nn(d.place), write_date:nn(d.write_date)
  };
  const { error } = await sb.from("permissions").insert(row);
  if(error){ toast(error.message); return false; }
  notifyPermitSaved(d);            // requirement 2: send a notification on success
  if(!silent){
    window.msgTitle.textContent = "បានរក្សាទុក ✓";
    window.msgText.textContent  = "ពាក្យសុំច្បាប់ត្រូវបានរក្សាទុកក្នុងម៉ឺនុយ «ប្រកាសសុំច្បាប់»។";
    window.msgModal.classList.add("show");
  }
  return true;   // realtime refreshes the list
}

// Image button now ALSO saves: save silently first, then generate the image.
async function savePermitAndImage(){
  const ok = await savePermit(true);
  if(!ok) return;                  // stop if name missing / save failed
  await exportNode("permDoc", "image", "PermissionRequest");
}

// Notify via Telegram on successful submission (free, instant).
// Uses a GET request (no CORS preflight). Disabled until tokens are set in supabase-config.js.
async function notifyPermitSaved(d){
  try{
    if(typeof TG_BOT_TOKEN==="undefined" || !TG_BOT_TOKEN || TG_BOT_TOKEN.indexOf("YOUR")>=0) return;
    const roleKh = d.role==="student" ? "សិស្ស" : d.role==="staff" ? "បុគ្គលិក" : "និស្សិត";
    const text =
      "📋 ពាក្យសុំច្បាប់ថ្មី (New permission request)\n" +
      "👤 ឈ្មោះ: " + (d.name||"-") + " (" + roleKh + ")\n" +
      "📝 មូលហេតុ: " + (d.reason||"-") + "\n" +
      "📅 ចាប់ពី: " + (d.from_date||"-") + " → " + (d.to_date||"-") + "\n" +
      "☎️ ទូរស័ព្ទ: " + (d.phone||"-");
    // send to admin chat and/or the student channel (whichever is configured)
    const targets = [];
    if(typeof TG_CHAT_ID!=="undefined" && TG_CHAT_ID && String(TG_CHAT_ID).indexOf("YOUR")<0) targets.push(TG_CHAT_ID);
    if(typeof TG_CHANNEL_ID!=="undefined" && TG_CHANNEL_ID && String(TG_CHANNEL_ID).indexOf("YOUR")<0) targets.push(TG_CHANNEL_ID);
    for(const id of targets){
      const url = "https://api.telegram.org/bot" + TG_BOT_TOKEN + "/sendMessage" +
        "?chat_id=" + encodeURIComponent(id) + "&text=" + encodeURIComponent(text);
      try{ await fetch(url); }catch(e){ console.warn("[PPNLSC] tg send failed for", id, e && e.message); }
    }
  }catch(e){ console.warn("[PPNLSC] telegram notify failed:", e && e.message); }
}

async function loadPermits(){
  const { data, error } = await sb.from("permissions").select("*").order("created_at", { ascending: false });
  if(error){ console.warn("[PPNLSC] permits:", error.message); PERMITS = []; renderPermits(); refreshCounts(); return; }  // fail quietly -> just show empty state
  PERMITS = data || [];
  renderPermits();
  refreshCounts();
}

function updatePermitAuthBtn(){
  const b = document.getElementById("permitAuthBtn"); if(!b) return;
  b.textContent = isStaff ? "🔓 ចេញពីគណនី" : "🔒 ចូលគណនី";
  b.classList.toggle("open", isStaff);
}
function renderPermits(){
  updatePermitAuthBtn();
  const w = document.getElementById("permitListWrap"); if(!w) return;
  if(!PERMITS.length){ w.innerHTML = '<div class="empty">មិនទាន់មានពាក្យសុំច្បាប់។</div>'; return; }
  w.innerHTML = PERMITS.map(p => {
    const roleKh = p.role==="student" ? "សិស្ស" : p.role==="staff" ? "បុគ្គលិក" : "និស្សិត";
    const when = p.created_at ? new Date(p.created_at).toLocaleString("en-GB") : "";
    const range = [p.from_date, p.to_date].filter(Boolean).join(" → ");
    const del = isStaff ? `<button class="btn b-clear" onclick="deletePermit('${p.id}')">🗑 លុប</button>` : "";
    return `<div class="permit-card">
      <div class="pc-main">
        <div class="pc-name">${escHtml(p.name)||"—"} <span class="pc-role">(${roleKh})</span></div>
        <div class="pc-sub">មូលហេតុ៖ ${escHtml(p.reason)||"—"}${range?" · "+escHtml(range):""}</div>
        <div class="pc-date">${escHtml(when)}</div>
      </div>
      <div class="pc-act">
        <button class="btn b-png" onclick="viewPermit('${p.id}')">👁 មើល / ទាញយក</button>
        ${del}
      </div>
    </div>`;
  }).join("");
}

function viewPermit(id){
  const p = PERMITS.find(x => x.id === id); if(!p) return;
  const d = {
    no:p.no, name:p.name, sex:p.sex, age:p.age, phone:p.phone, role:p.role,
    klass:p.student_class, school:p.school, year:p.year_no, major:p.major, uni:p.uni, dept:p.dept,
    to_whom:p.to_whom, from_date:p.from_date, to_date:p.to_date, reason:p.reason,
    place:p.place, write_date:p.write_date
  };
  document.getElementById("permitDoc").innerHTML = permDocHTML(d);
  document.getElementById("permitView").classList.add("show");
}

async function deletePermit(id){
  if(!isStaff){ showLock(); return; }
  if(!confirm("លុបពាក្យសុំច្បាប់នេះ?")) return;
  const { error } = await sb.from("permissions").delete().eq("id", id);
  if(error) toast(error.message);   // realtime refreshes the list
}

/* ---------- REALTIME + BOOT ---------- */
let appBooted = false;   // true once protected data has been loaded for a signed-in session

// Edit rights come from app_metadata, set by an admin via SQL/the Studio Admin
// API — NEVER from user_metadata, which a signed-in user can rewrite on
// themselves via supabase.auth.updateUser(). app_metadata is only settable
// by an admin, so it's the only tamper-proof place to keep a role. See
// security-rls-setup.sql for how to grant/revoke the "admin" role, and the
// matching RLS policies that enforce it at the database level too (the
// client-side check below only controls what the UI shows/hides).
function isAdminSession(session){
  return !!(session && session.user && session.user.app_metadata && session.user.app_metadata.role === "admin");
}

// Runs once, right after a session is confirmed. Loads everything the
// old public boot sequence used to load unconditionally. Every signed-in
// account can view; only an "admin" account gets edit rights.
async function bootAfterAuth(session){
  if (appBooted) return;
  appBooted = true;
  isStaff = isAdminSession(session);
  attendLocked = !isStaff;
  studentLocked = !isStaff;
  guestMode = false;
  CUR_MONTH = curMonthStr();
  MONTH_FRIDAYS = fridaysOf(CUR_MONTH);
  hideGate();
  await loadMonths();
  await loadData();
  await loadMemories();
  await loadPermits();
  applyLock(); applySLock();
  sb.channel("ppnlsc-rt")
    .on("postgres_changes", { event: "*", schema: "public", table: "students"    }, loadData)
    .on("postgres_changes", { event: "*", schema: "public", table: "attendance"  }, loadData)
    .on("postgres_changes", { event: "*", schema: "public", table: "memories"    }, loadMemories)
    .on("postgres_changes", { event: "*", schema: "public", table: "permissions" }, loadPermits)
    .subscribe();
}

sb.auth.onAuthStateChange((evt, session) => {
  if (session) { bootAfterAuth(session); return; }
  // signed out: full reload clears every in-memory array (STUDENTS/DATA/PERMITS/MEM_DB)
  // and any rendered DOM, then boots fresh into the gate below.
  if (evt === "SIGNED_OUT") { location.reload(); return; }
  isStaff = false; attendLocked = true; studentLocked = true;
  showGate();
});

(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) { await bootAfterAuth(session); }
  else { showGate(); }   // no session: block the app, wait for gate login or guest permit link
})();
