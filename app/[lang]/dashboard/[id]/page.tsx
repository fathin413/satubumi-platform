"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Download, Trash2 } from "lucide-react";

const MapPreview = dynamic(() => import("../../../../components/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-emerald-50 rounded-2xl animate-pulse border border-emerald-100" />
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const id = params?.id as string;
  const isId = lang === "id";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push(`/${lang}/login`);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(isId ? "Assessment tidak ditemukan" : "Assessment not found");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id, lang, router, isId]);

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/reports/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(isId ? "Gagal mengunduh PDF" : "Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Satubumi-Report-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(isId ? "Hapus assessment ini?" : "Delete this assessment?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/assessments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(isId ? "Gagal menghapus" : "Failed to delete");
      router.push(`/${lang}/dashboard`);
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  const formatNumber = (n: number) =>
    new Intl.NumberFormat(isId ? "id-ID" : "en-US", { maximumFractionDigits: 0 }).format(n || 0);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(isId ? "id-ID" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n || 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-rose-600 font-medium mb-6">{error || "Not found"}</p>
          <Link href={`/${lang}/dashboard`} className="text-emerald-700 font-bold hover:underline">
            {isId ? "Kembali ke Dashboard" : "Back to Dashboard"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] pt-32 pb-24 px-6">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Back */}
        <Link
          href={`/${lang}/dashboard`}
          className="inline-flex items-center gap-2 text-emerald-800/60 font-bold hover:text-emerald-800 mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isId ? "Kembali ke Dashboard" : "Back to Dashboard"}
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-emerald-700 mb-3">
              Assessment Detail
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-tight mb-2">
              {data.location_name || data.locationName || "Unnamed Project"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-900/50 font-medium">
              {data.ecosystem_type && (
                <span className="capitalize">{String(data.ecosystem_type).replace(/_/g, " ")}</span>
              )}
              {data.area_ha && <span>· {Number(data.area_ha).toLocaleString()} ha</span>}
              {data.project_duration_years && <span>· {data.project_duration_years} years</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white text-sm font-bold rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-5 py-3 border border-rose-200 text-rose-600 text-sm font-bold rounded-2xl hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "..." : isId ? "Hapus" : "Delete"}
            </button>
          </div>
        </div>

        {/* Score card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100/60 p-8 mb-8 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-6 border-b border-emerald-50">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-emerald-800/50 mb-2">
                {isId ? "Skor Kelayakan" : "Feasibility Score"}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-emerald-700">
                  {typeof data.feasibility_score === "number" ? data.feasibility_score.toFixed(1) : "-"}
                </span>
                <span className="text-xl text-emerald-900/20 mb-1">/100</span>
              </div>
            </div>
            {data.feasibility_category && (
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-800 text-sm font-bold rounded-full border border-emerald-100">
                {data.feasibility_category}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Metric label="Carbon Stock (CO₂e)" value={`${formatNumber(data.co2e_ton)} t`} />
            <Metric label="Total Credits (ACC)" value={`${formatNumber(data.acc_total_credits)} t`} />
            <Metric label="Gross Revenue" value={formatCurrency(data.gross_revenue_usd)} />
            <Metric label="Net Revenue" value={formatCurrency(data.net_revenue_usd)} />
            <Metric label="Total Cost" value={formatCurrency(data.cost_breakdown?.total_cost_usd)} />
            <Metric label="AGB" value={`${formatNumber(data.agb_ton)} ton`} />
          </div>
        </div>

        {/* Map */}
        {data.geometry && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100/60 p-8 mb-8 shadow-sm">
            <p className="text-sm font-bold text-emerald-900 mb-4">
              {isId ? "Pratinjau Peta Area" : "Map Preview"}
            </p>
            <MapPreview geometry={data.geometry} />
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations?.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100/60 p-8 shadow-sm">
            <p className="text-sm font-bold text-emerald-900 mb-4">
              {isId ? "Rekomendasi" : "Recommendations"}
            </p>
            <ul className="space-y-3">
              {data.recommendations.map((rec: string, i: number) => (
                <li key={i} className="text-sm text-emerald-950/70 font-medium flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
      <p className="text-[11px] font-bold tracking-wide uppercase text-emerald-800/50 mb-1">{label}</p>
      <p className="text-xl font-extrabold text-emerald-950">{value}</p>
    </div>
  );
}