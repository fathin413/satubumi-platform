"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Trash2, Download, ArrowLeft, Plus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push(`/${lang}/login`);
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) {
          localStorage.removeItem("access_token");
          router.push(`/${lang}/login`);
          return;
        }
        const meData = await meRes.json();
        setUser(meData);

        const listRes = await fetch(`${API_URL}/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!listRes.ok) {
          throw new Error(isId ? "Gagal memuat data" : "Failed to load data");
        }

        const listData = await listRes.json();
        const raw = Array.isArray(listData)
          ? listData
          : listData.data || listData.items || [];

        // Halaman user: SELALU hanya assessment milik sendiri
        // (meski API admin mengembalikan semua data)
        const myId = meData.id;
        const mine = raw.filter((a: any) => {
          if (a.user_id == null) return false;
          return Number(a.user_id) === Number(myId);
        });

        setAssessments(mine);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [lang, router, isId]);

  const handleDelete = async (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(isId ? "Hapus assessment ini?" : "Delete this assessment?")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/assessments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(isId ? "Gagal menghapus" : "Failed to delete");
      setAssessments((prev) => prev.filter((a) => (a.id || a._id) !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = async (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/reports/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(isId ? "Gagal mengunduh PDF" : "Failed to download PDF");
      }
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

  const formatScore = (score: number) =>
    typeof score === "number" ? score.toFixed(1) : "-";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-900/50 font-medium">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] pt-32 pb-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-emerald-700 mb-3">
              Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-tight mb-2">
              {isId ? "Riwayat Assessment" : "Assessment History"}
            </h1>
            <p className="text-emerald-900/60 font-medium">
              {isId ? "Halo" : "Hello"}
              {user?.full_name ? `, ${user.full_name}` : ""}
              <span className="text-emerald-900/40">
                {" "}
                · {isId ? "hanya milik Anda" : "your projects only"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <Link
                href={`/${lang}/admin/assessments`}
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-emerald-200 text-emerald-800 font-bold rounded-2xl hover:bg-emerald-50 transition-all"
              >
                {isId ? "Semua Assessment (Admin)" : "All Assessments (Admin)"}
              </Link>
            )}
            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              {isId ? "Assessment Baru" : "New Assessment"}
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* List */}
        {assessments.length === 0 ? (
          <div className="bg-white/60 border-2 border-dashed border-emerald-200 rounded-[2.5rem] py-24 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-2">
              {isId ? "Belum ada assessment" : "No assessments yet"}
            </h3>
            <p className="text-emerald-900/50 font-medium mb-8 max-w-sm mx-auto">
              {isId
                ? "Jalankan Rapid-FS lalu simpan hasilnya untuk melihat riwayat di sini."
                : "Run Rapid-FS and save the result to see your history here."}
            </p>
            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all"
            >
              {isId ? "Mulai Assessment" : "Start Assessment"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((item) => {
              const id = item.id || item._id;
              return (
                <Link
                  key={id}
                  href={`/${lang}/dashboard/${id}`}
                  className="bg-white/80 backdrop-blur-xl border border-emerald-100/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-lg hover:shadow-emerald-900/5 hover:border-emerald-200 transition-all block"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-emerald-950 truncate mb-1">
                      {item.location_name || item.locationName || "Unnamed Project"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-900/50 font-medium">
                      {item.ecosystem_type && (
                        <span className="capitalize">
                          {String(item.ecosystem_type).replace(/_/g, " ")}
                        </span>
                      )}
                      {item.area_ha != null && (
                        <span>· {Number(item.area_ha).toLocaleString()} ha</span>
                      )}
                      {item.feasibility_category && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                          {item.feasibility_category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center shrink-0">
                    <p className="text-[11px] font-bold text-emerald-800/40 uppercase tracking-widest mb-1">
                      Score
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-700">
                      {formatScore(item.feasibility_score)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDownloadPDF(e, id)}
                      className="p-3 rounded-xl border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, id)}
                      disabled={deletingId === id}
                      className="p-3 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-emerald-800/60 font-bold hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isId ? "Kembali ke Beranda" : "Back to Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}