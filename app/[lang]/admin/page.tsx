"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  PlusCircle,
  Home as HomeIcon,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const cardMotion = `rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-300 ${ease} hover:-translate-y-1 hover:shadow-md group active:scale-[0.98]`;

const quickClass = `flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${ease} group active:scale-[0.98]`;

const quickIconClass = `w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200 group-hover:scale-105 shadow-sm transition-all duration-300 ${ease}`;

export default function AdminDashboardOverview() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ users: 0, assessments: 0 });

  const token = () => localStorage.getItem("access_token");

  useEffect(() => {
    const initData = async () => {
      const t = token();
      if (!t) {
        router.push(`/${lang}/login`);
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!meRes.ok) {
          router.push(`/${lang}/login`);
          return;
        }
        const me = await meRes.json();
        if (me.role !== "admin" && me.role !== "super_admin") {
          router.push(`/${lang}`);
          return;
        }
        setUser(me);

        let usersCount = 0;
        let assessmentsCount = 0;

        try {
          if (me.role === "super_admin") {
            const usersRes = await fetch(`${API_URL}/users/`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            if (usersRes.ok) {
              const usersData = await usersRes.json();
              usersCount = Array.isArray(usersData) ? usersData.length : 0;
            }
          }

          const assessRes = await fetch(`${API_URL}/assessments/`, {
            headers: { Authorization: `Bearer ${t}` },
          });
          if (assessRes.ok) {
            const assessData = await assessRes.json();
            assessmentsCount = Array.isArray(assessData) ? assessData.length : 0;
          }
        } catch (e) {
          console.error("Gagal memuat statistik", e);
        }

        setStats({ users: usersCount, assessments: assessmentsCount });
      } catch {
        router.push(`/${lang}/login`);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [lang, router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (isId) {
      if (hour < 11) return "Selamat Pagi";
      if (hour < 15) return "Selamat Siang";
      if (hour < 18) return "Selamat Sore";
      return "Selamat Malam";
    }
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 relative flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          {isId ? "Memuat Dashboard..." : "Loading Workspace..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* HERO */}
        <div
          className={`md:col-span-12 lg:col-span-8 bg-gradient-to-br from-[#042F24] via-[#064233] to-[#03261D] text-white rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300 ${ease} hover:-translate-y-1 hover:shadow-md group`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[90px] pointer-events-none group-hover:scale-125 group-hover:bg-emerald-400/20 transition-all duration-700 ease-out" />
          <div className="relative z-10 flex items-center justify-between mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 font-bold text-[11px] uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Satubumi Workspace</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-200/70 text-[12px] font-bold">
              <Clock className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString(isId ? "id-ID" : "en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {getGreeting()},{" "}
              <span className="text-emerald-300">{user?.full_name?.split(" ")[0]}</span>!
            </h1>
            <p className="text-emerald-100/70 font-medium text-[15px] max-w-xl leading-relaxed">
              {isId
                ? "Sistem operasional dan analitik platform berjalan normal. Kendalikan konten dan data ekosistem dengan mudah dari sini."
                : "Platform operational and analytics systems are running smoothly. Manage website contents and ecosystem metrics seamlessly."}
            </p>
          </div>
        </div>

        {/* ROLE — emerald soft */}
        <div
          className={`md:col-span-12 lg:col-span-4 ${cardMotion} bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50/80 hover:border-emerald-200`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm transition-all duration-300 ${ease} group-hover:scale-105`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-white/90 text-emerald-700 border border-emerald-100">
              Verified
            </span>
          </div>
          <div className="my-6">
            <p className="text-[12px] font-bold text-emerald-800/50 uppercase tracking-widest mb-1">
              {isId ? "Hak Akses Login" : "Access Permission"}
            </p>
            <h3 className="text-xl font-extrabold text-emerald-950 uppercase tracking-wide">
              {user?.role?.replace("_", " ")}
            </h3>
            <p className="text-[13px] text-emerald-900/50 font-medium truncate mt-1">
              {user?.email}
            </p>
          </div>
          <div className="pt-4 border-t border-emerald-100/80 flex items-center justify-between text-[12px] font-bold text-emerald-800/40">
            <span>Status Sistem</span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
          </div>
        </div>

        {/* ASSESSMENTS — emerald */}
        <Link
          href={`/${lang}/admin/assessments`}
          className={`md:col-span-6 lg:col-span-4 ${cardMotion} bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200`}
        >
          <div className="flex justify-between items-start mb-6">
            <div
              className={`w-14 h-14 rounded-2xl bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm transition-all duration-300 ${ease} group-hover:scale-105`}
            >
              <ClipboardList className="w-7 h-7" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white/90 border border-emerald-100 px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> Live Data
            </span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-emerald-950 tracking-tight mb-1">
              {stats.assessments}
            </h3>
            <p className="text-[12px] font-extrabold text-emerald-800/45 uppercase tracking-widest">
              {isId ? "Kalkulasi Rapid-FS" : "Rapid-FS Calculations"}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-emerald-100/80 flex justify-end">
            <div className="text-[13px] font-bold text-emerald-800/50 group-hover:text-emerald-700 flex items-center gap-1 transition-colors duration-300">
              <span>{isId ? "Kelola Assessment" : "Manage Assessments"}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* ARTICLES — sky */}
        <Link
          href={`/${lang}/admin/articles`}
          className={`md:col-span-6 lg:col-span-4 ${cardMotion} bg-sky-50/70 border border-sky-100 hover:bg-sky-50 hover:border-sky-200`}
        >
          <div className="flex justify-between items-start mb-6">
            <div
              className={`w-14 h-14 rounded-2xl bg-white border border-sky-100 text-sky-600 flex items-center justify-center shadow-sm transition-all duration-300 ${ease} group-hover:scale-105`}
            >
              <FileText className="w-7 h-7" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-white/90 border border-sky-100 px-3 py-1 rounded-full">
              CMS Portal
            </span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-sky-950 tracking-tight mb-1">Articles</h3>
            <p className="text-[12px] font-extrabold text-sky-800/45 uppercase tracking-widest">
              {isId ? "Publikasi Berita & Blog" : "News & Blog Publications"}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-sky-100/80 flex justify-end">
            <div className="text-[13px] font-bold text-sky-800/50 group-hover:text-sky-700 flex items-center gap-1 transition-colors duration-300">
              <span>{isId ? "Buka Artikel" : "Open Articles"}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* USERS — indigo / HOME — amber */}
        {user?.role === "super_admin" ? (
          <Link
            href={`/${lang}/admin/users`}
            className={`md:col-span-12 lg:col-span-4 ${cardMotion} bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200`}
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 rounded-2xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm transition-all duration-300 ${ease} group-hover:scale-105`}
              >
                <Users className="w-7 h-7" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-white/90 border border-indigo-100 px-3 py-1 rounded-full">
                Super Admin
              </span>
            </div>
            <div>
              <h3 className="text-4xl font-extrabold text-indigo-950 tracking-tight mb-1">
                {stats.users}
              </h3>
              <p className="text-[12px] font-extrabold text-indigo-800/45 uppercase tracking-widest">
                {isId ? "Pengguna Terdaftar" : "Registered Users"}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-indigo-100/80 flex justify-end">
              <div className="text-[13px] font-bold text-indigo-800/50 group-hover:text-indigo-700 flex items-center gap-1 transition-colors duration-300">
                <span>{isId ? "Kelola Pengguna" : "Manage Users"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href={`/${lang}/admin/home`}
            className={`md:col-span-12 lg:col-span-4 ${cardMotion} bg-amber-50/70 border border-amber-100 hover:bg-amber-50 hover:border-amber-200`}
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 rounded-2xl bg-white border border-amber-100 text-amber-600 flex items-center justify-center shadow-sm transition-all duration-300 ${ease} group-hover:scale-105`}
              >
                <HomeIcon className="w-7 h-7" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-white/90 border border-amber-100 px-3 py-1 rounded-full">
                Website
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-amber-950 tracking-tight mb-1">
                Home Page
              </h3>
              <p className="text-[12px] font-extrabold text-amber-800/45 uppercase tracking-widest">
                {isId ? "Pengaturan Halaman Utama" : "Main Page Editor"}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-100/80 flex justify-end">
              <div className="text-[13px] font-bold text-amber-800/50 group-hover:text-amber-700 flex items-center gap-1 transition-colors duration-300">
                <span>{isId ? "Sunting Beranda" : "Edit Home"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}

        {/* QUICK ACTIONS — netral */}
        <div className="md:col-span-12 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-[16px] font-extrabold text-slate-800">
              {isId ? "Akses Cepat Pintasan" : "Quick Actions Shortcut"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={`/${lang}/admin/articles`} className={quickClass}>
              <div className={quickIconClass}>
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={`text-[14px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors duration-300 ${ease}`}
                >
                  {isId ? "Tulis Artikel Baru" : "Write New Article"}
                </p>
                <p className="text-[12px] text-slate-500 font-medium">
                  {isId ? "Publikasikan berita terbaru" : "Publish new updates"}
                </p>
              </div>
            </Link>

            <Link href={`/${lang}/admin/assessments`} className={quickClass}>
              <div className={quickIconClass}>
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={`text-[14px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors duration-300 ${ease}`}
                >
                  {isId ? "Tinjau Assessment" : "Review Assessments"}
                </p>
                <p className="text-[12px] text-slate-500 font-medium">
                  {isId ? "Lihat riwayat kalkulasi" : "View calculation history"}
                </p>
              </div>
            </Link>

            {user?.role === "super_admin" && (
              <Link href={`/${lang}/admin/users`} className={quickClass}>
                <div className={quickIconClass}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p
                    className={`text-[14px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors duration-300 ${ease}`}
                  >
                    {isId ? "Kelola Pengguna" : "Manage Users"}
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium">
                    {isId ? "Tambah atau hapus akses" : "Add or remove access"}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}