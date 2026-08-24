"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  Newspaper,
  Star,
  Users,
  Clock,
  TrendingUp,
  Tag,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
import ScrollReveal from "../../../../components/ScrollReveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

type Article = {
  id: number;
  category: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  image_url?: string | null;
  created_at?: string;
  author?: string | null;
  topic?: string | null;
  is_featured?: boolean;
  view_count?: number;
};

type TopAuthor = { author: string; count: number };
type TopicItem = { topic: string; count: number };

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

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(content: string, max = 160) {
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

// Kartu untuk grid "Seluruh Insights"
function InsightCard({
  item,
  lang,
  isId,
  index,
}: {
  item: Article;
  lang: string;
  isId: boolean;
  index: number;
}) {
  const img =
    resolveImageUrl(item.image_url) ||
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80";

  return (
    <ScrollReveal delay={`delay-${Math.min((index % 2) * 100, 300)}`} className="h-full">
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
          {item.is_featured && (
            <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm">
              <Star className="w-3 h-3 fill-current" />
              Top
            </span>
          )}
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
    </ScrollReveal>
  );
}

export default function InsightsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [items, setItems] = useState<Article[]>([]);
  const [topInsights, setTopInsights] = useState<Article[]>([]);
  const [topAuthors, setTopAuthors] = useState<TopAuthor[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);

  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const apiLang = lang === "en" ? "en" : "id";
      const topicQ = activeTopic ? `&topic=${encodeURIComponent(activeTopic)}` : "";

      try {
        const [listRes, authorsRes, topicsRes] = await Promise.all([
          fetch(`${API_URL}/articles/?category=insight&lang=${apiLang}${topicQ}`),
          fetch(`${API_URL}/articles/insights/top-authors?limit=5`),
          fetch(`${API_URL}/articles/insights/topics`),
        ]);

        const list = listRes.ok ? await listRes.json() : [];
        const authors = authorsRes.ok ? await authorsRes.json() : [];
        const tops = topicsRes.ok ? await topicsRes.json() : [];

        // Filter Published Articles
        const publishedArticles = Array.isArray(list)
          ? list.filter((a: Article) => a.status === "published")
          : [];

        // Logika Top Views: Urutkan murni dari View Count Tertinggi (Descending)
        const sortedByViews = [...publishedArticles].sort(
          (a, b) => (b.view_count || 0) - (a.view_count || 0)
        );

        setItems(publishedArticles.sort((a, b) => b.id - a.id)); // Standar list diurutkan dari ID/terbaru
        setTopInsights(sortedByViews.slice(0, 4)); // Ambil 4 teratas view untuk Headline(1) dan Sidebar(3)
        setTopAuthors(Array.isArray(authors) ? authors : []);
        setTopics(Array.isArray(tops) ? tops : []);
      } catch {
        setItems([]);
        setTopInsights([]);
        setTopAuthors([]);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, activeTopic]);

  const filterTopics: TopicItem[] =
    topics.length > 0
      ? topics
      : Object.keys(TOPIC_LABELS).map((t) => ({ topic: t, count: 0 }));

  // Pencarian (Search Bar Filter)
  const displayedArticles = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      excerpt(item.content).toLowerCase().includes(q)
    );
  });

  // Memisahkan data untuk layout Editorial
  const featuredArticle = topInsights.length > 0 ? topInsights[0] : null;
  const sidebarPicks = topInsights.length > 1 ? topInsights.slice(1, 4) : [];

  return (
    <main className="bg-[#f7f6f2] min-h-screen selection:bg-emerald-200 selection:text-emerald-950 font-sans pb-28">
      {/* ================= HEADER HIJAU EKSKLUSIF ================= */}
      <div className="relative overflow-hidden bg-emerald-950 text-white pt-36 pb-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.2),_transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(4,20,15,0.6))] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="w-6 h-px bg-emerald-400/60" />
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400/90">
                {isId ? "Pengetahuan & Analisis" : "Knowledge & Analysis"}
              </p>
              <span className="w-6 h-px bg-emerald-400/60" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Insights
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/80 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              {isId
                ? "Perspektif ilmiah dan praktis seputar iklim, karbon, dan keberlanjutan."
                : "Scientific and practical perspectives on climate, carbon, and sustainability."}
            </p>

            {/* MESIN PENCARIAN DI TENGAH HEADER */}
            <div className="relative w-full max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder={isId ? "Cari wawasan, topik, atau penulis..." : "Search insights, topics, or authors..."}
                className="w-full pl-14 pr-6 py-4 bg-white rounded-full text-[15px] font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 -mt-12 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <div className="w-9 h-9 border-[3px] border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-stone-400">
              {isId ? "Memuat insights…" : "Loading insights…"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            {/* ================= KOLOM KIRI (MAIN CONTENT) ================= */}
            <div className="w-full lg:w-2/3 flex flex-col gap-10">
              
              {/* FEATURED: HIGHEST VIEWS (Hanya tampil jika tidak ada filter aktif & pencarian kosong) */}
              {!activeTopic && !searchQuery && featuredArticle && (
                <ScrollReveal>
                  <div className="bg-white rounded-[1.75rem] border border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="flex items-center gap-2 px-6 md:px-8 pt-6 md:pt-8">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-900">
                        {isId ? "Paling Banyak Dibaca" : "Most Viewed"}
                      </h2>
                    </div>

                    <Link
                      href={`/${lang}/insights/${featuredArticle.slug}`}
                      className="group block px-6 md:px-8 pb-6 md:pb-8 pt-5"
                    >
                      <div className="relative w-full aspect-[16/10] md:aspect-[2/1] rounded-[1.25rem] overflow-hidden bg-stone-100 mb-6">
                        <img
                          src={
                            resolveImageUrl(featuredArticle.image_url) ||
                            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
                          }
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                        <div className="absolute top-5 left-5">
                          <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm text-emerald-800 text-[11px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                            {topicLabel(featuredArticle.topic, isId)}
                          </span>
                        </div>
                        <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">
                          <Eye className="w-3.5 h-3.5" />
                          {featuredArticle.view_count || 0} {isId ? "Tayangan" : "Views"}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl lg:text-[2.35rem] font-extrabold text-stone-900 leading-[1.2] mb-4 group-hover:text-emerald-700 transition-colors tracking-tight">
                        {featuredArticle.title}
                      </h3>

                      <p className="text-base text-stone-600 font-medium leading-relaxed mb-7 line-clamp-3 max-w-2xl">
                        {excerpt(featuredArticle.content, 250)}
                      </p>

                      <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
                            {featuredArticle.author ? featuredArticle.author.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-stone-900">
                              {featuredArticle.author || "Satubumi Team"}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatDate(featuredArticle.created_at, lang)}</span>
                            </div>
                          </div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-extrabold text-emerald-900 group-hover:text-emerald-600 transition-colors shrink-0">
                          {isId ? "Baca artikel" : "Read article"}
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </ScrollReveal>
              )}

              {/* DAFTAR SELURUH INSIGHTS (Didalam Kanvas Putih Bersih) */}
              <div className="bg-white rounded-[1.75rem] border border-stone-200/80 p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                {/* Header Container */}
                <div className="flex items-center gap-2 border-b border-stone-100 pb-5 mb-8">
                  <Newspaper className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-xs md:text-[13px] font-extrabold uppercase tracking-[0.2em] text-emerald-900">
                    {searchQuery
                      ? (isId ? "Hasil Pencarian" : "Search Results")
                      : activeTopic
                      ? topicLabel(activeTopic, isId)
                      : isId
                      ? "Seluruh Publikasi"
                      : "All Publications"}
                  </h2>
                  <span className="text-xs font-medium text-stone-400">
                    ({displayedArticles.length})
                  </span>
                </div>

                {displayedArticles.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto mb-4">
                      <Newspaper className="w-6 h-6 text-stone-300" />
                    </div>
                    <p className="text-stone-500 font-medium text-sm">
                      {isId
                        ? "Tidak ada artikel yang sesuai dengan pencarian."
                        : "No articles match your search."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
                    {displayedArticles.map((item, i) => (
                      <InsightCard key={item.id} item={item} lang={lang} isId={isId} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ================= KOLOM KANAN (SIDEBAR WIDGETS) ================= */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              
              {/* WIDGET 1: KATEGORI / TOP TOPICS (Interaktif Filter) */}
              <ScrollReveal className="bg-white rounded-[1.75rem] border border-stone-200/80 p-6 md:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-900">
                    {isId ? "Eksplorasi Topik" : "Explore Topics"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setActiveTopic(null);
                      setSearchQuery("");
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                      activeTopic === null
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/20"
                        : "bg-stone-50 hover:bg-emerald-50 border-stone-200 hover:border-emerald-300 text-stone-600 hover:text-emerald-800"
                    }`}
                  >
                    {isId ? "Semua" : "All"}
                  </button>
                  {filterTopics.map((t) => (
                    <button
                      key={t.topic}
                      onClick={() => {
                        setActiveTopic(t.topic);
                        setSearchQuery("");
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                        activeTopic === t.topic
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/20"
                          : "bg-stone-50 hover:bg-emerald-50 border-stone-200 hover:border-emerald-300 text-stone-600 hover:text-emerald-800"
                      }`}
                    >
                      {topicLabel(t.topic, isId)} {t.count > 0 ? `(${t.count})` : ""}
                    </button>
                  ))}
                </div>
              </ScrollReveal>

              {/* WIDGET 2: TRENDING VIEWS (EDITOR'S PICKS) */}
              {sidebarPicks.length > 0 && (
                <ScrollReveal className="bg-white rounded-[1.75rem] border border-stone-200/80 p-6 md:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-5">
                    <span className="relative flex w-2 h-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-900">
                      {isId ? "Sedang Tren" : "Trending Now"}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-5">
                    {sidebarPicks.map((article, idx) => (
                      <Link
                        key={`side-${article.id}`}
                        href={`/${lang}/insights/${article.slug}`}
                        className="group flex items-start gap-3.5"
                      >
                        <span className="text-2xl font-black text-stone-200 group-hover:text-emerald-300 transition-colors w-6 shrink-0 leading-none pt-0.5">
                          {idx + 2}
                        </span>
                        <div className="flex flex-col gap-1.5 w-full min-w-0">
                          <h4 className="text-[13.5px] font-extrabold text-stone-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {formatDate(article.created_at, lang)}
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Eye className="w-3.5 h-3.5" />
                              {article.view_count || 0}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {/* WIDGET 3: TOP AUTHORS */}
              {topAuthors.length > 0 && (
                <ScrollReveal className="bg-white rounded-[1.75rem] border border-stone-200/80 p-6 md:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-900">
                      {isId ? "Penulis Utama" : "Top Authors"}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {topAuthors.slice(0, 5).map((a) => (
                      <div
                        key={a.author}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all cursor-default"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-extrabold text-sm shrink-0">
                            {a.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13.5px] font-extrabold text-stone-800 truncate">
                              {a.author}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                              {a.count} {isId ? "Artikel" : "Articles"}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}