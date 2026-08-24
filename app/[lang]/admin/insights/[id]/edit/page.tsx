"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import InsightForm from "../../../../../../components/admin/InsightForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function EditInsightPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";
  const id = params?.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/${id}`);
        if (!res.ok) throw new Error("Not found");
        setData(await res.json());
      } catch {
        setError(isId ? "Gagal memuat data insight" : "Failed to load insight data");
      }
    };
    if (id) load();
  }, [id, isId]);

  if (error) {
    return (
      <div className="p-8">
        <Link
          href={`/${lang}/admin/insights`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {isId ? "Kembali ke daftar" : "Back to list"}
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
           {isId ? "Menyiapkan Data..." : "Preparing Data..."}
        </p>
      </div>
    );
  }

  return (
    // Padding top dikurangi drastis (pt-2) agar form naik mendekati batas atas
    <div className="max-w-4xl mx-auto pt-2 pb-12">
      <Link
        href={`/${lang}/admin/insights`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isId ? "Kembali ke Daftar Insight" : "Back to Insight List"}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <BookOpenCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isId ? "Edit Insight" : "Edit Insight"}
          </h1>
          <p className="text-slate-500 font-medium text-[15px] mt-1">
            {isId ? "Perbarui informasi dan konten artikel publikasi." : "Update insight information and content."}
          </p>
        </div>
      </div>

      <InsightForm mode="edit" initial={data} />
    </div>
  );
}