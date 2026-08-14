"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, UserPlus, AlertCircle, Home, ShieldCheck, Eye, EyeOff } from "lucide-react";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = dict.auth;
  const isId = lang === "id";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          phone_number: phoneNumber.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let message = isId ? "Gagal mendaftar" : "Registration failed";
        if (typeof data.detail === "string") message = data.detail;
        else if (Array.isArray(data.detail)) {
          message = data.detail.map((err: any) => err.msg).join(", ");
        }
        throw new Error(message);
      }

      router.push(`/${lang}/login`);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen flex bg-white font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-hidden">
      <div className="hidden lg:flex lg:w-[45%] relative bg-emerald-950 overflow-hidden items-end p-10">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000&auto=format&fit=crop"
          alt="Satubumi Nature"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />
        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply" />
        <div className="relative z-10 w-full max-w-lg mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">
              Join The Mission
            </span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Start your sustainability journey today.
          </h2>
          <p className="text-base text-emerald-100/80 font-medium leading-relaxed max-w-md">
            Bergabunglah dengan platform Rapid-FS dan ambil bagian dalam menciptakan masa depan yang lebih hijau.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[55%] h-screen flex flex-col justify-center relative bg-white px-6 sm:px-12 lg:px-20">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <Link
          href={`/${lang}`}
          className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-2.5 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors z-20 group"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shadow-sm text-emerald-600">
            <Home className="w-4 h-4" />
          </div>
          <span className="hidden sm:block">Back to Home</span>
        </Link>

        <Link
          href={`/${lang}`}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 hover:scale-105 transition-transform duration-300 z-20"
        >
          <Image
            src="/logo.png"
            alt="Satubumi Logo"
            width={1403}
            height={252}
            className="h-8 w-auto object-contain"
            priority
            unoptimized
          />
        </Link>

        <div className="w-full max-w-[400px] mx-auto relative z-10 mt-8">
          <div className="mb-8 text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 mb-2 tracking-tight flex items-center gap-3">
              {t.register_title}
              <div className="w-8 h-8 bg-emerald-50 rounded-[0.6rem] flex items-center justify-center border border-emerald-100 text-emerald-600">
                <UserPlus className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </h1>
            <p className="text-emerald-900/60 font-medium text-[14px]">{t.register_subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                {t.full_name}
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium text-emerald-950"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                {t.email}
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium text-emerald-950"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                {isId ? "Nomor Telepon" : "Phone Number"}
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium text-emerald-950"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+62 812 xxxx xxxx"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium text-emerald-950"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900/40 hover:text-emerald-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[13px] font-medium flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white text-[15px] font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-200 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  {t.register_btn}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-[14px] text-emerald-900/60 font-medium">
            {t.have_account}{" "}
            <Link href={`/${lang}/login`} className="text-emerald-700 font-extrabold">
              {t.login_btn}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}