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

/* ============================================================
   I18N — translation dictionary + helpers.
   English is the default language (CUR_LANG). Khmer values below are
   copied verbatim from the original hardcoded UI text so nothing is
   reworded. Korean/Chinese are new translations.
   NOTE: applyLanguage() is only actually *invoked* at the very bottom
   of this file (see initLang() near the auth boot code), AFTER every
   `let`/`const` in this file has been initialized — calling it earlier
   (e.g. up here, at parse time) would hit a temporal-dead-zone
   ReferenceError on things like STUDENTS/PERMITS/CUR_MONTH that are
   declared further down. Function declarations (t, applyLanguage, …)
   are hoisted, so it's safe to *define* everything here and *call* it
   later, from anywhere.
   ============================================================ */
const I18N = {
  en: {
    // app / branding
    appName: "Phnom Penh New Life Student Center",
    appFooterCopy: "© 2026 Phnom Penh New Life Student Center<br>Made with love, in the name of Jesus Christ",
    // theme
    theme_label: "Appearance", theme_light: "Light", theme_dark: "Dark",
    // nav (drawer / tabbar / home tiles)
    nav_home: "Home", nav_students: "Student List", nav_students_tab: "Students",
    nav_attendance: "Attendance", nav_org: "Org Chart", nav_memories: "Memories",
    nav_memories_tab: "Photos", nav_permits: "Permission Requests", nav_feedback: "Feedback",
    nav_staff: "Admin", nav_admin_panel: "Admin Panel", nav_more: "More",
    // fabs
    fab_request_permit: "Request permission", fab_add_student: "Add student",
    // gender
    gender_male_label: "Male", gender_female_label: "Female",
    gender_male_btn: "👤 Male", gender_female_btn: "👤 Female",
    // home
    home_request_btn: "Request Permission", carousel_empty: "No photos yet",
    stat_total_students: "Total Students", home_permits_this_month: "Permission Requests —",
    // students
    label_total: "Total",
    tt_toggle_gender: "Click to toggle M/F", tt_delete_student: "Delete student",
    // attendance
    rank_title: "Absence Ranking", rank_empty: "No absences yet",
    att_col_no: "No.", att_col_name: "Student Name", att_col_gender: "Gender",
    att_col_present: "Present", att_col_absent: "Absent",
    att_friday_word: "Friday", att_weekly_meeting_note: "— meets every Friday",
    // permission request form
    perm_no_label: "No.", perm_no_ph: "e.g. 001",
    perm_name_label: "Full name", perm_name_ph: "Full name",
    perm_role_label: "Role", perm_role_student: "Student", perm_role_uni: "University Student", perm_role_staff: "Staff",
    perm_gender_label: "Gender", perm_age_label: "Age", perm_phone_label: "Phone",
    perm_class_label: "Class", perm_school_label: "School",
    perm_year_label: "Year", perm_major_label: "Major", perm_uni_label: "University",
    perm_dept_label: "Department", perm_to_label: "To (recipient)",
    perm_from_label: "From", perm_todate_label: "To",
    perm_reason_label: "Reason", perm_reason_ph: "e.g. go to hometown / sick",
    perm_place_label: "Place", perm_date_label: "Date",
    perm_preview_label: "Preview",
    perm_btn_generate_image: "📷 Generate Image & Submit", perm_btn_generate_pdf: "📄 Generate PDF",
    // permission letter document
    doc_title: "Permission Request Letter",
    doc_i_am_named: "I am named:", doc_gender: "Gender", doc_age: "Age", doc_phone: "Phone",
    doc_as: "as a", doc_role_student_class: "Student, Class", doc_of: "of",
    doc_role_uni_year: "University Student, Year", doc_dept_major: "Major",
    doc_role_staff_dept: "Staff, Department",
    doc_recip_greeting: "Respectfully submitted to",
    doc_recip_title: "The Officer in Charge, Phnom Penh New Life Student Center",
    doc_via_label: "To", doc_subject_label: "Subject",
    doc_leave_request_text: "Request for leave of absence for a total of",
    doc_days_label: "day(s)",
    doc_from_date_label: "From", doc_to_date_label: "To",
    doc_month_label: "Month", doc_year_label: "Year",
    doc_reason_label: "Reason", doc_colon: ":",
    doc_para_body: "In light of the above, I kindly request the Director's permission to be granted leave as requested, in the love of our Lord Jesus Christ.",
    doc_dated_on: "Date", doc_signature: "Signature",
    doc_decision_title: "Decision of the Officer in Charge",
    // memories
    mem_add_btn: "+ Add Photo",
    mem_empty_line1: "No photos yet.", mem_empty_line2: "Tap «➕ Add Photo» to upload (staff only).",
    // permit list
    permit_login_as_admin: "🔒 Sign in as Admin", permit_list_empty: "No permission requests yet.",
    permit_reason_prefix: "Reason: ", permit_view_btn: "👁 View / Download",
    common_delete_btn: "🗑 Delete",
    auth_signin_short: "🔒 Sign In", auth_signout_short: "🔓 Sign Out", auth_signout_full: "Sign Out",
    // feedback
    fb_name_label: "Name (optional)", fb_name_ph: "Your name",
    fb_category_label: "Category",
    fb_cat_technical: "Technical issue", fb_cat_suggestion: "Suggestion / idea",
    fb_cat_data_error: "Data error", fb_cat_other: "Other",
    fb_message_label: "Message", fb_message_ph: "Please describe the issue or your feedback...",
    fb_send_btn: "📧 Send Feedback", fb_anonymous: "Anonymous",
    msg_fill_message_title: "Please fill in a message", msg_fill_message_body: "Please write a message before sending.",
    email_name_label: "Name: ", email_category_label: "Category: ", email_message_label: "Message:\n",
    // auth gate / login
    auth_gate_subtitle: "Please sign in to use the app",
    auth_username_label: "Username", auth_username_ph: "Username",
    auth_password_label: "Password",
    auth_signin_btn: "Sign In", auth_login_short: "Sign In",
    common_cancel: "Cancel",
    auth_err_missing: "Please enter username and password.",
    auth_err_invalid: "Invalid username or password.",
    // generic messages / modals / toasts
    msg_error_generic: "An error occurred",
    msg_not_allowed_title: "Not Allowed",
    msg_not_allowed_body: "This action is for authorized staff only.",
    common_ok: "OK", common_close: "Close", common_save: "Save", common_loading: "Loading…",
    msg_generating: "Generating… please wait",
    msg_export_failed_title: "Could not generate (export failed)", msg_try_again: "Please try again.",
    msg_last_updated: "Last updated ", msg_editing_admin: "Editing — Admin",
    msg_fill_name_title: "Please fill in the name", msg_fill_name_body: "Please enter a name before saving.",
    msg_saved_title: "Saved ✓", msg_saved_body: "The permission request has been saved in the «Permission Requests» menu.",
    // download / share modal
    dl_done_title: "Done ✓", dl_share_btn: "📤 Share / Save", dl_save_link: "⬇ Save",
    dl_hint_can_share: "On phone: tap «📤 Share / Save» ➜ choose <b>Save Image</b> / <b>Save Video</b> or <b>Save to Files</b>, or send it to Telegram / Messenger.",
    dl_hint_image: "Tap «⬇ Save» to download the image. (Phone: press and hold the image, then choose Save Image)",
    dl_hint_other: "Tap «⬇ Open / Save» ➜ open the file, then tap Share ➜ Save to Files / Save Video.",
    // confirm dialogs
    confirm_delete_student_prefix: "Delete student «", confirm_delete_student_suffix: "»? (This cannot be undone)",
    confirm_delete_permit: "Delete this permission request?",
    // Telegram admin notification
    tg_notify_title: "📋 New permission request",
    tg_name_label: "👤 Name: ", tg_reason_label: "📝 Reason: ", tg_from_label: "📅 From: ", tg_phone_label: "☎️ Phone: ",
  },
  km: {
    // app / branding
    appName: "មណ្ឌលនិស្សិតជីវិតថ្មីភ្នំពេញ",
    appFooterCopy: "© 2026 មណ្ឌលនិស្សិតជីវិតថ្មីភ្នំពេញ<br>បង្កើតឡើងដោយក្តីស្រឡាញ់ ក្នុងព្រះនាមព្រះយេស៊ូវគ្រីស្ទ",
    // theme
    theme_label: "រូបរាង", theme_light: "ភ្លឺ", theme_dark: "ងងឹត",
    // nav
    nav_home: "ទំព័រដើម", nav_students: "បញ្ជីសិស្ស", nav_students_tab: "សិស្ស",
    nav_attendance: "វត្តមាន", nav_org: "រចនាសម្ព័ន្ធ", nav_memories: "អនុស្សាវរីយ៍",
    nav_memories_tab: "រូបភាព", nav_permits: "ប្រកាសសុំច្បាប់", nav_feedback: "មតិយោបល់",
    nav_staff: "អ្នកគ្រប់គ្រង", nav_admin_panel: "ផ្ទាំងគ្រប់គ្រង", nav_more: "ផ្សេងៗ",
    // fabs
    fab_request_permit: "ស្នើសុំច្បាប់", fab_add_student: "បន្ថែមសិស្ស",
    // gender
    gender_male_label: "ប្រុស", gender_female_label: "ស្រី",
    gender_male_btn: "👤 ប្រុស", gender_female_btn: "👤 ស្រី",
    // home
    home_request_btn: "ស្នើសុំច្បាប់", carousel_empty: "មិនទាន់មានរូបភាព",
    stat_total_students: "សិស្សសរុប", home_permits_this_month: "ស្នើសុំច្បាប់ ខែ",
    // students
    label_total: "សរុប",
    tt_toggle_gender: "ចុចដើម្បីប្ដូរ M/F", tt_delete_student: "លុបសិស្ស",
    // attendance
    rank_title: "ចំណាត់ថ្នាក់អវត្តមាន", rank_empty: "មិនទាន់មានអវត្តមាន",
    att_col_no: "ល.រ", att_col_name: "ឈ្មោះសិស្ស", att_col_gender: "ភេទ",
    att_col_present: "វត្តមាន", att_col_absent: "អវត្តមាន",
    att_friday_word: "សុក្រ", att_weekly_meeting_note: "— ប្រជុំរៀងរាល់ថ្ងៃសុក្រ",
    // permission request form
    perm_no_label: "លេខ (No.)", perm_no_ph: "ឧ. ០០១",
    perm_name_label: "ឈ្មោះ / Full name", perm_name_ph: "ឈ្មោះពេញ",
    perm_role_label: "តួនាទី / Role", perm_role_student: "សិស្ស", perm_role_uni: "និស្សិត", perm_role_staff: "បុគ្គលិក",
    perm_gender_label: "ភេទ / Gender", perm_age_label: "អាយុ / Age", perm_phone_label: "លេខទូរស័ព្ទ / Phone",
    perm_class_label: "ថ្នាក់ទី / Class", perm_school_label: "នៃសាលា / School",
    perm_year_label: "ឆ្នាំទី / Year", perm_major_label: "ផ្នែក / Major", perm_uni_label: "សាកលវិទ្យាល័យ / Uni",
    perm_dept_label: "ផ្នែក / Department", perm_to_label: "តាមរយះ (អ្នកទទួល) / To",
    perm_from_label: "ចាប់ពីថ្ងៃ / From", perm_todate_label: "ដល់ថ្ងៃ / To",
    perm_reason_label: "មូលហេតុ / Reason", perm_reason_ph: "ឧ. ទៅផ្ទះកំណើត / ឈឺ",
    perm_place_label: "ទីកន្លែង / Place", perm_date_label: "កាលបរិច្ឆេទ / Date",
    perm_preview_label: "មើលជាមុន",
    perm_btn_generate_image: "📷 បង្កើតរូបភាព & ប្រកាស", perm_btn_generate_pdf: "📄 បង្កើត PDF",
    // permission letter document
    doc_title: "ពាក្យសុំច្បាប់",
    doc_i_am_named: "ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ ៖", doc_gender: "ភេទ", doc_age: "អាយុ", doc_phone: "លេខទូរស័ព្ទ",
    doc_as: "ជា", doc_role_student_class: "សិស្ស ថ្នាក់ទី", doc_of: "នៃ",
    doc_role_uni_year: "និស្សិត ឆ្នាំទី", doc_dept_major: "ផ្នែក",
    doc_role_staff_dept: "បុគ្គលិក ផ្នែក",
    doc_recip_greeting: "សូមគោរពចូលមក",
    doc_recip_title: "បុគ្គលិកទទួលខុសត្រូវមណ្ឌលនិស្សិតជីវិតថ្មី",
    doc_via_label: "តាមរយះ", doc_subject_label: "កម្មវត្ថុ",
    doc_leave_request_text: "សំណើសុំច្បាប់ដើម្បីឈប់សម្រាក ចំនួន",
    doc_days_label: "ថ្ងៃ",
    doc_from_date_label: "ចាប់ពីថ្ងៃទី", doc_to_date_label: "ដល់ថ្ងៃទី",
    doc_month_label: "ខែ", doc_year_label: "ឆ្នាំ",
    doc_reason_label: "មូលហេតុ", doc_colon: "៖",
    doc_para_body: "អាស្រ័យដូចបានជំរាបជូនខាងលើនេះ សូមលោកនាយកមេត្តាអនុញ្ញាតច្បាប់សម្រាប់ទៅតាមការស្នើសុំរបស់ខ្ញុំបាទ-នាងខ្ញុំ ដោយយល់សេចក្ដីស្រឡាញ់នៃព្រះអម្ចាស់យេស៊ូវគ្រីស្ទ ។",
    doc_dated_on: "ថ្ងៃទី", doc_signature: "ហត្ថលេខា",
    doc_decision_title: "សេចក្ដីសម្រេចរបស់បុគ្គលិក",
    // memories
    mem_add_btn: "+ បន្ថែមរូបភាព",
    mem_empty_line1: "មិនទាន់មានរូបភាព។", mem_empty_line2: "ចុច «➕ បន្ថែមរូបភាព» ដើម្បីបង្ហោះ (សម្រាប់បុគ្គលិក)។",
    // permit list
    permit_login_as_admin: "🔒 ចូលជាអ្នកគ្រប់គ្រង", permit_list_empty: "មិនទាន់មានពាក្យសុំច្បាប់។",
    permit_reason_prefix: "មូលហេតុ៖ ", permit_view_btn: "👁 មើល / ទាញយក",
    common_delete_btn: "🗑 លុប",
    auth_signin_short: "🔒 ចូលគណនី", auth_signout_short: "🔓 ចេញពីគណនី", auth_signout_full: "ចេញពីគណនី",
    // feedback
    fb_name_label: "ឈ្មោះ (ស្រេចចិត្ត) / Name (optional)", fb_name_ph: "ឈ្មោះរបស់អ្នក",
    fb_category_label: "ប្រភេទ / Category",
    fb_cat_technical: "បញ្ហាបច្ចេកទេស / Technical issue", fb_cat_suggestion: "សំណូមពរ / គំនិត / Suggestion",
    fb_cat_data_error: "កំហុសទិន្នន័យ / Data error", fb_cat_other: "ផ្សេងៗ / Other",
    fb_message_label: "សារ", fb_message_ph: "សូមពិពណ៌នាបញ្ហា ឬមតិរបស់អ្នក...",
    fb_send_btn: "📧 ផ្ញើមតិយោបល់", fb_anonymous: "អនាមិក",
    msg_fill_message_title: "សូមបំពេញសារ", msg_fill_message_body: "សូមសរសេរសារមុននឹងផ្ញើ។",
    email_name_label: "ឈ្មោះ: ", email_category_label: "ប្រភេទ: ", email_message_label: "សារ:\n",
    // auth gate / login
    auth_gate_subtitle: "សូមចូលគណនីដើម្បីប្រើប្រាស់កម្មវិធី",
    auth_username_label: "ឈ្មោះអ្នកប្រើ", auth_username_ph: "ឈ្មោះអ្នកប្រើ",
    auth_password_label: "ពាក្យសម្ងាត់",
    auth_signin_btn: "ចូលគណនី", auth_login_short: "ចូល",
    common_cancel: "បោះបង់",
    auth_err_missing: "សូមបញ្ចូលឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់។",
    auth_err_invalid: "ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។",
    // generic messages / modals / toasts
    msg_error_generic: "មានបញ្ហា (error)",
    msg_not_allowed_title: "មិនអនុញ្ញាត",
    msg_not_allowed_body: "មុខងារនេះអនុញ្ញាតតែសម្រាប់អ្នកទទួលខុសត្រូវប៉ុណ្ណោះ។",
    common_ok: "យល់ព្រម", common_close: "បិទ", common_save: "រក្សាទុក", common_loading: "កំពុងផ្ទុក…",
    msg_generating: "កំពុងបង្កើត… សូមរង់ចាំ",
    msg_export_failed_title: "បង្កើតមិនបាន (export failed)", msg_try_again: "សូមព្យាយាមម្ដងទៀត។",
    msg_last_updated: "ផ្លាស់ប្ដូរចុងក្រោយ ", msg_editing_admin: "កំពុងកែប្រែ — អ្នកគ្រប់គ្រង",
    msg_fill_name_title: "សូមបំពេញឈ្មោះ", msg_fill_name_body: "សូមបញ្ចូលឈ្មោះមុននឹងរក្សាទុក។",
    msg_saved_title: "បានរក្សាទុក ✓", msg_saved_body: "ពាក្យសុំច្បាប់ត្រូវបានរក្សាទុកក្នុងម៉ឺនុយ «ប្រកាសសុំច្បាប់»។",
    // download / share modal
    dl_done_title: "រួចរាល់ ✓", dl_share_btn: "📤 ចែករំលែក / រក្សាទុក", dl_save_link: "⬇ រក្សាទុក",
    dl_hint_can_share: "ទូរស័ព្ទ៖ ចុច «📤 ចែករំលែក / រក្សាទុក» ➜ ជ្រើស <b>Save Image</b> / <b>Save Video</b> ឬ <b>Save to Files</b> ឬផ្ញើទៅ Telegram / Messenger។",
    dl_hint_image: "ចុច «⬇ រក្សាទុក» ដើម្បីទាញយករូបភាព។ (ទូរស័ព្ទ៖ ចុចឃ្លាំងលើរូប រួចជ្រើស Save Image)",
    dl_hint_other: "ចុច «⬇ បើក / រក្សាទុក» ➜ បើកឯកសារ រួចចុច Share ➜ Save to Files / Save Video។",
    // confirm dialogs
    confirm_delete_student_prefix: "លុបសិស្ស «", confirm_delete_student_suffix: "» ? (ការលុបមិនអាចត្រឡប់វិញបានទេ)",
    confirm_delete_permit: "លុបពាក្យសុំច្បាប់នេះ?",
    // Telegram admin notification
    tg_notify_title: "📋 ពាក្យសុំច្បាប់ថ្មី (New permission request)",
    tg_name_label: "👤 ឈ្មោះ: ", tg_reason_label: "📝 មូលហេតុ: ", tg_from_label: "📅 ចាប់ពី: ", tg_phone_label: "☎️ ទូរស័ព្ទ: ",
  },
  ko: {
    appName: "프놈펜 뉴라이프 학생센터",
    appFooterCopy: "© 2026 프놈펜 뉴라이프 학생센터<br>예수 그리스도의 이름으로 사랑을 담아 만들었습니다",
    theme_label: "테마", theme_light: "라이트", theme_dark: "다크",
    nav_home: "홈", nav_students: "학생 목록", nav_students_tab: "학생",
    nav_attendance: "출석", nav_org: "조직도", nav_memories: "추억",
    nav_memories_tab: "사진", nav_permits: "휴가 신청서", nav_feedback: "피드백",
    nav_staff: "관리자", nav_admin_panel: "관리자 페이지", nav_more: "더보기",
    fab_request_permit: "휴가 신청", fab_add_student: "학생 추가",
    gender_male_label: "남성", gender_female_label: "여성",
    gender_male_btn: "👤 남성", gender_female_btn: "👤 여성",
    home_request_btn: "휴가 신청", carousel_empty: "아직 사진이 없습니다",
    stat_total_students: "전체 학생", home_permits_this_month: "휴가 신청 —",
    label_total: "전체",
    tt_toggle_gender: "클릭하여 성별 전환", tt_delete_student: "학생 삭제",
    rank_title: "결석 순위", rank_empty: "아직 결석이 없습니다",
    att_col_no: "번호", att_col_name: "이름", att_col_gender: "성별",
    att_col_present: "출석", att_col_absent: "결석",
    att_friday_word: "금요일", att_weekly_meeting_note: "— 매주 금요일 모임",
    perm_no_label: "번호 (No.)", perm_no_ph: "예: 001",
    perm_name_label: "성명", perm_name_ph: "성명을 입력하세요",
    perm_role_label: "역할", perm_role_student: "학생", perm_role_uni: "대학생", perm_role_staff: "직원",
    perm_gender_label: "성별", perm_age_label: "나이", perm_phone_label: "전화번호",
    perm_class_label: "학년/반", perm_school_label: "학교",
    perm_year_label: "학년", perm_major_label: "전공", perm_uni_label: "대학교",
    perm_dept_label: "부서", perm_to_label: "수신인",
    perm_from_label: "시작일", perm_todate_label: "종료일",
    perm_reason_label: "사유", perm_reason_ph: "예: 고향 방문 / 병가",
    perm_place_label: "장소", perm_date_label: "작성일",
    perm_preview_label: "미리보기",
    perm_btn_generate_image: "📷 이미지 생성 & 제출", perm_btn_generate_pdf: "📄 PDF 생성",
    doc_title: "휴가 신청서",
    doc_i_am_named: "저의 이름은:", doc_gender: "성별", doc_age: "나이", doc_phone: "전화번호",
    doc_as: "신분:", doc_role_student_class: "학생, 학년/반", doc_of: "소속",
    doc_role_uni_year: "대학생, 학년", doc_dept_major: "전공",
    doc_role_staff_dept: "직원, 부서",
    doc_recip_greeting: "삼가 아룁니다,",
    doc_recip_title: "프놈펜 뉴라이프 학생센터 담당자 귀하",
    doc_via_label: "수신", doc_subject_label: "제목",
    doc_leave_request_text: "총",
    doc_days_label: "일간의 휴가를 신청합니다",
    doc_from_date_label: "시작일:", doc_to_date_label: "종료일:",
    doc_month_label: "월", doc_year_label: "년",
    doc_reason_label: "사유", doc_colon: ":",
    doc_para_body: "위와 같은 사유로, 주 예수 그리스도의 사랑 안에서 원장님의 허가를 정중히 요청드립니다.",
    doc_dated_on: "작성일", doc_signature: "서명",
    doc_decision_title: "담당자 결정 사항",
    mem_add_btn: "+ 사진 추가",
    mem_empty_line1: "아직 사진이 없습니다.", mem_empty_line2: "«➕ 사진 추가»를 눌러 업로드하세요 (직원 전용).",
    permit_login_as_admin: "🔒 관리자로 로그인", permit_list_empty: "아직 휴가 신청서가 없습니다.",
    permit_reason_prefix: "사유: ", permit_view_btn: "👁 보기 / 다운로드",
    common_delete_btn: "🗑 삭제",
    auth_signin_short: "🔒 로그인", auth_signout_short: "🔓 로그아웃", auth_signout_full: "로그아웃",
    fb_name_label: "이름 (선택)", fb_name_ph: "이름을 입력하세요",
    fb_category_label: "분류",
    fb_cat_technical: "기술적 문제", fb_cat_suggestion: "제안 / 아이디어",
    fb_cat_data_error: "데이터 오류", fb_cat_other: "기타",
    fb_message_label: "메시지", fb_message_ph: "문제점이나 의견을 작성해 주세요...",
    fb_send_btn: "📧 피드백 보내기", fb_anonymous: "익명",
    msg_fill_message_title: "메시지를 입력해 주세요", msg_fill_message_body: "보내기 전에 메시지를 작성해 주세요.",
    email_name_label: "이름: ", email_category_label: "분류: ", email_message_label: "메시지:\n",
    auth_gate_subtitle: "앱을 사용하려면 로그인하세요",
    auth_username_label: "사용자 이름", auth_username_ph: "사용자 이름",
    auth_password_label: "비밀번호",
    auth_signin_btn: "로그인", auth_login_short: "로그인",
    common_cancel: "취소",
    auth_err_missing: "사용자 이름과 비밀번호를 입력하세요.",
    auth_err_invalid: "사용자 이름 또는 비밀번호가 올바르지 않습니다.",
    msg_error_generic: "오류가 발생했습니다",
    msg_not_allowed_title: "허용되지 않음",
    msg_not_allowed_body: "이 기능은 담당 직원만 사용할 수 있습니다.",
    common_ok: "확인", common_close: "닫기", common_save: "저장", common_loading: "불러오는 중…",
    msg_generating: "생성 중… 잠시만 기다려 주세요",
    msg_export_failed_title: "생성할 수 없습니다 (내보내기 실패)", msg_try_again: "다시 시도해 주세요.",
    msg_last_updated: "마지막 업데이트 ", msg_editing_admin: "편집 중 — 관리자",
    msg_fill_name_title: "이름을 입력해 주세요", msg_fill_name_body: "저장하기 전에 이름을 입력해 주세요.",
    msg_saved_title: "저장됨 ✓", msg_saved_body: "휴가 신청서가 «휴가 신청서» 메뉴에 저장되었습니다.",
    dl_done_title: "완료 ✓", dl_share_btn: "📤 공유 / 저장", dl_save_link: "⬇ 저장",
    dl_hint_can_share: "휴대폰: «📤 공유 / 저장»을 눌러 <b>Save Image</b> / <b>Save Video</b> 또는 <b>Save to Files</b>를 선택하거나 Telegram / Messenger로 보내세요.",
    dl_hint_image: "«⬇ 저장»을 눌러 이미지를 다운로드하세요. (휴대폰: 이미지를 길게 눌러 Save Image 선택)",
    dl_hint_other: "«⬇ 열기 / 저장»을 눌러 파일을 연 다음 Share ➜ Save to Files / Save Video를 선택하세요.",
    confirm_delete_student_prefix: "학생 «", confirm_delete_student_suffix: "»을(를) 삭제하시겠습니까? (되돌릴 수 없습니다)",
    confirm_delete_permit: "이 휴가 신청서를 삭제하시겠습니까?",
    tg_notify_title: "📋 새 휴가 신청서",
    tg_name_label: "👤 이름: ", tg_reason_label: "📝 사유: ", tg_from_label: "📅 시작일: ", tg_phone_label: "☎️ 전화번호: ",
  },
  zh: {
    appName: "金边新生活学生中心",
    appFooterCopy: "© 2026 金边新生活学生中心<br>因着对耶稣基督的爱而创建",
    theme_label: "外观", theme_light: "浅色", theme_dark: "深色",
    nav_home: "首页", nav_students: "学生名单", nav_students_tab: "学生",
    nav_attendance: "考勤", nav_org: "组织架构", nav_memories: "回忆",
    nav_memories_tab: "照片", nav_permits: "请假申请", nav_feedback: "反馈",
    nav_staff: "管理员", nav_admin_panel: "管理面板", nav_more: "更多",
    fab_request_permit: "请假申请", fab_add_student: "添加学生",
    gender_male_label: "男", gender_female_label: "女",
    gender_male_btn: "👤 男", gender_female_btn: "👤 女",
    home_request_btn: "请假申请", carousel_empty: "暂无照片",
    stat_total_students: "学生总数", home_permits_this_month: "请假申请 —",
    label_total: "总计",
    tt_toggle_gender: "点击切换性别", tt_delete_student: "删除学生",
    rank_title: "缺勤排行", rank_empty: "暂无缺勤记录",
    att_col_no: "序号", att_col_name: "姓名", att_col_gender: "性别",
    att_col_present: "出勤", att_col_absent: "缺勤",
    att_friday_word: "周五", att_weekly_meeting_note: "— 每周五聚会",
    perm_no_label: "编号 (No.)", perm_no_ph: "例：001",
    perm_name_label: "姓名", perm_name_ph: "请输入姓名",
    perm_role_label: "身份", perm_role_student: "学生", perm_role_uni: "大学生", perm_role_staff: "职员",
    perm_gender_label: "性别", perm_age_label: "年龄", perm_phone_label: "电话号码",
    perm_class_label: "班级", perm_school_label: "学校",
    perm_year_label: "年级", perm_major_label: "专业", perm_uni_label: "大学",
    perm_dept_label: "部门", perm_to_label: "收件人",
    perm_from_label: "起始日期", perm_todate_label: "结束日期",
    perm_reason_label: "事由", perm_reason_ph: "例：回家乡 / 生病",
    perm_place_label: "地点", perm_date_label: "填写日期",
    perm_preview_label: "预览",
    perm_btn_generate_image: "📷 生成图片并提交", perm_btn_generate_pdf: "📄 生成 PDF",
    doc_title: "请假申请书",
    doc_i_am_named: "本人姓名：", doc_gender: "性别", doc_age: "年龄", doc_phone: "电话号码",
    doc_as: "身份为", doc_role_student_class: "学生，班级", doc_of: "属于",
    doc_role_uni_year: "大学生，年级", doc_dept_major: "专业",
    doc_role_staff_dept: "职员，部门",
    doc_recip_greeting: "谨呈",
    doc_recip_title: "金边新生活学生中心负责人",
    doc_via_label: "致", doc_subject_label: "事由",
    doc_leave_request_text: "申请请假，共计",
    doc_days_label: "天",
    doc_from_date_label: "起始日期：", doc_to_date_label: "结束日期：",
    doc_month_label: "月", doc_year_label: "年",
    doc_reason_label: "原因", doc_colon: "：",
    doc_para_body: "综上所述，恳请负责人本着对我主耶稣基督的爱，批准本人的请假申请。",
    doc_dated_on: "日期", doc_signature: "签名",
    doc_decision_title: "负责人审批意见",
    mem_add_btn: "+ 添加照片",
    mem_empty_line1: "暂无照片。", mem_empty_line2: "点击«➕添加照片»上传（仅限工作人员）。",
    permit_login_as_admin: "🔒 以管理员登录", permit_list_empty: "暂无请假申请。",
    permit_reason_prefix: "事由：", permit_view_btn: "👁 查看 / 下载",
    common_delete_btn: "🗑 删除",
    auth_signin_short: "🔒 登录", auth_signout_short: "🔓 登出", auth_signout_full: "登出",
    fb_name_label: "姓名（可选）", fb_name_ph: "请输入您的姓名",
    fb_category_label: "类别",
    fb_cat_technical: "技术问题", fb_cat_suggestion: "建议 / 意见",
    fb_cat_data_error: "数据错误", fb_cat_other: "其他",
    fb_message_label: "留言", fb_message_ph: "请描述问题或您的意见……",
    fb_send_btn: "📧 发送反馈", fb_anonymous: "匿名",
    msg_fill_message_title: "请填写留言", msg_fill_message_body: "发送前请先填写留言内容。",
    email_name_label: "姓名：", email_category_label: "类别：", email_message_label: "留言：\n",
    auth_gate_subtitle: "请登录以使用本应用",
    auth_username_label: "用户名", auth_username_ph: "用户名",
    auth_password_label: "密码",
    auth_signin_btn: "登录", auth_login_short: "登录",
    common_cancel: "取消",
    auth_err_missing: "请输入用户名和密码。",
    auth_err_invalid: "用户名或密码不正确。",
    msg_error_generic: "发生错误",
    msg_not_allowed_title: "不允许",
    msg_not_allowed_body: "此功能仅限负责人员使用。",
    common_ok: "确定", common_close: "关闭", common_save: "保存", common_loading: "加载中…",
    msg_generating: "生成中…请稍候",
    msg_export_failed_title: "生成失败（导出失败）", msg_try_again: "请重试。",
    msg_last_updated: "最后更新 ", msg_editing_admin: "编辑中 — 管理员",
    msg_fill_name_title: "请填写姓名", msg_fill_name_body: "保存前请先输入姓名。",
    msg_saved_title: "已保存 ✓", msg_saved_body: "请假申请已保存到«请假申请»菜单中。",
    dl_done_title: "完成 ✓", dl_share_btn: "📤 分享 / 保存", dl_save_link: "⬇ 保存",
    dl_hint_can_share: "手机：点击«📤 分享 / 保存»➜选择<b>保存图片</b>/<b>保存视频</b>或<b>保存到文件</b>，或发送到 Telegram / Messenger。",
    dl_hint_image: "点击«⬇ 保存»下载图片。（手机：长按图片后选择保存图片）",
    dl_hint_other: "点击«⬇ 打开 / 保存»➜打开文件，然后点击分享➜保存到文件 / 保存视频。",
    confirm_delete_student_prefix: "删除学生「", confirm_delete_student_suffix: "」？（此操作无法撤销）",
    confirm_delete_permit: "确定删除此请假申请吗？",
    tg_notify_title: "📋 新的请假申请",
    tg_name_label: "👤 姓名：", tg_reason_label: "📝 事由：", tg_from_label: "📅 起始日：", tg_phone_label: "☎️ 电话：",
  },
};
let CUR_LANG = 'en';   // English is the default language
function t(key){
  return (I18N[CUR_LANG] && I18N[CUR_LANG][key] !== undefined) ? I18N[CUR_LANG][key]
       : (I18N.km[key] !== undefined ? I18N.km[key] : key);
}

/* ---- localized month names (Khmer array reused lazily so no TDZ issue with KH_MONTHS below) ---- */
const EN_MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const KO_MONTHS=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const ZH_MONTHS=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
function monthNameLocalized(idx){
  if(CUR_LANG==='ko') return KO_MONTHS[idx];
  if(CUR_LANG==='zh') return ZH_MONTHS[idx];
  if(CUR_LANG==='km') return (typeof KH_MONTHS!=='undefined' ? KH_MONTHS : EN_MONTHS)[idx];
  return EN_MONTHS[idx];
}

function retranslateMonthSelect(){
  const sel=document.getElementById('monthSel'); if(!sel) return;
  Array.from(sel.options).forEach(o=>{ if(o.value && typeof monthLabelKh==='function') o.textContent = monthLabelKh(o.value); });
}

/* ---- applies CUR_LANG to every static [data-i18n*] element, then re-runs
   whatever render functions currently produce JS-generated text so the
   whole app updates immediately without a reload. ---- */
function applyLanguage(lang){
  if(!I18N[lang]) lang = 'en';
  CUR_LANG = lang;
  try{ localStorage.setItem('ppnlsc-lang', lang); }catch(e){}
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const k = el.getAttribute('data-i18n-title');
    if(el.hasAttribute('title')) el.title = t(k);
    if(el.hasAttribute('aria-label')) el.setAttribute('aria-label', t(k));
  });

  const btnLabel = document.getElementById('langBtnLabel');
  if(btnLabel) btnLabel.textContent = lang.toUpperCase();
  document.querySelectorAll('#langMenu button[data-lang]').forEach(b=>{
    b.classList.toggle('active', b.getAttribute('data-lang')===lang);
  });

  retranslateMonthSelect();
  if(typeof renderStudents==='function') renderStudents();
  if(typeof renderAttHead==='function') renderAttHead();
  if(typeof renderAtt==='function') renderAtt();
  if(typeof renderGallery==='function') renderGallery();
  if(typeof renderPermits==='function') renderPermits();
  if(typeof refreshCounts==='function') refreshCounts();
  if(typeof renderPerm==='function') renderPerm();
}

function toggleLangMenu(){
  const m = document.getElementById('langMenu'); if(m) m.classList.toggle('show');
}
document.addEventListener('click', function(e){
  const wrap = document.getElementById('langSwitch');
  const menu = document.getElementById('langMenu');
  if(wrap && menu && !wrap.contains(e.target)) menu.classList.remove('show');
});

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
    window.msgTitle.textContent = t("msg_error_generic");
    window.msgText.textContent  = m;
    window.msgModal.classList.add("show");
  }
}

function fmtStamp(ts){
  return ts ? t("msg_last_updated") + new Date(ts).toLocaleString("en-GB") : "";
}

/* ---------- monthly attendance ---------- */
const KH_DIGITS = ["០","១","២","៣","៤","៥","៦","៧","៨","៩"];
const KH_MONTHS = ["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"];
// only Khmer uses its own numeral glyphs — every other language keeps plain Arabic digits
function khNum(n){ return CUR_LANG==='km' ? String(n).replace(/\d/g, d => KH_DIGITS[+d]) : String(n); }
function curMonthStr(){ const t = new Date(); return t.getFullYear() + "-" + String(t.getMonth()+1).padStart(2,"0"); }
let CUR_MONTH = curMonthStr();
let MONTH_FRIDAYS = [];          // [{idx, day, label}]

// every Friday in a given "YYYY-MM"
function fridaysOf(monthStr){
  const [y,m] = monthStr.split("-").map(Number);
  const out=[]; const d=new Date(y, m-1, 1);
  while(d.getMonth() === m-1){ if(d.getDay()===5) out.push(d.getDate()); d.setDate(d.getDate()+1); }
  return out.map((day,idx) => ({ idx, day, month: m, label: fridayLabel(day, m-1) }));
}
// locale-aware "Friday <day> <month>" label used in the attendance header tooltips
function fridayLabel(day, monthIdx){
  const name = monthNameLocalized(monthIdx);
  if(CUR_LANG==='km') return t('att_friday_word') + ' ' + khNum(day) + ' ' + name;
  if(CUR_LANG==='ko') return name + ' ' + day + '일 (' + t('att_friday_word') + ')';
  if(CUR_LANG==='zh') return name + day + '日 (' + t('att_friday_word') + ')';
  return t('att_friday_word') + ', ' + name + ' ' + day;
}
function monthLabelKh(monthStr){
  const [y,m] = monthStr.split("-").map(Number);
  const name = monthNameLocalized(m-1);
  const yearStr = khNum(y);
  if(CUR_LANG==='km') return t('doc_month_label') + ' ' + name + ' ' + t('doc_year_label') + ' ' + yearStr;
  if(CUR_LANG==='ko') return yearStr + '년 ' + name;
  if(CUR_LANG==='zh') return yearStr + '年' + name;
  return name + ' ' + yearStr;
}

// header built from the selected month's Fridays (4 or 5 columns) — one column per week,
// "day/month" label; the full "សុក្រ ៣ កក្កដា" label lives in each <th title="">.
function renderAttHead(){
  const head = window.attHead; if(!head) return;
  if(!MONTH_FRIDAYS.length) MONTH_FRIDAYS = fridaysOf(CUR_MONTH);
  let h = `<tr><th>${t('att_col_no')}</th><th>${t('att_col_name')}</th><th>${t('att_col_gender')}</th>`;
  MONTH_FRIDAYS.forEach(f => h += `<th class="wk" title="${f.label}">${khNum(f.day)}/${khNum(f.month)}</th>`);
  h += `<th>${t('att_col_present')}</th><th>${t('att_col_absent')}</th></tr>`;
  head.innerHTML = h;
  const sub = document.querySelector('#attendDoc .docsub');
  if(sub) sub.textContent = monthLabelKh(CUR_MONTH) + " " + t('att_weekly_meeting_note');
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
      ? `<div class="sname" onclick="showLock()">${escHtml(d.name)}</div>`
      : `<div class="sname" contenteditable onblur="saveStudentName(${i}, this.innerText)">${escHtml(d.name)}</div>`;
    const genderEl = `<div class="sgender ${d.gender}" onclick="${!isStaff ? "showLock()" : "toggleGender(" + i + ")"}" title="${t('tt_toggle_gender')}">${d.gender}</div>`;
    const delEl = isStaff ? `<button class="rowdel" onclick="deleteStudent(${i})" title="${t('tt_delete_student')}">🗑</button>` : "";
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
    let row = `<td>${i + 1}</td><td class="name">${d.name ? escHtml(d.name) : '<i style=color:#bbb>—</i>'}</td><td class="gender ${d.gender}">${d.gender}</td>`;
    d.att.forEach((w, j) => {
      const s = w.s || "";
      const label = s === "" ? "·" : s === "P" ? "✓" : s === "AP" ? "A✓" : "A";   // AP = absent WITH permission
      const showReason = s === "A" || s === "AP";   // only absences carry a reason — present/blank stay a single quiet badge
      const reasonHtml = !showReason ? "" : !isStaff
        ? `<div class="reason" onclick="showLock()">${escHtml(w.r)}</div>`
        : `<div class="reason" contenteditable onblur="saveReason(${i},${j}, this.innerText)">${escHtml(w.r)}</div>`;
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
    w.innerHTML = `<div class="empty">${t('mem_empty_line1')}<br>${t('mem_empty_line2')}</div>`;
    return;
  }
  w.innerHTML = '<div class="gallery">' + all.map((m, i) => {
    const thumb = m.type === "video"
      ? `<div class="thumb"><video src="${m.src}" preload="metadata" muted></video><div class="play">▶</div></div>`
      : `<img src="${m.src}" alt="${m.cap || ""}" loading="lazy">`;
    const dl = `<a class="dl" href="javascript:void(0)" onclick="event.stopPropagation();saveMedia(${i})">⬇ ${t('common_save')}</a>`;
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
  if (!confirm(t("confirm_delete_student_prefix") + (d.name || "—") + t("confirm_delete_student_suffix"))) return;
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

const EYE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.28 20.28 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a20.28 20.28 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
function togglePwd(id, btn){
  const el = document.getElementById(id); if (!el) return;
  const toText = el.type === "password";
  el.type = toText ? "text" : "password";
  btn.innerHTML = toText ? EYE_OFF_ICON : EYE_ICON;
  btn.setAttribute("aria-label", toText ? "Hide password" : "Show password");
}
/* ---------- AUTH GATE: full-screen login blocking the whole app ---------- */
// No anonymous access at all: everything, including the permission-request
// form, requires a real signed-in account. See security-rls-setup.sql for
// the matching database-side lockdown (anon insert on "permissions" removed).

function showGate(){
  const g = document.getElementById("authGate"); if (!g) return;
  g.classList.remove("hide");
  document.getElementById("gateErr").style.display = "none";
  document.getElementById("gateUser").value = "";
  document.getElementById("gatePass").value = "";
  setTimeout(() => { const e=document.getElementById("gateUser"); if(e) e.focus(); }, 50);
}
function hideGate(){
  const g = document.getElementById("authGate"); if (g) g.classList.add("hide");
}
async function doGateLogin(){
  const username = (document.getElementById("gateUser").value || "").trim();
  const password = document.getElementById("gatePass").value || "";
  const err = document.getElementById("gateErr");
  if (!username || !password) { err.textContent = t("auth_err_missing"); err.style.display = "block"; return; }
  const { error } = await sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (error) { err.textContent = t("auth_err_invalid"); err.style.display = "block"; return; }
  // onAuthStateChange hides the gate and boots the app
}

/* ---------- ប្រកាសសុំច្បាប់ (permission letters) ---------- */
let PERMITS = [];
function escHtml(v){ return (v==null?"":String(v)).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

// Save the current form as a public submission. Returns true on success.
async function savePermit(silent){
  const d = collectPerm();
  if(!d.name || !d.name.trim()){
    window.msgTitle.textContent = t("msg_fill_name_title");
    window.msgText.textContent  = t("msg_fill_name_body");
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
    window.msgTitle.textContent = t("msg_saved_title");
    window.msgText.textContent  = t("msg_saved_body");
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
    const roleKh = d.role==="student" ? t("perm_role_student") : d.role==="staff" ? t("perm_role_staff") : t("perm_role_uni");
    const text =
      t("tg_notify_title") + "\n" +
      t("tg_name_label") + (d.name||"-") + " (" + roleKh + ")\n" +
      t("tg_reason_label") + (d.reason||"-") + "\n" +
      t("tg_from_label") + (d.from_date||"-") + " → " + (d.to_date||"-") + "\n" +
      t("tg_phone_label") + (d.phone||"-");
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

function renderPermits(){
  const w = document.getElementById("permitListWrap"); if(!w) return;
  if(!PERMITS.length){ w.innerHTML = `<div class="empty">${t('permit_list_empty')}</div>`; return; }
  w.innerHTML = PERMITS.map(p => {
    const roleKh = p.role==="student" ? t("perm_role_student") : p.role==="staff" ? t("perm_role_staff") : t("perm_role_uni");
    const when = p.created_at ? new Date(p.created_at).toLocaleString("en-GB") : "";
    const range = [p.from_date, p.to_date].filter(Boolean).join(" → ");
    const del = isStaff ? `<button class="btn b-clear" onclick="deletePermit('${p.id}')">${t('common_delete_btn')}</button>` : "";
    return `<div class="permit-card">
      <div class="pc-main">
        <div class="pc-name">${escHtml(p.name)||"—"} <span class="pc-role">(${roleKh})</span></div>
        <div class="pc-sub">${t('permit_reason_prefix')}${escHtml(p.reason)||"—"}${range?" · "+escHtml(range):""}</div>
        <div class="pc-date">${escHtml(when)}</div>
      </div>
      <div class="pc-act">
        <button class="btn b-png" onclick="viewPermit('${p.id}')">${t('permit_view_btn')}</button>
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
  if(!confirm(t("confirm_delete_permit"))) return;
  const { error } = await sb.from("permissions").delete().eq("id", id);
  if(error) toast(error.message);   // realtime refreshes the list
}

/* ---------- I18N: apply the saved (or default English) language ----------
   Placed here — after every `let`/`const` above it has already run — so
   applyLanguage()'s re-render calls (renderStudents/renderAtt/renderPermits/…)
   don't hit a temporal-dead-zone error on STUDENTS/PERMITS/CUR_MONTH/etc.
   This still executes synchronously, well before bootAfterAuth()'s first
   `await` resolves, so the very first authenticated render already uses
   the right language. */
(function initLang(){
  let saved = null;
  try{ saved = localStorage.getItem('ppnlsc-lang'); }catch(e){}
  applyLanguage(saved || 'en');
})();

/* ---------- REALTIME + BOOT ---------- */
let appBooted = false;   // true once protected data has been loaded for a signed-in session

// Editing now happens exclusively in admin.html (which checks
// app_metadata.role === "admin" itself, backed by the matching RLS
// policies in security-rls-setup.sql). This page is permanently
// view-only for every signed-in account, admin or not.
async function bootAfterAuth(session){
  if (appBooted) return;
  appBooted = true;
  isStaff = false;
  CUR_MONTH = curMonthStr();
  MONTH_FRIDAYS = fridaysOf(CUR_MONTH);
  hideGate();
  await loadMonths();
  await loadData();
  await loadMemories();
  await loadPermits();
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
  isStaff = false;
  showGate();
});

(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) { await bootAfterAuth(session); }
  else { showGate(); }   // no session: block the app, wait for gate login or guest permit link
})();
