import Link from "next/link";
import { getDictionary } from "../../../getDictionary";
import ScrollReveal from "../../../components/ScrollReveal";
import HeroBackground from "../../../components/HeroBackground";
import { 
  ArrowRight, Leaf, ShieldCheck, Cpu, MessagesSquare, 
  Wind, LineChart, Globe2, Activity, BookOpen, Clock 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const FALLBACK_HERO = "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?q=80&w=1200&auto=format&fit=crop";
const FALLBACK_INSIGHT = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop";

// Gambar untuk Kartu Layanan Vertical
const IMG_SRV_1 = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop";
const IMG_SRV_2 = "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop";
const IMG_SRV_3 = "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop";

type Article = {
  id: number;
  category: string;
  title: string;
  title_en?: string | null;
  content: string;
  content_en?: string | null;
  status: string;
  slug?: string;
  image_url?: string | null;
  created_at?: string;
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

function formatDate(dateString?: string, isId?: boolean) {
  if (!dateString) return isId ? "Baru saja dirilis" : "Recently published";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(isId ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return isId ? "Baru saja dirilis" : "Recently published";
  }
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

function pickTitle(a: Article | undefined, isId: boolean, fallback: string) {
  if (!a) return fallback;
  if (!isId && a.title_en?.trim()) return a.title_en.trim();
  return (a.title || fallback).trim();
}

function pickRawContent(a: Article | undefined, isId: boolean) {
  if (!a) return "";
  if (!isId && a.content_en?.trim()) return a.content_en;
  return a.content || "";
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const articles = await getHomeArticles(lang);
  const isId = lang === "id";

  const bySlug = (slug: string) => articles.find((a) => a.slug === slug);

  // Ambil Data CMS
  const heroArt = bySlug("home-hero");
  const heroBg2 = bySlug("home-hero-bg-2");
  const heroBg3 = bySlug("home-hero-bg-3");
  const cardAbout = bySlug("home-card-about");
  const cardServices = bySlug("home-card-services");
  const cardProducts = bySlug("home-card-products");

  let heroImages = [
    resolveImageUrl(heroArt?.image_url),
    resolveImageUrl(heroBg2?.image_url),
    resolveImageUrl(heroBg3?.image_url),
  ].filter((u): u is string => Boolean(u));

  if (heroImages.length === 0) {
    heroImages = [FALLBACK_HERO];
  }

  // Logika Mengambil 4 Insight Asli dari API Insights (Eksplisit mengabaikan prefix 'home-')
  const insightArticles = articles
    .filter((a) => (a.category || "").toLowerCase() === "insight")
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  // LOGIKA HERO
  let showTitle = isId
    ? "Menciptakan Dampak Iklim yang Terukur & Berkelanjutan"
    : "Satubumi bridges science, nature, communities, and business to create measurable climate and sustainability impacts.";
  let showHighlight = "";
  let heroSubtitle = isId
    ? "Kami mendampingi perusahaan, lembaga, dan pemerintah dalam merancang strategi keseimbangan antara pertumbuhan ekonomi dan kelestarian ekosistem."
    : "We assist companies, institutions, and governments in designing strategies that balance economic growth with ecosystem preservation.";

  if (heroArt) {
    showTitle = pickTitle(heroArt, isId, showTitle);
    const raw = pickRawContent(heroArt, isId);
    if (raw.includes("<<<")) {
      const [hl, sub] = raw.split("<<<");
      if (hl.trim()) showHighlight = hl.trim();
      if (sub.trim()) heroSubtitle = sub.trim();
    } else {
      const plain = plainText(raw);
      if (plain) heroSubtitle = plain;
    }
  }

  // LOGIKA ABOUT / SERVICES / PRODUCTS (dari CMS admin)
  const aboutBodyCms =
    plainText(pickRawContent(cardAbout, isId)) ||
    (isId
      ? "Konsultansi yang berfokus pada pengembangan solusi iklim dan keberlanjutan melalui pendekatan ilmiah, kolaboratif, dan berbasis dampak."
      : "Consultancy focused on developing climate and sustainability solutions through a scientific, collaborative, and impact-driven approach.");

  const servicesTitleCms = pickTitle(
    cardServices,
    isId,
    isId
      ? "Keahlian Spesifik untuk Transisi Ekologis."
      : "Specific Expertise for Ecological Transition."
  );

  const servicesBodyCms =
    plainText(pickRawContent(cardServices, isId)) ||
    (isId
      ? "Dengan pengalaman mendalam dalam bidang kehutanan, bentang alam, dan konservasi, kami hadir sebagai mitra strategis untuk memastikan proses bisnis Anda berjalan berkelanjutan."
      : "With deep experience in forestry, landscapes, and conservation, we serve as a strategic partner to ensure your business processes run sustainably.");

  const productsTitle = pickTitle(
    cardProducts,
    isId,
    "Rapid-FS Scoring Engine"
  );

  const productsBodyCms =
    plainText(pickRawContent(cardProducts, isId)) ||
    (isId
      ? "Hanya dengan memasukkan Luasan Area, Koordinat, atau Unggah Shapefile (KML), sistem otomatis kami akan mengestimasi kelayakan proyek karbon Anda dalam kurang dari 30 menit."
      : "Simply by providing your Area Size, Coordinates, or Uploading a Shapefile, our automated system will estimate the feasibility of your carbon project in less than 30 minutes.");

  return (
    <main className="bg-[#052e16] min-h-screen selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* =========================================================================
          SECTION 1: HERO
      ========================================================================== */}
      <section className="relative w-full flex flex-col justify-center min-h-[95vh] pt-32 pb-20 z-0 overflow-hidden">
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroBackground images={heroImages} intervalMs={6000} />
          
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#052e16_120%)] z-10 opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-emerald-900 to-transparent z-10" />
        </div>

        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center justify-center text-center mt-10">
          <ScrollReveal baseClass="opacity-0 translate-y-12" className="flex flex-col items-center relative w-full">
            
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-[#052e16]/50 backdrop-blur-md mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-[0.25em]">
                Climate & Sustainability Advisory
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-8 max-w-5xl drop-shadow-md">
              {showTitle}
              {showHighlight && (
                <>
                  <br />
                  <span className="font-serif italic font-light text-emerald-300 drop-shadow-sm">
                    {showHighlight}
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-2xl text-emerald-50 font-medium leading-relaxed mb-12 max-w-3xl drop-shadow-sm">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Link
                href={`/${lang}/about`}
                className="px-8 py-4 bg-emerald-600 text-white text-[16px] font-bold rounded-full hover:bg-emerald-500 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] group focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
              >
                {isId ? "Pelajari Pendekatan Kami" : "Discover Our Approach"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${lang}/products`}
                className="px-8 py-4 bg-transparent border border-white/30 text-white text-[16px] font-bold rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 text-center focus:outline-none focus:ring-4 focus:ring-emerald-500/50 backdrop-blur-sm"
              >
                {isId ? "Coba Rapid-FS Scoring" : "Try Rapid-FS Scoring"}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ABOUT PAGE
      ========================================================================== */}
      <section className="relative w-full py-12 md:py-16 bg-emerald-900 border-t border-emerald-800/50">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <ScrollReveal className="lg:col-span-6 flex flex-col items-start text-left">
              <span className="text-emerald-400 font-bold mb-2 tracking-wide text-sm md:text-base">
                {isId ? "Selamat datang di" : "Welcome to"}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
                Satubumi
              </h2>
              <p className="text-base md:text-lg text-emerald-100/80 font-medium max-w-lg mb-8 leading-relaxed">
                {isId 
                  ? "Konsultan pengembangan solusi iklim dan keberlanjutan." 
                  : "Climate and sustainability solutions development consultant."}
              </p>

              <div className="flex flex-col sm:flex-row gap-x-6 gap-y-3 pt-5 border-t border-emerald-700/50 w-full max-w-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[12px] md:text-[13px] text-emerald-50/90 font-medium uppercase tracking-wider">
                    {isId ? "Berbasis Ilmiah" : "Science Based"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[12px] md:text-[13px] text-emerald-50/90 font-medium uppercase tracking-wider">
                    {isId ? "Berdampak Nyata" : "Measurable Impact"}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={`/${lang}/about`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-800/50 border border-emerald-600/50 text-emerald-300 text-sm font-bold hover:bg-emerald-700/50 hover:text-emerald-200 hover:border-emerald-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {isId ? "Pelajari Profil Kami" : "Read Our Full Profile"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            {/* KARTU "SCOPE OF CONSULTANCY" */}
            <ScrollReveal delay="delay-200" className="lg:col-span-6 w-full">
              <div className="bg-white border border-slate-100 rounded-[1.5rem] p-8 md:p-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-emerald-100 transition-colors duration-500">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-100/60 blur-[40px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-emerald-200/60" />
                
                <h3 className="text-2xl md:text-3xl font-black text-emerald-900 mb-4 relative z-10 leading-tight tracking-tight">
                  {isId ? "Lingkup Jasa Konsultan" : "Scope of Consultancy"}
                </h3> 
                
                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium relative z-10">
                  {aboutBodyCms}
                </p>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SERVICES PAGE (BERSIH & TERANG - NO DARK/DIRTY EFFECTS)
      ========================================================================== */}
      <section className="relative w-full pt-16 pb-12 md:pt-24 md:pb-16 bg-slate-50 border-t border-slate-200/60 overflow-hidden">
        
        {/* Hanya ada satu sentuhan bias cahaya sangat lembut dan terang, tanpa membuat kotor */}
        <div className="absolute z-0 left-[-10%] bottom-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(209,250,229,0.5)_0%,transparent_70%)] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <ScrollReveal className="lg:col-span-5 flex flex-col items-start text-left">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-[12px] font-extrabold text-emerald-700 uppercase tracking-[0.2em]">
                  {isId ? "Keahlian Layanan Kami" : "Our Service Expertise"}
                </span>
              </div>
              
              <h2 className="text-[2.5rem] md:text-5xl lg:text-[3.5rem] font-extrabold text-emerald-950 leading-[1.1] tracking-tight mb-6">
                {servicesTitleCms}
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10 max-w-md relative z-10">
                {servicesBodyCms}
              </p>

              <Link
                href={`/${lang}/services`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-emerald-700 text-white text-[15px] font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-700/20 group focus:outline-none focus:ring-4 focus:ring-emerald-500/50 relative z-10"
              >
                {isId ? "Eksplorasi Layanan" : "Explore Services"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>

            <ScrollReveal delay="delay-200" className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 h-auto sm:h-[500px] lg:h-[600px]">
                
                <div className="relative rounded-[2rem] overflow-hidden group h-[350px] sm:h-full shadow-xl border border-slate-200/50 hover:border-emerald-300 transition-all duration-500 hover:-translate-y-2 bg-white">
                  <img src={IMG_SRV_1} alt="Pengembangan Proyek Karbon" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start text-left z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-700 mb-5 shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                       <Wind className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2 leading-snug">
                      {isId ? "Pengembangan Proyek Karbon" : "Carbon Project Development"}
                    </h3>
                    <p className="text-sm text-emerald-100 font-medium leading-relaxed opacity-90">
                      {isId ? "Mendampingi klien dalam seluruh tahapan pengembangan proyek karbon." : "Assisting clients throughout all stages of carbon project development."}
                    </p>
                  </div>
                </div>

                <div className="relative rounded-[2rem] overflow-hidden group h-[350px] sm:h-full shadow-xl border border-slate-200/50 hover:border-emerald-300 transition-all duration-500 hover:-translate-y-2 bg-white">
                  <img src={IMG_SRV_2} alt="Baseline Assessment" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start text-left z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-700 mb-5 shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                       <LineChart className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2 leading-snug">
                      {isId ? "Baseline Assessment" : "Baseline Assessment"}
                    </h3>
                    <p className="text-sm text-emerald-100 font-medium leading-relaxed opacity-90">
                      {isId ? "Menyediakan layanan pengumpulan dan analisis data." : "Providing data collection and analysis services."}
                    </p>
                  </div>
                </div>

                <div className="relative rounded-[2rem] overflow-hidden group h-[350px] sm:h-full shadow-xl border border-slate-200/50 hover:border-emerald-300 transition-all duration-500 hover:-translate-y-2 bg-white">
                  <img src={IMG_SRV_3} alt="Strategi Keberlanjutan dan ESG" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start text-left z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-700 mb-5 shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                       <Globe2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2 leading-snug">
                      {isId ? "Strategi Keberlanjutan dan ESG" : "Sustainability and ESG Strategy"}
                    </h3>
                    <p className="text-sm text-emerald-100 font-medium leading-relaxed opacity-90">
                      {isId ? "Integrasi prinsip lingkungan, sosial, dan tata kelola (ESG)." : "Integration of environmental, social, and governance (ESG) principles."}
                    </p>
                  </div>
                </div>

              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PRODUCTS PAGE (TEKSTUR STRICTLY DI Z-0)
      ========================================================================== */}
      <section className="w-full pt-10 pb-12 md:pt-14 md:pb-16 bg-gradient-to-b from-white to-slate-50/80 border-t border-slate-100 relative overflow-hidden">
        
        {/* Dekorasi Grid Terang Premium (Tech Grid di z-0) */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_30%,transparent_100%)] opacity-40" />
        
        {/* Bias Cahaya Besar di Belakang Mesin (Engine) */}
        <div className="absolute z-0 left-[10%] top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(236,253,245,0.8)_0%,transparent_70%)] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
            
            {/* Kiri: Orbit Engine dengan UI Hover Interaktif */}
            <ScrollReveal className="relative z-10 w-full lg:w-1/2 flex justify-center order-2 lg:order-1 mt-6 lg:mt-0">
              
              <div className="relative w-full max-w-[300px] md:max-w-[420px] aspect-square flex items-center justify-center">
                
                <div className="absolute inset-0 border border-slate-200/80 rounded-full" />
                <div className="absolute inset-6 md:inset-10 border border-slate-100/60 rounded-full" />

                <div className="absolute inset-8 md:inset-12 border-2 border-emerald-300/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-16 md:inset-20 border border-emerald-200/50 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
                
                <div className="w-32 h-32 md:w-52 md:h-52 bg-gradient-to-br from-[#052e16] to-emerald-900 border-2 border-emerald-600/50 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] relative overflow-hidden z-10">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3),transparent)] pointer-events-none" />
                   <Activity className="w-10 h-10 md:w-16 md:h-16 text-emerald-400 relative z-10" />
                </div>

                <div className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite] z-20">

                  {/* 1. Feasibility Score */}
                  <div className="absolute top-[5%] left-[-5%] md:top-[5%] md:left-[-5%]">
                    <div className="animate-[spin_60s_linear_infinite_reverse]">
                      <div 
                        className="bg-white border border-slate-200 shadow-xl rounded-2xl p-3 md:p-4 flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500"
                        tabIndex={0}
                        aria-label="Preview Feasibility Score"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="w-[110px] md:w-[130px]">
                          <p className="text-[9px] md:text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest mb-0.5 truncate" title={isId ? "Skor Kelayakan" : "Feasibility Score"}>{isId ? "Skor Kelayakan" : "Feasibility Score"}</p>
                          <div className="relative h-7 md:h-9">
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 group-hover:opacity-0 pt-0.5">
                               <span className="text-[13px] md:text-[15px] font-black text-slate-400 tracking-wide">[ ICPFS ]</span>
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                               <span className="text-[13px] md:text-[15px] font-black text-emerald-600 leading-tight">85 / 100</span>
                               <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isId ? "Contoh" : "Example"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Est. Carbon Stock */}
                  <div className="absolute top-[20%] right-[-10%] md:top-[20%] md:right-[-10%]">
                    <div className="animate-[spin_60s_linear_infinite_reverse]">
                      <div 
                        className="bg-white border border-slate-200 shadow-xl rounded-2xl p-3 md:p-4 flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500"
                        tabIndex={0}
                        aria-label="Preview Carbon Stock"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Leaf className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="w-[110px] md:w-[130px]">
                          <p className="text-[9px] md:text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest mb-0.5 truncate" title="Est. Carbon Stock">Est. Carbon Stock</p>
                          <div className="relative h-7 md:h-9">
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 group-hover:opacity-0 pt-0.5">
                               <span className="text-[13px] md:text-[15px] font-black text-slate-400 tracking-wide">[ tCO₂e ]</span>
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                               <span className="text-[13px] md:text-[15px] font-black text-emerald-600 leading-tight">2.4M Ton</span>
                               <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isId ? "Contoh" : "Example"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Revenue Projection */}
                  <div className="absolute bottom-[20%] left-[-10%] md:bottom-[20%] md:left-[-10%]">
                    <div className="animate-[spin_60s_linear_infinite_reverse]">
                      <div 
                        className="bg-white border border-slate-200 shadow-xl rounded-2xl p-3 md:p-4 flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500"
                        tabIndex={0}
                        aria-label="Preview Revenue Projection"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <LineChart className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="w-[110px] md:w-[130px]">
                          <p className="text-[9px] md:text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest mb-0.5 truncate" title={isId ? "Proyeksi Pendapatan" : "Revenue Projection"}>{isId ? "Proyeksi Pendapatan" : "Revenue Projection"}</p>
                          <div className="relative h-7 md:h-9">
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 group-hover:opacity-0 pt-0.5">
                               <span className="text-[13px] md:text-[15px] font-black text-slate-400 tracking-wide">[ USD ]</span>
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                               <span className="text-[13px] md:text-[15px] font-black text-emerald-600 leading-tight">$ 90M</span>
                               <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isId ? "Contoh" : "Example"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Spatial Risk Analysis */}
                  <div className="absolute bottom-[5%] right-[-5%] md:bottom-[5%] md:right-[0%]">
                    <div className="animate-[spin_60s_linear_infinite_reverse]">
                      <div 
                        className="bg-white border border-slate-200 shadow-xl rounded-2xl p-3 md:p-4 flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500"
                        tabIndex={0}
                        aria-label="Preview Spatial Risk"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Globe2 className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="w-[110px] md:w-[130px]">
                          <p className="text-[9px] md:text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest mb-0.5 truncate" title={isId ? "Analisis Risiko Spasial" : "Spatial Risk Analysis"}>{isId ? "Analisis Risiko" : "Spatial Risk"}</p>
                          <div className="relative h-7 md:h-9">
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 group-hover:opacity-0 pt-0.5">
                               <span className="text-[13px] md:text-[15px] font-black text-slate-400 tracking-wide">[ Status ]</span>
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-start transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                               <span className="text-[13px] md:text-[15px] font-black text-amber-500 leading-tight">Moderate</span>
                               <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isId ? "Contoh" : "Example"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </ScrollReveal>

            {/* Kanan: Copywriting & Hierarki CTA */}
            <ScrollReveal delay="delay-300" className="relative z-10 w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left order-1 lg:order-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 lg:mb-8 shadow-sm">
                <Cpu className="w-6 h-6 text-emerald-600" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-emerald-950 leading-[1.1] tracking-tight mb-5">
                {productsTitle}
              </h2>
              
              <p className="text-slate-600 text-[17px] md:text-lg leading-relaxed font-medium mb-6 max-w-lg relative z-10">
                {productsBodyCms}
              </p>

              {/* Disclaimer */}
              <p className="text-[12px] text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 font-medium">
                * {isId ? "Penapisan indikatif — bukan due diligence menyeluruh." : "Indicative screening — not a full due diligence."}
              </p>
              
              {/* Hierarki CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4 w-full sm:w-auto relative z-10">
                <Link
                  href={`/${lang}/products`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-emerald-600 text-white text-[15px] font-extrabold hover:bg-emerald-500 hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                >
                  <Cpu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {isId ? "Coba Rapid-FS Sekarang" : "Try Rapid-FS Now"}
                </Link>
                
                <Link
                  href={`/${lang}/contact`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 text-[15px] font-bold hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <MessagesSquare className="w-5 h-5" />
                  {isId ? "Hubungi Tim Kami" : "Contact Our Team"}
                </Link>
              </div>

              {/* Tautan Tersier */}
              <div className="flex w-full sm:w-auto justify-center lg:justify-start relative z-10">
                <Link 
                  href={`/${lang}/products`} 
                  className="text-[13px] md:text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1 transition-colors"
                >
                  {isId ? "Cara kerja Rapid-FS" : "How Rapid-FS works"} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INSIGHTS 
      ========================================================================== */}
      <section className="relative w-full pt-12 pb-20 md:pt-16 md:pb-28 bg-slate-50 border-t border-slate-200/60 overflow-hidden">
        
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(209,250,229,0.5)_0%,transparent_70%)] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span className="text-[12px] font-extrabold text-emerald-700 uppercase tracking-[0.2em]">
                  {isId ? "Wawasan & Pembaruan" : "Insights & Updates"}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 leading-[1.1] tracking-tight">
                {isId ? "Perspektif Terbaru Kami" : "Our Latest Perspectives"}
              </h2>
            </div>
            
            <Link
              href={`/${lang}/insights`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-emerald-700 text-[14px] font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 whitespace-nowrap"
            >
              {isId ? "Lihat Semua Wawasan" : "View All Insights"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          {/* Grid Layout */}
          {insightArticles.length > 0 ? (
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              
              {/* KOLOM KIRI: 1 Artikel Featured Utama */}
              <div className="lg:col-span-7 flex flex-col h-full">
                <ScrollReveal className="h-full w-full">
                  <Link 
                    href={`/${lang}/insights/${insightArticles[0].slug || insightArticles[0].id}`}
                    className="group relative flex flex-col w-full h-[400px] lg:h-[550px] rounded-[1.5rem] overflow-hidden shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                  >
                    <img
                      src={resolveImageUrl(insightArticles[0].image_url) || FALLBACK_INSIGHT}
                      alt={insightArticles[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1310] via-emerald-950/60 to-transparent opacity-95" />
                    
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full z-10 flex flex-col">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug line-clamp-3 group-hover:text-emerald-300 transition-colors">
                        {insightArticles[0].title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-emerald-100/70 text-sm font-medium mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(insightArticles[0].created_at, isId)}</span>
                      </div>
                      
                      <p className="text-emerald-50/80 text-sm md:text-base leading-relaxed line-clamp-2">
                        {plainText(insightArticles[0].content)}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              </div>

              {/* KOLOM KANAN: 3 Artikel Berjejer ke Bawah */}
              {insightArticles.length > 1 && (
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                  {insightArticles.slice(1, 4).map((article, idx) => (
                    <ScrollReveal key={article.id} delay={`delay-${(idx + 1) * 100}`} className="flex-1">
                      <Link 
                        href={`/${lang}/insights/${article.slug || article.id}`} 
                        className="group flex items-center h-full bg-white border border-slate-200/80 rounded-[1.5rem] p-4 md:p-5 gap-5 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                      >
                        <div className="relative w-[110px] sm:w-[140px] lg:w-[150px] aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={resolveImageUrl(article.image_url) || FALLBACK_INSIGHT}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        
                        <div className="flex flex-col justify-center py-1 w-full">
                          <h3 className="text-[15px] md:text-[17px] font-bold text-emerald-950 mb-2 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {article.title}
                          </h3>
                          
                          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-medium mb-3">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(article.created_at, isId)}</span>
                          </div>
                          
                          <div className="mt-auto flex items-center gap-1.5 text-[12px] font-extrabold text-emerald-600 group-hover:text-emerald-500 transition-colors">
                            {isId ? "Baca Selengkapnya" : "Read More"} 
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-[2rem]">
              <p className="text-slate-500 font-medium text-lg">
                {isId ? "Belum ada artikel wawasan yang dipublikasikan." : "No insight articles published yet."}
              </p>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}