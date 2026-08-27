"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "../../../../components/ScrollReveal";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const FALLBACK_IMAGES = {
  body: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  gallery: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200",
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900",
  ],
};

type Article = {
  id: number;
  category: string;
  title: string;
  content: string;
  status: string;
  slug?: string;
  image_url?: string | null;
};

type TeamMember = {
  name: string;
  role: string;
  description: string;
  image: string;
};

function resolveImage(url?: string | null, fallback?: string) {
  if (!url) return fallback || "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function isHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

function parseMission(content: string) {
  if (!content) return [];

  if (isHtml(content)) {
    const result: string[] = [];
    const regex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const text = stripHtml(match[1]);
      if (text) result.push(text);
    }
    return result;
  }

  return content
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^[-•*]\s*/, ""));
}

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const dictionary = lang === "id" ? id : en;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_URL}/articles/?lang=${lang}`);

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();

        setArticles(
          Array.isArray(data)
            ? data.filter(
                (item: Article) =>
                  item.category === "about" && item.status === "published"
              )
            : []
        );
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [lang]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-emerald-900 animate-spin" />
      </main>
    );
  }

  const find = (slug: string) => articles.find((item) => item.slug === slug);

  const hero = find("about-hero");
  const body = find("about-body");
  const vision = find("about-vision");
  const mission = find("about-mission");

  const gallery = [
    resolveImage(find("about-gallery-1")?.image_url, FALLBACK_IMAGES.gallery[0]),
    resolveImage(find("about-gallery-2")?.image_url, FALLBACK_IMAGES.gallery[1]),
    resolveImage(find("about-gallery-3")?.image_url, FALLBACK_IMAGES.gallery[2]),
  ];

  const missionItems = mission?.content
    ? parseMission(mission.content)
    : [];

  const teamMembers: TeamMember[] = [
    {
      name: "MF. Fathin Qusyayyi",
      role: "Founder & Research Lead",
      description:
        "Leading sustainable innovation through science, collaboration, and ecosystem restoration.",
      image: "/assett.jpg",
    },
    {
      name: "Rachman Abi",
      role: "Environmental Specialist",
      description:
        "Developing practical solutions for sustainable environmental impact.",
      image: "/team2.jpg",
    },
    {
      name: "Raka Andhika",
      role: "Community & Partnership",
      description:
        "Building collaboration between communities, researchers, and organizations.",
      image: "/team3.jpg",
    },
    {
      name: "Muh. Ryan Syah",
      role: "Research Associate",
      description:
        "Supporting research initiatives and knowledge development for sustainable solutions.",
      image: "/team4.jpg",
    },
    {
      name: "Irfan Fauzi",
      role: "Field Coordinator",
      description:
        "Coordinating field activities and ensuring effective implementation on the ground.",
      image: "/team5.jpg",
    },
    {
      name: "Mawardi",
      role: "Operations Support",
      description:
        "Supporting operational processes and team collaboration across projects.",
      image: "/team6.jpg",
    },
  ];

  return (
    <main className="bg-[#FAFAFA] text-slate-900 overflow-hidden font-sans">
      
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center">
        <img
          src="/asset1.jpeg"
          alt="Satubumi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/70 to-emerald-950/20" />
        <div className="absolute -right-32 top-20 w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[120px]" />

        {/* Blur sangat rendah agar tidak menabrak teks */}
        <div className="absolute inset-x-0 bottom-0 h-16 md:h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 lg:px-12">
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-[#052e16]/50 backdrop-blur-md mb-8 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-[0.25em]">
                {isId ? "TENTANG SATUBUMI" : "ABOUT SATUBUMI"}
              </span>
            </div>
            
            <h1 className="max-w-4xl text-5xl md:text-7xl lg:text-8xl leading-[1.05] font-extrabold tracking-tight text-white drop-shadow-md">
              {hero?.title || "Nature Intelligence"}
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-xl leading-relaxed text-emerald-50/90 font-medium whitespace-pre-line">
              {hero?.content ? stripHtml(hero.content) : ""}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 bg-white">
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-start">
            
            <ScrollReveal className="flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-[2px] bg-emerald-600" />
                <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600 font-extrabold">
                  {isId ? "Siapa Kami" : "Who We Are"}
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-emerald-950 mb-8 md:mb-10">
                {body?.title ||
                  "Creating sustainable solutions through knowledge and collaboration."}
              </h2>
              
              <div className="text-lg md:text-xl leading-relaxed text-slate-600 font-medium text-justify flex flex-col gap-5">
                {body?.content
                  ? stripHtml(body.content)
                      .split(/\n+/)
                      .filter((p) => p.trim() !== "")
                      .map((p, idx) => <p key={idx}>{p}</p>)
                  : null}
              </div>
            </ScrollReveal>

            <ScrollReveal delay="delay-200">
              <div className="relative mt-8 lg:mt-0">
                <div className="absolute -inset-4 bg-emerald-100 rounded-[2.5rem] -rotate-2" />
                <img
                  src={resolveImage(body?.image_url, FALLBACK_IMAGES.body)}
                  alt="Satubumi"
                  className="relative w-full aspect-[4/5] object-cover rounded-[2rem] shadow-xl"
                />
              </div>
            </ScrollReveal>

          </div>
        </div>

        {/* Efek Blur Transisi ke section Visi Misi */}
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-[#02180e] to-transparent pointer-events-none z-20" />
      </section>

      {/* ================= VISION & MISSION ================= */}
      {/* Padding section dikurangi agar lebih compact (tidak terlalu besar) */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-[#02180e]">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={gallery[0]}
            alt="Vision Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-950/80 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-[#02180e]/85 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="mb-14 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-emerald-500" />
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 font-extrabold">
                {isId ? "Visi & Misi" : "Vision & Mission"}
              </p>
            </div>
            <h2 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              {isId ? "Apa yang mendorong kami" : "What drives us forward"}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* KIRI: VISION + 2 GAMBAR */}
            <div className="space-y-6">
              <ScrollReveal>
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/20">
                      <span className="text-emerald-950 font-extrabold text-2xl">V</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">
                      {isId ? "Visi Kami" : "Our Vision"}
                    </h3>
                  </div>
                  <p className="text-lg md:text-xl leading-relaxed text-emerald-100/90 font-medium whitespace-pre-line">
                    {vision?.content
                      ? stripHtml(vision.content)
                      : "Regenerating ecosystems through knowledge."}
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-2 gap-4">
                <ScrollReveal>
                  <div className="overflow-hidden rounded-[1.5rem] shadow-lg">
                    <img
                      src={gallery[1]}
                      alt="Satubumi"
                      className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal delay="delay-100">
                  <div className="overflow-hidden rounded-[1.5rem] shadow-lg">
                    <img
                      src={gallery[2]}
                      alt="Satubumi"
                      className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </ScrollReveal>
              </div>
            </div>

            {/* KANAN: MISSION */}
            <ScrollReveal delay="delay-100">
              <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-xl">
                <div className="flex items-center gap-4 mb-9">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/20">
                    <span className="text-emerald-950 font-extrabold text-2xl">M</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    {isId ? "Misi Kami" : "Our Mission"}
                  </h3>
                </div>

                <div className="space-y-6">
                  {missionItems.map((item, index) => (
                    <div key={index} className="flex gap-5 items-start">
                      <div className="w-10 h-10 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-sm font-extrabold shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-lg leading-relaxed text-emerald-100/90 font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ================= FULL SCREEN DIVIDER ================= */}
      {/* Tinggi divider dipotong agar section tidak terlalu boros */}
      <section className="relative w-full h-[25vh] md:h-[30vh] flex items-center justify-center overflow-hidden bg-[#02180e]">
        
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src={gallery[0]}
            alt="Nature Divider"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute inset-0 bg-emerald-950/80 mix-blend-multiply z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[#02180e]/65 z-10 pointer-events-none" />
        
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#02180e] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent z-10 pointer-events-none" />
      </section>

      {/* ================= MEET OUR TEAM ================= */}
      <section className="relative pb-24 md:pb-32 bg-[#FAFAFA] z-20 pt-0">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          
          <ScrollReveal>
            <div className="mb-14 md:mb-20">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-[2px] bg-emerald-600" />
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-emerald-600">
                  {isId ? "Tim Kami" : "Meet Our Team"}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <h2 className="max-w-2xl text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] text-emerald-950">
                  {isId ? "Orang-orang di balik misi kami." : "People behind the mission."}
                </h2>
                <p className="max-w-2xl text-base md:text-lg leading-relaxed text-slate-600 font-medium">
                  {isId 
                    ? "Sebuah tim multidisiplin yang memadukan sains, pengalaman lapangan, dan strategi keberlanjutan."
                    : "A multidisciplinary team working together through science, sustainability, and collaboration."}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {teamMembers.map((member, index) => (
              <ScrollReveal key={index} delay={`delay-${index * 100}`}>
                <article className="group flex flex-col">
                  
                  <div className="relative w-full aspect-square overflow-hidden rounded-[2rem] bg-slate-200 mb-6 shadow-md">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover filter grayscale-[35%] group-hover:grayscale-0 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  <div className="flex flex-col px-2">
                    <h3 className="text-[1.35rem] font-extrabold tracking-tight text-emerald-950 mb-1.5 group-hover:text-emerald-700 transition-colors">
                      {member.name}
                    </h3>
                    
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 mb-4">
                      {member.role}
                    </p>
                    
                    <div className="w-8 h-[3px] bg-emerald-200 mb-4 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-500 rounded-full" />
                    
                    <p className="text-[14px] md:text-[15px] text-slate-600 font-medium leading-relaxed">
                      {member.description}
                    </p>
                  </div>

                </article>
              </ScrollReveal>
            ))}
          </div>

        </div>

        {/* Efek Blur Transisi ke section Gallery (Putih Bersih) */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
      </section>

      {/* ================= GALLERY BOTTOM ================= */}
      {/* (Kini menjadi penutup halaman tanpa ada section closing) */}
      <section className="pt-24 pb-32 md:pt-28 md:pb-40 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-12 gap-6">
            
            <div className="md:col-span-7">
              <ScrollReveal>
                <img
                  src={gallery[0]}
                  alt="Satubumi gallery"
                  className="w-full aspect-[4/3] object-cover rounded-[2rem] shadow-lg"
                />
              </ScrollReveal>
            </div>

            <div className="md:col-span-5 space-y-6">
              <ScrollReveal delay="delay-100">
                <img
                  src={gallery[1]}
                  alt="Satubumi gallery"
                  className="w-full aspect-square object-cover rounded-[2rem] shadow-lg"
                />
              </ScrollReveal>

              {/* Min-height dihapus, diganti p-8 md:p-10 agar otomatis memeluk text (Fit to text) */}
              <ScrollReveal delay="delay-200">
                <div className="rounded-[2rem] bg-emerald-950 p-8 md:p-10 shadow-xl relative overflow-hidden flex items-center">
                  <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
                  <p className="text-2xl md:text-3xl font-extrabold tracking-tight leading-[1.2] text-white relative z-10">
                    Responsible innovation begins with understanding nature.
                  </p>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>
      
    </main>
  );
}