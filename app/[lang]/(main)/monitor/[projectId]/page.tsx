"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trees,
  Leaf,
  Users,
  AlertTriangle,
  Activity,
  FileText,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Dashboard = {
  project_id: number;
  project_name: string;
  project_status?: string;
  area_ha?: number;
  trees_planted?: number;
  trees_survived?: number;
  trees_dead?: number;
  survival_rate?: number;
  carbon_stock_tco2e?: number;
  estimated_co2e?: number;
  species_recorded?: number;
  total_beneficiaries?: number;
  total_villages?: number;
  total_livelihood_groups?: number;
  total_activities?: number;
  recent_activities?: Array<{
    id: number;
    type?: string;
    date?: string;
    realization?: number;
    unit?: string;
  }>;
  active_alerts?: number;
  recent_alerts?: Array<{
    id: number;
    type?: string;
    alert_type?: string;
    severity?: string;
    description?: string;
    created_at?: string;
  }>;
  total_field_reports?: number;
  last_field_report?: string | null;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function fmt(n?: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString();
}

export default function MonitorDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const projectId = params?.projectId as string;
  const isId = lang === "id";

  const [data, setData] = useState<Dashboard | null>(null);
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
        const res = await fetch(
          `${API_URL}/projects/${projectId}/dashboard`,
          { headers: authHeaders(), cache: "no-store" }
        );
        if (res.status === 401) {
          router.replace(`/${lang}/login`);
          return;
        }
        if (!res.ok) throw new Error("fail");
        setData(await res.json());
      } catch {
        setData(null);
        setError(
          isId
            ? "Gagal memuat dashboard proyek."
            : "Failed to load project dashboard."
        );
      } finally {
        setLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId, lang, router, isId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <p className="text-slate-600 font-medium mb-4">
          {error || (isId ? "Proyek tidak ditemukan." : "Project not found.")}
        </p>
        <Link
          href={`/${lang}/monitor`}
          className="text-emerald-700 font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {isId ? "Kembali" : "Back"}
        </Link>
      </main>
    );
  }

  const kpis = [
    {
      label: isId ? "Pohon ditanam" : "Trees planted",
      value: fmt(data.trees_planted),
      icon: Trees,
    },
    {
      label: isId ? "Pohon hidup" : "Trees survived",
      value: fmt(data.trees_survived),
      icon: Trees,
    },
    {
      label: isId ? "Survival rate" : "Survival rate",
      value:
        data.survival_rate != null
          ? `${Number(data.survival_rate).toFixed(1)}%`
          : "—",
      icon: Leaf,
    },
    {
      label: isId ? "Estimasi CO₂e" : "Estimated CO₂e",
      value: fmt(data.estimated_co2e ?? data.carbon_stock_tco2e),
      icon: Leaf,
      hint: isId ? "Estimasi monitoring" : "Monitoring estimate",
    },
    {
      label: isId ? "Spesies" : "Species",
      value: fmt(data.species_recorded),
      icon: Leaf,
    },
    {
      label: isId ? "Penerima manfaat" : "Beneficiaries",
      value: fmt(data.total_beneficiaries),
      icon: Users,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <div className="bg-emerald-950 text-white pt-28 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/${lang}/monitor`}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isId ? "Semua proyek" : "All projects"}
          </Link>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
            {data.project_name}
          </h1>
          <p className="text-emerald-100/70 text-sm font-medium">
            {data.area_ha != null && <span>{fmt(data.area_ha)} ha · </span>}
            {data.project_status || "—"} ·{" "}
            {isId ? "Alert aktif" : "Active alerts"}:{" "}
            {fmt(data.active_alerts)}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
      <Link
        href={`/${lang}/monitor/${projectId}/alerts`}
        className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20"
      >
        Alerts
      </Link>
      <Link
        href={`/${lang}/monitor/${projectId}/field-reports`}
        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400"
      >
        {isId ? "Laporan lapangan" : "Field reports"}
      </Link>
    </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <k.icon className="w-5 h-5 text-emerald-600 mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {k.label}
              </p>
              <p className="text-xl md:text-2xl font-extrabold text-slate-900">
                {k.value}
              </p>
              {k.hint && (
                <p className="text-[11px] text-amber-700/80 font-medium mt-1">
                  {k.hint}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-extrabold text-slate-900">
                {isId ? "Alert terbaru" : "Recent alerts"}
              </h2>
            </div>
            {!data.recent_alerts?.length ? (
              <p className="text-sm text-slate-500">
                {isId ? "Tidak ada alert aktif." : "No active alerts."}
              </p>
            ) : (
              <ul className="space-y-3">
                {data.recent_alerts.map((a) => (
                  <li
                    key={a.id}
                    className="border border-slate-100 rounded-xl p-4"
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      {a.type || a.alert_type || "alert"} · {a.severity || "—"}
                    </p>
                    <p className="text-sm text-slate-700 font-medium">
                      {a.description || "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-900">
                {isId ? "Kegiatan terbaru" : "Recent activities"}
              </h2>
            </div>
            {!data.recent_activities?.length ? (
              <p className="text-sm text-slate-500">
                {isId ? "Belum ada kegiatan." : "No activities yet."}
              </p>
            ) : (
              <ul className="space-y-3">
                {data.recent_activities.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 border border-slate-100 rounded-xl p-4"
                  >
                    <span className="font-bold text-slate-800">
                      {a.type || "activity"}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      {a.realization != null && (
                        <>
                          {fmt(a.realization)} {a.unit || ""} ·{" "}
                        </>
                      )}
                      {a.date || ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-slate-400 font-medium">
              {isId ? "Laporan lapangan:" : "Field reports:"}{" "}
              {fmt(data.total_field_reports)}
              {data.last_field_report
                ? ` · ${isId ? "terakhir" : "last"} ${data.last_field_report}`
                : ""}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}