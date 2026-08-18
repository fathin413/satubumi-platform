"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "../../../../../components/ScrollReveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  image_url?: string | null;
  created_at?: string;
  author?: string;
};

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content || "");
}

export default function InsightDetailPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const slug = (params?.slug as string) || "";
  const isId = lang === "id";

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const apiLang = lang === "en" ? "en" : "id";
        const res = await fetch(
          `${API_URL}/articles/?category=insight&lang=${apiLang}`
        );
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        setArticle(list.find((a) => a.slug === slug && a.status === "published") || null);
      } catch {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [lang, slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            {isId ? "Memuat Insight..." : "Loading Insight..."}
          </p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <span className="text-slate-400 font-bold text-2xl">?</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
          {isId ? "Tidak Ditemukan" : "Not Found"}
        </h2>
        <p className="text-slate-500 font-medium mb-8">
          {isId ? "Insight yang Anda cari tidak tersedia atau telah dihapus." : "The insight you are looking for is unavailable or has been deleted."}
        </p>
        <Link 
          href={`/${lang}/insights`} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          {isId ? "Kembali ke Insights" : "Back to Insights"}
        </Link>
      </main>
    );
  }

  const img = resolveImageUrl(article.image_url);

  return (
    <main className="bg-slate-50 min-h-screen pb-28 font-sans">
      <div className="bg-emerald-950 pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        {/* Header container disejajarkan dengan ukuran gambar (max-w-4xl) agar rata kiri */}
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <Link
              href={`/${lang}/insights`}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400/90 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Insights
            </Link>
            <ScrollReveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400 mb-4 bg-emerald-900/50 inline-block px-3 py-1 rounded-md border border-emerald-800/50">
                Insight Article
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-emerald-100/60 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xs font-bold">
                    {(article.author || "S").charAt(0).toUpperCase()}
                  </span>
                  {article.author || "Satubumi Team"}
                </span>
                {article.created_at && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                    <span>
                      {new Date(article.created_at).toLocaleDateString(
                        isId ? "id-ID" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {img && (
        <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-[21/9] bg-white">
            <img src={img} alt={article.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Kontainer teks dibungkus dalam max-w-4xl agar rata kiri mulus dengan ujung gambar */}
      <article className="max-w-4xl mx-auto px-6 mt-16">
        {/* Teks dibatasi dengan max-w-3xl tanpa mx-auto (berarti tetap menempel ke ujung kiri) */}
        <div className="max-w-3xl">
          <ScrollReveal>
            {isHtml(article.content) ? (
              <div
                className="prose prose-lg max-w-none text-slate-700 font-medium leading-relaxed
                           prose-headings:text-emerald-950 prose-headings:font-extrabold 
                           prose-a:text-emerald-600 hover:prose-a:text-emerald-700 
                           [&_p]:indent-8 [&_p]:text-justify [&_p]:mb-6
                           [&_div]:indent-8 [&_div]:text-justify [&_div]:mb-6
                           [&_h1]:text-3xl [&_h1]:mb-4 [&_h1]:mt-8
                           [&_h2]:text-2xl [&_h2]:mb-4 [&_h2]:mt-8
                           [&_h3]:text-xl [&_h3]:mb-3 [&_h3]:mt-6
                           [&_ul]:list-disc [&_ul]:pl-10 [&_ul]:mb-6 [&_ul_p]:indent-0
                           [&_ol]:list-decimal [&_ol]:pl-10 [&_ol]:mb-6 [&_ol_p]:indent-0
                           [&_li]:mb-2 [&_li]:pl-2 [&_li]:text-left"
                dangerouslySetInnerHTML={{ 
                  __html: article.content
                    .replace(/<br\s*\/?>/gi, "</p><p>")
                    .replace(/<p>\s*<\/p>/gi, "") 
                }}
              />
            ) : (
              <div className="space-y-6 text-lg text-slate-700 font-medium leading-relaxed text-justify">
                {article.content.split("\n").map((paragraph, idx) =>
                  paragraph.trim() ? (
                    <p key={idx} className="indent-8 mb-6">
                      {paragraph}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </ScrollReveal>

          {/* Tombol Action Bawah */}
          <div className="mt-20 pt-10 border-t border-slate-200">
            <Link
              href={`/${lang}/insights`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 hover:-translate-x-1 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {isId ? "Kembali Membaca Insights Lainnya" : "Back to Read More Insights"}
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}