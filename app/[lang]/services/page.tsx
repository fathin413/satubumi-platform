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
import ScrollReveal from "../../../components/ScrollReveal";
import en from "../../../dictionaries/en.json";
import id from "../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const icons = [TreePine, Map, Bird, Users, TrendingUp, FileText];

const images = [
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
  author: string;
  content: string;
  status: string;
  tags?: string;
};

/** Ambil deskripsi singkat + list scope dari content */
function parseContent(content: string) {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const scopeLines = lines.filter(
    (l) =>
      l.startsWith("-") ||
      l.startsWith("•") ||
      l.startsWith("*") ||
      l.match(/^\d+[\.\)]/)
  );

  const scopes = scopeLines.map((l) =>
    l.replace(/^[-•*]\s*/, "").replace(/^\d+[\.\)]\s*/, "")
  );

  const descLines = lines.filter(
    (l) =>
      !l.startsWith("-") &&
      !l.startsWith("•") &&
      !l.startsWith("*") &&
      !l.match(/^\d+[\.\)]/)
  );

  const desc = descLines.join(" ").trim() || content.slice(0, 220);

  return { desc, scopes };
}

export default function ServicesPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = (dict as any).services || {};

  const [services, setServices] = useState<
    { id: number; title: string; desc: string; scopes: string[] }[]
  >([]);
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
            const { desc, scopes } = parseContent(a.content || "");
            return {
              id: a.id,
              title: a.title,
              desc,
              scopes,
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

  const ServiceIcon0 = icons[0];
  const ServiceIcon1 = icons[1];

  return (
    <main className="bg-[#f8faf9] min-h-screen selection:bg-emerald-200 selection:text-emerald-950 font-sans relative overflow-hidden pt-32 pb-32">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-emerald-50/80 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-emerald-100/40 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header — tetap dari dictionary */}
        <ScrollReveal baseClass="opacity-0 translate-y-12" className="max-w-4xl mx-auto text-center mb-24">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-emerald-200/60 bg-white/60 backdrop-blur-md mb-8 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[13px] font-bold text-emerald-800 uppercase tracking-[0.2em]">
              {t.eyebrow || (lang === "id" ? "Pilar Keberlanjutan" : "Sustainability Pillars")}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-emerald-950 tracking-tight mb-8 leading-[1.1]">
            {t.title || (lang === "id" ? "Layanan" : "Our")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
              {t.title_highlight || (lang === "id" ? "Unggulan Kami" : "Services")}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-900/60 font-medium leading-relaxed max-w-3xl mx-auto">
            {t.subtitle ||
              (lang === "id"
                ? "Lima pilar layanan utama dengan integrasi keahlian teknis dan pendekatan berbasis data."
                : "Core service pillars integrating technical expertise and data-driven approaches.")}
          </p>
        </ScrollReveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-emerald-900/40 font-medium">
            {lang === "id"
              ? "Belum ada layanan yang dipublikasikan."
              : "No published services yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-fr">
            
            {/* KARTU 1 — besar (jika ada) */}
            {services[0] && (
              <ScrollReveal delay="delay-100" className="md:col-span-12 lg:col-span-8 h-full">
                <div className="h-full relative bg-white/80 backdrop-blur-xl p-8 lg:p-12 rounded-[2.5rem] border border-emerald-100/60 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(4,43,34,0.08)] transition-all duration-500 overflow-hidden group flex flex-col">
                  
                  <div className="w-full h-56 md:h-72 mb-10 rounded-[1.5rem] overflow-hidden relative shadow-sm border border-emerald-50">
                    <img
                      src={images[0]}
                      alt={services[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply transition-colors duration-500 group-hover:bg-transparent"></div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start relative z-10 flex-1">
                    <div className="flex flex-col h-full">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm border border-emerald-100 shrink-0">
                        <ServiceIcon0 className="w-8 h-8" />
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-extrabold text-emerald-950 mb-6 leading-tight">
                        {services[0].title}
                      </h3>
                      <p className="text-emerald-900/70 leading-relaxed text-lg font-medium">
                        {services[0].desc}
                      </p>
                    </div>

                    {services[0].scopes.length > 0 && (
                      <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 h-full flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-6">
                          {t.scope_label || (lang === "id" ? "Ruang Lingkup:" : "Scope of Work:")}
                        </h4>
                        <ul className="space-y-5">
                          {services[0].scopes.map((scope, i) => (
                            <li key={i} className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-white border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors duration-500">
                                <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white transition-colors duration-500" strokeWidth={3} />
                              </div>
                              <span className="text-emerald-950/80 text-base leading-snug font-semibold">
                                {scope}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* KARTU 2 */}
            {services[1] && (
              <ScrollReveal delay="delay-200" className="md:col-span-6 lg:col-span-4 h-full">
                <div className="h-full relative bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] border border-emerald-100/60 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(4,43,34,0.08)] transition-all duration-500 flex flex-col group">
                  
                  <div className="w-full h-48 mb-8 rounded-[1.25rem] overflow-hidden relative shadow-sm border border-emerald-50 shrink-0">
                    <img
                      src={images[1]}
                      alt={services[1].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply transition-colors duration-500 group-hover:bg-transparent"></div>
                  </div>

                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm border border-emerald-100 shrink-0">
                    <ServiceIcon1 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-950 mb-4 leading-snug">
                    {services[1].title}
                  </h3>
                  <p className="text-emerald-900/70 leading-relaxed text-[15px] font-medium mb-8">
                    {services[1].desc}
                  </p>
                  {services[1].scopes.length > 0 && (
                    <div className="mt-auto">
                      <div className="h-px w-full bg-emerald-100 mb-6"></div>
                      <ul className="space-y-3.5">
                        {services[1].scopes.map((scope, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" strokeWidth={3} />
                            <span className="text-emerald-950/80 text-[14px] leading-snug font-semibold">
                              {scope}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* KARTU 3+ */}
            {services.slice(2).map((service, index) => {
              const ServiceIcon = icons[(index + 2) % icons.length];
              const image = images[(index + 2) % images.length];
              return (
                <ScrollReveal
                  key={service.id}
                  delay={`delay-${Math.min((index + 3) * 100, 500)}`}
                  className="md:col-span-6 lg:col-span-4 h-full"
                >
                  <div className="h-full relative bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] border border-emerald-100/60 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(4,43,34,0.08)] transition-all duration-500 flex flex-col group">
                    
                    <div className="w-full h-48 mb-8 rounded-[1.25rem] overflow-hidden relative shadow-sm border border-emerald-50 shrink-0">
                      <img
                        src={image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply transition-colors duration-500 group-hover:bg-transparent"></div>
                    </div>

                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm border border-emerald-100 shrink-0">
                      <ServiceIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-950 mb-4 leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-emerald-900/70 leading-relaxed text-[15px] font-medium mb-8">
                      {service.desc}
                    </p>
                    {service.scopes.length > 0 && (
                      <div className="mt-auto">
                        <div className="h-px w-full bg-emerald-100 mb-6"></div>
                        <ul className="space-y-3.5">
                          {service.scopes.map((scope, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" strokeWidth={3} />
                              <span className="text-emerald-950/80 text-[14px] leading-snug font-semibold">
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
            })}
          </div>
        )}
      </div>
    </main>
  );
}