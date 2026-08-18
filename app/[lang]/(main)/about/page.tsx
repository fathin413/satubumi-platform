"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ScrollReveal from "../../../../components/ScrollReveal";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80";
const FALLBACK_BODY =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80";
const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
];

type Article = {
  id: number;
  category: string;
  title: string;
  content: string;
  status: string;
  slug?: string;
  image_url?: string | null;
};

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isHtmlContent(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content || "");
}

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMissionList(content: string): string[] {
  if (!content) return [];
  if (isHtmlContent(content)) {
    const items: string[] = [];
    const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = re.exec(content)) !== null) {
      const text = stripHtml(m[1]);
      if (text) items.push(text);
    }
    if (items.length) return items;
    const plain = stripHtml(content);
    return plain ? [plain] : [];
  }
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.startsWith("-") ||
        l.startsWith("•") ||
        l.startsWith("*") ||
        /^\d+[\.\)]/.test(l)
    )
    .map((l) => l.replace(/^[-•*]\s*/, "").replace(/^\d+[\.\)]\s*/, ""));
}

function ArticleBody({ content }: { content: string }) {
  if (!content) return null;
  if (isHtmlContent(content)) {
    return (
      <div
        className="prose prose-lg max-w-none text-slate-600 font-medium leading-relaxed
          prose-p:mb-5 prose-p:leading-relaxed
          prose-strong:text-emerald-950 prose-strong:font-bold
          prose-ul:my-4 prose-li:marker:text-emerald-600"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <div className="whitespace-pre-line text-lg text-slate-600 leading-relaxed font-medium space-y-4">
      {content}
    </div>
  );
}

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";
  const dict = lang === "id" ? id : en;
  const t = (dict as any).about;

  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const apiLang = lang === "en" ? "en" : "id";
        const res = await fetch(`${API_URL}/articles/?lang=${apiLang}`);
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
  }, [lang]);

  if (!mounted || loading) {
    return (
      <main className="bg-emerald-50 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </main>
    );
  }

  const bySlug = (slug: string) => articles.find((a) => a.slug === slug);

  const hero = bySlug("about-hero");
  const body = bySlug("about-body");
  const vision = bySlug("about-vision");
  const mission = bySlug("about-mission");
  const gallery1 = bySlug("about-gallery-1");
  const gallery2 = bySlug("about-gallery-2");
  const gallery3 = bySlug("about-gallery-3");

  const heroBg = resolveImageUrl(hero?.image_url) || FALLBACK_HERO;
  const bodyImage = resolveImageUrl(body?.image_url) || FALLBACK_BODY;
  const galleryImages = [
    resolveImageUrl(gallery1?.image_url) || FALLBACK_GALLERY[0],
    resolveImageUrl(gallery2?.image_url) || FALLBACK_GALLERY[1],
    resolveImageUrl(gallery3?.image_url) || FALLBACK_GALLERY[2],
  ];

  const heroTitle = hero?.title || (lang === "id" ? "Tentang Kami" : "About");
  const heroLines = hero?.content
    ? (isHtmlContent(hero.content) ? stripHtml(hero.content) : hero.content)
        .split(/\n|·|\|/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        lang === "id"
          ? "Layanan Advisory Iklim & Keberlanjutan"
          : "Climate & Sustainability Advisory Services",
        lang === "id"
          ? "Membangun Nilai Berkelanjutan untuk Manusia, Alam, dan Bisnis"
          : "Building Sustainable Value for People, Nature, and Business",
      ];

  const missionItems = mission?.content
    ? parseMissionList(mission.content)
    : t?.missions || [];

  return (
    <main className="bg-emerald-50/40 min-h-screen selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      {/* HERO */}
      <section className="relative min-h-[70vh] md:min-h-[78vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/45 via-emerald-900/30 to-emerald-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-50 via-emerald-50/90 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-24 text-center">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-sm mb-6">
              {heroTitle}
            </h1>
            <div className="space-y-2">
              {heroLines.slice(0, 2).map((line, i) => (
                <p
                  key={i}
                  className={`text-white/95 font-medium drop-shadow-sm ${
                    i === 0
                      ? "text-lg md:text-xl"
                      : "text-base md:text-lg text-white/85"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BODY */}
      <section className="relative z-10 bg-emerald-50/40 px-6 pb-16 md:pb-24 -mt-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-tight mb-6">
                  {body?.title || "Satubumi"}
                </h2>
                {body?.content ? (
                  <ArticleBody content={body.content} />
                ) : (
                  <div className="space-y-5 text-lg text-slate-600 font-medium leading-relaxed">
                    <p>{t?.intro}</p>
                    <p>{t?.body_1}</p>
                    <p>{t?.body_2}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay="delay-200">
              <div className="relative aspect-[4/3] w-full rounded-[1.75rem] overflow-hidden shadow-xl shadow-emerald-900/10 border border-emerald-100/80">
                <img
                  src={bodyImage}
                  alt={body?.title || "Satubumi"}
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="px-6 pb-16 md:pb-24 bg-emerald-50/40">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {galleryImages.map((src, i) => (
            <ScrollReveal key={i} delay={`delay-${(i + 1) * 100}`}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-emerald-100/60 group">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* VISI — panel hijau */}
<section className="w-full bg-emerald-950 relative z-20 py-14 md:py-18 overflow-hidden">
  <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

  <div className="max-w-[1100px] mx-auto px-6 relative z-10">
    <ScrollReveal>
      <h3 className="text-emerald-400 font-extrabold tracking-tight text-3xl md:text-4xl lg:text-5xl mb-5 md:mb-6">
        {vision?.title ||
          t?.vision_label ||
          (isId ? "Visi Perusahaan" : "Our Vision")}
      </h3>

      <div className="text-2xl md:text-3xl lg:text-[2.15rem] font-medium text-white leading-[1.45] tracking-tight">
        {vision?.content ? (
          isHtmlContent(vision.content) ? (
            <div
              className="prose prose-invert max-w-none prose-p:my-0 prose-p:text-2xl md:prose-p:text-3xl prose-p:leading-[1.45] prose-strong:text-emerald-300"
              dangerouslySetInnerHTML={{ __html: vision.content }}
            />
          ) : (
            <div className="space-y-3">
              {vision.content.split("\n").map((paragraph, idx) =>
                paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
              )}
            </div>
          )
        ) : (
          <p>&ldquo;{t?.vision}&rdquo;</p>
        )}
      </div>
    </ScrollReveal>
  </div>
</section>

{/* MISI — nomor bulat kiri, teks rata kanan */}
<section className="w-full bg-white relative z-20 py-12 md:py-16 border-b border-emerald-100/60">
  <div className="max-w-[1000px] mx-auto px-6">
    <ScrollReveal>
      <h3 className="text-emerald-800 font-extrabold tracking-tight text-3xl md:text-4xl lg:text-5xl border-r-4 border-emerald-600 pr-4 md:pr-5 mb-6 md:mb-8 text-right">
        {mission?.title ||
          t?.mission_label ||
          (isId ? "Misi Kami" : "Our Mission")}
      </h3>

      <div className="space-y-0">
        {missionItems.map((item: string, index: number) => (
          <div
            key={index}
            className="group flex items-start gap-4 md:gap-8 py-4 md:py-5 border-b border-emerald-100 last:border-b-0"
          >
            {/* Frame bulat nomor — kiri */}
            <span className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-full border-2 border-emerald-600 text-emerald-700 font-extrabold text-sm md:text-base tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Teks — kanan */}
            <p className="flex-1 text-emerald-950 text-lg md:text-xl font-medium leading-snug text-right group-hover:text-emerald-900 transition-colors pt-1.5">
              {item}
            </p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  </div>
</section>
    </main>
  );
}