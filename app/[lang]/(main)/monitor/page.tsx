"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  MapPin,
  Ruler,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Project = {
  id: number;
  name: string;
  location_name?: string | null;
  area_ha?: number | null;
  status?: string | null;
  created_at?: string;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function MonitorProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace(`/${lang}/login`);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/projects`, {
          headers: authHeaders(),
          cache: "no-store",
        });
        if (res.status === 401) {
          router.replace(`/${lang}/login`);
          return;
        }
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch {
        setProjects([]);
        setError(
          isId
            ? "Gagal memuat daftar proyek. Pastikan backend aktif."
            : "Failed to load projects. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, router, isId]);

  const statusLabel = (s?: string | null) => {
    if (!s) return "—";
    const map: Record<string, { id: string; en: string }> = {
      active: { id: "Aktif", en: "Active" },
      completed: { id: "Selesai", en: "Completed" },
      paused: { id: "Ditunda", en: "Paused" },
      draft: { id: "Draf", en: "Draft" },
    };
    const m = map[s];
    return m ? (isId ? m.id : m.en) : s;
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <div className="bg-emerald-950 text-white pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3">
            Satubumi Monitor
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            {isId ? "Proyek Monitor" : "Monitor Projects"}
          </h1>
          <p className="text-emerald-100/70 font-medium max-w-xl">
            {isId
              ? "Pantau restorasi, pohon, alert, dan dampak komunitas per proyek."
              : "Track restoration, trees, alerts, and community impact per project."}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-rose-700 font-medium">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {isId
                ? "Belum ada proyek. Buat dulu lewat Swagger (POST /projects) sebagai admin."
                : "No projects yet. Create one in Swagger (POST /projects) as admin."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/${lang}/monitor/${p.id}`}
                className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-800 truncate">
                    {p.name}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 font-medium">
                    {p.location_name && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.location_name}
                      </span>
                    )}
                    {p.area_ha != null && (
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" />
                        {Number(p.area_ha).toLocaleString()} ha
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                      {statusLabel(p.status)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}