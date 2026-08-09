"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  TreePine,
  Map,
  Bird,
  Users,
  TrendingUp,
  Check,
  FileText,
} from "lucide-react";
import ScrollReveal from "../../../../components/ScrollReveal";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const icons = [TreePine, Map, Bird, Users, TrendingUp, FileText];

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
        className={`prose prose-emerald max-w-none prose-p:my-0 prose-p:leading-relaxed prose-strong:text-slate-900 prose-strong:font-bold ${className || ""}`}
        dangerouslySetInnerHTML={{ __html: descHtml }}
      />
    );
  }
  return <p className={className}>{desc}</p>;
}

function LargeCard({
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
  const Icon = icons[index % icons.length];

  return (
    <ScrollReveal delay="delay-100" className="md:col-span-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden relative shadow-sm border border-slate-200 group">
          <img
            src={getImage(service, index)}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>

        <div className="w-full bg-white p-8 lg:p-12 rounded-[2.5rem] border border-slate-200 hover:border-emerald-200 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)] transition-all duration-700 relative overflow-hidden group flex flex-col justify-start">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />

          <div className="relative z-10 w-full">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm shrink-0 group-hover:rotate-3">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#0a1118] leading-tight tracking-tight">
                {service.title}
              </h3>
            </div>

            <Description
              desc={service.desc}
              descHtml={service.descHtml}
              className="text-slate-600 leading-relaxed text-lg lg:text-xl font-medium"
            />

            {service.scopes.length > 0 && (
              <div className="bg-slate-50/80 rounded-3xl p-8 border border-slate-100 mt-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                  {scopeLabel}
                </h4>
                <ul className="space-y-4">
                  {service.scopes.map((scope, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors duration-500">
                        <Check
                          className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white transition-colors duration-500"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-slate-700 text-base leading-relaxed font-semibold">
                        {scope}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function SmallCard({
  service,
  index,
  getImage,
}: {
  service: ServiceItem;
  index: number;
  getImage: (item: ServiceItem, index: number) => string;
}) {
  const Icon = icons[index % icons.length];

  return (
    <ScrollReveal
      delay={`delay-${Math.min((index % 3) * 100 + 100, 500)}`}
      className="md:col-span-6"
    >
      <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 hover:border-emerald-200 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-700 flex flex-col group overflow-hidden relative h-full">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />

        <div className="w-full aspect-video mb-8 rounded-[1.5rem] overflow-hidden relative shadow-sm shrink-0 z-10 border border-slate-100 group-hover:border-emerald-200 transition-colors">
          <img
            src={getImage(service, index)}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>

        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm shrink-0 group-hover:-rotate-3">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-[#0a1118] leading-snug tracking-tight">
            {service.title}
          </h3>
        </div>

        <Description
          desc={service.desc}
          descHtml={service.descHtml}
          className="text-slate-600 leading-relaxed text-lg font-medium relative z-10"
        />

        {service.scopes.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
            <ul className="space-y-4">
              {service.scopes.map((scope, i) => (
                <li key={i} className="flex items-start gap-4">
                  <Check
                    className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
                    strokeWidth={3}
                  />
                  <span className="text-slate-700 text-[15px] leading-relaxed font-medium">
                    {scope}
                  </span>
                </li>
              ))}
            </ul>
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
      try {
        const res = await fetch(`${API_URL}/articles/`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];

        const published = list.filter(
          (a) => a.category === "services" && a.status === "published"
        );

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
  }, []);

  const getImage = (item: ServiceItem, index: number) =>
    resolveImageUrl(item.image_url, fallbackImages[index % fallbackImages.length]);

  const scopeLabel =
    t.scope_label || (lang === "id" ? "Ruang Lingkup:" : "Scope of Work:");

  // Pola: index % 3 === 0 → besar | selain itu → kecil (pasangan)
  const cards: React.ReactNode[] = [];
  for (let i = 0; i < services.length; i++) {
    if (i % 3 === 0) {
      cards.push(
        <LargeCard
          key={services[i].id}
          service={services[i]}
          index={i}
          scopeLabel={scopeLabel}
          getImage={getImage}
        />
      );
    } else if (i % 3 === 1) {
      cards.push(
        <SmallCard
          key={services[i].id}
          service={services[i]}
          index={i}
          getImage={getImage}
        />
      );
      if (services[i + 1]) {
        cards.push(
          <SmallCard
            key={services[i + 1].id}
            service={services[i + 1]}
            index={i + 1}
            getImage={getImage}
          />
        );
      }
    }
    // i % 3 === 2 sudah ikut di blok sebelumnya
  }

  return (
    <main className="bg-slate-50 min-h-screen selection:bg-emerald-200 selection:text-emerald-950 font-sans relative overflow-hidden pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-100/50 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-cyan-50/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 pt-40 md:pt-52">
        <ScrollReveal
          baseClass="opacity-0 translate-y-12"
          className="max-w-4xl mx-auto text-center mb-28"
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {cards}
          </div>
        )}
      </div>
    </main>
  );
}