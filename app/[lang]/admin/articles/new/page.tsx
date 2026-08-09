"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleForm from "../../../../../components/admin/ArticleForm";

export default function NewArticlePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

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
        {isId ? "Buat Artikel" : "Create Article"}
      </h1>
      <p className="text-emerald-900/50 font-medium text-sm mb-8">
        {isId ? "Isi form lalu simpan" : "Fill the form and save"}
      </p>

      <ArticleForm mode="create" />
    </div>
  );
}