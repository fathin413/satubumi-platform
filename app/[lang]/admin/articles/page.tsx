"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, ExternalLink } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

type Article = {
  id: number;
  category: string;
  title: string;
  slug: string;
  author: string;
  status: string;
  image_url?: string | null;
};

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function AdminArticlesListPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "about" | "services" | "general">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = () => localStorage.getItem("access_token");

  const loadArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/articles/`);
      if (!res.ok) throw new Error(isId ? "Gagal memuat artikel" : "Failed to load");
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(isId ? "Hapus artikel ini?" : "Delete this article?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered =
    filter === "all" ? articles : articles.filter((a) => a.category === filter);

  const publicPath = (a: Article) => {
    if (a.category === "about") return `/${lang}/about`;
    if (a.category === "services") return `/${lang}/services`;
    return `/${lang}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 tracking-tight mb-1">
            {isId ? "Daftar Konten" : "Content List"}
          </h1>
          <p className="text-emerald-900/50 font-medium text-sm">
            {isId
              ? "Semua artikel About & Services"
              : "All About & Services articles"}
          </p>
        </div>

        <Link
          href={`/${lang}/admin/articles/new`}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          {isId ? "Buat Artikel" : "Create Article"}
        </Link>
      </div>

      {/* Filter nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["all", isId ? "Semua" : "All"],
            ["about", "About"],
            ["services", "Services"],
            ["general", "General"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              filter === key
                ? "bg-emerald-600 text-white"
                : "bg-white border border-emerald-100 text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-2xl py-20 text-center">
          <FileText className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-900/50 font-medium mb-6">
            {isId ? "Belum ada artikel" : "No articles yet"}
          </p>
          <Link
            href={`/${lang}/admin/articles/new`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl"
          >
            <Plus className="w-5 h-5" />
            {isId ? "Buat Artikel" : "Create Article"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => {
            const img = resolveImageUrl(article.image_url);
            return (
              <div
                key={article.id}
                className="bg-white border border-emerald-100/80 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-sm"
              >
                {img ? (
                  <div className="w-full md:w-28 aspect-video rounded-xl overflow-hidden border border-emerald-100 shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="hidden md:flex w-28 aspect-video rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-emerald-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {article.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        article.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 truncate">
                    {article.title}
                  </h3>
                  <p className="text-sm text-emerald-900/40 font-medium mt-0.5">
                    {article.author} · {article.slug}
                  </p>
                </div>

                {/* Nav actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {article.status === "published" && (
                    <Link
                      href={publicPath(article)}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isId ? "Lihat" : "View"}
                    </Link>
                  )}
                  <Link
                    href={`/${lang}/admin/articles/${article.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                    className="p-2.5 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}