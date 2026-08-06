"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Lock, AlertCircle, Home } from "lucide-react";
import en from "../../../dictionaries/en.json";
import id from "../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = dict.auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    // Backend pakai OAuth2 form-data, bukan JSON
    const formData = new URLSearchParams();
    formData.append("username", email); // email dimasukkan ke field "username"
    formData.append("password", password);

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      let message = lang === "id" ? "Email atau password salah" : "Invalid email or password";
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) {
        message = data.detail.map((err: any) => err.msg).join(", ");
      }
      throw new Error(message);
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);

    // Cek role untuk redirect
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    if (meRes.ok) {
      const me = await meRes.json();
      if (me.role === "admin" || me.role === "super_admin") {
        router.push(`/${lang}/admin`);
      } else {
        router.push(`/${lang}/products`);
      }
    } else {
      router.push(`/${lang}/products`);
    }
  } catch (err: any) {
    setError(err.message || "Error");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center px-6 py-32 relative overflow-hidden font-sans">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[150px] pointer-events-none"></div>

      <Link 
        href={`/${lang}`} 
        className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-sm font-bold text-emerald-900/40 hover:text-emerald-700 transition-colors z-20 group"
      >
        <div className="w-8 h-8 rounded-full bg-white/50 border border-emerald-100 flex items-center justify-center group-hover:bg-white transition-colors">
          <Home className="w-4 h-4" />
        </div>
        Back to Home
      </Link>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/60 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Lock className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-950 mb-3 tracking-tight">
            {t.login_title}
          </h1>
          <p className="text-emerald-900/60 font-medium text-[15px]">
            {t.login_subtitle}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100/60 p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(4,43,34,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-emerald-900 uppercase tracking-wide">
                {t.email}
              </label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-emerald-900 uppercase tracking-wide">
                {t.password}
              </label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-[14px] font-medium flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" strokeWidth={2.5} />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/20 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    {t.login_btn}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-emerald-50 text-center">
            <p className="text-[14px] text-emerald-900/60 font-medium">
              {t.no_account}{" "}
              <Link href={`/${lang}/register`} className="text-emerald-700 font-extrabold hover:text-emerald-800 transition-colors">
                {t.register_btn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}