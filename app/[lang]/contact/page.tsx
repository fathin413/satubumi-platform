"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Mail, MapPin, Phone, Send, CheckCircle2, Home } from "lucide-react";
import ScrollReveal from "../../../components/ScrollReveal";
import en from "../../../dictionaries/en.json";
import id from "../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
    <main className="min-h-screen bg-[#f8faf9] flex flex-col items-center pt-32 pb-24 px-6 relative overflow-hidden font-sans">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-[1200px] relative z-10">
        
        {/* Header */}
        <ScrollReveal baseClass="opacity-0 translate-y-8" className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-emerald-200/60 bg-white/60 backdrop-blur-md mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[13px] font-bold text-emerald-800 uppercase tracking-[0.2em]">
              {t.eyebrow}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-emerald-950 mb-6 tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-emerald-900/60 font-medium">
            {t.subtitle}
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Form */}
          <ScrollReveal delay="delay-100" className="lg:col-span-7">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100/60 p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(4,43,34,0.05)] h-full">
              
              {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-emerald-950 mb-4">{t.success_title}</h3>
                  <p className="text-emerald-900/60 font-medium text-lg max-w-md mx-auto mb-10 leading-relaxed">
                    {t.success_desc}
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-colors"
                  >
                    {t.send_another}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-emerald-900 uppercase tracking-wide">{t.name}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Fathin Qusyayyi"
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-emerald-900 uppercase tracking-wide">{t.email}</label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-emerald-900 uppercase tracking-wide">{t.company}</label>
                    <input
                      type="text"
                      placeholder="e.g., PT Hijau Lestari"
                      className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-emerald-900 uppercase tracking-wide">{t.message}</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30 resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/20 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 group"
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
          </ScrollReveal>

          {/* Info Card */}
          <ScrollReveal delay="delay-300" className="lg:col-span-5 h-full">
            <div className="bg-emerald-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl h-full flex flex-col justify-between relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold text-white mb-4">{t.info_title}</h2>
                <p className="text-emerald-100/60 font-medium leading-relaxed mb-12">
                  {t.info_desc}
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-emerald-900/50 border border-emerald-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-800 transition-colors">
                      <Mail className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-100/40 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-white font-medium text-lg">info@satubumi.org</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-emerald-900/50 border border-emerald-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-800 transition-colors">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-100/40 uppercase tracking-widest mb-1">Phone / WhatsApp</p>
                      <p className="text-white font-medium text-lg">+62 811 1234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-emerald-900/50 border border-emerald-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-800 transition-colors">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-100/40 uppercase tracking-widest mb-1">Headquarters</p>
                      <p className="text-white font-medium text-lg leading-relaxed">
                        Jakarta, Indonesia <br />
                        <span className="text-emerald-100/60 text-sm font-normal">Sudirman Central Business District (SCBD)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-16 pt-8 border-t border-emerald-800/50">
                <Link 
                  href={`/${lang}`}
                  className="inline-flex items-center gap-2 text-emerald-100/70 font-bold hover:text-white transition-colors group"
                >
                  <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {t.back}
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </main>
  );
}