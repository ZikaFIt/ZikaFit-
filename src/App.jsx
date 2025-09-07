import React, { useMemo, useState, useEffect } from "react";
// NOTE: This is a single-file React prototype for the "Dpapa" fitness coaching app.
// It focuses on the UX "shape" (screens, flows, and styling) so we can iterate
// quickly with you. All data is kept in-memory/localStorage for demo purposes.
// TailwindCSS is required. Libraries used: lucide-react (icons), framer-motion (animations), recharts (charts)

import { Dumbbell, Utensils, LineChart as LineChartIcon, MessageCircle, Settings as SettingsIcon, LogIn, UserPlus, Target, Ruler, Weight, Flame, NotebookPen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function DpapaApp() {
  /* -------------------------- Language / Direction -------------------------- */
  const [lang, setLang] = useState("ar");
  const t = useMemo(() => (lang === "ar" ? i18n.ar : i18n.en), [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  /* --------------------------------- Auth ---------------------------------- */
  const [route, setRoute] = useState("auth");
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("dpapa_profile");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("dpapa_profile", JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    // If profile minimally complete, land on dashboard on reload
    if (profile?.onboarded) setRoute("dashboard");
  }, []);

  /* ---------------------------- The Main Layout ----------------------------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100" dir={dir}>
      <TopBar
        t={t}
        lang={lang}
        onToggleLang={() => setLang((p) => (p === "ar" ? "en" : "ar"))}
        profile={profile}
      />

      <div className="mx-auto max-w-7xl px-3 md:px-6 py-6 grid grid-cols-12 gap-4">
        {route !== "auth" && (
          <Sidebar
            t={t}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            route={route}
            setRoute={setRoute}
          />
        )}

        <main className={route !== "auth" ? "col-span-12 md:col-span-9 lg:col-span-10" : "col-span-12"}>
          <AnimatePresence mode="wait">
            {route === "auth" && (
              <PageWrapper key="auth">
                <AuthView t={t} onSuccess={() => setRoute("onboarding")} />
              </PageWrapper>
            )}

            {route === "onboarding" && (
              <PageWrapper key="onboarding">
                <OnboardingWizard
                  t={t}
                  lang={lang}
                  onComplete={(data) => {
                    setProfile({ ...profile, ...data, onboarded: true });
                    setRoute("dashboard");
                  }}
                />
              </PageWrapper>
            )}

            {route === "dashboard" && (
              <PageWrapper key="dashboard">
                <Dashboard t={t} profile={profile} />
              </PageWrapper>
            )}

            {route === "workouts" && (
              <PageWrapper key="workouts">
                <Workouts t={t} profile={profile} />
              </PageWrapper>
            )}

            {route === "nutrition" && (
              <PageWrapper key="nutrition">
                <Nutrition t={t} profile={profile} />
              </PageWrapper>
            )}

            {route === "progress" && (
              <PageWrapper key="progress">
                <Progress t={t} profile={profile} />
              </PageWrapper>
            )}

            {route === "messages" && (
              <PageWrapper key="messages">
                <Messages t={t} />
              </PageWrapper>
            )}

            {route === "settings" && (
              <PageWrapper key="settings">
                <Settings t={t} lang={lang} setLang={setLang} profile={profile} setProfile={setProfile} />
              </PageWrapper>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   TopBar                                   */
/* -------------------------------------------------------------------------- */
function TopBar({ t, lang, onToggleLang, profile }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-lg shadow-fuchsia-500/20 grid place-items-center font-black">D</div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight text-xl">Dpapa</div>
            <div className="text-xs text-slate-400">{t.tagline}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 text-sm rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">{t.coach}</div>
              <div className="font-semibold">{profile?.name || t.yourCoach}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500" />
          </div>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Sidebar                                   */
/* -------------------------------------------------------------------------- */
function Sidebar({ t, sidebarOpen, setSidebarOpen, route, setRoute }) {
  const items = [
    { key: "dashboard", label: t.nav.dashboard, icon: <Dumbbell size={18} /> },
    { key: "workouts", label: t.nav.workouts, icon: <NotebookPen size={18} /> },
    { key: "nutrition", label: t.nav.nutrition, icon: <Utensils size={18} /> },
    { key: "progress", label: t.nav.progress, icon: <LineChartIcon size={18} /> },
    { key: "messages", label: t.nav.messages, icon: <MessageCircle size={18} /> },
    { key: "settings", label: t.nav.settings, icon: <SettingsIcon size={18} /> },
  ];

  return (
    <aside className="col-span-12 md:col-span-3 lg:col-span-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-2 sticky top-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full mb-2 text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
        >
          {sidebarOpen ? t.hideMenu : t.showMenu}
        </button>

        <nav className={`grid gap-1 transition-all ${sidebarOpen ? "opacity-100" : "opacity-80"}`}>
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setRoute(it.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/10 border border-transparent hover:border-white/10 text-left ${
                route === it.key ? "bg-white/10 border-white/10" : ""
              }`}
            >
              <span className="grid place-items-center h-6 w-6 rounded-lg bg-white/10">{it.icon}</span>
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Wrapper                                   */
/* -------------------------------------------------------------------------- */
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-xl shadow-black/20"
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Auth                                     */
/* -------------------------------------------------------------------------- */
function AuthView({ t, onSuccess }) {
  const [tab, setTab] = useState("login");

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.welcome}</h1>
        <p className="text-slate-400 mt-1">{t.welcomeSub}</p>
      </div>

      <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <button
          className={`py-2 text-sm ${tab === "login" ? "bg-white/10 font-semibold" : "hover:bg-white/5"}`}
          onClick={() => setTab("login")}
        >
          <div className="inline-flex items-center gap-2"><LogIn size={16} /> {t.login}</div>
        </button>
        <button
          className={`py-2 text-sm ${tab === "register" ? "bg-white/10 font-semibold" : "hover:bg-white/5"}`}
          onClick={() => setTab("register")}
        >
          <div className="inline-flex items-center gap-2"><UserPlus size={16} /> {t.register}</div>
        </button>
      </div>

      <div className="mt-4">
        {tab === "login" ? (
          <AuthForm t={t} mode="login" onSuccess={onSuccess} />
        ) : (
          <AuthForm t={t} mode="register" onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}

function AuthForm({ t, mode, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          onSuccess();
        }, 600);
      }}
    >
      <div>
        <label className="text-sm text-slate-300">{t.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-fuchsia-500/40"
        />
      </div>
      <div>
        <label className="text-sm text-slate-300">{t.password}</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-fuchsia-500/40"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold hover:opacity-95 disabled:opacity-70"
      >
        {loading ? t.loading : mode === "login" ? t.login : t.createAccount}
      </button>
      <p className="text-xs text-slate-400 text-center">{t.consent}</p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Onboarding Wizard                              */
/* -------------------------------------------------------------------------- */
function OnboardingWizard({ t, lang, onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    goal: "fat_loss",
    activity: "moderate",
    targetWeight: "",
    deadline: "",
    injuries: "",
  });

  const bmi = useMemo(() => {
    const h = parseFloat(data.height) / 100;
    const w = parseFloat(data.weight);
    if (!h || !w) return "-";
    return (w / (h * h)).toFixed(1);
  }, [data.height, data.weight]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight">{t.onboard.title}</h2>
        <p className="text-slate-400">{t.onboard.subtitle}</p>
      </div>

      <Steps step={step} labels={[t.onboard.s1, t.onboard.s2, t.onboard.s3, t.onboard.s4]} />

      <div className="mt-6 grid gap-4">
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label={t.name} value={data.name} onChange={(v) => setData({ ...data, name: v })} />
            <TextField label={t.age} value={data.age} onChange={(v) => setData({ ...data, age: v })} type="number" />
            <SelectField
              label={t.gender}
              value={data.gender}
              onChange={(v) => setData({ ...data, gender: v })}
              options={[
                { value: "male", label: t.male },
                { value: "female", label: t.female },
              ]}
            />
            <SelectField
              label={t.activity}
              value={data.activity}
              onChange={(v) => setData({ ...data, activity: v })}
              options={[
                { value: "low", label: t.activityLevels.low },
                { value: "moderate", label: t.activityLevels.moderate },
                { value: "high", label: t.activityLevels.high },
              ]}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid md:grid-cols-3 gap-4">
            <NumberWithIcon label={t.heightCm} placeholder="175" icon={<Ruler size={16} />} value={data.height} onChange={(v) => setData({ ...data, height: v })} />
            <NumberWithIcon label={t.weightKg} placeholder="78" icon={<Weight size={16} />} value={data.weight} onChange={(v) => setData({ ...data, weight: v })} />
            <ReadOnlyWithIcon label={t.bmi} value={bmi} icon={<Flame size={16} />} />
          </div>
        )}

        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-4">
            <SelectField
              label={t.goal}
              value={data.goal}
              onChange={(v) => setData({ ...data, goal: v })}
              options={[
                { value: "fat_loss", label: t.goals.fat_loss },
                { value: "muscle_gain", label: t.goals.muscle_gain },
                { value: "recomp", label: t.goals.recomp },
                { value: "performance", label: t.goals.performance },
              ]}
            />
            <NumberWithIcon label={t.targetWeight} placeholder="72" icon={<Target size={16} />} value={data.targetWeight} onChange={(v) => setData({ ...data, targetWeight: v })} />
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">{t.deadline}</label>
              <input type="date" value={data.deadline} onChange={(e) => setData({ ...data, deadline: e.target.value })} className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500/40" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">{t.injuries}</label>
              <textarea value={data.injuries} onChange={(e) => setData({ ...data, injuries: e.target.value })} rows={3} placeholder={t.injuriesPh} className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-fuchsia-500/40" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-semibold mb-2">{t.review}</h4>
              <ul className="text-sm text-slate-300 grid md:grid-cols-2 gap-2">
                <li>• {t.name}: <span className="text-white">{data.name || "-"}</span></li>
                <li>• {t.age}: <span className="text-white">{data.age || "-"}</span></li>
                <li>• {t.gender}: <span className="text-white">{data.gender === "male" ? t.male : t.female}</span></li>
                <li>• {t.activity}: <span className="text-white">{t.activityLevels[data.activity]}</span></li>
                <li>• {t.heightCm}: <span className="text-white">{data.height || "-"}</span></li>
                <li>• {t.weightKg}: <span className="text-white">{data.weight || "-"}</span></li>
                <li>• {t.bmi}: <span className="text-white">{bmi}</span></li>
                <li>• {t.goal}: <span className="text-white">{t.goals[data.goal]}</span></li>
                <li>• {t.targetWeight}: <span className="text-white">{data.targetWeight || "-"}</span></li>
                <li>• {t.deadline}: <span className="text-white">{data.deadline || "-"}</span></li>
                <li className="md:col-span-2">• {t.injuries}: <span className="text-white">{data.injuries || "-"}</span></li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40"
          >
            {t.back}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold"
            >
              {t.next}
            </button>
          ) : (
            <button
              onClick={() => onComplete(data)}
              className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 font-semibold"
            >
              {t.finish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Steps({ step, labels }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {labels.map((label, idx) => {
        const n = idx + 1;
        const active = n <= step;
        return (
          <div key={label} className={`rounded-xl px-3 py-2 border ${active ? "border-fuchsia-500/40 bg-fuchsia-500/10" : "border-white/10 bg-white/5"}`}>
            <div className="text-xs text-slate-300">{label}</div>
            <div className="text-[10px] text-slate-400">{n}/4</div>
          </div>
        );
      })}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500/40"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberWithIcon({ label, value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl bg-black/30 border border-white/10 px-3 py-2">
        <span className="opacity-70">{icon}</span>
        <input
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}

function ReadOnlyWithIcon({ label, value, icon }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2">
        <span className="opacity-70">{icon}</span>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Dashboard                                 */
/* -------------------------------------------------------------------------- */
function Dashboard({ t, profile }) {
  const cards = [
    {
      title: t.stats.weight,
      value: profile?.weight || "-",
      foot: "kg",
    },
    {
      title: t.stats.height,
      value: profile?.height || "-",
      foot: "cm",
    },
    {
      title: t.stats.goal,
      value: t.goals[profile?.goal || "fat_loss"],
      foot: "",
    },
    {
      title: t.stats.activity,
      value: t.activityLevels[profile?.activity || "moderate"],
      foot: "",
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl p-4 border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="text-sm text-slate-400">{c.title}</div>
            <div className="text-2xl font-extrabold mt-1">{c.value}<span className="text-base font-semibold ml-1">{c.foot}</span></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 border border-white/10 bg-white/5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">{t.progressChart}</div>
            <div className="text-xs text-slate-400">{t.sampleData}</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoProgressData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="weight" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
          <div className="font-semibold mb-2">{t.nextWorkout}</div>
          <ul className="text-sm grid gap-2">
            <li className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span>Bench Press (4×8)</span>
              <span className="text-slate-400">Upper — A</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span>Incline DB Press (3×10)</span>
              <span className="text-slate-400">Upper — A</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span>Lat Pulldown (4×10)</span>
              <span className="text-slate-400">Upper — A</span>
            </li>
          </ul>
          <button className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold">
            {t.viewPlan}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Workouts                                  */
/* -------------------------------------------------------------------------- */
function Workouts({ t }) {
  const template = [
    {
      name: t.splits.upperA,
      items: [
        { ex: "Bench Press", sets: 4, reps: 8 },
        { ex: "Incline Dumbbell Press", sets: 3, reps: 10 },
        { ex: "Lat Pulldown", sets: 4, reps: 10 },
        { ex: "Lateral Raise", sets: 4, reps: 12 },
      ],
    },
    {
      name: t.splits.lowerA,
      items: [
        { ex: "Back Squat", sets: 4, reps: 6 },
        { ex: "Romanian Deadlift", sets: 3, reps: 8 },
        { ex: "Leg Press", sets: 3, reps: 12 },
      ],
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t.workoutBuilder}</h3>
        <button className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 text-sm">{t.addDay}</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {template.map((day) => (
          <div key={day.name} className="rounded-2xl p-4 border border-white/10 bg-white/5">
            <div className="font-semibold mb-2">{day.name}</div>
            <ul className="grid gap-2 text-sm">
              {day.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                  <span>{it.ex}</span>
                  <span className="text-slate-400">{it.sets}×{it.reps}</span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold text-sm">{t.customize}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Nutrition                                 */
/* -------------------------------------------------------------------------- */
function Nutrition({ t, profile }) {
  const h = (parseFloat(profile?.height) || 0) / 100;
  const w = parseFloat(profile?.weight) || 0;
  const age = parseInt(profile?.age || "0", 10);
  const gender = profile?.gender || "male";

  const bmr = useMemo(() => {
    if (!h || !w || !age) return 0;
    // Mifflin-St Jeor (rough estimate)
    const cm = h * 100;
    return Math.round(
      gender === "male"
        ? 10 * w + 6.25 * cm - 5 * age + 5
        : 10 * w + 6.25 * cm - 5 * age - 161
    );
  }, [h, w, age, gender]);

  const activityMultiplier = { low: 1.2, moderate: 1.55, high: 1.8 }[profile?.activity || "moderate"];
  const tdee = Math.round(bmr * activityMultiplier);
  const macroTarget = getMacroTargets(profile?.goal || "fat_loss", tdee);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="rounded-2xl p-4 border border-white/10 bg-white/5 lg:col-span-2">
        <div className="font-semibold mb-2">{t.nutritionSummary}</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Stat label="BMR" value={bmr} suffix="kcal" />
          <Stat label="TDEE" value={tdee} suffix="kcal" />
          <Stat label={t.macros.protein} value={macroTarget.protein} suffix="g" />
          <Stat label={t.macros.carbs} value={macroTarget.carbs} suffix="g" />
          <Stat label={t.macros.fat} value={macroTarget.fat} suffix="g" />
        </div>
        <p className="text-xs text-slate-400 mt-2">{t.nutritionNote}</p>
      </div>

      <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
        <div className="font-semibold mb-2">{t.sampleMeal}</div>
        <ul className="text-sm grid gap-2">
          <li className="p-2 rounded-xl bg-white/5 border border-white/10 flex justify-between"><span>Oats + Whey + Banana</span><span className="text-slate-400">{t.breakfast}</span></li>
          <li className="p-2 rounded-xl bg-white/5 border border-white/10 flex justify-between"><span>Chicken Breast + Rice + Salad</span><span className="text-slate-400">{t.lunch}</span></li>
          <li className="p-2 rounded-xl bg-white/5 border border-white/10 flex justify-between"><span>Yogurt + Nuts + Berries</span><span className="text-slate-400">{t.snack}</span></li>
          <li className="p-2 rounded-xl bg-white/5 border border-white/10 flex justify-between"><span>Salmon + Potatoes + Veggies</span><span className="text-slate-400">{t.dinner}</span></li>
        </ul>
        <button className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold text-sm">{t.generatePlan}</button>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }) {
  return (
    <div className="rounded-2xl p-4 border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}<span className="text-base font-semibold ml-1">{suffix}</span></div>
    </div>
  );
}

function getMacroTargets(goal, tdee) {
  // Simple macro presets
  const calories = {
    fat_loss: Math.round(tdee * 0.8),
    muscle_gain: Math.round(tdee * 1.1),
    recomp: tdee,
    performance: Math.round(tdee * 1.05),
  }[goal];

  // Assume bodyweight 80 kg for demo if unknown; in real app derive from profile
  const bw = 80;
  const protein = Math.round(bw * 2.0); // g
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

/* -------------------------------------------------------------------------- */
/*                                   Progress                                 */
/* -------------------------------------------------------------------------- */
function Progress({ t }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="rounded-2xl p-4 border border-white/10 bg-white/5 lg:col-span-2">
        <div className="font-semibold mb-2">{t.progressChart}</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoProgressData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
        <div className="font-semibold mb-2">{t.uploadProgress}</div>
        <div className="rounded-xl border border-dashed border-white/20 p-4 text-center text-sm text-slate-300">
          {t.dragDrop}
        </div>
        <button className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold text-sm">{t.addMeasurement}</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Messages                                  */
/* -------------------------------------------------------------------------- */
function Messages({ t }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { from: "coach", text: t.msgHello },
  ]);

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl p-4 border border-white/10 bg-white/5 h-80 overflow-y-auto">
        <ul className="grid gap-2 text-sm">
          {msgs.map((m, i) => (
            <li key={i} className={`max-w-[80%] p-2 rounded-xl ${m.from === "coach" ? "bg-white/10" : "bg-gradient-to-r from-fuchsia-500/20 to-sky-500/20 ml-auto"}`}>
              {m.text}
            </li>
          ))}
        </ul>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          setMsgs((list) => [...list, { from: "user", text: input.trim() }]);
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.typeMessage}
          className="flex-1 rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500/40"
        />
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 font-semibold">{t.send}</button>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Settings                                  */
/* -------------------------------------------------------------------------- */
function Settings({ t, lang, setLang, profile, setProfile }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
        <div className="font-semibold mb-2">{t.account}</div>
        <div className="grid gap-3">
          <TextField label={t.name} value={profile?.name || ""} onChange={(v) => setProfile({ ...profile, name: v })} />
          <SelectField label={t.language} value={lang} onChange={setLang} options={[{ value: "ar", label: "العربية" }, { value: "en", label: "English" }]} />
          <button className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 font-semibold w-max">{t.save}</button>
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
        <div className="font-semibold mb-2">{t.security}</div>
        <p className="text-sm text-slate-400 mb-2">{t.securityNote}</p>
        <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 text-sm w-max">{t.resetDemo}</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Demo Content                                */
/* -------------------------------------------------------------------------- */
const demoProgressData = [
  { date: "Aug 01", weight: 80 },
  { date: "Aug 08", weight: 79.4 },
  { date: "Aug 15", weight: 78.9 },
  { date: "Aug 22", weight: 78.2 },
  { date: "Aug 29", weight: 77.7 },
  { date: "Sep 05", weight: 77.1 },
];

/* -------------------------------------------------------------------------- */
/*                                    Copy                                    */
/* -------------------------------------------------------------------------- */
const i18n = {
  ar: {
    tagline: "منصّة تدريب وتغذية ذكية لعملائك",
    coach: "المدرّب",
    yourCoach: "ديبابا",
    welcome: "مرحبًا بك في Dpapa",
    welcomeSub: "سجّل دخولك أو أنشئ حسابًا جديدًا لبدء رحلتك",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    createAccount: "إنشاء الحساب",
    loading: "جاري...",
    consent: "بالدخول، أنت توافق على الشروط وسياسة الخصوصية",

    nav: {
      dashboard: "لوحة التحكم",
      workouts: "التمارين",
      nutrition: "التغذية",
      progress: "التقدم",
      messages: "الرسائل",
      settings: "الإعدادات",
    },
    hideMenu: "إخفاء القائمة",
    showMenu: "إظهار القائمة",

    onboard: {
      title: "تهيئة الحساب",
      subtitle: "أدخل بياناتك الأساسية لنخصص لك البرنامج",
      s1: "بيانات أساسية",
      s2: "الطول والوزن",
      s3: "الهدف والمدة",
      s4: "مراجعة",
    },
    back: "رجوع",
    next: "التالي",
    finish: "إنهاء",

    name: "الاسم",
    age: "العمر",
    gender: "النوع",
    male: "ذكر",
    female: "أنثى",
    activity: "مستوى النشاط",
    activityLevels: { low: "منخفض", moderate: "متوسط", high: "مرتفع" },
    heightCm: "الطول (سم)",
    weightKg: "الوزن (كجم)",
    bmi: "مؤشر الكتلة",
    goal: "الهدف",
    goals: { fat_loss: "حرق الدهون", muscle_gain: "زيادة العضلات", recomp: "إعادة تركيب", performance: "أداء رياضي" },
    targetWeight: "الوزن المستهدف",
    deadline: "الموعد المستهدف",
    injuries: "إصابات/موانع صحية",
    injuriesPh: "مثال: آلام أسفل الظهر، حساسية أطعمة...",
    review: "مراجعة البيانات",

    stats: { weight: "وزنك", height: "طولك", goal: "هدفك", activity: "نشاطك" },
    progressChart: "منحنى التقدم (وزن)",
    sampleData: "بيانات تجريبية",
    nextWorkout: "تمرينك القادم",
    viewPlan: "عرض الخطة",

    workoutBuilder: "منشئ الخطة التدريبية",
    addDay: "إضافة يوم",
    customize: "تخصيص اليوم",
    splits: { upperA: "علوي – أ", lowerA: "سفلي – أ" },

    nutritionSummary: "ملخّص التغذية",
    macros: { protein: "البروتين", carbs: "الكربوهيدرات", fat: "الدهون" },
    sampleMeal: "أمثلة لوجبات اليوم",
    breakfast: "فطور",
    lunch: "غداء",
    dinner: "عشاء",
    snack: "وجبة خفيفة",
    generatePlan: "ولّد خطة غذاء",
    nutritionNote: "الحسابات تقديرية، وسيتم ضبطها أسبوعيًا حسب قياساتك وتقدمك.",

    uploadProgress: "رفع صور/قياسات التقدم",
    dragDrop: "اسحب وأفلت صور التقدم أو القياسات هنا",
    addMeasurement: "إضافة قياس/صورة",

    msgHello: "أهلاً! أرسل لي قياساتك الأسبوعية أو أي سؤال عندك.",
    typeMessage: "اكتب رسالتك...",
    send: "إرسال",

    account: "حسابك",
    language: "اللغة",
    save: "حفظ",
    security: "الأمان",
    securityNote: "هذا نموذج استعراضي — لا توجد كلمات مرور فعلية. لإعادة التهيئة، امسح بيانات المتصفح.",
    resetDemo: "إعادة ضبط النموذج",
  },

  en: {
    tagline: "Smart coaching & nutrition for your clients",
    coach: "Coach",
    yourCoach: "Dpapa",
    welcome: "Welcome to Dpapa",
    welcomeSub: "Sign in or create an account to start your journey",
    login: "Log in",
    register: "Register",
    email: "Email",
    password: "Password",
    createAccount: "Create account",
    loading: "Loading...",
    consent: "By continuing, you agree to Terms and Privacy",

    nav: {
      dashboard: "Dashboard",
      workouts: "Workouts",
      nutrition: "Nutrition",
      progress: "Progress",
      messages: "Messages",
      settings: "Settings",
    },
    hideMenu: "Hide menu",
    showMenu: "Show menu",

    onboard: {
      title: "Account Setup",
      subtitle: "Enter your basics so we can personalize your plan",
      s1: "Basics",
      s2: "Height & Weight",
      s3: "Goal & Timeline",
      s4: "Review",
    },
    back: "Back",
    next: "Next",
    finish: "Finish",

    name: "Name",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    activity: "Activity Level",
    activityLevels: { low: "Low", moderate: "Moderate", high: "High" },
    heightCm: "Height (cm)",
    weightKg: "Weight (kg)",
    bmi: "BMI",
    goal: "Goal",
    goals: { fat_loss: "Fat Loss", muscle_gain: "Muscle Gain", recomp: "Recomposition", performance: "Performance" },
    targetWeight: "Target Weight",
    deadline: "Target Date",
    injuries: "Injuries/Restrictions",
    injuriesPh: "e.g. Lower back pain, food allergies...",
    review: "Review",

    stats: { weight: "Weight", height: "Height", goal: "Goal", activity: "Activity" },
    progressChart: "Progress Curve (Weight)",
    sampleData: "Sample Data",
    nextWorkout: "Next Workout",
    viewPlan: "View plan",

    workoutBuilder: "Workout Plan Builder",
    addDay: "Add Day",
    customize: "Customize Day",
    splits: { upperA: "Upper — A", lowerA: "Lower — A" },

    nutritionSummary: "Nutrition Summary",
    macros: { protein: "Protein", carbs: "Carbs", fat: "Fat" },
    sampleMeal: "Sample Meals",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    generatePlan: "Generate plan",
    nutritionNote: "These are estimates; we'll adjust weekly based on your check-ins.",

    uploadProgress: "Upload Progress Photos/Measurements",
    dragDrop: "Drag & drop your progress images or measurements here",
    addMeasurement: "Add measurement/photo",

    msgHello: "Hey! Send me your weekly check-ins or any questions.",
    typeMessage: "Type a message...",
    send: "Send",

    account: "Your Account",
    language: "Language",
    save: "Save",
    security: "Security",
    securityNote: "This is a demo — no real passwords. To reset, clear site data.",
    resetDemo: "Reset demo",
  },
};
