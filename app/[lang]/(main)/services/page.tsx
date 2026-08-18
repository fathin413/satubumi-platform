"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import ScrollReveal from "../../../../components/ScrollReveal";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const fallbackImages = [
  "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?q=80&w=800&auto=format&fit=crop",
];

type Article = {
  id: number;
  category: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  image_url?: string | null;
};

type ServiceItem = {
  id: number;
  title: string;
  desc: string;
  descHtml: string;
  scopes: string[];
  image_url?: string | null;
};

function resolveImageUrl(url?: string | null, fallback?: string) {
  if (!url) return fallback || "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseContent(content: string) {
  if (!content) return { desc: "", descHtml: "", scopes: [] as string[] };

  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    const scopes: string[] = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    while ((match = liRegex.exec(content)) !== null) {
      const text = stripHtml(match[1]);
      if (text) scopes.push(text);
    }

    const withoutLists = content
      .replace(/<ul[\s\S]*?<\/ul>/gi, "")
      .replace(/<ol[\s\S]*?<\/ol>/gi, "");

    const descHtml = withoutLists.trim();
    const desc = stripHtml(withoutLists) || stripHtml(content).slice(0, 220);

    return { desc, descHtml, scopes };
  }

  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const scopeLines = lines.filter(
    (l) =>
      l.startsWith("-") ||
      l.startsWith("•") ||
      l.startsWith("*") ||
      /^\d+[\.\)]/.test(l)
  );

  const scopes = scopeLines.map((l) =>
    l.replace(/^[-•*]\s*/, "").replace(/^\d+[\.\)]\s*/, "")
  );

  const descLines = lines.filter(
    (l) =>
      !l.startsWith("-") &&
      !l.startsWith("•") &&
      !l.startsWith("*") &&
      !/^\d+[\.\)]/.test(l)
  );

  const desc = descLines.join(" ").trim() || content.slice(0, 220);

  return { desc, descHtml: "", scopes };
}

function Description({
  desc,
  descHtml,
  className,
}: {
  desc: string;
  descHtml: string;
  className?: string;
}) {
  if (descHtml) {
    return (
      <div
        className={`prose prose-emerald max-w-none prose-p:my-0 prose-p:leading-relaxed prose-strong:text-emerald-950 prose-strong:font-bold ${className || ""}`}
        dangerouslySetInnerHTML={{ __html: descHtml }}
      />
    );
  }
  return <p className={className}>{desc}</p>;
}

function ServiceCard({
  service,
  index,
  scopeLabel,
  getImage,
}: {
  service: ServiceItem;
  index: number;
  scopeLabel: string;
  getImage: (item: ServiceItem, index: number) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ScrollReveal
      delay={`delay-${Math.min((index % 3) * 100 + 100, 300)}`}
      className="w-full" /* h-full dihapus agar kartu di sebelahnya tidak ikut melar */
    >
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-200 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-500 flex flex-col group relative">
        
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />

        <div 
          className="w-full aspect-[4/3] mb-6 rounded-[1.25rem] overflow-hidden relative shadow-sm shrink-0 border border-slate-100 group-hover:border-emerald-200 transition-colors cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <img
            src={getImage(service, index)}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>

        <h3 
          className="text-xl md:text-2xl font-extrabold text-emerald-700 leading-snug tracking-tight mb-4 relative z-10 group-hover:text-emerald-950 transition-colors cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {service.title}
        </h3>

        {/* line-clamp-3 dihapus agar deskripsi tampil penuh dan tidak terpotong "..." */}
        <div className="mb-6 relative z-10">
          <Description
            desc={service.desc}
            descHtml={service.descHtml}
            className="text-slate-600 leading-relaxed text-[15px] font-medium"
          />
        </div>

        {service.scopes.length > 0 && (
          <div className="relative z-10 mt-auto flex flex-col pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full group/toggle outline-none"
            >
              <span className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.15em] group-hover/toggle:text-emerald-600 transition-colors">
                {scopeLabel}
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? "bg-emerald-50 text-emerald-600 rotate-180" : "bg-slate-50 text-slate-400 group-hover/toggle:bg-emerald-50 group-hover/toggle:text-emerald-600"}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            <div 
              className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 mt-0"
              }`}
            >
              <div className="overflow-hidden">
                <ul className="space-y-4 pb-2">
                  {service.scopes.map((scope, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        className="w-[18px] h-[18px] text-emerald-500 shrink-0 mt-[3px]"
                        strokeWidth={3}
                      />
                      <span className="text-slate-600 text-[14.5px] leading-relaxed font-semibold">
                        {scope}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
}

export default function ServicesPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = (dict as any).services || {};

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const apiLang = lang === "en" ? "en" : "id";
        const res = await fetch(`${API_URL}/articles/?lang=${apiLang}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];

        const published = list
          .filter((a) => a.category === "services" && a.status === "published")
          .sort((a, b) => a.id - b.id);

        setServices(
          published.map((a) => {
            const { desc, descHtml, scopes } = parseContent(a.content || "");
            return {
              id: a.id,
              title: a.title,
              desc,
              descHtml,
              scopes,
              image_url: a.image_url || null,
            };
          })
        );
      } catch {
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  const getImage = (item: ServiceItem, index: number) =>
    resolveImageUrl(item.image_url, fallbackImages[index % fallbackImages.length]);

  const scopeLabel =
    t.scope_label || (lang === "id" ? "Ruang Lingkup:" : "Scope of Work:");

  return (
    <main className="bg-slate-50 min-h-screen selection:bg-emerald-200 selection:text-emerald-950 font-sans relative overflow-hidden pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-100/50 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-cyan-50/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 pt-28 md:pt-36">
        <ScrollReveal
          baseClass="opacity-0 translate-y-12"
          className="max-w-4xl mx-auto text-center mb-20 md:mb-24"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-slate-200 bg-white mb-10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              {t.eyebrow ||
                (lang === "id" ? "Pilar Keberlanjutan" : "Sustainability Pillars")}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-extrabold text-[#0a1118] tracking-tight mb-8 leading-[1.05]">
            {t.title || (lang === "id" ? "Layanan" : "Our")}{" "}
            <span className="font-serif italic font-light text-emerald-600">
              {t.title_highlight || (lang === "id" ? "Unggulan" : "Services")}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
            {t.subtitle ||
              (lang === "id"
                ? "Lima pilar layanan utama dengan integrasi keahlian teknis dan pendekatan berbasis data."
                : "Core service pillars integrating technical expertise and data-driven approaches.")}
          </p>
        </ScrollReveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">
            {lang === "id"
              ? "Belum ada layanan yang dipublikasikan."
              : "No published services yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                scopeLabel={scopeLabel}
                getImage={getImage}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}