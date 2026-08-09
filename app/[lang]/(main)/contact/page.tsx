"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Mail, MapPin, Phone, Send, CheckCircle2, Home, Sparkle, Leaf } from "lucide-react";
import ScrollReveal from "../../../../components/ScrollReveal";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// FISIKA ALAM: Data setiap daun diatur spesifik agar tidak terkesan "kembar"
const LEAVES = [
  { left: "5%", fallDur: "18s", fallDelay: "0s", swayDur: "4s", swayAmp: "60px", size: 24, op: 0.5, blur: "1px" },
  { left: "15%", fallDur: "14s", fallDelay: "4s", swayDur: "3s", swayAmp: "40px", size: 16, op: 0.7, blur: "0px" },
  { left: "25%", fallDur: "22s", fallDelay: "1s", swayDur: "5s", swayAmp: "80px", size: 36, op: 0.35, blur: "3px" },
  { left: "35%", fallDur: "16s", fallDelay: "7s", swayDur: "3.5s", swayAmp: "50px", size: 20, op: 0.6, blur: "0px" },
  { left: "45%", fallDur: "19s", fallDelay: "2s", swayDur: "4.5s", swayAmp: "70px", size: 28, op: 0.45, blur: "2px" },
  { left: "55%", fallDur: "12s", fallDelay: "5s", swayDur: "3.2s", swayAmp: "45px", size: 18, op: 0.8, blur: "0px" },
  { left: "65%", fallDur: "20s", fallDelay: "3s", swayDur: "5.5s", swayAmp: "90px", size: 40, op: 0.3, blur: "4px" },
  { left: "75%", fallDur: "17s", fallDelay: "8s", swayDur: "3.8s", swayAmp: "55px", size: 26, op: 0.55, blur: "1px" },
  { left: "85%", fallDur: "24s", fallDelay: "0.5s", swayDur: "6s", swayAmp: "100px", size: 48, op: 0.25, blur: "5px" },
  { left: "95%", fallDur: "15s", fallDelay: "6s", swayDur: "4.2s", swayAmp: "65px", size: 22, op: 0.5, blur: "0px" },
  { left: "20%", fallDur: "21s", fallDelay: "9s", swayDur: "4.8s", swayAmp: "75px", size: 32, op: 0.4, blur: "2px" },
  { left: "80%", fallDur: "13s", fallDelay: "2.5s", swayDur: "3.4s", swayAmp: "45px", size: 14, op: 0.7, blur: "0px" },
];

export default function ContactPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = dict.contact;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || "-",
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let message = lang === "id" ? "Gagal mengirim pesan" : "Failed to send message";
        if (typeof data.detail === "string") message = data.detail;
        else if (Array.isArray(data.detail)) {
          message = data.detail.map((err: any) => err.msg).join(", ");
        }
        throw new Error(message);
      }

      setIsSuccess(true);
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // PERUBAHAN: Background diganti dengan gradasi hijau yang lebih kaya dan segar
    <main className="min-h-screen bg-gradient-to-br from-emerald-300 via-emerald-100 to-emerald-200 flex flex-col items-center pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* 1. CSS INJECTION: Logika Fisika Daun (Jatuh, Berayun, Berputar 3D) */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Animasi gravitasi (Jatuh dari atas ke bawah layar) */
        @keyframes fall {
          0% { transform: translateY(-15vh); opacity: 0; }
          5% { opacity: var(--op); }
          90% { opacity: var(--op); }
          100% { transform: translateY(115vh); opacity: 0; }
        }
        
        /* Animasi angin (Berayun ke kiri-kanan sambil berputar 3 Dimensi) */
        @keyframes sway {
          0% {
            transform: translateX(calc(var(--sway-amp) * -1)) rotate(-30deg) rotateX(45deg) rotateY(0deg);
          }
          100% {
            transform: translateX(var(--sway-amp)) rotate(45deg) rotateX(-45deg) rotateY(180deg);
          }
        }
        
        .leaf-fall {
           animation: fall var(--fall-dur) linear infinite var(--fall-delay);
           position: absolute;
           top: -10vh; /* Daun bersembunyi di atas layar sebelum jatuh */
        }
        
        .leaf-sway {
           animation: sway var(--sway-dur) ease-in-out infinite alternate;
        }
      `}} />

      {/* 2. AREA DAUN GUGUR */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {LEAVES.map((l, i) => (
          <div
            key={i}
            // PERUBAHAN: Warna daun dibuat lebih hijau tua (emerald-700) agar terlihat kontras dengan BG baru
            className="leaf-fall text-emerald-700/60 drop-shadow-md"
            style={{
              left: l.left,
              filter: `blur(${l.blur})`,
              '--op': l.op,
              '--fall-dur': l.fallDur,
              '--fall-delay': l.fallDelay,
              '--sway-dur': l.swayDur,
              '--sway-amp': l.swayAmp,
            } as React.CSSProperties}
          >
            <div className="leaf-sway">
              <Leaf size={l.size} fill="currentColor" strokeWidth={0.3} />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-[1100px] relative z-10 flex flex-col items-center">
        
        {/* Header - Centered & Floating */}
        <ScrollReveal baseClass="opacity-0 translate-y-6" className="text-center max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm text-emerald-800 text-[12px] font-extrabold uppercase tracking-widest mb-6">
            <Sparkle className="w-4 h-4 text-emerald-600" />
            {t.eyebrow}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-4 drop-shadow-sm">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-emerald-900/70 font-medium leading-relaxed">
            {t.subtitle}
          </p>
        </ScrollReveal>

        {/* 3. The Unified Glass Card */}
        <ScrollReveal delay="delay-100" className="w-full">
          {/* PERUBAHAN: Opasitas putih diturunkan (bg-white/30) dan blur dinaikkan (backdrop-blur-3xl) agar warna hijau BG menembus dengan cantik */}
          <div className="bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/60 p-2 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.3)] flex flex-col lg:flex-row overflow-hidden">
            
            {/* KIRI: Formulir Kaca */}
            <div className="w-full lg:w-3/5 p-8 md:p-12">
              {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-8 border border-white shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-emerald-950 mb-4">{t.success_title}</h3>
                  <p className="text-emerald-900/70 font-medium text-lg max-w-md mx-auto mb-10 leading-relaxed">
                    {t.success_desc}
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    {t.send_another}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full justify-between">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[12px] font-bold text-emerald-900/80 uppercase tracking-widest">{t.name}</label>
                        {/* PERUBAHAN: Background input disesuaikan agar lebih padu dengan kaca transparan */}
                        <input
                          type="text"
                          required
                          placeholder="e.g., Fathin Qusyayyi"
                          className="w-full px-5 py-4 rounded-2xl border border-white/50 bg-white/40 focus:bg-white/70 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/40 backdrop-blur-sm"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-bold text-emerald-900/80 uppercase tracking-widest">{t.email}</label>
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          className="w-full px-5 py-4 rounded-2xl border border-white/50 bg-white/40 focus:bg-white/70 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/40 backdrop-blur-sm"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/80 uppercase tracking-widest">{t.company}</label>
                      <input
                        type="text"
                        placeholder="e.g., CV Tinfinity Jasa Indonesia"
                        className="w-full px-5 py-4 rounded-2xl border border-white/50 bg-white/40 focus:bg-white/70 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/40 backdrop-blur-sm"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/80 uppercase tracking-widest">{t.message}</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="How can we help you?"
                        className="w-full px-5 py-4 rounded-2xl border border-white/50 bg-white/40 focus:bg-white/70 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/40 resize-none backdrop-blur-sm"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>

                    {error && (
                      <div className="p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200/50 rounded-2xl text-rose-700 text-sm font-medium">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin"></div>
                          {t.processing}
                        </>
                      ) : (
                        <>
                          {t.send}
                          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* KANAN: Panel Informasi dengan Overlay Hutan/Gradien */}
            <div className="w-full lg:w-2/5 relative bg-emerald-950 rounded-[2.5rem] overflow-hidden p-8 md:p-12 flex flex-col justify-between m-2 shadow-inner">
              
              {/* Gambar/Tekstur Nature Overlay */}
              <img 
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop" 
                alt="Forest" 
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 to-emerald-950/95 pointer-events-none"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-white mb-2">{t.info_title}</h3>
                <p className="text-emerald-100/70 font-medium mb-12 text-sm leading-relaxed">
                  {t.info_desc}
                </p>

                <div className="space-y-8">
                  {/* Email */}
                  <div className="group/item flex gap-5">
                    <div className="w-12 h-12 bg-emerald-800/40 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover/item:bg-emerald-700/60 transition-colors">
                      <Mail className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="pt-1">
                      <p className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-white font-medium text-lg">info@satubumi.org</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="group/item flex gap-5">
                    <div className="w-12 h-12 bg-emerald-800/40 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover/item:bg-emerald-700/60 transition-colors">
                      <Phone className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="pt-1">
                      <p className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-widest mb-1">Phone</p>
                      <p className="text-white font-medium text-lg">+62 811 1234 5678</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="group/item flex gap-5">
                    <div className="w-12 h-12 bg-emerald-800/40 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover/item:bg-emerald-700/60 transition-colors">
                      <MapPin className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="pt-1">
                      <p className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-widest mb-1">Headquarters</p>
                      <p className="text-white font-medium text-base leading-relaxed">
                        Jakarta, Indonesia <br />
                        <span className="text-emerald-100/50 text-sm">SCBD District</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Home - Bottom */}
              <div className="relative z-10 mt-16 pt-8 border-t border-emerald-800/60">
                <Link 
                  href={`/${lang}`}
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-white font-bold text-sm transition-colors group"
                >
                  <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {t.back}
                </Link>
              </div>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </main>
  );
}