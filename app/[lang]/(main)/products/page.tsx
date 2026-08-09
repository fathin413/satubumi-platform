"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { UploadCloud, FileArchive, BarChart3, Save, Download, CheckCircle2, AlertCircle, Leaf, Map, LockKeyhole } from "lucide-react";
import ScrollReveal from "../../../../components/ScrollReveal";
import en from "../../../../dictionaries/en.json";
import id from "../../../../dictionaries/id.json";

// Import peta secara dinamis untuk menghindari error SSR
const MapPreview = dynamic(() => import("../../../../components/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-emerald-50/50 rounded-[1.5rem] animate-pulse border border-emerald-100 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ecosystemOptions = [
  { label: "Hutan Tropis", value: "hutan_tropis" },
  { label: "Mangrove", value: "mangrove" },
  { label: "Gambut", value: "gambut" },
  { label: "Agroforestri", value: "agroforestri" },
  { label: "Lahan Terdegradasi", value: "lahan_terdegradasi" },
];

export default function ProductsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "id" ? id : en;
  const t = dict.products;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"spatial" | "manual">("spatial");

  const [locationName, setLocationName] = useState("");
  const [ecosystemType, setEcosystemType] = useState("hutan_tropis");
  const [area, setArea] = useState("");
  const [duration, setDuration] = useState("30");
  const [carbonPrice, setCarbonPrice] = useState("10");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError(lang === "id"
        ? "File harus berformat .zip (berisi .shp, .shx, .dbf, .prj)"
        : "File must be .zip (containing .shp, .shx, .dbf, .prj)");
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError(null);
    setSuccessMsg(null);
    setResults(null);
    setSavedId(null);

    try {
      let response: Response;

      if (mode === "spatial") {
        if (!selectedFile) {
          throw new Error(lang === "id"
            ? "Silakan upload file shapefile (.zip) terlebih dahulu"
            : "Please upload a shapefile (.zip) first");
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("location_name", locationName || "Spatial Project");
        formData.append("ecosystem_type", ecosystemType);

        response = await fetch(`${API_URL}/rapid-fs/upload-shapefile`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/rapid-fs/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_name: locationName || "Unnamed Project",
            area_ha: parseFloat(area),
            ecosystem_type: ecosystemType,
            project_duration_years: parseInt(duration) || 30,
            carbon_price_usd: parseFloat(carbonPrice) || 10,
          }),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let message = lang === "id" ? "Gagal melakukan perhitungan" : "Calculation failed";
        if (typeof errData.detail === "string") message = errData.detail;
        else if (Array.isArray(errData.detail)) {
          message = errData.detail.map((e: any) => e.msg).join(", ");
        }
        throw new Error(message);
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(results),
      });
      if (!response.ok) throw new Error(lang === "id" ? "Gagal menyimpan" : "Failed to save");
      const data = await response.json();
      setSavedId(data.id || data._id || null);
      setSuccessMsg(lang === "id" ? "Assessment berhasil disimpan" : "Assessment saved");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!savedId) {
      setError(lang === "id"
        ? "Simpan assessment terlebih dahulu sebelum download PDF"
        : "Save assessment before downloading PDF");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/reports/${savedId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(lang === "id" ? "Gagal mengunduh PDF" : "Failed to download PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Satubumi-Report-${savedId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatNumber = (n: number) =>
    new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", { maximumFractionDigits: 0 }).format(n || 0);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n || 0);

  // ==========================================
  // STATE: CHECKING AUTH (LOADING)
  // ==========================================
  if (isLoggedIn === null) {
    return (
      <main className="min-h-screen bg-[#F1F6F4] flex flex-col items-center justify-center relative overflow-hidden font-sans pt-32 pb-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="flex flex-col items-center z-10 animate-in fade-in duration-500">
          <div className="w-16 h-16 relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            <Leaf className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          <p className="text-emerald-800/60 font-bold tracking-widest uppercase text-sm">Authenticating Workspace...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // STATE: NOT LOGGED IN - Fixed Navbar Overlap (Ditambah pt-32)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#F1F6F4] flex flex-col items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden font-sans">
        
        {/* Soft Ambient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        <ScrollReveal baseClass="opacity-0 translate-y-8" className="max-w-[500px] w-full relative z-10 mt-8">
          <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white/80 p-10 md:p-14 text-center shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] relative overflow-hidden group">
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[1.8rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100/60 relative">
                <div className="absolute inset-0 rounded-[1.8rem] border border-emerald-200/50 animate-ping opacity-20"></div>
                <LockKeyhole className="w-8 h-8 text-emerald-600" strokeWidth={2} />
              </div>
              <h1 className="text-3xl font-extrabold text-emerald-950 mb-4 tracking-tight">{t.login_required}</h1>
              <p className="text-emerald-900/60 mb-10 leading-relaxed font-medium">
                {lang === "id" 
                  ? "Sistem Rapid-FS membutuhkan autentikasi untuk memproses data spasial dan kalkulasi proyeksi karbon secara akurat." 
                  : "The Rapid-FS system requires authentication to accurately process spatial data and carbon projection calculations."}
              </p>
              <div className="flex flex-col gap-4">
                <Link href={`/${lang}/login`} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300">
                  {t.login_btn}
                </Link>
                <Link href={`/${lang}/register`} className="w-full py-4 bg-white/50 backdrop-blur-sm border border-emerald-100/80 text-emerald-800 font-bold rounded-2xl hover:bg-white hover:border-emerald-200 transition-all duration-300">
                  {t.register_btn}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
    );
  }

  // ==========================================
  // STATE: LOGGED IN (MAIN WORKSPACE)
  // ==========================================
  return (
    <main className="bg-[#F1F6F4] min-h-screen pt-32 pb-32 relative overflow-hidden font-sans">
      
      {/* Soft Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 right-10 w-[700px] h-[700px] bg-emerald-200/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-cyan-100/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Dashboard Header */}
        <ScrollReveal baseClass="opacity-0 translate-y-4" className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-emerald-100/50 mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[12px] font-bold text-emerald-800 uppercase tracking-widest">{t.eyebrow}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight mb-4 leading-tight drop-shadow-sm">
            Rapid-FS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Scoring</span>
          </h1>
          <p className="text-lg text-emerald-900/60 font-medium max-w-2xl leading-relaxed">
            {t.welcome}<span className="text-emerald-900 font-bold">{user?.full_name ? ` ${user.full_name}` : ""}</span>. {t.subtitle}
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* =========================================
              KIRI: PANEL INPUT FORM (High Contrast)
          ========================================= */}
          <ScrollReveal delay="delay-100" className="lg:col-span-5">
            {/* PERBAIKAN: Kotak form menjadi putih solid (bg-white) agar input berwarna hijau pucat dapat terlihat jelas */}
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.08)]">
              
              {/* Premium Segmented Control - Mode Aktif Hijau Gelap */}
              <div className="flex bg-emerald-50 border border-emerald-100 p-1.5 rounded-[1.25rem] mb-10 relative">
                <div 
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-700 rounded-xl shadow-md transition-all duration-500 ease-out ${mode === 'spatial' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
                ></div>
                
                <button
                  type="button"
                  onClick={() => { setMode("spatial"); setError(null); setResults(null); }}
                  className={`flex-1 py-3.5 text-[13px] font-bold rounded-xl transition-colors duration-300 relative z-10 flex items-center justify-center gap-2 ${
                    mode === "spatial" ? "text-white" : "text-emerald-900/50 hover:text-emerald-800"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  {t.spatial_mode}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("manual"); setError(null); setResults(null); }}
                  className={`flex-1 py-3.5 text-[13px] font-bold rounded-xl transition-colors duration-300 relative z-10 flex items-center justify-center gap-2 ${
                    mode === "manual" ? "text-white" : "text-emerald-900/50 hover:text-emerald-800"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  {t.quick_mode}
                </button>
              </div>

              <form onSubmit={handleCalculate} className="space-y-6">
                
                {/* SPATIAL MODE */}
                {mode === "spatial" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                    <div>
                      <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest mb-3 flex justify-between">
                        <span>{t.upload_label}</span>
                        <span className="text-emerald-500">*</span>
                      </label>
                      {/* PERBAIKAN: Interactive Drag & Drop memiliki warna bg-emerald-50 yang tegas terhadap bg putih panel */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-[2rem] p-10 text-center cursor-pointer transition-all duration-500 group border-2 ${
                          isDragging
                            ? "border-emerald-400 bg-emerald-100/50 scale-[1.02]"
                            : selectedFile
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-dashed border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".zip"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        />
                        {selectedFile ? (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-emerald-600 shadow-sm border border-emerald-100 group-hover:-translate-y-1 transition-transform">
                              <FileArchive className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <p className="font-extrabold text-emerald-950 text-lg">{selectedFile.name}</p>
                            <p className="text-sm font-medium text-emerald-900/50 mt-1">
                              {(selectedFile.size / 1024).toFixed(1)} KB · Click to replace
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-emerald-400 shadow-sm border border-emerald-100 group-hover:text-emerald-600 group-hover:-translate-y-1 transition-all">
                              <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <p className="font-extrabold text-emerald-950 text-lg mb-1">{t.upload_hint}</p>
                            <p className="text-sm font-medium text-emerald-900/50 mb-4">{t.upload_note}</p>
                            <p className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-4 py-1.5 rounded-full uppercase tracking-widest">
                              Requires: .shp, .shx, .dbf, .prj
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest">{t.location_name}</label>
                      {/* PERBAIKAN: Input sekarang memiliki background emerald-50/50 & border tegas sehingga batasnya sangat jelas di mata */}
                      <input
                        type="text"
                        placeholder="e.g., Katingan Peatland"
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest">{t.ecosystem_type}</label>
                      <select
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 appearance-none cursor-pointer"
                        value={ecosystemType}
                        onChange={(e) => setEcosystemType(e.target.value)}
                      >
                        {ecosystemOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* MANUAL MODE */}
                {mode === "manual" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest">{t.location_name}</label>
                      <input
                        type="text"
                        placeholder="e.g., Project Alpha"
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest">{t.ecosystem_type}</label>
                      <select
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 appearance-none cursor-pointer"
                        value={ecosystemType}
                        onChange={(e) => setEcosystemType(e.target.value)}
                      >
                        {ecosystemOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest flex justify-between">
                        <span>{t.area_size} (Ha)</span>
                        <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g., 50000"
                        className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950 placeholder:text-emerald-900/30"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest">{t.duration} (Yrs)</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest">{t.carbon_price} ($)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all font-medium text-emerald-950"
                          value={carbonPrice}
                          onChange={(e) => setCarbonPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-2xl text-rose-700 text-[13px] font-medium flex items-start gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" strokeWidth={2.5} />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl text-emerald-700 text-[13px] font-medium flex items-start gap-3 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" strokeWidth={2.5} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="pt-6">
                  {/* PERBAIKAN: Tombol Run Analysis bersih, hijau, dan tanpa Sparkles/Arrow */}
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full py-4 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 group"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin"></div>
                        {t.processing}
                      </>
                    ) : (
                      <>
                        {t.run_analysis}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>

          {/* =========================================
              KANAN: PANEL RESULTS & MAP PREVIEW
          ========================================= */}
          <ScrollReveal delay="delay-300" className="lg:col-span-7 h-full">
            {results ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 lg:p-10 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.08)] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col">
                
                {/* Premium Score Section */}
                <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-emerald-50">
                  <div>
                    <p className="text-[12px] font-bold tracking-widest uppercase text-emerald-900/40 mb-2">{t.score_label}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-cyan-600 drop-shadow-sm">
                        {results.feasibility_score?.toFixed(1)}
                      </span>
                      <span className="text-2xl font-bold text-emerald-900/20 mb-2">/100</span>
                    </div>
                  </div>
                  <span className="px-5 py-2.5 bg-emerald-50 text-emerald-700 text-[13px] font-extrabold tracking-widest uppercase rounded-full border border-emerald-200/50 shadow-sm">
                    {results.feasibility_category}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Metric label="Carbon Stock (CO₂e)" value={`${formatNumber(results.co2e_ton)}`} unit="t" />
                  <Metric label="Total Credits (ACC)" value={`${formatNumber(results.acc_total_credits)}`} unit="t" />
                  <Metric label="Gross Revenue" value={formatCurrency(results.gross_revenue_usd)} />
                  <Metric label="Net Revenue" value={formatCurrency(results.net_revenue_usd)} highlight />
                </div>

                {/* Map Preview Container */}
                {results.geometry && (
                  <div className="pt-2">
                    <p className="text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Map className="w-4 h-4 text-emerald-500" />
                      {lang === "id" ? "Pemetaan Spasial" : "Spatial Mapping"}
                    </p>
                    <div className="rounded-[1.5rem] overflow-hidden border border-emerald-100 shadow-sm">
                      <MapPreview geometry={results.geometry} />
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations?.length > 0 && (
                  <div className="p-6 bg-white rounded-[1.5rem] border border-emerald-100/50 mt-2 shadow-sm">
                    <p className="text-[12px] font-bold text-emerald-900/70 uppercase tracking-widest mb-4">
                      {t.recommendations}
                    </p>
                    <ul className="space-y-3">
                      {results.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-[14px] text-emerald-900/70 font-medium leading-relaxed flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions at bottom */}
                <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-6 py-4 bg-emerald-950 text-white text-[14px] font-bold rounded-2xl hover:bg-emerald-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 flex justify-center items-center gap-2"
                  >
                    {isSaving ? "Saving Data..." : (
                      <>
                        <Save className="w-4 h-4" strokeWidth={2.5} />
                        {t.save}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 px-6 py-4 bg-white border border-emerald-200/50 text-emerald-800 text-[14px] font-bold rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.98] transition-all duration-300 flex justify-center items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                    {t.download_pdf}
                  </button>
                </div>
              </div>
            ) : (
              // EMPTY STATE
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-8 h-full min-h-[600px] flex flex-col items-center justify-center text-center shadow-[0_20px_40px_-15px_rgba(16,185,129,0.05)]">
                
                <div className="relative flex items-center justify-center w-40 h-40 mb-8">
                  <div className="absolute inset-0 border border-emerald-300/30 rounded-full animate-[ping_3s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-6 border border-emerald-400/20 rounded-full animate-[ping_3s_ease-in-out_infinite_1s]"></div>
                  <div className="absolute inset-12 border border-emerald-500/20 rounded-full animate-[ping_3s_ease-in-out_infinite_2s]"></div>
                  
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center border border-emerald-100 shadow-inner z-10">
                    <Map className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-emerald-950 mb-3 tracking-tight">
                  {lang === "id" ? "Menunggu Input Spasial" : "System Ready for Analysis"}
                </h3>
                <p className="text-emerald-900/50 font-medium max-w-sm leading-relaxed">
                  {lang === "id" 
                    ? "Sistem siap melakukan pemindaian. Masukkan parameter proyek Anda di sebelah kiri untuk menghasilkan kalkulasi."
                    : "The system is on standby. Input your project parameters on the left to generate calculations."}
                </p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, unit, highlight = false }: { label: string; value: string, unit?: string, highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-[1.25rem] border transition-all duration-300 group ${
      highlight 
        ? "bg-emerald-50/50 border-emerald-100/80 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-900/5" 
        : "bg-white/60 backdrop-blur-sm border-white hover:bg-white hover:shadow-md hover:shadow-emerald-900/5"
    }`}>
      <p className={`text-[11px] font-bold tracking-widest uppercase mb-2 ${highlight ? 'text-emerald-700/70' : 'text-emerald-900/40'}`}>
        {label}
      </p>
      <p className={`text-2xl font-extrabold transition-colors ${highlight ? 'text-emerald-900' : 'text-emerald-950'}`}>
        {value} {unit && <span className={`text-sm font-bold ml-1 ${highlight ? 'text-emerald-600' : 'text-emerald-600/60'}`}>{unit}</span>}
      </p>
    </div>
  );
}