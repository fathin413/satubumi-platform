"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Newspaper } from "lucide-react";
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
};

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function stripHtml(html: string) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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

export default function InsightsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [items, setItems] = useState<Article[]>([]);
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
        setItems(list.filter((a) => a.status === "published"));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  return (
    <main className="bg-slate-50 min-h-screen selection:bg-emerald-200 selection:text-emerald-950 font-sans pb-28">
      
      {/* Warna bg diubah menjadi bg-emerald-950 agar sama dengan Footer */}
      <div className="relative overflow-hidden bg-emerald-950 text-white pt-36 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
        <div className="relative z-10 max-w-[1200px] mx-auto text-center">
          <ScrollReveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400/90 mb-5">
              {isId ? "Pengetahuan & Analisis" : "Knowledge & Analysis"}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Insights
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              {isId
                ? "Perspektif ilmiah dan praktis seputar iklim, karbon, dan keberlanjutan."
                : "Scientific and practical perspectives on climate, carbon, and sustainability."}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 -mt-10 relative z-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 py-24 text-center shadow-sm">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {isId ? "Belum ada insight yang dipublikasikan." : "No insights published yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => {
              const img =
                resolveImageUrl(item.image_url) ||
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80";
              return (
                <ScrollReveal key={item.id} delay={`delay-${Math.min((i % 3) * 100, 300)}`}>
                  <Link
                    href={`/${lang}/insights/${item.slug}`}
                    className="group block h-full bg-white rounded-[1.75rem] border border-slate-200 overflow-hidden hover:border-emerald-200 hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.25)] transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-7">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          Insight
                        </span>
                        {item.created_at && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {formatDate(item.created_at, lang)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 leading-snug mb-3 group-hover:text-emerald-900 transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                        {excerpt(item.content)}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        {isId ? "Baca selengkapnya" : "Read more"}
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}