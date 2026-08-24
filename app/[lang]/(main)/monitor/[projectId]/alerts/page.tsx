"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Bell,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type AlertItem = {
  id: number;
  alert_type?: string;
  severity?: string;
  description?: string;
  is_read?: boolean;
  is_resolved?: boolean;
  auto_generated?: boolean;
  created_at?: string;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatDate(iso?: string, lang?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function severityClass(severity?: string) {
  switch ((severity || "").toLowerCase()) {
    case "critical":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function MonitorAlertsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const projectId = params?.projectId as string;
  const isId = lang === "id";

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [onlyActive, setOnlyActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  type AlertItem = {
    id: number;
    alert_type?: string;
    severity?: string;
    description?: string;
    is_read?: boolean;
    is_resolved?: boolean;
    auto_generated?: boolean;
    created_at?: string;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = onlyActive ? "" : "?only_active=false";
      const res = await fetch(
        `${API_URL}/projects/${projectId}/alerts${q}`,
        { headers: authHeaders(), cache: "no-store" }
      );
      if (res.status === 401) {
        router.replace(`/${lang}/login`);
        return;
      }
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      setAlerts([]);
      setError(isId ? "Gagal memuat alert." : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, onlyActive, lang]);

  const patchAlert = async (id: number, body: { is_read?: boolean; is_resolved?: boolean }) => {
    setActing(id);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/alerts/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(isId ? "Gagal update alert." : "Failed to update alert.");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setActing(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <div className="bg-emerald-950 text-white pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${lang}/monitor/${projectId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isId ? "Dashboard" : "Dashboard"}
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {isId ? "Peringatan" : "Alerts"}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setOnlyActive(true)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              onlyActive
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {isId ? "Aktif saja" : "Active only"}
          </button>
          <button
            type="button"
            onClick={() => setOnlyActive(false)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              !onlyActive
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {isId ? "Semua" : "All"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-500">
            {isId ? "Tidak ada alert." : "No alerts."}
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
                      {a.alert_type || "alert"}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg border ${
                        (a.severity || "").toLowerCase() === "critical"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : (a.severity || "").toLowerCase() === "high"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {a.severity || "medium"}
                    </span>
                    {a.auto_generated && (
                      <span className="text-[10px] font-bold text-slate-400">
                        auto
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    {a.description || "—"}
                  </p>
                  {a.created_at && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatDate(a.created_at, lang)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {!a.is_read && (
                    <button
                      type="button"
                      disabled={acting === a.id}
                      onClick={() =>
                        patchAlert(a.id, { is_read: true })
                      }
                      className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {isId ? "Tandai dibaca" : "Mark read"}
                    </button>
                  )}
                  {!a.is_resolved && (
                    <button
                      type="button"
                      disabled={acting === a.id}
                      onClick={() =>
                        patchAlert(a.id, { is_resolved: true })
                      }
                      className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {isId ? "Selesaikan" : "Resolve"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}