import Link from "next/link";
import { getDictionary } from "../../getDictionary";
import ScrollReveal from "../../components/ScrollReveal";

export default async function HomePage({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="bg-slate-50 min-h-screen selection:bg-emerald-200 selection:text-emerald-900 font-sans overflow-hidden">
      
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 max-w-[1400px] mx-auto min-h-[95vh] flex items-center">
        
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-300/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start w-full relative z-10 pt-4 lg:pt-0">
          
          <ScrollReveal 
            className="lg:col-span-5 max-w-2xl" 
            baseClass="opacity-0 -translate-x-12"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-100/50 mb-8 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                {dict.home.hero_eyebrow}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-emerald-950 leading-[1.05] tracking-tight mb-6">
              {dict.home.hero_title.split(' ').slice(0, -2).join(' ')} <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500">
                {dict.home.hero_highlight || dict.home.hero_title.split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-emerald-950/70 font-medium leading-relaxed mb-10 max-w-lg">
              {dict.home.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/${lang}/products`}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white text-[15px] font-bold rounded-full hover:bg-emerald-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                {dict.home.btn_primary}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              
              <Link
                href={`/${lang}/contact`}
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-700 text-[15px] font-bold rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 text-center shadow-sm"
              >
                {dict.home.btn_secondary}
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal 
            className="lg:col-span-7 relative w-full h-[500px] sm:h-[650px] lg:ml-10" 
            baseClass="opacity-0 translate-x-12"
            delay="delay-300"
          >
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10">
              <img 
                src="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop" 
                alt="Tropical Canopy" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply"></div>
            </div>

            <div className="absolute -bottom-10 -left-6 sm:bottom-12 sm:-left-12 bg-white/95 backdrop-blur-xl border border-emerald-100 p-6 rounded-3xl shadow-2xl shadow-emerald-900/10 w-64 md:w-80">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Data Lapangan</span>
              </div>
              <h4 className="text-slate-500 font-medium text-sm mb-1">Karbon Terserap</h4>
              <p className="text-3xl font-extrabold text-emerald-950 mb-2">2.4M <span className="text-sm font-semibold text-emerald-600">ton</span></p>
              
              <div className="w-full h-8 flex items-end gap-1 mt-4">
                {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
            
            <div className="hidden sm:flex absolute top-12 -right-2 lg:right-4 bg-white/95 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/10 items-center gap-3 border border-emerald-50">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-emerald-950 text-sm font-bold tracking-wide">Blue Carbon ESG</span>
            </div>
          </ScrollReveal>

        </div>
      </section>
      
      <section className="bg-white py-24 md:py-32 px-6 rounded-t-[3rem] relative z-20 border-t border-emerald-50 shadow-[0_-20px_40px_rgba(4,43,34,0.03)]">
        <div className="max-w-[1400px] mx-auto">
          
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 max-w-5xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 tracking-tight mb-4 leading-tight">
                {dict.home.bento_heading}
              </h2>
              <p className="text-xl text-emerald-950/60 font-medium">
                {dict.home.bento_subheading}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            
            {/* CARD 01 - Hijau terang saat default, Hijau Solid saat hover */}
            <ScrollReveal delay="delay-100" className="md:col-span-2 h-full">
              <div className="h-full bg-emerald-100/60 rounded-3xl p-10 border border-emerald-200/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/20 hover:bg-emerald-600 transition-all duration-500 flex flex-col justify-between group">
                <div className="w-14 h-14 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-emerald-700 transition-colors duration-500 shadow-sm">
                  <span className="font-serif font-extrabold text-xl">01</span>
                </div>
                <div className="max-w-lg">
                  <h3 className="text-3xl font-bold text-emerald-950 mb-4 group-hover:text-white transition-colors duration-500">{dict.home.bento_1_title}</h3>
                  <p className="text-emerald-900/70 text-lg leading-relaxed font-medium group-hover:text-emerald-50 transition-colors duration-500">
                    {dict.home.bento_1_desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* CARD 02 - Hijau terang saat default, Hijau Solid saat hover */}
            <ScrollReveal delay="delay-300" className="h-full">
              <div className="h-full bg-emerald-100/60 rounded-3xl p-10 border border-emerald-200/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/20 hover:bg-emerald-600 transition-all duration-500 flex flex-col justify-between group">
                <div className="w-14 h-14 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-emerald-700 transition-colors duration-500 shadow-sm">
                  <span className="font-serif font-extrabold text-xl">02</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-950 mb-3 group-hover:text-white transition-colors duration-500">{dict.home.bento_2_title}</h3>
                  <p className="text-emerald-900/70 text-base leading-relaxed font-medium group-hover:text-emerald-50 transition-colors duration-500">
                    {dict.home.bento_2_desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* CARD 03 - Hijau terang saat default, Hijau Solid saat hover */}
            <ScrollReveal delay="delay-500" className="md:col-span-3 h-full">
              <div className="h-full bg-emerald-100/60 rounded-3xl p-10 border border-emerald-200/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/20 hover:bg-emerald-600 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
                <div className="flex-1 max-w-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center group-hover:bg-white group-hover:text-emerald-700 transition-colors duration-500 shadow-sm">
                      <span className="font-serif font-extrabold text-xl">03</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-emerald-950 mb-4 group-hover:text-white transition-colors duration-500">{dict.home.bento_3_title}</h3>
                  <p className="text-emerald-900/70 text-lg leading-relaxed font-medium group-hover:text-emerald-50 transition-colors duration-500">
                    {dict.home.bento_3_desc}
                  </p>
                </div>
                
                {/* Ikon panah kanan */}
                <div className="hidden md:flex w-16 h-16 rounded-full border-2 border-emerald-300 items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500 text-emerald-700 group-hover:text-emerald-700 shadow-sm group-hover:shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

    </main>
  );
}