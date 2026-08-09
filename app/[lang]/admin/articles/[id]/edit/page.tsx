"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleForm from "../../../../../../components/admin/ArticleForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function EditArticlePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const id = Number(params?.id);
  const isId = lang === "id";

  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/${id}`);
        if (!res.ok) throw new Error("Not found");
        setArticle(await res.json());
      } catch {
        setError(isId ? "Artikel tidak ditemukan" : "Article not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, isId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-600 font-medium mb-4">{error}</p>
        <Link href={`/${lang}/admin/articles`} className="text-emerald-700 font-bold">
          {isId ? "Kembali" : "Back"}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/${lang}/admin/articles`}
        className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800/60 hover:text-emerald-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {isId ? "Kembali ke daftar" : "Back to list"}
      </Link>

      <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 mb-2">
        {isId ? "Edit Artikel" : "Edit Article"}
      </h1>
      <p className="text-emerald-900/50 font-medium text-sm mb-8 truncate">
        {article.title}
      </p>

      <ArticleForm mode="edit" articleId={id} initial={article} />
    </div>
  );
}