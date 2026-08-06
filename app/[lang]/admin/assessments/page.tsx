"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Assessment = {
  id: number;
  user_id?: number;
  location_name: string;
  area_ha: number;
  ecosystem_type: string;
  feasibility_score: number;
  feasibility_category: string;
  created_at?: string;
};

export default function AdminAssessmentsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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
          router.push(`/${lang}/login`);
          return;
        }
        const me = await meRes.json();
        if (me.role !== "admin" && me.role !== "super_admin") {
          setError(isId ? "Akses ditolak" : "Access denied");
          setLoading(false);
          return;
        }

        // Catatan: backend hanya role "admin" yang dapat semua data.
        // super_admin mungkin hanya melihat punya sendiri sampai BE diupdate.
        const res = await fetch(`${API_URL}/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(isId ? "Gagal memuat data" : "Failed to load");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, router, isId]);

  const formatScore = (n: number) =>
    typeof n === "number" ? n.toFixed(1) : "-";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 tracking-tight mb-1">
          {isId ? "Semua Assessment" : "All Assessments"}
        </h1>
        <p className="text-emerald-900/50 font-medium text-sm">
          {isId
            ? "Daftar proyek dari seluruh user — untuk follow-up kerja sama"
            : "Projects from all users — for collaboration follow-up"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-2xl py-20 text-center">
          <FileText className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-900/50 font-medium">
            {isId ? "Belum ada assessment" : "No assessments yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-emerald-100/80 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {item.feasibility_category && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {item.feasibility_category}
                    </span>
                  )}
                  {item.user_id != null && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                      User ID: {item.user_id}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-emerald-950 truncate">
                  {item.location_name || "Unnamed Project"}
                </h3>
                <p className="text-sm text-emerald-900/40 font-medium mt-0.5">
                  {item.ecosystem_type?.replace(/_/g, " ")}
                  {item.area_ha != null && ` · ${Number(item.area_ha).toLocaleString()} ha`}
                  {item.created_at &&
                    ` · ${new Date(item.created_at).toLocaleDateString(
                      isId ? "id-ID" : "en-US"
                    )}`}
                </p>
              </div>

              <div className="text-center shrink-0 px-4">
                <p className="text-[11px] font-bold text-emerald-800/40 uppercase tracking-widest mb-1">
                  Score
                </p>
                <p className="text-2xl font-extrabold text-emerald-700">
                  {formatScore(item.feasibility_score)}
                </p>
              </div>

              <Link
                href={`/${lang}/dashboard/${item.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                {isId ? "Detail" : "View"}
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm font-medium">
        {isId
          ? "Catatan: Email user belum tersedia di API assessment. Minta backend menambahkan user_email / user_full_name agar admin bisa langsung menghubungi."
          : "Note: User email is not in the assessment API yet. Ask backend to add user_email / user_full_name so admin can contact clients directly."}
      </div>
    </div>
  );
}