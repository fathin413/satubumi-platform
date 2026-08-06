"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import ScrollReveal from "../../../components/ScrollReveal";
import en from "../../../dictionaries/en.json";
import id from "../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Article = {
  id: number;
  category: string;
  title: string;
  content: string;
  status: string;
};

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = (dict as any).about;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        setArticles(
          list.filter((a) => a.category === "about" && a.status === "published")
        );
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const main = articles[0];

  return (
    <main className="bg-slate-50 min-h-screen selection:bg-emerald-200 selection:text-emerald-900 font-sans overflow-hidden">
      
      {/* Hero — label dari dictionary, judul bisa dari API */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 max-w-[1400px] mx-auto flex items-center z-10">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-emerald-300/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-300/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center w-full relative z-10">
          
          <ScrollReveal baseClass="opacity-0 -translate-x-12" className="max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-100/50 mb-8 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                {t?.eyebrow || (lang === "id" ? "Tentang Satubumi" : "About Satubumi")}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-950 leading-[1.1] mb-6">
              {main?.title ? (
                main.title
              ) : (
                <>
                  {t?.title_1}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
                    {t?.title_highlight}
                  </span>
                  <br className="hidden lg:block" /> {t?.title_2}
                </>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-emerald-950/70 font-medium leading-relaxed">
              {t?.label || (lang === "id" ? "Tentang Satubumi" : "About Satubumi")}
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay="delay-300" baseClass="opacity-0 translate-x-12">
            <div className="relative h-72 md:h-[32rem] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border border-white group">
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80"
                alt="Nature landscape"
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply pointer-events-none transition-colors duration-500 group-hover:bg-transparent"></div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-24 md:py-32 px-6 rounded-t-[3rem] relative z-20 border-t border-emerald-50 shadow-[0_-20px_40px_rgba(4,43,34,0.02)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-12 gap-16 md:gap-24 items-start">
            
            {/* Kiri: konten dari API */}
            <ScrollReveal className="md:col-span-12 lg:col-span-7 space-y-8 text-lg text-slate-600 leading-relaxed font-medium lg:sticky lg:top-32">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <div key={article.id} className="space-y-6">
                    {article.id !== main?.id && (
                      <h2 className="text-2xl font-extrabold text-emerald-950">
                        {article.title}
                      </h2>
                    )}
                    <div className="whitespace-pre-line text-lg text-slate-600 leading-relaxed font-medium">
                      {article.content}
                    </div>
                  </div>
                ))
              ) : (
                // Fallback dictionary kalau API kosong
                <>
                  <p className="text-2xl lg:text-3xl font-bold text-emerald-950 leading-snug tracking-tight">
                    {t?.intro}
                  </p>
                  <p>{t?.body_1}</p>
                  {t?.quote && (
                    <div className="pl-8 border-l-4 border-emerald-500 my-10 relative bg-emerald-50/50 p-8 rounded-r-[2rem]">
                      <p className="text-xl italic text-emerald-900 font-bold leading-relaxed relative z-10">
                        "{t.quote}"
                      </p>
                    </div>
                  )}
                  <p>{t?.body_2}</p>
                </>
              )}
            </ScrollReveal>

            {/* Kanan: Visi & Misi dari dictionary (struktur tetap) */}
            <div className="md:col-span-12 lg:col-span-5 space-y-8">
              
              <ScrollReveal delay="delay-300">
                <div className="bg-slate-50/50 border border-slate-200 rounded-[2.5rem] p-10 shadow-lg shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:bg-white group">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <p className="text-[14px] font-extrabold tracking-[0.2em] uppercase text-emerald-900/40">
                      {t?.vision_label || (lang === "id" ? "Visi Kami" : "Our Vision")}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-emerald-950 leading-relaxed">
                    {t?.vision}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay="delay-500">
                <div className="bg-emerald-600 rounded-[2.5rem] p-10 shadow-xl shadow-emerald-900/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500"></div>
                  
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm text-white group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-[14px] font-extrabold tracking-[0.2em] uppercase text-emerald-100">
                      {t?.mission_label || (lang === "id" ? "Misi Kami" : "Our Mission")}
                    </p>
                  </div>
                  
                  <ul className="space-y-5 relative z-10">
                    {(t?.missions || []).map((mission: string, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/50 border border-emerald-400/50 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-emerald-50 text-[16px] font-medium leading-relaxed">
                          {mission}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}