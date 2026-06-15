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
    b.innerHTML += `<tr><td>${i + 1}</td>${nameCell}${genderCell}</tr>`;
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

async function addStudent(){
  if (!isStaff) { showLock(); return; }
  const seq = STUDENTS.reduce((m, s) => Math.max(m, s.seq), 0) + 1;
  const { data, error } = await sb.from("students").insert({ seq, name: "", gender: "M" }).select().single();
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
  if (session) { await sb.auth.signOut(); return; }
  const email = prompt("អ៊ីមែលបុគ្គលិក (staff email):"); if (!email) return;
  const password = prompt("ពាក្យសម្ងាត់ (password):"); if (password === null) return;
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    window.msgTitle.textContent = "ចូលប្រើមិនបាន";
    window.msgText.textContent  = error.message;
    window.msgModal.classList.add("show");
  }
}
// The lock buttons now trigger sign-in/out instead of a client passcode.
function toggleLock(){ staffAuth(); }
function toggleSLock(){ staffAuth(); }

/* ---------- REALTIME + BOOT ---------- */
sb.auth.onAuthStateChange((_evt, session) => {
  isStaff = !!session;
  attendLocked = !isStaff;
  studentLocked = !isStaff;
  applyLock(); applySLock();
});

sb.channel("ppnlsc-rt")
  .on("postgres_changes", { event: "*", schema: "public", table: "students"   }, loadData)
  .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, loadData)
  .on("postgres_changes", { event: "*", schema: "public", table: "memories"   }, loadMemories)
  .subscribe();

(async () => {
  const { data: { session } } = await sb.auth.getSession();
  isStaff = !!session;
  attendLocked = !isStaff;
  studentLocked = !isStaff;
  await loadData();
  await loadMemories();
  applyLock(); applySLock();
})();
