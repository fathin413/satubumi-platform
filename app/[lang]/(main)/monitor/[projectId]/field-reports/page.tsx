"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Plus,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type FieldReport = {
  id: number;
  officer_name?: string;
  plot_id?: string | null;
  report_date?: string;
  report_type?: string;
  activity_description?: string;
  result_description?: string;
  photo_urls?: string[] | null;
  location_geojson?: {
    type?: string;
    coordinates?: number[];
  } | null;
};

const REPORT_TYPES = [
  { value: "tree_monitoring", id: "Monitoring pohon", en: "Tree monitoring" },
  { value: "biodiversity", id: "Keanekaragaman hayati", en: "Biodiversity" },
  { value: "incident", id: "Insiden", en: "Incident" },
  { value: "general", id: "Umum", en: "General" },
  { value: "community", id: "Komunitas", en: "Community" },
] as const;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatDate(iso?: string, lang?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function reportTypeLabel(value: string | undefined, isId: boolean) {
  const t = REPORT_TYPES.find((x) => x.value === value);
  if (!t) return value || "—";
  return isId ? t.id : t.en;
}

export default function MonitorFieldReportsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const projectId = params?.projectId as string;
  const isId = lang === "id";

  const [items, setItems] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [officerName, setOfficerName] = useState("");
  const [plotId, setPlotId] = useState("");
  const [reportType, setReportType] = useState<string>("tree_monitoring");
  const [activityDesc, setActivityDesc] = useState("");
  const [resultDesc, setResultDesc] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium text-slate-800";
  const labelCls =
    "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/field-reports`,
        { headers: authHeaders(), cache: "no-store" }
      );
      if (res.status === 401) {
        router.replace(`/${lang}/login`);
        return;
      }
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError(
        isId
          ? "Gagal memuat laporan lapangan."
          : "Failed to load field reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace(`/${lang}/login`);
      return;
    }
    if (projectId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, lang]);

  useEffect(() => {
    // Prefill nama dari /auth/me
    const t = localStorage.getItem("access_token");
    if (!t) return;
    fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (me?.full_name) setOfficerName(String(me.full_name).trim());
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setPlotId("");
    setReportType("tree_monitoring");
    setActivityDesc("");
    setResultDesc("");
    setLat("");
    setLng("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim() || !activityDesc.trim()) {
      setError(
        isId
          ? "Nama petugas dan deskripsi kegiatan wajib diisi."
          : "Officer name and activity description are required."
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      const hasCoords =
        !Number.isNaN(latN) &&
        !Number.isNaN(lngN) &&
        lat.trim() !== "" &&
        lng.trim() !== "";

      const body: Record<string, unknown> = {
        officer_name: officerName.trim(),
        plot_id: plotId.trim() || null,
        report_date: new Date().toISOString(),
        report_type: reportType,
        activity_description: activityDesc.trim(),
        result_description: resultDesc.trim() || null,
        photo_urls: [],
      };

      if (hasCoords) {
        body.location_geojson = {
          type: "Point",
          coordinates: [lngN, latN], // GeoJSON: [lng, lat]
        };
      }

      const res = await fetch(
        `${API_URL}/projects/${projectId}/field-reports`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.detail === "string"
            ? err.detail
            : isId
            ? "Gagal mengirim laporan."
            : "Failed to submit report."
        );
      }

      setSuccess(
        isId ? "Laporan berhasil dikirim." : "Report submitted successfully."
      );
      setFormOpen(false);
      resetForm();
      await load();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {(error || success) && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            {error ? (
              <>
                <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <p className="text-slate-600 text-sm mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="w-full py-3 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm"
                >
                  {isId ? "Tutup" : "Close"}
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">{success}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-emerald-950 text-white pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${lang}/monitor/${projectId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                {isId ? "Laporan Lapangan" : "Field Reports"}
              </h1>
              <p className="text-emerald-100/70 text-sm mt-2 font-medium">
                {isId
                  ? "Semua user login dapat mengirim laporan."
                  : "Any logged-in user can submit a report."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm transition"
            >
              <Plus className="w-4 h-4" />
              {isId ? "Kirim laporan" : "Submit report"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6">
        {/* Form modal */}
        {formOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[1.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {isId ? "Laporan baru" : "New report"}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className={labelCls}>
                    {isId ? "Nama petugas" : "Officer name"} *
                  </label>
                  <input
                    className={inputCls}
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Plot ID</label>
                    <input
                      className={inputCls}
                      value={plotId}
                      onChange={(e) => setPlotId(e.target.value)}
                      placeholder="WK-023"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      {isId ? "Jenis laporan" : "Report type"}
                    </label>
                    <select
                      className={inputCls}
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      {REPORT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {isId ? t.id : t.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    {isId ? "Deskripsi kegiatan" : "Activity description"} *
                  </label>
                  <textarea
                    className={inputCls + " min-h-[80px]"}
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {isId ? "Hasil / temuan" : "Result / findings"}
                  </label>
                  <textarea
                    className={inputCls + " min-h-[80px]"}
                    value={resultDesc}
                    onChange={(e) => setResultDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      Latitude ({isId ? "opsional" : "optional"})
                    </label>
                    <input
                      className={inputCls}
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="-1.534"
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Longitude ({isId ? "opsional" : "optional"})
                    </label>
                    <input
                      className={inputCls}
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="108.512"
                      inputMode="decimal"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isId ? "Kirim" : "Submit"}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {isId
                ? "Belum ada laporan. Klik “Kirim laporan”."
                : "No reports yet. Click “Submit report”."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <article
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {reportTypeLabel(r.report_type, isId)}
                  </span>
                  {r.plot_id && (
                    <span className="text-[11px] font-bold text-slate-500">
                      Plot {r.plot_id}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 ml-auto">
                    {formatDate(r.report_date, lang)}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">
                  {r.officer_name || "—"}
                </p>
                <p className="text-sm text-slate-600">
                  {r.activity_description || "—"}
                </p>
                {r.result_description && (
                  <p className="text-sm text-slate-500 mt-2 border-t border-slate-100 pt-2">
                    {r.result_description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}