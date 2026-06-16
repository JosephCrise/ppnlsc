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
let isStaff  = false;  // true once a staff user signs in

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

/* ---------- LOAD: students + attendance ---------- */
async function loadData(){
  const [{ data: students, error: e1 }, { data: att, error: e2 }] = await Promise.all([
    sb.from("students").select("*").order("seq"),
    sb.from("attendance").select("*")
  ]);
  if (e1) return toast(e1.message);
  if (e2) return toast(e2.message);

  STUDENTS = students || [];
  // sort: all males (M) first, then females (F); keep seq order within each group
  STUDENTS.sort((a, b) => (a.gender !== b.gender) ? (a.gender === "M" ? -1 : 1) : ((a.seq || 0) - (b.seq || 0)));
  DATA = STUDENTS.map(s => ({
    id: s.id, name: s.name, gender: s.gender,
    att: Array.from({ length: 4 }, () => ({ s: "", r: "" }))
  }));
  (att || []).forEach(a => {
    const i = STUDENTS.findIndex(s => s.id === a.student_id);
    if (i >= 0 && a.week_idx >= 0 && a.week_idx < 4)
      DATA[i].att[a.week_idx] = { s: a.status || "", r: a.reason || "" };
  });

  const stamps = STUDENTS.map(s => s.updated_at)
    .concat((att || []).map(a => a.updated_at)).filter(Boolean).sort();
  const last = stamps[stamps.length - 1];
  if (window.sStamp) sStamp.textContent = fmtStamp(last);
  if (window.aStamp) aStamp.textContent = fmtStamp(last);

  renderStudents(); renderAtt(); refreshCounts();
}

/* ---------- LOAD: memories (Storage public URLs) ---------- */
async function loadMemories(){
  const { data, error } = await sb.from("memories").select("*").order("created_at", { ascending: false });
  if (error) return toast(error.message);
  MEM_DB = (data || []).map(m => ({
    type: m.type,
    src:  sb.storage.from("memories").getPublicUrl(m.storage_path).data.publicUrl,
    cap:  m.caption
  }));
  renderGallery(); buildSlideshow();
}

/* ---------- RENDER overrides (add persistence hooks) ---------- */
function renderStudents(){
  const b = window.studentBody; if (!b) return; b.innerHTML = "";
  DATA.forEach((d, i) => {
    const nameCell = !isStaff
      ? `<td class="name" onclick="showLock()">${d.name}</td>`
      : `<td class="name" contenteditable onblur="saveStudentName(${i}, this.innerText)">${d.name}</td>`;
    const genderCell = `<td class="gender ${d.gender}" onclick="${!isStaff ? "showLock()" : "toggleGender(" + i + ")"}" title="ចុចដើម្បីប្ដូរ M/F">${d.gender}</td>`;
    const delCell = `<td class="del-col">${ isStaff ? `<button class="rowdel" onclick="deleteStudent(${i})" title="លុបសិស្ស">🗑</button>` : "" }</td>`;
    b.innerHTML += `<tr><td>${i + 1}</td>${nameCell}${genderCell}${delCell}</tr>`;
  });
  refreshCounts();
}

function renderAtt(){
  const b = window.attBody; if (!b) return; b.innerHTML = "";
  DATA.forEach((d, i) => {
    let row = `<td>${i + 1}</td><td class="name">${d.name || '<i style=color:#bbb>—</i>'}</td><td class="gender ${d.gender}">${d.gender}</td>`;
    d.att.forEach((w, j) => {
      row += `<td class="att ${w.s} ${!isStaff ? "lock" : ""}" onclick="cycle(${i},${j})">${w.s}</td>`;
      row += !isStaff
        ? `<td class="reason" onclick="showLock()">${w.r}</td>`
        : `<td class="reason" contenteditable onblur="saveReason(${i},${j}, this.innerText)">${w.r}</td>`;
    });
    const p = d.att.filter(w => w.s === "P").length, a = d.att.filter(w => w.s === "A").length;
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
  const ns = cur === "" ? "P" : cur === "P" ? "A" : "";
  DATA[i].att[j].s = ns;
  if (ns !== "A") DATA[i].att[j].r = "";
  renderAtt();
  sb.from("attendance")
    .upsert({ student_id: DATA[i].id, week_idx: j, status: ns, reason: DATA[i].att[j].r },
            { onConflict: "student_id,week_idx" })
    .then(({ error }) => { if (error) toast(error.message); });
}

function saveReason(i, j, txt){
  const r = (txt || "").trim();
  DATA[i].att[j].r = r;
  sb.from("attendance")
    .upsert({ student_id: DATA[i].id, week_idx: j, reason: r },
            { onConflict: "student_id,week_idx" })
    .then(({ error }) => { if (error) toast(error.message); });
}

async function clearAtt(){
  if (!isStaff) { showLock(); return; }
  const { error } = await sb.from("attendance").update({ status: "", reason: "" }).gte("week_idx", 0);
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
  const { data, error } = await sb.from("students").insert({ seq, name: "", gender: g }).select().single();
  if (error) return toast(error.message);
  await sb.from("attendance").insert([0, 1, 2, 3].map(w => ({ student_id: data.id, week_idx: w })));
  // realtime reloads
}

/* ---------- WRITE: memories upload (Storage) ---------- */
async function addMemFiles(files){
  if (!isStaff) { showLock(); return; }
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

/* ---------- AUTH: staff sign in / out ---------- */
async function staffAuth(){
  const { data: { session } } = await sb.auth.getSession();
  if (session) { await sb.auth.signOut(); return; }   // signed in -> sign out
  // open the in-app login popup (no browser prompt)
  const m = document.getElementById("loginModal"); if (!m) return;
  document.getElementById("loginErr").style.display = "none";
  document.getElementById("loginPass").value = "";
  m.classList.add("show");
  setTimeout(() => { const e=document.getElementById("loginEmail"); if(e) e.focus(); }, 50);
}
function closeLogin(){ const m=document.getElementById("loginModal"); if(m) m.classList.remove("show"); }
async function doStaffLogin(){
  const email = (document.getElementById("loginEmail").value || "").trim();
  const password = document.getElementById("loginPass").value || "";
  const err = document.getElementById("loginErr");
  if (!email || !password) { err.textContent = "សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់។"; err.style.display = "block"; return; }
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { err.textContent = error.message; err.style.display = "block"; return; }
  closeLogin();   // onAuthStateChange updates the rest of the UI
}
// The lock buttons now trigger sign-in/out instead of a client passcode.
function toggleLock(){ staffAuth(); }
function toggleSLock(){ staffAuth(); }

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
  const row = {
    no:d.no, name:d.name, sex:d.sex, age:d.age, phone:d.phone, role:d.role,
    student_class:d.klass, school:d.school, year_no:d.year, major:d.major, uni:d.uni, dept:d.dept,
    to_whom:d.to_whom, from_date:d.from_date, to_date:d.to_date, reason:d.reason,
    place:d.place, write_date:d.write_date
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
  if(error){ console.warn("[PPNLSC] permits:", error.message); PERMITS = []; renderPermits(); return; }  // fail quietly -> just show empty state
  PERMITS = data || [];
  renderPermits();
}

function updatePermitAuthBtn(){
  const b = document.getElementById("permitAuthBtn"); if(!b) return;
  b.textContent = isStaff ? "🔓 ចេញពីគណនី (Admin)" : "🔒 ចូលជាអ្នកគ្រប់គ្រង (Admin)";
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
sb.auth.onAuthStateChange((_evt, session) => {
  isStaff = !!session;
  attendLocked = !isStaff;
  studentLocked = !isStaff;
  applyLock(); applySLock();
  renderPermits();   // show/hide the staff-only delete buttons
});

sb.channel("ppnlsc-rt")
  .on("postgres_changes", { event: "*", schema: "public", table: "students"    }, loadData)
  .on("postgres_changes", { event: "*", schema: "public", table: "attendance"  }, loadData)
  .on("postgres_changes", { event: "*", schema: "public", table: "memories"    }, loadMemories)
  .on("postgres_changes", { event: "*", schema: "public", table: "permissions" }, loadPermits)
  .subscribe();

(async () => {
  const { data: { session } } = await sb.auth.getSession();
  isStaff = !!session;
  attendLocked = !isStaff;
  studentLocked = !isStaff;
  await loadData();
  await loadMemories();
  await loadPermits();
  applyLock(); applySLock();
})();
