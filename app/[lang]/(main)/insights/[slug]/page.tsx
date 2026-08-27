"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, Clock, ArrowUpRight, Tag, User as UserIcon } from "lucide-react";
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
  author_profile_image?: string | null;
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
  if (!topic) return isId ? "Artikel" : "Article";
  const t = TOPIC_LABELS[topic];
  return t ? (isId ? t.id : t.en) : topic;
}

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

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
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function RelatedCard({ item, lang, isId }: { item: Article; lang: string; isId: boolean }) {
  const img = resolveImageUrl(item.image_url) || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80";
  return (
    <Link
      href={`/${lang}/insights/${item.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
        <img
          src={img}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
          {topicLabel(item.topic, isId)}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-[1.1rem] md:text-[1.2rem] font-extrabold text-slate-900 leading-snug mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {item.title}
        </h2>
        <p className="text-[13.5px] text-slate-600 font-medium leading-relaxed flex-grow line-clamp-3 mb-4">
          {excerpt(item.content, 100)}
        </p>
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(item.created_at, lang)}</span>
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
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
              // Abaikan jika error
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
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            {isId ? "Memuat Artikel..." : "Loading Article..."}
          </p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <span className="text-slate-400 font-bold text-2xl">?</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
          {isId ? "Tidak Ditemukan" : "Not Found"}
        </h2>
        <p className="text-slate-500 font-medium mb-8">
          {isId
            ? "Artikel yang Anda cari tidak tersedia atau telah dihapus."
            : "The article you are looking for is unavailable or has been deleted."}
        </p>
        <Link
          href={`/${lang}/insights`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {isId ? "Kembali ke Artikel" : "Back to Articles"}
        </Link>
      </main>
    );
  }

  const img = resolveImageUrl(article.image_url) || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80";

  return (
    <main className="bg-[#FAFAFA] min-h-screen pb-28 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* ================= HERO SECTION ================= */}
      <section className="bg-emerald-950 pt-20 pb-12 md:pt-24 md:pb-14 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* KIRI: Judul Lengkap */}
            <div>
              <Link
                href={`/${lang}/insights`}
                className="inline-flex items-center gap-2 text-[12px] font-bold text-emerald-400 hover:text-white mb-8 transition-colors uppercase tracking-widest"
              >
                <ArrowLeft className="w-4 h-4" />
                {isId ? "Kembali" : "Back"}
              </Link>
              
              <ScrollReveal>
                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                  {article.title}
                </h1>
              </ScrollReveal>
            </div>

            {/* KANAN: Gambar Cover */}
            <ScrollReveal delay="delay-100">
              <div className="w-full aspect-[4/3] md:aspect-video lg:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 relative">
                <img
                  src={img}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent" />
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ================= BODY CONTENT & SIDEBAR ================= */}
      <section className="max-w-[1440px] mx-auto px-6 pt-10 pb-16 lg:pt-14 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* KIRI: Teks Deskripsi (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <ScrollReveal>
              <div className="w-full">
                {isHtml(article.content) ? (
                  <div
                    className="max-w-none text-slate-800 font-medium leading-[1.85] text-[17px] md:text-[18px]
                               [&_p]:text-justify [&_p]:mb-6
                               [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:mb-5 [&_h1]:mt-10
                               [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mb-5 [&_h2]:mt-10
                               [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-900 [&_h3]:mb-4 [&_h3]:mt-8
                               [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 
                               [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 
                               [&_li]:mb-2 [&_li]:pl-1 [&_li]:text-left
                               [&_strong]:font-bold [&_b]:font-bold
                               [&_em]:italic [&_i]:italic
                               [&_a]:text-emerald-600 [&_a]:underline hover:[&_a]:text-emerald-700"
                    dangerouslySetInnerHTML={{
                      __html: article.content,
                    }}
                  />
                ) : (
                  <div className="text-[17px] md:text-[18px] text-slate-800 font-medium leading-[1.85] text-justify">
                    {article.content.split("\n").map((paragraph, idx) =>
                      paragraph.trim() ? (
                        <p key={idx} className="mb-6">
                          {paragraph}
                        </p>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* KANAN: Sidebar Deskripsi Info Artikel (lg:col-span-4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <ScrollReveal delay="delay-200">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 flex flex-col">
                
                <h3 className="text-lg font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                  {isId ? "Informasi Artikel" : "Article Information"}
                </h3>

                {/* Author Info (Box kotak besar) */}
                <div className="flex flex-col mb-8">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm mb-5">
                    {article.author_profile_image ? (
                      <img
                        src={resolveImageUrl(article.author_profile_image) || ""}
                        alt={article.author || "Author"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-emerald-600/30" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {article.author || "Satubumi Team"}
                    </span>
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2.5">
                      {isId ? "Penulis" : "Author"}
                    </span>
                    
                  </div>
                </div>

                {/* List Informasi Tambahan (Diubah menjadi lebih rapat) */}
                <div className="flex flex-col gap-3">
                  {/* Tanggal */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-[13px] font-bold">{isId ? "Tanggal Publish" : "Published Date"}</span>
                    </div>
                    <span className="text-[13.5px] font-bold text-slate-900">
                      {formatDate(article.created_at, lang)}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-[13px] font-bold">{isId ? "Tayangan" : "Views"}</span>
                    </div>
                    <span className="text-[13.5px] font-bold text-slate-900">
                      {article.view_count?.toLocaleString(isId ? "id-ID" : "en-US") || 0}
                    </span>
                  </div>

                  {/* Tag/Kategori */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Tag className="w-4 h-4" />
                      <span className="text-[13px] font-bold">{isId ? "Kategori" : "Category"}</span>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest rounded-md">
                      {topicLabel(article.topic, isId)}
                    </span>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* ================= RELATED ARTICLES ================= */}
      {relatedArticles.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 pb-20">
          <div className="border-t border-slate-200/80 pt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {isId ? "Artikel Terkait" : "Related Articles"}
              </h3>
              <Link 
                href={`/${lang}/insights`}
                className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {isId ? "Lihat Semua" : "View All"} <ArrowRight className="w-4 h-4"/>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((item) => (
                <ScrollReveal key={item.id}>
                  <RelatedCard item={item} lang={lang} isId={isId} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}