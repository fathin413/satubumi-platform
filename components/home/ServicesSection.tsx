import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Wind,
  LineChart,
  Globe2,
} from "lucide-react";

import ScrollReveal from "../ScrollReveal";

interface ServicesSectionProps {
  lang: string;
  isId: boolean;
}

const services = [
  {
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop",
    icon: Wind,
    title: {
      id: "Pengembangan Proyek Karbon",
      en: "Carbon Project Development",
    },
    description: {
      id: "Mendampingi pengembangan proyek karbon berbasis alam melalui pendekatan ilmiah dan terukur.",
      en: "Supporting nature-based carbon projects through scientific and measurable approaches.",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=900&auto=format&fit=crop",
    icon: LineChart,
    title: {
      id: "Baseline Assessment",
      en: "Baseline Assessment",
    },
    description: {
      id: "Analisis kondisi awal lingkungan sebagai dasar pengambilan keputusan.",
      en: "Environmental baseline analysis to support strategic decisions.",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=900&auto=format&fit=crop",
    icon: Globe2,
    title: {
      id: "Strategi Sustainability & ESG",
      en: "Sustainability & ESG Strategy",
    },
    description: {
      id: "Membantu organisasi membangun strategi keberlanjutan yang berdampak.",
      en: "Helping organizations build impactful sustainability strategies.",
    },
  },
];

export default function ServicesSection({
  lang,
  isId,
}: ServicesSectionProps) {
  return (
    // Latar diubah ke emerald-900 (hijau yang lebih segar dan jelas, tidak terlalu gelap)
    <section className="relative w-full py-24 bg-emerald-900 overflow-hidden font-sans border-t border-emerald-800/50">
      
      {/* ================= BACKGROUND ELEMENTS ================= */}
      {/* Cahaya pendar (glow) disesuaikan agar lebih menyala di atas warna hijau yang lebih terang */}
      <div className="absolute left-[-10%] bottom-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ================= LEFT CONTENT: EDITORIAL COPY ================= */}
          <ScrollReveal className="lg:col-span-5">
            
            {/* Eyebrow Label */}
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                {isId ? "Keahlian Layanan Kami" : "Our Service Expertise"}
              </span>
            </div>

            {/* Judul Utama */}
            <h2 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.1] tracking-tight">
              {isId
                ? "Keahlian Iklim & Keberlanjutan"
                : "Climate & Sustainability Expertise"}
            </h2>

            {/* Subjudul */}
            <p className="mt-6 text-[16px] md:text-[17px] text-emerald-50/90 leading-[1.8] max-w-md font-medium">
              {isId
                ? "Kami membantu organisasi merancang strategi iklim melalui pendekatan ilmiah, data, dan solusi berbasis alam."
                : "We help organizations develop climate strategies through science, data, and nature-based solutions."}
            </p>

            {/* CTA Button (Teks disesuaikan ke emerald-900 agar senada dengan background) */}
            <Link
              href={`/${lang}/services`}
              className="inline-flex items-center justify-center gap-3 mt-10 px-8 py-4 rounded-full bg-white text-emerald-900 text-[13px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-colors duration-300 shadow-xl shadow-black/10"
            >
              {isId ? "Eksplorasi Layanan" : "Explore Services"}
              <ArrowRight className="w-4 h-4" />
            </Link>

          </ScrollReveal>

          {/* ================= RIGHT CONTENT: SERVICE CARDS ================= */}
          <ScrollReveal
            delay="delay-200"
            className="lg:col-span-7"
          >
            <div className="grid sm:grid-cols-3 gap-5">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title.en}
                    className="relative h-[420px] rounded-[2rem] overflow-hidden group border border-emerald-700/50 bg-emerald-800 shadow-lg"
                  >
                    
                    {/* Background Image (Zoom lambat dan mulus) */}
                    <img
                      src={service.image}
                      alt={service.title[isId ? "id" : "en"]}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 ease-out"
                    />

                    {/* Gradient Overlay (Disesuaikan ke emerald-900 agar mulus dengan warna section) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/60 to-transparent" />

                    {/* Card Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                      
                      {/* Icon Box */}
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center mb-5 text-emerald-700 shadow-lg group-hover:bg-emerald-100 transition-colors duration-500">
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-extrabold leading-snug text-white">
                        {service.title[isId ? "id" : "en"]}
                      </h3>

                      {/* Description */}
                      <p className="mt-3 text-sm text-emerald-50/90 leading-relaxed font-medium">
                        {service.description[isId ? "id" : "en"]}
                      </p>
                      
                    </div>
                  </article>
                );
              })}
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}