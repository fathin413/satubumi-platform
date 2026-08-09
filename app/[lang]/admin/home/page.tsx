"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ImagePlus, Trash2, Save, LayoutTemplate, Info, Sparkles, Package, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const SLUGS = {
  hero: "home-hero",
  about: "home-card-about",
  services: "home-card-services",
  products: "home-card-products",
} as const;

type Article = {
  id: number;
  category: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  image_url?: string | null;
};

type ImgSlot = { preview: string | null; file: File | null };
type CropTarget = "hero" | "about" | "products";
type IdKey = keyof typeof SLUGS;

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content || "");
}

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseHeroContent(raw: string) {
  if (!raw) return { highlight: "", subtitle: "" };
  if (raw.includes("<<<")) {
    const [hl, sub] = raw.split("<<<");
    return { highlight: (hl || "").trim(), subtitle: (sub || "").trim() };
  }
  return {
    highlight: "",
    subtitle: isHtml(raw) ? stripHtml(raw) : raw.trim(),
  };
}

export default function AdminHomePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingImg, setDeletingImg] = useState<string | null>(null);

  const [ids, setIds] = useState<Record<IdKey, number | null>>({
    hero: null,
    about: null,
    services: null,
    products: null,
  });

  const [heroTitle, setHeroTitle] = useState("");
  const [heroHighlight, setHeroHighlight] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImg, setHeroImg] = useState<ImgSlot>({ preview: null, file: null });

  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDesc, setAboutDesc] = useState("");
  const [aboutImg, setAboutImg] = useState<ImgSlot>({ preview: null, file: null });

  const [servicesTitle, setServicesTitle] = useState("");
  const [servicesDesc, setServicesDesc] = useState("");

  const [productsTitle, setProductsTitle] = useState("");
  const [productsDesc, setProductsDesc] = useState("");
  const [productsImg, setProductsImg] = useState<ImgSlot>({ preview: null, file: null });

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  const token = () => localStorage.getItem("access_token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        const find = (slug: string) => list.find((a) => a.slug === slug);

        const hero = find(SLUGS.hero);
        const about = find(SLUGS.about);
        const services = find(SLUGS.services);
        const products = find(SLUGS.products);

        setIds({
          hero: hero?.id ?? null,
          about: about?.id ?? null,
          services: services?.id ?? null,
          products: products?.id ?? null,
        });

        if (hero) {
          setHeroTitle(hero.title || "");
          const parsed = parseHeroContent(hero.content || "");
          setHeroHighlight(parsed.highlight);
          setHeroSubtitle(parsed.subtitle);
          setHeroImg({ preview: resolveImageUrl(hero.image_url), file: null });
        }
        if (about) {
          setAboutTitle(about.title || "");
          setAboutDesc(
            about.content
              ? isHtml(about.content)
                ? stripHtml(about.content)
                : about.content
              : ""
          );
          setAboutImg({ preview: resolveImageUrl(about.image_url), file: null });
        }
        if (services) {
          setServicesTitle(services.title || "");
          setServicesDesc(
            services.content
              ? isHtml(services.content)
                ? stripHtml(services.content)
                : services.content
              : ""
          );
        }
        if (products) {
          setProductsTitle(products.title || "");
          setProductsDesc(
            products.content
              ? isHtml(products.content)
                ? stripHtml(products.content)
                : products.content
              : ""
          );
          setProductsImg({ preview: resolveImageUrl(products.image_url), file: null });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upsert = async (
    key: IdKey,
    payload: { title: string; content: string; slug: string }
  ) => {
    const t = token();
    const existingId = ids[key];
    const body = {
      category: "home",
      title: payload.title,
      slug: payload.slug,
      content: payload.content || "-",
      status: "published",
      author: "Satubumi Team",
    };

    if (existingId) {
      const res = await fetch(`${API_URL}/articles/${existingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Gagal update ${key}`);
      return (await res.json()) as Article;
    }

    const res = await fetch(`${API_URL}/articles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gagal buat ${key}`);
    const saved = (await res.json()) as Article;
    setIds((prev) => ({ ...prev, [key]: saved.id }));
    return saved;
  };

  const uploadImage = async (articleId: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/articles/${articleId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd,
    });
    if (!res.ok) throw new Error(isId ? "Upload gambar gagal" : "Image upload failed");
  };

  const handleDeleteImage = async (key: IdKey, clearSlot: () => void) => {
    const articleId = ids[key];
    if (!articleId) {
      clearSlot();
      return;
    }
    if (
      !confirm(
        isId ? "Hapus gambar ini dari server?" : "Delete this image from server?"
      )
    ) {
      return;
    }
    setDeletingImg(key);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/articles/${articleId}/image`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(isId ? "Gagal menghapus gambar" : "Failed to delete image");
      clearSlot();
      setSuccess(isId ? "Gambar dihapus" : "Image deleted");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingImg(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const heroSaved = await upsert("hero", {
        title: heroTitle || "Home Hero",
        content: `${heroHighlight || ""}\n<<<\n${heroSubtitle || ""}`,
        slug: SLUGS.hero,
      });
      if (heroImg.file) await uploadImage(heroSaved.id, heroImg.file);

      const aboutSaved = await upsert("about", {
        title: aboutTitle || "About",
        content: aboutDesc || "-",
        slug: SLUGS.about,
      });
      if (aboutImg.file) await uploadImage(aboutSaved.id, aboutImg.file);

      await upsert("services", {
        title: servicesTitle || "Services",
        content: servicesDesc || "-",
        slug: SLUGS.services,
      });

      const productsSaved = await upsert("products", {
        title: productsTitle || "Products",
        content: productsDesc || "-",
        slug: SLUGS.products,
      });
      if (productsImg.file) await uploadImage(productsSaved.id, productsImg.file);

      setHeroImg((p) => ({ ...p, file: null }));
      setAboutImg((p) => ({ ...p, file: null }));
      setProductsImg((p) => ({ ...p, file: null }));

      setSuccess(isId ? "Semua perubahan berhasil disimpan!" : "All changes saved successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      // Smooth scroll to top to see success message clearly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const openCrop = (target: CropTarget, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropTarget(target);
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const cropAspect = cropTarget === "about" ? 4 / 3 : 16 / 9;

  // Komponen Helper untuk Image Field yang lebih estetik
  const ImageField = ({
    label,
    slot,
    target,
    ratio,
    idKey,
    onClear,
  }: {
    label: string;
    slot: ImgSlot;
    target: CropTarget;
    ratio: "16/9" | "4/3";
    idKey: IdKey;
    onClear: () => void;
  }) => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
        <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
          Ratio: {ratio}
        </span>
      </div>
      
      {slot.preview ? (
        <div
          className={`relative w-full rounded-2xl overflow-hidden border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] group ${
            ratio === "4/3" ? "aspect-[4/3]" : "aspect-video"
          }`}
        >
          <img src={slot.preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
          {/* Overlay & Delete Button */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-start justify-end p-4 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              disabled={deletingImg === idKey}
              onClick={() => handleDeleteImage(idKey, onClear)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/90 backdrop-blur-md text-white text-sm font-bold rounded-xl hover:bg-rose-600 hover:scale-105 transition-all shadow-lg disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              {deletingImg === idKey ? (isId ? "Menghapus..." : "Removing...") : (isId ? "Hapus Gambar" : "Remove Image")}
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-emerald-600 transition-all text-slate-400">
            <ImagePlus className="w-5 h-5" />
          </div>
          <span className="text-[13px] font-bold text-slate-700 mb-1">
            {isId ? "Pilih & Crop Gambar" : "Choose & Crop Image"}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {isId ? "Format JPG, PNG, WEBP didukung" : "JPG, PNG, WEBP formats supported"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => openCrop(target, e)}
          />
        </label>
      )}
    </div>
  );

  // =====================================
  // LOADING STATE
  // =====================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          {isId ? "Memuat Konten..." : "Loading Content..."}
        </p>
      </div>
    );
  }

  const box = "bg-white border border-slate-200/60 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6 relative overflow-hidden";
  const inputCls =
    "w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400";

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans">
      
      {/* 1. STICKY ACTION BAR (Navigasi Mengambang) */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 p-4 md:px-8 md:py-5 mb-10 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 rounded-b-3xl md:rounded-3xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] mx-[-1rem] md:mx-0 translate-y-[-1rem] md:translate-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            {isId ? "Kelola Beranda" : "Manage Home Page"}
          </h1>
          <p className="text-slate-500 font-medium text-[13px] hidden md:block">
            {isId
              ? "Perbarui teks utama, highlight, dan gambar untuk halaman depan situs web Anda."
              : "Update main texts, highlights, and images for your website's front page."}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-60"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan Semua" : "Save All Changes")}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-8 p-5 bg-rose-50 border border-rose-200/60 rounded-2xl text-rose-700 text-[14px] font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200/60 rounded-2xl text-emerald-700 text-[14px] font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Konten Form */}
      <div className="space-y-8">
        
        {/* SECTION 1: HERO */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                1. Hero Section
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.hero}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                {isId ? "Judul Utama" : "Main Title"}
              </label>
              <input
                className={inputCls}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. Building measurable climate"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-bold text-emerald-700 uppercase tracking-wide">
                {isId ? "Highlight (Cetak Hijau)" : "Highlight (Green Text)"}
              </label>
              <input
                className={`${inputCls} border-emerald-100 bg-emerald-50/30 focus:border-emerald-400`}
                value={heroHighlight}
                onChange={(e) => setHeroHighlight(e.target.value)}
                placeholder="e.g. impact together"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
              Subtitle
            </label>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder={isId ? "Teks penjelasan di bawah judul utama..." : "Explanation text below the main title..."}
            />
          </div>

          <ImageField
            label={isId ? "Latar Belakang Hero" : "Hero Background Image"}
            slot={heroImg}
            target="hero"
            ratio="16/9"
            idKey="hero"
            onClear={() => setHeroImg({ preview: null, file: null })}
          />
        </section>

        {/* SECTION 2: ABOUT CARD */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                2. {isId ? "Kartu Info: About" : "Info Card: About"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.about}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Judul Kartu" : "Card Title"}</label>
            <input
              className={inputCls}
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              placeholder={isId ? "e.g. Tentang Satubumi" : "e.g. About Satubumi"}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Deskripsi Singkat" : "Short Description"}</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              value={aboutDesc}
              onChange={(e) => setAboutDesc(e.target.value)}
              placeholder={isId ? "Ketik deskripsi singkat di sini..." : "Type short description here..."}
            />
          </div>

          <ImageField
            label={isId ? "Gambar Saat Kursor Mengarah (Hover)" : "Hover Image"}
            slot={aboutImg}
            target="about"
            ratio="4/3"
            idKey="about"
            onClear={() => setAboutImg({ preview: null, file: null })}
          />
        </section>

        {/* SECTION 3: SERVICES CARD */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                3. {isId ? "Kartu Info: Services" : "Info Card: Services"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.services}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Judul Kartu" : "Card Title"}</label>
            <input
              className={inputCls}
              value={servicesTitle}
              onChange={(e) => setServicesTitle(e.target.value)}
              placeholder={isId ? "e.g. Layanan Kami" : "e.g. Our Services"}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Deskripsi Singkat" : "Short Description"}</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              value={servicesDesc}
              onChange={(e) => setServicesDesc(e.target.value)}
              placeholder={isId ? "Ketik deskripsi singkat di sini..." : "Type short description here..."}
            />
          </div>
        </section>

        {/* SECTION 4: PRODUCTS CARD */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                4. {isId ? "Kartu Info: Products" : "Info Card: Products"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.products}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Judul Kartu" : "Card Title"}</label>
            <input
              className={inputCls}
              value={productsTitle}
              onChange={(e) => setProductsTitle(e.target.value)}
              placeholder={isId ? "e.g. Produk Unggulan" : "e.g. Core Products"}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Deskripsi Singkat" : "Short Description"}</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              value={productsDesc}
              onChange={(e) => setProductsDesc(e.target.value)}
              placeholder={isId ? "Ketik deskripsi singkat di sini..." : "Type short description here..."}
            />
          </div>
          
          <ImageField
            label={isId ? "Gambar Produk Latar Belakang" : "Product Background Image"}
            slot={productsImg}
            target="products"
            ratio="16/9"
            idKey="products"
            onClear={() => setProductsImg({ preview: null, file: null })}
          />
        </section>
      </div>

      {/* CROP MODAL */}
      {cropSrc && cropTarget && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={cropAspect}
          onCancel={() => {
            setCropSrc(null);
            setCropTarget(null);
          }}
          onComplete={(file) => {
            const preview = URL.createObjectURL(file);
            const slot = { preview, file };
            if (cropTarget === "hero") setHeroImg(slot);
            if (cropTarget === "about") setAboutImg(slot);
            if (cropTarget === "products") setProductsImg(slot);
            setCropSrc(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
}