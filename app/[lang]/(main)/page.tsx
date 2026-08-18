import Link from "next/link";
import { getDictionary } from "../../../getDictionary";
import ScrollReveal from "../../../components/ScrollReveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const FALLBACK_HERO = "/asset.jpeg";
const FALLBACK_CARD3 =
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop";
const FALLBACK_LEAF =
  "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=1200&auto=format&fit=crop";

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

function plainText(content: string) {
  if (!content) return "";
  if (/<\/?[a-z][\s\S]*>/i.test(content)) return stripHtml(content);
  return content.trim();
}

async function getHomeArticles(lang: string): Promise<Article[]> {
  try {
    const apiLang = lang === "en" ? "en" : "id";
    const res = await fetch(`${API_URL}/articles/?lang=${apiLang}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list: Article[] = Array.isArray(data) ? data : [];
    return list.filter((a) => a.status === "published");
  } catch {
    return [];
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const articles = await getHomeArticles(lang);

  const bySlug = (slug: string) => articles.find((a) => a.slug === slug);

  const heroArt = bySlug("home-hero");
  const cardAbout = bySlug("home-card-about");
  const cardServices = bySlug("home-card-services");
  const cardProducts = bySlug("home-card-products");

  const heroBg = resolveImageUrl(heroArt?.image_url) || FALLBACK_HERO;

  let showTitle = dict.home.hero_title;
  let showHighlight = dict.home.hero_highlight || "";
  let heroSubtitle = dict.home.hero_subtitle;

  // Auto-split hanya jika kata lebih dari 2 (agar judul pendek tidak rusak)
  if (!showHighlight) {
    const words = showTitle.split(" ");
    if (words.length > 2) {
      showTitle = words.slice(0, -2).join(" ");
      showHighlight = words.slice(-2).join(" ");
    }
  }

  // Jika di-override dari CMS (Database)
  if (heroArt?.title?.trim()) {
    showTitle = heroArt.title.trim();
    showHighlight = "";
  }

  if (heroArt?.content) {
    const raw = heroArt.content;
    if (raw.includes("<<<")) {
      const [hl, sub] = raw.split("<<<");
      if (hl.trim()) showHighlight = hl.trim();
      if (sub.trim()) heroSubtitle = sub.trim();
    } else {
      const plain = plainText(raw);
      if (plain) heroSubtitle = plain;
    }
  }

  const c1Title = cardAbout?.title || dict.home.bento_1_title;
  const c1Desc = cardAbout?.content
    ? plainText(cardAbout.content)
    : dict.home.bento_1_desc;
  const c1HoverImg = resolveImageUrl(cardAbout?.image_url) || FALLBACK_LEAF;

  const c2Title = cardServices?.title || dict.home.bento_2_title;
  const c2Desc = cardServices?.content
    ? plainText(cardServices.content)
    : dict.home.bento_2_desc;

  const c3Title = cardProducts?.title || dict.home.bento_3_title;
  const c3Desc = cardProducts?.content
    ? plainText(cardProducts.content)
    : dict.home.bento_3_desc;
  const c3Img = resolveImageUrl(cardProducts?.image_url) || FALLBACK_CARD3;

  return (
    <main className="bg-[#060c14] min-h-screen selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      
      <section className="relative w-full flex flex-col justify-center min-h-[90vh] pt-32 pb-0 z-0">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={heroBg}
            alt="Tropical Canopy"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          {/* Filter Hijau Gelap Solid */}
          <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply" />
          {/* Gradient Fade yang lebih hijau */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-[#060c14]/70 to-[#060c14]" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center justify-center text-center mt-10">
          <ScrollReveal baseClass="opacity-0 translate-y-12" className="flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-8 max-w-5xl">
              {showTitle} {showHighlight && <br />}
              {showHighlight && (
                <span className="font-serif italic font-light text-emerald-400">
                  {showHighlight}
                </span>
              )}
            </h1>

            <p className="text-lg md:text-2xl text-emerald-50/70 font-medium leading-relaxed mb-12 max-w-2xl">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 z-20">
              <Link
                href={`/${lang}/products`}
                className="px-8 py-4 bg-emerald-600 text-white text-[16px] font-extrabold rounded-full hover:bg-emerald-500 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] group"
              >
                {dict.home.btn_primary}
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>

              <Link
                href={`/${lang}/contact`}
                className="px-8 py-4 bg-emerald-900/30 backdrop-blur-md border border-emerald-500/20 text-emerald-50 text-[16px] font-bold rounded-full hover:bg-emerald-800/40 transition-all duration-300 text-center"
              >
                {dict.home.btn_secondary}
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 sm:px-6 mt-20 pb-20 md:pb-24">
          <ScrollReveal delay="delay-300" baseClass="opacity-0 translate-y-12">
            <div className="w-full bg-[#111622]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] py-10 px-8 md:px-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="flex-1 w-full">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
                  Live Carbon Absorbed
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    2.4M
                  </p>
                  <p className="text-emerald-400 font-bold text-sm">Tons CO₂e</p>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-white/10 mx-4" />

              <div className="flex-1 w-full">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
                  Active Projects
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    14
                  </p>
                  <p className="text-emerald-400 font-bold text-sm">Regions</p>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-white/10 mx-4" />

              <div className="flex-1 w-full flex md:justify-end">
                <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-5 py-2.5 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white text-sm font-bold tracking-wide">
                    ESG Verified
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Container Bento Putih menimpa hero (-mt-12 md:-mt-16) dan kontennya dinaikkan (pt-12 md:pt-16) */}
      <section className="bg-slate-50 -mt-12 md:-mt-16 pt-12 md:pt-16 pb-28 md:pb-36 px-6 relative z-20 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)]">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 max-w-4xl">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight mb-4 md:mb-6 leading-[1.1]">
                {dict.home.bento_heading}
              </h2>
              <p className="text-xl md:text-2xl text-emerald-600 font-medium leading-relaxed">
                {dict.home.bento_subheading}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-[420px]">
            
            <ScrollReveal delay="delay-100" className="md:col-span-7 h-full">
              <Link href={`/${lang}/about`} className="block h-full">
                <div className="h-full bg-[#eaeeed] rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden flex flex-col group hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] transition-shadow duration-500">
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000 ease-out">
                    <img
                      src={c1HoverImg}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-white flex items-center justify-center mb-8 shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-500">
                    <span className="font-serif font-extrabold text-2xl">01</span>
                  </div>

                  <div className="relative z-10 max-w-lg transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-[32px] lg:text-[40px] font-extrabold text-emerald-700 mb-4 leading-tight tracking-tight">
                      {c1Title}
                    </h3>
                    <p className="text-[#153429] text-lg lg:text-[19px] leading-relaxed font-medium">
                      {c1Desc}
                    </p>
                  </div>

                  <div className="absolute bottom-8 right-8 z-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-900 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                      <svg
                        className="w-6 h-6 -rotate-45"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute -bottom-8 right-4 text-[220px] font-extrabold text-emerald-900/10 select-none pointer-events-none leading-none z-0 group-hover:text-emerald-900/20 transition-colors duration-700">
                    1
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay="delay-300" className="md:col-span-5 h-full">
              <Link href={`/${lang}/services`} className="block h-full">
                <div className="h-full bg-[#091512] rounded-[2.5rem] p-10 lg:p-12 shadow-2xl flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-400/20 group-hover:scale-150 transition-all duration-1000 z-0" />

                  <div className="w-16 h-16 rounded-2xl bg-emerald-900/40 backdrop-blur-md border border-emerald-800 text-emerald-400 flex items-center justify-center mb-8 relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <span className="font-serif font-extrabold text-2xl">02</span>
                  </div>

                  <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-[32px] font-extrabold text-white mb-4 leading-tight tracking-tight">
                      {c2Title}
                    </h3>
                    <p className="text-emerald-100/60 text-lg leading-relaxed font-medium">
                      {c2Desc}
                    </p>
                  </div>

                  <div className="absolute bottom-8 right-8 z-10 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    <div className="w-16 h-16 rounded-full bg-white text-emerald-950 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 -rotate-45"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay="delay-500" className="md:col-span-12 h-[450px] md:h-[500px]">
              <Link href={`/${lang}/products`} className="block h-full">
                <div className="h-full rounded-[2.5rem] overflow-hidden relative group shadow-xl">
                  <img
                    src={c3Img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent group-hover:from-slate-950/80 transition-colors duration-700" />

                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 max-w-4xl">
                      <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-900/60 backdrop-blur-md border border-emerald-800 text-emerald-300 flex items-center justify-center shadow-lg group-hover:-translate-y-2 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                        <span className="font-serif font-extrabold text-2xl">03</span>
                      </div>
                      <div className="translate-y-4 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-700">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
                          {c3Title}
                        </h3>
                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
                          {c3Desc}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 flex items-center gap-3 px-8 py-5 rounded-full bg-white border border-slate-200 text-slate-950 text-[15px] font-extrabold group-hover:bg-emerald-900 group-hover:text-white group-hover:border-emerald-800 group-hover:scale-105 transition-all duration-500 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-2xl">
                      Learn More
                      <svg
                        className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  );
}