"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Clock, ArrowUpRight } from "lucide-react";
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
  author?: string | null;
  topic?: string | null;
  view_count?: number;
};

const TOPIC_LABELS: Record<string, { id: string; en: string }> = {
  carbon: { id: "Karbon", en: "Carbon" },
  esg: { id: "ESG", en: "ESG" },
  policy: { id: "Kebijakan", en: "Policy" },
  nature: { id: "Alam & Bentang", en: "Nature & Landscape" },
  other: { id: "Lainnya", en: "Other" },
};

function topicLabel(topic: string | null | undefined, isId: boolean) {
  if (!topic) return isId ? "Insight" : "Insight";
  const t = TOPIC_LABELS[topic];
  return t ? (isId ? t.id : t.en) : topic;
}

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Mengecek apakah teks mengandung tag HTML
function isHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content || "");
}

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(content: string, max = 120) {
  const plain = /<\/?[a-z]/i.test(content) ? stripHtml(content) : content;
  if (plain.length <= max) return plain;
  return plain.slice(0, max).trim() + "…";
}

function formatDate(iso?: string, lang?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Komponen Kartu untuk Artikel Terkait
function RelatedCard({ item, lang, isId }: { item: Article; lang: string; isId: boolean }) {
  const img = resolveImageUrl(item.image_url) || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80";
  return (
    <Link
      href={`/${lang}/insights/${item.slug}`}
      className="group flex flex-col h-full bg-white rounded-[1.25rem] border border-stone-200/80 overflow-hidden transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_20px_45px_-20px_rgba(6,78,59,0.25)] hover:-translate-y-1"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-stone-100">
        <img
          src={img}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        <span className="absolute top-3.5 left-3.5 inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-emerald-800 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm">
          {topicLabel(item.topic, isId)}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 text-[11px] font-medium text-stone-400 mb-3">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{item.view_count || 0}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-stone-300" />
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(item.created_at, lang)}</span>
          </div>
        </div>
        <h2 className="text-[1.1rem] md:text-[1.2rem] font-extrabold text-stone-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {item.title}
        </h2>
        <p className="text-[12px] font-bold text-emerald-800/80 mb-3 tracking-wide">
          {item.author || "Satubumi Team"}
        </p>
        <p className="text-[13.5px] text-stone-600 font-medium leading-relaxed flex-grow line-clamp-3">
          {excerpt(item.content, 120)}
        </p>
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[12px] font-bold text-emerald-900 group-hover:text-emerald-600 transition-colors">
            {isId ? "Baca selengkapnya" : "Read the story"}
          </span>
          <span className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 transition-all">
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function InsightDetailPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const slug = (params?.slug as string) || "";
  const isId = lang === "id";

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const viewedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      viewedRef.current = false;
      try {
        const apiLang = lang === "en" ? "en" : "id";
        const res = await fetch(
  `${API_URL}/articles/?category=insight&lang=${apiLang}`,
  { cache: "no-store" }
);
        if (!res.ok) throw new Error("fail");
        
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        const found = list.find((a) => a.slug === slug && a.status === "published") || null;
        setArticle(found);

        if (found) {
          const others = list.filter((a) => a.slug !== slug && a.status === "published");
          const sameTopic = others.filter((a) => a.topic === found.topic);
          const diffTopic = others.filter((a) => a.topic !== found.topic);
          
          const combinedRelated = [...sameTopic, ...diffTopic].slice(0, 3);
          setRelatedArticles(combinedRelated);
        }

        if (found?.id && typeof window !== "undefined") {
          const key = `viewed-insight-${found.id}`;
          if (!sessionStorage.getItem(key) && !viewedRef.current) {
            viewedRef.current = true;
            sessionStorage.setItem(key, "1");
            try {
              const viewRes = await fetch(`${API_URL}/articles/${found.id}/view`, { method: "POST" });
              if (viewRes.ok) {
                const updated = await viewRes.json();
                setArticle((prev) =>
                  prev
                    ? {
                        ...prev,
                        view_count: updated.view_count ?? (prev.view_count || 0) + 1,
                      }
                    : prev
                );
              }
            } catch {
              // diamkan jika BE offline
            }
          }
        }
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
          {isId
            ? "Insight yang Anda cari tidak tersedia atau telah dihapus."
            : "The insight you are looking for is unavailable or has been deleted."}
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
    <main className="bg-[#f7f6f2] min-h-screen pb-28 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* HEADER SECTION */}
      <div className="bg-emerald-950 pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-full">
            <Link
              href={`/${lang}/insights`}
              className="inline-flex items-center gap-2 text-[13px] font-bold text-emerald-400/90 hover:text-white mb-8 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              {isId ? "Kembali" : "Back"}
            </Link>
            
            <ScrollReveal>
              <div className="mb-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-900 mb-4 bg-emerald-400 inline-block px-3 py-1.5 rounded-md shadow-sm">
                  {topicLabel(article.topic, isId)}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.15] mb-8">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-emerald-100/70 text-sm font-medium">
                <span className="flex items-center gap-2.5 text-white font-bold">
                  <span className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {(article.author || "S").charAt(0).toUpperCase()}
                  </span>
                  {article.author || "Satubumi Team"}
                </span>
                
                {article.created_at && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>
                      {new Date(article.created_at).toLocaleDateString(
                        isId ? "id-ID" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </>
                )}
                
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {article.view_count ?? 0} {isId ? "Tayangan" : "Views"}
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* GAMBAR COVER ARTIKEL */}
      {img && (
        <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
          <div className="rounded-[1.5rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-4 border-white aspect-[21/9] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* BODY KONTEN ARTIKEL */}
      <article className="max-w-4xl mx-auto px-6 mt-16">
        <div className="w-full">
          <ScrollReveal>
            {isHtml(article.content) ? (
              <div
                // KUNCI PERBAIKAN: Menambahkan dukungan Tailwind Arbitrary Variant untuk Style Rich Text 
                className="max-w-none text-stone-800 font-medium leading-[1.85]
                           [&_p]:text-justify [&_p]:mb-7
                           [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-emerald-950 [&_h1]:mb-5 [&_h1]:mt-10
                           [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-emerald-950 [&_h2]:mb-5 [&_h2]:mt-10
                           [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-emerald-950 [&_h3]:mb-4 [&_h3]:mt-8
                           [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-7 
                           [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-7 
                           [&_li]:mb-2 [&_li]:pl-1 [&_li]:text-left
                           [&_strong]:font-bold [&_b]:font-bold
                           [&_em]:italic [&_i]:italic
                           [&_u]:underline
                           [&_a]:text-emerald-600 [&_a]:underline hover:[&_a]:text-emerald-700"
                // .replace() dihapus agar tidak merusak struktur HTML bawaan Tiptap
                dangerouslySetInnerHTML={{
                  __html: article.content,
                }}
              />
            ) : (
              <div className="text-lg text-stone-800 font-medium leading-[1.85] text-justify">
                {article.content.split("\n").map((paragraph, idx) =>
                  paragraph.trim() ? (
                    <p key={idx} className="mb-7">
                      {paragraph}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </ScrollReveal>

          {/* TOMBOL KEMBALI */}
          <div className="mt-16 pt-8 pb-4 border-t border-stone-200">
            <Link
              href={`/${lang}/insights`}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-stone-200/50 text-stone-700 font-bold hover:bg-emerald-100 hover:text-emerald-800 hover:-translate-x-1 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {isId ? "Kembali Membaca Insights" : "Back to Insights"}
            </Link>
          </div>
        </div>
      </article>

      {/* ================= RELATED ARTICLES (BACA JUGA) ================= */}
      {relatedArticles.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 mt-12 mb-10">
          <div className="border-t-2 border-stone-200/60 pt-12">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
                {isId ? "Baca Juga" : "Related Insights"}
              </h3>
              <Link 
                href={`/${lang}/insights`}
                className="hidden sm:inline-flex text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                {isId ? "Lihat Semua" : "View All"} &rarr;
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((item) => (
                <RelatedCard key={item.id} item={item} lang={lang} isId={isId} />
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}