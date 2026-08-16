import { useState, useEffect } from "react";
import {
  BookOpen, Calendar, Trophy, Users, TrendingUp, Flame, CheckCircle2,
  Award, Star, Plus, UserPlus, RefreshCw, ChevronRight, Sparkles, X,
  Languages, Trash2, LogOut, Mail, LayoutDashboard, Upload, FileText
} from "lucide-react";
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip
} from "recharts";
import mammoth from "mammoth";
import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------
   DESIGN TOKENS
--------------------------------------------------------- */
const C = {
  bg: "#FAF9F4", surface: "#FFFFFF", ink: "#1C231F", inkSoft: "#5B655F", inkFaint: "#8A9390",
  teal: "#124F49", tealDeep: "#0B3733", tealSoft: "#E4EEEC",
  gold: "#B9922E", goldSoft: "#F3E9CE",
  terracotta: "#AE5236", terracottaSoft: "#F3E1D8", border: "#E7E3D6",
};
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Karla:wght@400;500;600;700&display=swap');`;

/* ---------------------------------------------------------
   i18n
--------------------------------------------------------- */
const STR = {
  en: {
    appTitle: "Alirshaad Quran Center — Operations",
    appSubtitle: "Tracking · Revision · Engagement · Scheduling",
    tabProgress: "Progress", tabRevision: "Revision Queue", tabEngagement: "Engagement", tabAdmin: "Admin & Scaling",
    attendance: "Attendance", tajweedMistakes: "Tajweed mistakes / week", surahs: "Surahs", dueToday: "due today",
    markPresent: "Mark present", markAbsent: "Mark absent", weeklyParentSummary: "Weekly parent summary",
    weeklySummaryTitle: "Weekly summary —",
    copyNote: "Copy this into WhatsApp or email to send to the parent — no manual write-up needed each week.",
    revisionDueLine: (n) => `${n} revision${n === 1 ? "" : "s"} due today, generated automatically from each student's spaced-repetition schedule.`,
    nothingDue: "Nothing due today — everyone is caught up on revision.",
    wasDueOn: "was due", interval: "interval",
    recitedCorrectly: "Recited correctly", needsPractice: "Needs more practice",
    leaderboard: "Leaderboard", badgesEarned: "Badges earned", level: "Level", noBadges: "No badges yet — keep going!",
    weeklySchedule: "Weekly class schedule", addClass: "Add class", teacherLoad: "Teacher load", studentsWord: "students",
    loadNote: "When a teacher passes ~8–10 active students, that's your signal to open a new class or bring on another teacher.",
    referralsTitle: "Referrals & enrollment pipeline", familyName: "Family name", contact: "Contact", add: "Add",
    enrolled: "Enrolled", invited: "Invited",
    scalingLabel: "Scaling checklist:",
    scalingText: "once you're consistently above 90% attendance and a full revision queue each day, it's time to (1) add a class slot before any teacher exceeds ~10 students, (2) turn your top 2–3 badge-earners into referral ambassadors, and (3) start exporting this data weekly to spot which track needs another teacher first.",
    loading: "Loading center data…",
    manageStudents: "Students", addStudent: "Add student", studentName: "Student name", parentContact: "Parent contact",
    signOut: "Sign out", signIn: "Sign in to your center", emailPlaceholder: "you@center.org",
    sendLink: "Send magic link", checkEmail: "Check your email for a sign-in link.",
    signInHelp: "Staff sign in with a magic link — no password to remember.",
    tabDashboard: "Dashboard", tabImport: "Import Students",
    dashTotalStudents: "Total students", dashTotalTeachers: "Total teachers",
    dashAvgAttendance: "Avg. attendance", dashDueToday: "Revisions due today",
    dashReferrals: "Referral pipeline", dashTodaysClasses: "Today's classes",
    dashNoClasses: "No classes scheduled today.",
    importTitle: "Import students from Word",
    importDesc: "Upload a .docx file listing your students — a simple list of names, or a table with extra columns like track or parent contact. We'll read it and show you a preview before anything is added.",
    importChooseFile: "Choose Word file (.docx)", importParsing: "Reading document…",
    importPreviewTitle: "Review before importing",
    importPreviewNote: "Uncheck any row you don't want to import, or edit a name if needed. Pick the teacher to assign them to below.",
    importColName: "Name", importColContact: "Parent contact",
    importConfirm: "Import selected students", importCancel: "Cancel",
    importNoneFound: "No names found in this document. Make sure it has one name per line, or a table with a name column.",
    importSuccess: (n) => `${n} student${n === 1 ? "" : "s"} imported successfully.`,
    importSelectAll: "Select all", importAssignTeacher: "Assign to teacher",
  },
  ar: {
    appTitle: "مركز الإرشاد لتعليم القرآن — الإدارة",
    appSubtitle: "المتابعة · المراجعة · التحفيز · الجدولة",
    tabProgress: "التقدم", tabRevision: "قائمة المراجعة", tabEngagement: "التحفيز", tabAdmin: "الإدارة والتوسع",
    attendance: "الحضور", tajweedMistakes: "أخطاء التجويد / أسبوعياً", surahs: "السور", dueToday: "مستحقة اليوم",
    markPresent: "تسجيل حضور", markAbsent: "تسجيل غياب", weeklyParentSummary: "ملخص أسبوعي لولي الأمر",
    weeklySummaryTitle: "الملخص الأسبوعي —",
    copyNote: "انسخ هذا وأرسله عبر واتساب أو البريد الإلكتروني لولي الأمر — دون الحاجة لكتابته يدويًا كل أسبوع.",
    revisionDueLine: (n) => `${n} مراجعة مستحقة اليوم، يتم إنشاؤها تلقائيًا حسب جدول التكرار المتباعد لكل طالب.`,
    nothingDue: "لا توجد مراجعات مستحقة اليوم — الجميع منتظم في المراجعة.",
    wasDueOn: "كانت مستحقة في", interval: "الفاصل الزمني",
    recitedCorrectly: "تمت التلاوة بشكل صحيح", needsPractice: "بحاجة إلى مزيد من التدريب",
    leaderboard: "لوحة المتصدرين", badgesEarned: "الشارات المكتسبة", level: "المستوى", noBadges: "لا توجد شارات بعد — استمر!",
    weeklySchedule: "الجدول الأسبوعي للحصص", addClass: "إضافة حصة", teacherLoad: "عبء المعلمين", studentsWord: "طالب",
    loadNote: "عندما يتجاوز المعلم حوالي ٨-١٠ طلاب نشطين، فهذه إشارة لفتح فصل جديد أو ضم معلم آخر.",
    referralsTitle: "الإحالات وخط التسجيل", familyName: "اسم الأسرة", contact: "رقم التواصل", add: "إضافة",
    enrolled: "مسجَّل", invited: "مدعو",
    scalingLabel: "قائمة التوسع:",
    scalingText: "عندما تتجاوز نسبة الحضور ٩٠٪ باستمرار وتكون قائمة المراجعة مكتملة يوميًا، فقد حان الوقت لفتح فصل جديد، وتحويل أفضل الطلاب إلى سفراء للإحالة، وتصدير البيانات أسبوعيًا لمعرفة أي مسار يحتاج معلمًا إضافيًا.",
    loading: "جاري تحميل بيانات المركز…",
    manageStudents: "الطلاب", addStudent: "إضافة طالب", studentName: "اسم الطالب", parentContact: "تواصل ولي الأمر",
    signOut: "تسجيل الخروج", signIn: "تسجيل الدخول إلى المركز", emailPlaceholder: "you@center.org",
    sendLink: "إرسال رابط الدخول", checkEmail: "تحقق من بريدك الإلكتروني لرابط الدخول.",
    signInHelp: "يسجل الموظفون الدخول عبر رابط سحري — دون الحاجة لكلمة مرور.",
    tabDashboard: "لوحة المعلومات", tabImport: "استيراد الطلاب",
    dashTotalStudents: "إجمالي الطلاب", dashTotalTeachers: "إجمالي المعلمين",
    dashAvgAttendance: "متوسط الحضور", dashDueToday: "مراجعات مستحقة اليوم",
    dashReferrals: "خط الإحالات", dashTodaysClasses: "حصص اليوم",
    dashNoClasses: "لا توجد حصص مجدولة اليوم.",
    importTitle: "استيراد الطلاب من ملف وورد",
    importDesc: "ارفع ملف Word (.docx) يحتوي على أسماء الطلاب — قائمة بسيطة بالأسماء، أو جدول بأعمدة إضافية مثل المسار أو تواصل ولي الأمر. سنقرأ الملف ونعرض لك معاينة قبل إضافة أي شيء.",
    importChooseFile: "اختر ملف Word (.docx)", importParsing: "جاري قراءة الملف…",
    importPreviewTitle: "المراجعة قبل الاستيراد",
    importPreviewNote: "قم بإلغاء تحديد أي صف لا تريد استيراده، أو عدّل الاسم إذا لزم الأمر. اختر المعلم الذي سيُسند إليه الطلاب أدناه.",
    importColName: "الاسم", importColContact: "تواصل ولي الأمر",
    importConfirm: "استيراد الطلاب المحددين", importCancel: "إلغاء",
    importNoneFound: "لم يتم العثور على أسماء في هذا الملف. تأكد من وجود اسم واحد في كل سطر، أو جدول يحتوي على عمود للأسماء.",
    importSuccess: (n) => `تم استيراد ${n} ${n === 1 ? "طالب" : "طلاب"} بنجاح.`,
    importSelectAll: "تحديد الكل", importAssignTeacher: "إسناد إلى معلم",
  },
};

const DAY_TR = {
  Sunday: { en: "Sunday", ar: "الأحد" }, Monday: { en: "Monday", ar: "الإثنين" },
  Tuesday: { en: "Tuesday", ar: "الثلاثاء" }, Wednesday: { en: "Wednesday", ar: "الأربعاء" },
  Thursday: { en: "Thursday", ar: "الخميس" }, Friday: { en: "Friday", ar: "الجمعة" }, Saturday: { en: "Saturday", ar: "السبت" },
};
const TRACK_TR = { Hifz: { en: "Hifz", ar: "حفظ" }, Tajweed: { en: "Tajweed", ar: "تجويد" }, Qaida: { en: "Qaida", ar: "قاعدة" } };
const BADGE_TR = {
  streak7: { en: "7-Day Flame", ar: "سلسلة ٧ أيام" }, streak14: { en: "14-Day Flame", ar: "سلسلة ١٤ يوم" },
  xp500: { en: "500 XP Reciter", ar: "قارئ ٥٠٠ نقطة" }, surah3: { en: "3 Surahs Memorized", ar: "حفظ ٣ سور" },
  steady: { en: "Steady Attender", ar: "منتظم الحضور" },
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (dateStr, days) => { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
const isDue = (dateStr) => dateStr <= todayISO();
const fmt = (dateStr, lang) => new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-EG" : undefined, { month: "short", day: "numeric" });

const BADGE_DEFS = [
  { key: "streak7", test: (s) => s.streak >= 7, icon: Flame },
  { key: "streak14", test: (s) => s.streak >= 14, icon: Flame },
  { key: "xp500", test: (s) => s.xp >= 500, icon: Star },
  { key: "surah3", test: (s) => s.memorized.length >= 3, icon: BookOpen },
  { key: "steady", test: (s) => attendanceRate(s) >= 90, icon: CheckCircle2 },
];
function attendanceRate(s) {
  const total = s.attendanceLog.length;
  const present = s.attendanceLog.filter(Boolean).length;
  return total ? Math.round((present / total) * 100) : 0;
}
function dueCount(s) { return s.memorized.filter((m) => isDue(m.nextRevision)).length; }
function levelFromXP(xp) { return Math.floor(xp / 200) + 1; }

/* ---------------------------------------------------------
   DB <-> APP MAPPING
--------------------------------------------------------- */
const fromDbStudent = (r) => ({
  id: r.id, name: r.name, track: r.track, teacherId: r.teacher_id, parentContact: r.parent_contact,
  xp: r.xp, streak: r.streak, lastActive: r.last_active,
  attendanceLog: r.attendance_log || [], mistakesLog: r.mistakes_log || [], memorized: r.memorized || [],
});
const fromDbClass = (r) => ({ id: r.id, day: r.day, time: r.time, teacherId: r.teacher_id, track: r.track });

/* ---------------------------------------------------------
   AUTH GATE
--------------------------------------------------------- */
function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "Karla, sans-serif" }}>
        <style>{FONTS}</style>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 32, width: 340 }}>
          <div style={{ fontFamily: "Amiri, serif", fontSize: 21, fontWeight: 700, color: C.tealDeep, marginBottom: 4 }}>
            {STR.en.signIn}
          </div>
          <div style={{ fontSize: 12.5, color: C.inkFaint, marginBottom: 18 }}>{STR.en.signInHelp}</div>
          {sent ? (
            <div style={{ fontSize: 13.5, color: C.teal, display: "flex", gap: 8, alignItems: "center" }}>
              <Mail size={16} /> {STR.en.checkEmail}
            </div>
          ) : (
            <>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={STR.en.emailPlaceholder}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, marginBottom: 10 }}
              />
              <button
                onClick={async () => {
                  setErr("");
                  const { error } = await supabase.auth.signInWithOtp({ email });
                  if (error) setErr(error.message); else setSent(true);
                }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
              >
                {STR.en.sendLink}
              </button>
              {err && <div style={{ color: C.terracotta, fontSize: 12, marginTop: 8 }}>{err}</div>}
            </>
          )}
        </div>
      </div>
    );
  }

  return children(session);
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function App() {
  return <AuthGate>{(session) => <Dashboard session={session} />}</AuthGate>;
}

function Dashboard({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [openStudent, setOpenStudent] = useState(null);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState("en");

  const t = (key, ...args) => { const v = STR[lang][key]; return typeof v === "function" ? v(...args) : v; };
  const dir = lang === "ar" ? "rtl" : "ltr";
  const bodyFont = lang === "ar" ? "'Amiri', serif" : "'Karla', sans-serif";
  const headFont = "'Amiri', serif";

  async function loadAll() {
    setLoading(true);
    const [t1, s1, c1, r1] = await Promise.all([
      supabase.from("teachers").select("*").order("name"),
      supabase.from("students").select("*").order("name"),
      supabase.from("classes").select("*"),
      supabase.from("referrals").select("*"),
    ]);
    setData({
      teachers: t1.data || [],
      students: (s1.data || []).map(fromDbStudent),
      classes: (c1.data || []).map(fromDbClass),
      referrals: r1.data || [],
    });
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  function notify(msg) { setToast(msg); setTimeout(() => setToast(""), 2400); }

  async function markRevision(studentId, surahName, correct) {
    const s = data.students.find((x) => x.id === studentId);
    const memorized = s.memorized.map((m) => {
      if (m.surah !== surahName) return m;
      const interval = correct ? Math.min(m.interval * 2, 60) : 1;
      return { ...m, interval, nextRevision: addDays(todayISO(), interval) };
    });
    const xp = s.xp + (correct ? 15 : 5);
    const lastActive = s.lastActive === todayISO() ? s.lastActive : todayISO();
    const streak = s.lastActive === todayISO() ? s.streak : (s.lastActive === addDays(todayISO(), -1) ? s.streak + 1 : 1);

    setData((d) => ({ ...d, students: d.students.map((x) => x.id === studentId ? { ...x, memorized, xp, streak, lastActive } : x) }));
    await supabase.from("students").update({ memorized, xp, streak, last_active: lastActive }).eq("id", studentId);
    const m = memorized.find((x) => x.surah === surahName);
    notify(`${s.name}: ${surahName} → ${fmt(m.nextRevision, lang)}`);
  }

  async function markAttendance(studentId, present) {
    const s = data.students.find((x) => x.id === studentId);
    const attendanceLog = [...s.attendanceLog.slice(-7), present];
    const xp = present ? s.xp + 5 : s.xp;
    const lastActive = present ? todayISO() : s.lastActive;
    const streak = present ? (s.lastActive === todayISO() ? s.streak : (s.lastActive === addDays(todayISO(), -1) ? s.streak + 1 : 1)) : s.streak;

    setData((d) => ({ ...d, students: d.students.map((x) => x.id === studentId ? { ...x, attendanceLog, xp, streak, lastActive } : x) }));
    await supabase.from("students").update({ attendance_log: attendanceLog, xp, streak, last_active: lastActive }).eq("id", studentId);
    notify(t("markPresent") + (present ? " ✓" : "") + " — " + s.name);
  }

  async function addStudent(name, track, teacherId, parentContact) {
    const { data: row, error } = await supabase.from("students").insert({
      name, track, teacher_id: teacherId, parent_contact: parentContact,
    }).select().single();
    if (error) { notify(error.message); return; }
    setData((d) => ({ ...d, students: [...d.students, fromDbStudent(row)] }));
    notify(`${name} added`);
  }

  async function deleteStudent(id) {
    setData((d) => ({ ...d, students: d.students.filter((s) => s.id !== id) }));
    await supabase.from("students").delete().eq("id", id);
  }

  async function addStudentsBulk(rows) {
    const payload = rows.map((r) => ({
      name: r.name, track: r.track || "Hifz",
      teacher_id: r.teacherId || null, parent_contact: r.parentContact || "",
    }));
    const { data: inserted, error } = await supabase.from("students").insert(payload).select();
    if (error) { notify(error.message); return 0; }
    setData((d) => ({ ...d, students: [...d.students, ...inserted.map(fromDbStudent)] }));
    notify(t("importSuccess", inserted.length));
    return inserted.length;
  }

  async function addReferral(name, contact) {
    const { data: row, error } = await supabase.from("referrals").insert({ name, contact, status: "Invited" }).select().single();
    if (error) { notify(error.message); return; }
    setData((d) => ({ ...d, referrals: [...d.referrals, row] }));
  }
  async function toggleReferralStatus(id) {
    const r = data.referrals.find((x) => x.id === id);
    const status = r.status === "Invited" ? "Enrolled" : "Invited";
    setData((d) => ({ ...d, referrals: d.referrals.map((x) => x.id === id ? { ...x, status } : x) }));
    await supabase.from("referrals").update({ status }).eq("id", id);
  }
  async function deleteReferral(id) {
    setData((d) => ({ ...d, referrals: d.referrals.filter((x) => x.id !== id) }));
    await supabase.from("referrals").delete().eq("id", id);
  }

  async function addClass(cls) {
    const { data: row, error } = await supabase.from("classes").insert({
      day: cls.day, time: cls.time, teacher_id: cls.teacherId, track: cls.track,
    }).select().single();
    if (error) { notify(error.message); return; }
    setData((d) => ({ ...d, classes: [...d.classes, fromDbClass(row)] }));
  }
  async function deleteClass(id) {
    setData((d) => ({ ...d, classes: d.classes.filter((c) => c.id !== id) }));
    await supabase.from("classes").delete().eq("id", id);
  }

  if (loading || !data) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: C.inkSoft, fontFamily: "Karla, sans-serif" }}>{STR.en.loading}</div>;
  }

  return (
    <div dir={dir} style={{ background: C.bg, minHeight: "100vh", fontFamily: bodyFont, color: C.ink, padding: "24px 20px 60px" }}>
      <style>{FONTS}{`
        .star8 { transform-origin: center; }
        .tab-btn { transition: all .15s ease; }
        .card-hover { transition: box-shadow .15s ease, transform .15s ease; }
        .card-hover:hover { box-shadow: 0 4px 18px rgba(18,79,73,0.10); transform: translateY(-1px); }
      `}</style>

      <Header lang={lang} setLang={setLang} t={t} headFont={headFont} session={session} />
      <TabNav tab={tab} setTab={setTab} t={t} />

      <div style={{ maxWidth: 1080, margin: "24px auto 0" }}>
        {tab === "dashboard" && <DashboardHomeTab data={data} t={t} lang={lang} headFont={headFont} />}
        {tab === "progress" && <ProgressTab data={data} onOpen={setOpenStudent} onAttendance={markAttendance} t={t} lang={lang} headFont={headFont} />}
        {tab === "revision" && <RevisionTab data={data} onMark={markRevision} t={t} lang={lang} />}
        {tab === "engagement" && <EngagementTab data={data} t={t} lang={lang} headFont={headFont} />}
        {tab === "import" && <ImportStudentsTab data={data} t={t} lang={lang} onImportStudents={addStudentsBulk} />}
        {tab === "admin" && (
          <AdminTab
            data={data} t={t} lang={lang}
            onAddReferral={addReferral} onToggleReferral={toggleReferralStatus} onDeleteReferral={deleteReferral}
            onAddClass={addClass} onDeleteClass={deleteClass}
            onAddStudent={addStudent} onDeleteStudent={deleteStudent}
          />
        )}
      </div>

      {openStudent && (
        <StudentModal student={data.students.find((s) => s.id === openStudent)} onClose={() => setOpenStudent(null)} t={t} lang={lang} headFont={headFont} />
      )}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.tealDeep, color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13.5, boxShadow: "0 6px 20px rgba(0,0,0,0.2)", zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function Star8({ size = 18, color = C.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="star8">
      <path fill={color} d="M20 0 L23.5 13.2 L36.2 6.8 L26.8 16.8 L40 20 L26.8 23.2 L36.2 33.2 L23.5 26.8 L20 40 L16.5 26.8 L3.8 33.2 L13.2 23.2 L0 20 L13.2 16.8 L3.8 6.8 L16.5 13.2 Z" />
    </svg>
  );
}

function Header({ lang, setLang, t, headFont, session }) {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Star8 size={30} color={C.teal} />
        <div>
          <div style={{ fontFamily: headFont, fontSize: 24, fontWeight: 700, color: C.tealDeep, lineHeight: 1.2 }}>{t("appTitle")}</div>
          <div style={{ fontSize: 13, color: C.inkFaint }}>{t("appSubtitle")}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 3 }}>
          <Languages size={14} color={C.inkFaint} style={{ marginInlineStart: 8 }} />
          {["en", "ar"].map((code) => (
            <button key={code} onClick={() => setLang(code)} style={{
              fontSize: 12.5, fontWeight: 700, padding: "6px 12px", borderRadius: 16, border: "none", cursor: "pointer",
              background: lang === code ? C.teal : "transparent", color: lang === code ? "#fff" : C.inkFaint,
              fontFamily: code === "ar" ? "'Amiri', serif" : "'Karla', sans-serif",
            }}>
              {code === "en" ? "English" : "العربية"}
            </button>
          ))}
        </div>
        <button onClick={() => supabase.auth.signOut()} title={t("signOut")} style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, padding: "8px 12px",
          borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface, color: C.inkFaint, cursor: "pointer",
        }}>
          <LogOut size={13} /> {t("signOut")}
        </button>
      </div>
    </div>
  );
}

function TabNav({ tab, setTab, t }) {
  const tabs = [
    { id: "dashboard", label: t("tabDashboard"), icon: LayoutDashboard },
    { id: "progress", label: t("tabProgress"), icon: TrendingUp },
    { id: "revision", label: t("tabRevision"), icon: RefreshCw },
    { id: "engagement", label: t("tabEngagement"), icon: Trophy },
    { id: "import", label: t("tabImport"), icon: Upload },
    { id: "admin", label: t("tabAdmin"), icon: Users },
  ];
  return (
    <div style={{ maxWidth: 1080, margin: "20px auto 0", display: "flex", gap: 6, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
      {tabs.map((tb) => {
        const active = tab === tb.id; const Icon = tb.icon;
        return (
          <button key={tb.id} className="tab-btn" onClick={() => setTab(tb.id)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13.5, fontWeight: 600, color: active ? C.tealDeep : C.inkFaint,
            borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent", marginBottom: -1,
          }}>
            <Icon size={15} /> {tb.label}
          </button>
        );
      })}
    </div>
  );
}

function ProgressTab({ data, onOpen, onAttendance, t, lang, headFont }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {data.students.length === 0 && <EmptyNote text="No students yet — add your first one from the Admin tab." />}
      {data.students.map((s) => {
        const rate = attendanceRate(s);
        const teacher = data.teachers.find((tc) => tc.id === s.teacherId)?.name;
        return (
          <div key={s.id} className="card-hover" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: headFont, fontSize: 18, fontWeight: 700, color: C.tealDeep }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: C.inkFaint, marginTop: 2 }}>{TRACK_TR[s.track]?.[lang] || s.track} · {teacher || "—"}</div>
              <button onClick={() => onOpen(s.id)} style={{ marginTop: 8, fontSize: 12, color: C.teal, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, padding: 0, fontWeight: 600 }}>
                {t("weeklyParentSummary")} <ChevronRight size={13} style={lang === "ar" ? { transform: "rotate(180deg)" } : {}} />
              </button>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: C.inkFaint, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{t("attendance")} ({rate}%)</div>
              <AttendanceDots log={s.attendanceLog} />
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <button onClick={() => onAttendance(s.id, true)} style={pillBtn(C.tealSoft, C.tealDeep)}>{t("markPresent")}</button>
                <button onClick={() => onAttendance(s.id, false)} style={pillBtn(C.terracottaSoft, C.terracotta)}>{t("markAbsent")}</button>
              </div>
            </div>
            <div style={{ height: 64 }}>
              <div style={{ fontSize: 11.5, color: C.inkFaint, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{t("tajweedMistakes")}</div>
              <ResponsiveContainer width="100%" height={48}>
                <BarChart data={s.mistakesLog}>
                  <Bar dataKey="count" fill={C.terracotta} radius={[3, 3, 0, 0]} />
                  <XAxis dataKey="week" hide />
                  <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: lang === "ar" ? "left" : "right" }}>
              <div style={{ fontSize: 11.5, color: C.inkFaint, fontWeight: 600, textTransform: "uppercase" }}>{t("surahs")}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.tealDeep, fontFamily: headFont }}>{s.memorized.length}</div>
              {dueCount(s) > 0 && <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginTop: 2 }}>{dueCount(s)} {t("dueToday")}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyNote({ text }) {
  return <div style={{ padding: 30, textAlign: "center", color: C.inkFaint, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>{text}</div>;
}

function AttendanceDots({ log }) {
  return <div style={{ display: "flex", gap: 3 }}>{log.map((p, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: p ? C.teal : C.terracottaSoft, border: p ? "none" : `1px solid ${C.terracotta}` }} />)}</div>;
}
function pillBtn(bg, color) { return { fontSize: 11, padding: "5px 9px", borderRadius: 20, border: "none", background: bg, color, fontWeight: 600, cursor: "pointer" }; }

function StudentModal({ student: s, onClose, t, lang, headFont }) {
  const rate = attendanceRate(s);
  const summary = lang === "ar"
    ? `السلام عليكم! التحديث الأسبوعي لـ ${s.name}:\n• الحضور: ${rate}٪ هذا الأسبوع\n• عدد السور المحفوظة: ${s.memorized.length}\n• التتابع الحالي: ${s.streak} يوم\n• المراجعات المستحقة اليوم: ${dueCount(s)} سورة\nتشجيع الطفل في المنزل يصنع فرقًا كبيرًا. جزاكم الله خيرًا.`
    : `Assalamu alaikum! Weekly update for ${s.name}:\n• Attendance: ${rate}% this week\n• Surahs in memorization bank: ${s.memorized.length}\n• Current streak: ${s.streak} day(s)\n• Revision due today: ${dueCount(s)} surah(s)\nKeep up the encouragement at home. JazakAllahu khairan.`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,55,51,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }} onClick={onClose}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, padding: 24, maxWidth: 460, width: "100%", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: headFont, fontSize: 19, fontWeight: 700, color: C.tealDeep }}>{t("weeklySummaryTitle")} {s.name}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkFaint }}><X size={18} /></button>
        </div>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: lang === "ar" ? "'Amiri', serif" : "Karla, sans-serif", fontSize: 13, color: C.ink, background: C.bg, padding: 14, borderRadius: 8, marginTop: 14, lineHeight: 1.8, border: `1px solid ${C.border}`, textAlign: lang === "ar" ? "right" : "left" }}>
          {summary}
        </pre>
        <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 10 }}>{t("copyNote")}</div>
      </div>
    </div>
  );
}

function RevisionTab({ data, onMark, t, lang }) {
  const rows = [];
  data.students.forEach((s) => { s.memorized.forEach((m) => { if (isDue(m.nextRevision)) rows.push({ student: s, surah: m.surah, interval: m.interval, nextRevision: m.nextRevision }); }); });
  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 13.5, color: C.inkSoft }}>{t("revisionDueLine", rows.length)}</div>
      {rows.length === 0 && <EmptyNote text={t("nothingDue")} />}
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r, i) => (
          <div key={i} className="card-hover" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BookOpen size={16} color={C.teal} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: C.tealDeep }}>{r.surah}</div>
                <div style={{ fontSize: 12, color: C.inkFaint }}>{r.student.name} · {t("wasDueOn")} {fmt(r.nextRevision, lang)} · {t("interval")} {r.interval}d</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onMark(r.student.id, r.surah, true)} style={pillBtn(C.tealSoft, C.tealDeep)}>{t("recitedCorrectly")}</button>
              <button onClick={() => onMark(r.student.id, r.surah, false)} style={pillBtn(C.terracottaSoft, C.terracotta)}>{t("needsPractice")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementTab({ data, t, lang, headFont }) {
  const ranked = [...data.students].sort((a, b) => b.xp - a.xp);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
      <div>
        <SectionLabel icon={Trophy}>{t("leaderboard")}</SectionLabel>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {ranked.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < ranked.length - 1 ? `1px solid ${C.border}` : "none", background: i === 0 ? C.goldSoft : "transparent" }}>
              <div style={{ width: 22, textAlign: "center", fontWeight: 700, color: i === 0 ? C.gold : C.inkFaint, fontFamily: headFont, fontSize: 16 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: C.inkFaint }}>{t("level")} {levelFromXP(s.xp)} · {s.xp} XP</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: s.streak > 0 ? C.terracotta : C.inkFaint, fontWeight: 700, fontSize: 13 }}>
                <Flame size={14} /> {s.streak}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel icon={Award}>{t("badgesEarned")}</SectionLabel>
        <div style={{ display: "grid", gap: 10 }}>
          {data.students.map((s) => {
            const earned = BADGE_DEFS.filter((b) => b.test(s));
            return (
              <div key={s.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: C.tealDeep, marginBottom: 8 }}>{s.name}</div>
                {earned.length === 0 ? <div style={{ fontSize: 12, color: C.inkFaint }}>{t("noBadges")}</div> : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {earned.map((b) => {
                      const Icon = b.icon;
                      return <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, background: C.tealSoft, color: C.tealDeep, padding: "5px 10px", borderRadius: 20 }}><Icon size={12} /> {BADGE_TR[b.key][lang]}</div>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardHomeTab({ data, t, lang, headFont }) {
  const totalStudents = data.students.length;
  const totalTeachers = data.teachers.length;
  const avgAttendance = totalStudents
    ? Math.round(data.students.reduce((sum, s) => sum + attendanceRate(s), 0) / totalStudents)
    : 0;
  const dueTodayTotal = data.students.reduce((sum, s) => sum + dueCount(s), 0);
  const enrolledCount = data.referrals.filter((r) => r.status === "Enrolled").length;
  const invitedCount = data.referrals.length - enrolledCount;

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = data.classes.filter((c) => c.day === todayName);

  const cards = [
    { label: t("dashTotalStudents"), value: totalStudents, icon: Users },
    { label: t("dashTotalTeachers"), value: totalTeachers, icon: UserPlus },
    { label: t("dashAvgAttendance"), value: `${avgAttendance}%`, icon: CheckCircle2 },
    { label: t("dashDueToday"), value: dueTodayTotal, icon: RefreshCw },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card-hover" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={C.teal} />
                </div>
                <div style={{ fontSize: 11.5, color: C.inkFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{c.label}</div>
              </div>
              <div style={{ fontFamily: headFont, fontSize: 26, fontWeight: 700, color: C.tealDeep }}>{c.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionLabel icon={Calendar}>{t("dashTodaysClasses")}</SectionLabel>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            {todaysClasses.length === 0 && <div style={{ padding: 16, fontSize: 12.5, color: C.inkFaint }}>{t("dashNoClasses")}</div>}
            {todaysClasses.map((c, i) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", fontSize: 13, borderBottom: i < todaysClasses.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontWeight: 600 }}>{c.time}</span>
                <span style={{ color: C.inkFaint }}>{data.teachers.find((tc) => tc.id === c.teacherId)?.name}</span>
                <span style={{ color: C.gold, fontWeight: 600 }}>{TRACK_TR[c.track]?.[lang] || c.track}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel icon={UserPlus}>{t("dashReferrals")}</SectionLabel>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: "flex", gap: 28 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.tealDeep, fontFamily: headFont }}>{enrolledCount}</div>
              <div style={{ fontSize: 11.5, color: C.inkFaint }}>{t("enrolled")}</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.gold, fontFamily: headFont }}>{invitedCount}</div>
              <div style={{ fontSize: 11.5, color: C.inkFaint }}>{t("invited")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   IMPORT STUDENTS FROM WORD (.docx)
--------------------------------------------------------- */
function normalizeTrack(val) {
  if (!val) return "Hifz";
  const v = String(val).toLowerCase();
  if (v.includes("tajweed") || v.includes("تجويد")) return "Tajweed";
  if (v.includes("qaida") || v.includes("قاعدة")) return "Qaida";
  return "Hifz";
}

async function parseDocxFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const doc = new DOMParser().parseFromString(result.value, "text/html");

  const table = doc.querySelector("table");
  if (table) {
    const trs = Array.from(table.querySelectorAll("tr"));
    if (trs.length === 0) return [];
    const headerCells = Array.from(trs[0].querySelectorAll("th,td")).map((c) => c.textContent.trim().toLowerCase());
    const nameIdx = headerCells.findIndex((h) => /name|اسم/.test(h));
    const trackIdx = headerCells.findIndex((h) => /track|level|مسار/.test(h));
    const contactIdx = headerCells.findIndex((h) => /contact|phone|parent|تواصل|هاتف/.test(h));
    const hasHeader = nameIdx !== -1 || trackIdx !== -1 || contactIdx !== -1;
    const dataRows = hasHeader ? trs.slice(1) : trs;
    return dataRows
      .map((tr) => {
        const cells = Array.from(tr.querySelectorAll("td,th")).map((c) => c.textContent.trim());
        const name = hasHeader && nameIdx !== -1 ? cells[nameIdx] : cells[0];
        const track = hasHeader && trackIdx !== -1 ? cells[trackIdx] : cells[1];
        const contact = hasHeader && contactIdx !== -1 ? cells[contactIdx] : cells[2];
        return { name: (name || "").trim(), track: normalizeTrack(track), contact: (contact || "").trim() };
      })
      .filter((r) => r.name);
  }

  const lines = Array.from(doc.querySelectorAll("p, li")).map((el) => el.textContent.trim()).filter(Boolean);
  return lines
    .map((line) => {
      const parts = line.split(/\t|,|\s{2,}|\s-\s|\|/).map((p) => p.trim()).filter(Boolean);
      return { name: parts[0] || "", track: normalizeTrack(parts[1]), contact: parts[2] || "" };
    })
    .filter((r) => r.name);
}

function ImportStudentsTab({ data, t, lang, onImportStudents }) {
  const [parsing, setParsing] = useState(false);
  const [rows, setRows] = useState(null);
  const [importing, setImporting] = useState(false);
  const [assignTeacher, setAssignTeacher] = useState(data.teachers[0]?.id || "");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setRows(null);
    try {
      const parsed = await parseDocxFile(file);
      setRows(parsed.map((r) => ({ ...r, include: true })));
    } catch (err) {
      setRows([]);
    }
    setParsing(false);
    e.target.value = "";
  }

  function updateRow(i, field, value) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  async function confirmImport() {
    const selected = rows.filter((r) => r.include && r.name.trim());
    if (selected.length === 0) return;
    setImporting(true);
    await onImportStudents(
      selected.map((r) => ({ name: r.name.trim(), track: r.track || "Hifz", teacherId: assignTeacher, parentContact: r.contact || "" }))
    );
    setImporting(false);
    setRows(null);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <SectionLabel icon={Upload}>{t("importTitle")}</SectionLabel>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 12, lineHeight: 1.6, maxWidth: 620 }}>{t("importDesc")}</div>
        <label style={{ ...addBtn, display: "inline-flex", cursor: "pointer" }}>
          <FileText size={13} /> {t("importChooseFile")}
          <input type="file" accept=".docx" onChange={handleFile} style={{ display: "none" }} />
        </label>
        {parsing && <div style={{ marginTop: 10, fontSize: 12.5, color: C.inkFaint }}>{t("importParsing")}</div>}
      </div>

      {rows !== null && (
        <div>
          <SectionLabel icon={Users}>{t("importPreviewTitle")}</SectionLabel>
          {rows.length === 0 ? (
            <EmptyNote text={t("importNoneFound")} />
          ) : (
            <>
              <div style={{ fontSize: 11.5, color: C.inkFaint, marginBottom: 10 }}>{t("importPreviewNote")}</div>
              <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={rows.every((r) => r.include)}
                    onChange={(e) => setRows((rs) => rs.map((r) => ({ ...r, include: e.target.checked })))}
                  />
                  {t("importSelectAll")}
                </label>
                <span style={{ fontSize: 12.5, color: C.inkFaint }}>{t("importAssignTeacher")}:</span>
                <select value={assignTeacher} onChange={(e) => setAssignTeacher(e.target.value)} style={selectStyle}>
                  {data.teachers.map((tc) => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
                </select>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1.4fr 1fr 1.2fr", gap: 10, alignItems: "center", padding: "8px 14px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <input type="checkbox" checked={r.include} onChange={(e) => updateRow(i, "include", e.target.checked)} />
                    <input value={r.name} onChange={(e) => updateRow(i, "name", e.target.value)} style={inputStyle} placeholder={t("importColName")} />
                    <select value={r.track} onChange={(e) => updateRow(i, "track", e.target.value)} style={selectStyle}>
                      {Object.keys(TRACK_TR).map((tr) => <option key={tr} value={tr}>{TRACK_TR[tr][lang]}</option>)}
                    </select>
                    <input value={r.contact} onChange={(e) => updateRow(i, "contact", e.target.value)} style={inputStyle} placeholder={t("importColContact")} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button onClick={confirmImport} disabled={importing} style={addBtn}>
                  <Plus size={13} /> {importing ? "…" : t("importConfirm")}
                </button>
                <button onClick={() => setRows(null)} style={{ ...addBtn, background: C.surface, color: C.inkFaint, border: `1px solid ${C.border}` }}>
                  {t("importCancel")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 12.5, fontWeight: 700, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.5 }}><Icon size={14} /> {children}</div>;
}

function AdminTab({ data, t, lang, onAddReferral, onToggleReferral, onDeleteReferral, onAddClass, onDeleteClass, onAddStudent, onDeleteStudent }) {
  const [refName, setRefName] = useState("");
  const [refContact, setRefContact] = useState("");
  const [clsDay, setClsDay] = useState("Sunday");
  const [clsTime, setClsTime] = useState("5:00 PM");
  const [clsTeacher, setClsTeacher] = useState(data.teachers[0]?.id || "");
  const [clsTrack, setClsTrack] = useState("Hifz");
  const [stuName, setStuName] = useState("");
  const [stuTrack, setStuTrack] = useState("Hifz");
  const [stuTeacher, setStuTeacher] = useState(data.teachers[0]?.id || "");
  const [stuContact, setStuContact] = useState("");

  const loadByTeacher = data.teachers.map((tc) => ({ ...tc, count: data.students.filter((s) => s.teacherId === tc.id).length }));

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <SectionLabel icon={UserPlus}>{t("manageStudents")}</SectionLabel>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {data.students.map((s, i) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", fontSize: 13, borderBottom: i < data.students.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div><span style={{ fontWeight: 600 }}>{s.name}</span> <span style={{ color: C.inkFaint }}>· {TRACK_TR[s.track]?.[lang] || s.track}</span></div>
              <button onClick={() => onDeleteStudent(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkFaint }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={stuName} onChange={(e) => setStuName(e.target.value)} placeholder={t("studentName")} style={inputStyle} />
          <select value={stuTrack} onChange={(e) => setStuTrack(e.target.value)} style={selectStyle}>
            {Object.keys(TRACK_TR).map((tr) => <option key={tr} value={tr}>{TRACK_TR[tr][lang]}</option>)}
          </select>
          <select value={stuTeacher} onChange={(e) => setStuTeacher(e.target.value)} style={selectStyle}>
            {data.teachers.map((tc) => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
          </select>
          <input value={stuContact} onChange={(e) => setStuContact(e.target.value)} placeholder={t("parentContact")} style={inputStyle} />
          <button onClick={() => { if (stuName) { onAddStudent(stuName, stuTrack, stuTeacher, stuContact); setStuName(""); setStuContact(""); } }} style={addBtn}><Plus size={13} /> {t("addStudent")}</button>
        </div>
      </div>

      <div>
        <SectionLabel icon={Calendar}>{t("weeklySchedule")}</SectionLabel>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {data.classes.map((c, i) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr 1fr auto", padding: "12px 16px", fontSize: 13, alignItems: "center", borderBottom: i < data.classes.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontWeight: 700, color: C.tealDeep }}>{DAY_TR[c.day]?.[lang] || c.day}</div>
              <div style={{ color: C.inkSoft }}>{c.time}</div>
              <div style={{ color: C.inkSoft }}>{data.teachers.find((tc) => tc.id === c.teacherId)?.name}</div>
              <div style={{ color: C.gold, fontWeight: 600 }}>{TRACK_TR[c.track]?.[lang] || c.track}</div>
              <button onClick={() => onDeleteClass(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkFaint, justifySelf: "end" }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={clsDay} onChange={(e) => setClsDay(e.target.value)} style={selectStyle}>
            {Object.keys(DAY_TR).map((d) => <option key={d} value={d}>{DAY_TR[d][lang]}</option>)}
          </select>
          <input value={clsTime} onChange={(e) => setClsTime(e.target.value)} placeholder="5:00 PM" style={inputStyle} />
          <select value={clsTeacher} onChange={(e) => setClsTeacher(e.target.value)} style={selectStyle}>
            {data.teachers.map((tc) => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
          </select>
          <select value={clsTrack} onChange={(e) => setClsTrack(e.target.value)} style={selectStyle}>
            {Object.keys(TRACK_TR).map((tr) => <option key={tr} value={tr}>{TRACK_TR[tr][lang]}</option>)}
          </select>
          <button onClick={() => onAddClass({ day: clsDay, time: clsTime, teacherId: clsTeacher, track: clsTrack })} style={addBtn}><Plus size={13} /> {t("addClass")}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionLabel icon={Users}>{t("teacherLoad")}</SectionLabel>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
            {loadByTeacher.map((tc) => (
              <div key={tc.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: C.ink }}>{tc.name}</span>
                <span style={{ color: tc.count > 8 ? C.terracotta : C.inkSoft, fontWeight: 700 }}>{tc.count} {t("studentsWord")}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 6 }}>{t("loadNote")}</div>
        </div>

        <div>
          <SectionLabel icon={UserPlus}>{t("referralsTitle")}</SectionLabel>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            {data.referrals.map((r, i) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", fontSize: 13, borderBottom: i < data.referrals.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.inkFaint }}>{r.contact}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onToggleReferral(r.id)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: r.status === "Enrolled" ? C.tealSoft : C.goldSoft, color: r.status === "Enrolled" ? C.tealDeep : C.gold }}>
                    {r.status === "Enrolled" ? t("enrolled") : t("invited")}
                  </button>
                  <button onClick={() => onDeleteReferral(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkFaint }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <input value={refName} onChange={(e) => setRefName(e.target.value)} placeholder={t("familyName")} style={{ ...inputStyle, flex: 1 }} />
            <input value={refContact} onChange={(e) => setRefContact(e.target.value)} placeholder={t("contact")} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { if (refName) { onAddReferral(refName, refContact); setRefName(""); setRefContact(""); } }} style={addBtn}><Plus size={13} /> {t("add")}</button>
          </div>
        </div>
      </div>

      <div style={{ background: C.tealSoft, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Sparkles size={16} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, color: C.tealDeep, lineHeight: 1.7 }}><strong>{t("scalingLabel")}</strong> {t("scalingText")}</div>
      </div>
    </div>
  );
}

const inputStyle = { fontSize: 12.5, padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontFamily: "inherit", outline: "none" };
const selectStyle = { ...inputStyle };
const addBtn = { display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, padding: "7px 12px", borderRadius: 6, border: "none", background: C.teal, color: "#fff", cursor: "pointer" };
