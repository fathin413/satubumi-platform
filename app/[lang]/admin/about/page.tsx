"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ImagePlus, Plus, Trash2, Save, LayoutTemplate, FileText, Images, Eye, Target, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const SLUGS = {
  hero: "about-hero",
  body: "about-body",
  vision: "about-vision",
  mission: "about-mission",
  gallery1: "about-gallery-1",
  gallery2: "about-gallery-2",
  gallery3: "about-gallery-3",
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
type CropTarget = "hero" | "body" | "g1" | "g2" | "g3";
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

function parseList(content: string): string[] {
  if (!content) return [""];
  if (isHtml(content)) {
    const items: string[] = [];
    const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = re.exec(content)) !== null) {
      const t = stripHtml(m[1]);
      if (t) items.push(t);
    }
    return items.length ? items : [""];
  }
  const lines = content
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim())
    .filter(Boolean);
  return lines.length ? lines : [""];
}

function listToHtml(items: string[]) {
  const lis = items
    .map((i) => i.trim())
    .filter(Boolean)
    .map((i) => `<li>${i}</li>`)
    .join("");
  return lis ? `<ul>${lis}</ul>` : "<p>-</p>";
}

export default function AdminAboutPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [ids, setIds] = useState<Record<IdKey, number | null>>({
    hero: null,
    body: null,
    vision: null,
    mission: null,
    gallery1: null,
    gallery2: null,
    gallery3: null,
  });

  const [heroTitle, setHeroTitle] = useState("");
  const [heroLabel, setHeroLabel] = useState("");
  const [bodyTitle, setBodyTitle] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [visionTitle, setVisionTitle] = useState("");
  const [visionContent, setVisionContent] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionItems, setMissionItems] = useState<string[]>([""]);

  const [heroImg, setHeroImg] = useState<ImgSlot>({ preview: null, file: null });
  const [bodyImg, setBodyImg] = useState<ImgSlot>({ preview: null, file: null });
  const [g1, setG1] = useState<ImgSlot>({ preview: null, file: null });
  const [g2, setG2] = useState<ImgSlot>({ preview: null, file: null });
  const [g3, setG3] = useState<ImgSlot>({ preview: null, file: null });

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [deletingImg, setDeletingImg] = useState<string | null>(null);

  const token = () => localStorage.getItem("access_token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        const about = list.filter((a) => a.category === "about");
        const find = (slug: string) => about.find((a) => a.slug === slug);

        const hero = find(SLUGS.hero);
        const body = find(SLUGS.body);
        const vision = find(SLUGS.vision);
        const mission = find(SLUGS.mission);
        const gallery1 = find(SLUGS.gallery1);
        const gallery2 = find(SLUGS.gallery2);
        const gallery3 = find(SLUGS.gallery3);

        setIds({
          hero: hero?.id ?? null,
          body: body?.id ?? null,
          vision: vision?.id ?? null,
          mission: mission?.id ?? null,
          gallery1: gallery1?.id ?? null,
          gallery2: gallery2?.id ?? null,
          gallery3: gallery3?.id ?? null,
        });

        if (hero) {
          setHeroTitle(hero.title || "");
          setHeroLabel(
            hero.content
              ? isHtml(hero.content)
                ? stripHtml(hero.content)
                : hero.content
              : ""
          );
          setHeroImg({ preview: resolveImageUrl(hero.image_url), file: null });
        }
        if (body) {
          setBodyTitle(body.title || "");
          setBodyContent(body.content || "");
          setBodyImg({ preview: resolveImageUrl(body.image_url), file: null });
        }
        if (vision) {
          setVisionTitle(vision.title || "");
          setVisionContent(
            vision.content
              ? isHtml(vision.content)
                ? stripHtml(vision.content)
                : vision.content
              : ""
          );
        }
        if (mission) {
          setMissionTitle(mission.title || "");
          setMissionItems(parseList(mission.content || ""));
        }
        if (gallery1) setG1({ preview: resolveImageUrl(gallery1.image_url), file: null });
        if (gallery2) setG2({ preview: resolveImageUrl(gallery2.image_url), file: null });
        if (gallery3) setG3({ preview: resolveImageUrl(gallery3.image_url), file: null });
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
      category: "about",
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

  const handleDeleteImage = async (
    key: IdKey,
    clearSlot: () => void
  ) => {
    const articleId = ids[key];
    if (!articleId) {
      // Belum tersimpan di server — cukup clear lokal
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
      if (!res.ok) {
        throw new Error(isId ? "Gagal menghapus gambar" : "Failed to delete image");
      }
      clearSlot();
      setSuccess(isId ? "Gambar dihapus" : "Image deleted");
      
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
        title: heroTitle || "About",
        content: heroLabel || "",
        slug: SLUGS.hero,
      });
      if (heroImg.file) await uploadImage(heroSaved.id, heroImg.file);

      const bodySaved = await upsert("body", {
        title: bodyTitle || "Satubumi",
        content: bodyContent || "",
        slug: SLUGS.body,
      });
      if (bodyImg.file) await uploadImage(bodySaved.id, bodyImg.file);

      await upsert("vision", {
        title: visionTitle || (isId ? "Visi" : "Vision"),
        content: visionContent || "",
        slug: SLUGS.vision,
      });

      await upsert("mission", {
        title: missionTitle || (isId ? "Misi" : "Mission"),
        content: listToHtml(missionItems),
        slug: SLUGS.mission,
      });

      const g1Saved = await upsert("gallery1", {
        title: "Gallery 1",
        content: "-",
        slug: SLUGS.gallery1,
      });
      if (g1.file) await uploadImage(g1Saved.id, g1.file);

      const g2Saved = await upsert("gallery2", {
        title: "Gallery 2",
        content: "-",
        slug: SLUGS.gallery2,
      });
      if (g2.file) await uploadImage(g2Saved.id, g2.file);

      const g3Saved = await upsert("gallery3", {
        title: "Gallery 3",
        content: "-",
        slug: SLUGS.gallery3,
      });
      if (g3.file) await uploadImage(g3Saved.id, g3.file);

      setHeroImg((p) => ({ ...p, file: null }));
      setBodyImg((p) => ({ ...p, file: null }));
      setG1((p) => ({ ...p, file: null }));
      setG2((p) => ({ ...p, file: null }));
      setG3((p) => ({ ...p, file: null }));

      setSuccess(isId ? "Semua perubahan berhasil disimpan!" : "All changes saved successfully!");
      
      setTimeout(() => setSuccess(null), 3000);
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

  const cropAspect = cropTarget === "hero" ? 16 / 9 : 4 / 3;

  // Komponen Helper untuk Image Field yang Estetik
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
            {isId ? "Kelola Halaman About" : "Manage About Page"}
          </h1>
          <p className="text-slate-500 font-medium text-[13px] hidden md:block">
            {isId
              ? "Perbarui narasi visi, misi, dan galeri untuk halaman profil perusahaan."
              : "Update vision, mission, and gallery for your company profile page."}
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

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
              {isId ? "Judul Hero" : "Hero Title"}
            </label>
            <input
              className={inputCls}
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="e.g. About Satubumi"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
              {isId ? "Subtitle Hero" : "Hero Subtitle"}
            </label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={heroLabel}
              onChange={(e) => setHeroLabel(e.target.value)}
              placeholder={isId ? "Teks di bawah judul utama..." : "Text below main title..."}
            />
          </div>

          <ImageField
            label={isId ? "Background Hero" : "Hero Background"}
            slot={heroImg}
            target="hero"
            ratio="16/9"
            idKey="hero"
            onClear={() => setHeroImg({ preview: null, file: null })}
          />
        </section>

        {/* SECTION 2: NARASI (BODY) */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                2. {isId ? "Narasi Utama" : "Main Body Content"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.body}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Judul Narasi" : "Body Title"}</label>
            <input
              className={inputCls}
              value={bodyTitle}
              onChange={(e) => setBodyTitle(e.target.value)}
              placeholder={isId ? "e.g. Siapa Kami?" : "e.g. Who Are We?"}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Konten Narasi" : "Body Content"}</label>
            {/* Rich Text Editor */}
            <div className="rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all bg-slate-50">
              <RichTextEditor value={bodyContent} onChange={setBodyContent} />
            </div>
          </div>

          <ImageField
            label={isId ? "Gambar Samping" : "Side Image"}
            slot={bodyImg}
            target="body"
            ratio="4/3"
            idKey="body"
            onClear={() => setBodyImg({ preview: null, file: null })}
          />
        </section>

        {/* SECTION 3: GALLERY */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                3. {isId ? "Galeri Perusahaan" : "Company Gallery"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.gallery1} - {SLUGS.gallery3}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <ImageField
              label={isId ? "Foto Galeri 1" : "Gallery Photo 1"}
              slot={g1}
              target="g1"
              ratio="4/3"
              idKey="gallery1"
              onClear={() => setG1({ preview: null, file: null })}
            />
            <ImageField
              label={isId ? "Foto Galeri 2" : "Gallery Photo 2"}
              slot={g2}
              target="g2"
              ratio="4/3"
              idKey="gallery2"
              onClear={() => setG2({ preview: null, file: null })}
            />
            <ImageField
              label={isId ? "Foto Galeri 3" : "Gallery Photo 3"}
              slot={g3}
              target="g3"
              ratio="4/3"
              idKey="gallery3"
              onClear={() => setG3({ preview: null, file: null })}
            />
          </div>
        </section>

        {/* SECTION 4: VISION */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                4. {isId ? "Visi" : "Vision"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.vision}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Judul Visi" : "Vision Title"}</label>
            <input
              className={inputCls}
              value={visionTitle}
              onChange={(e) => setVisionTitle(e.target.value)}
              placeholder={isId ? "e.g. Visi Kami" : "e.g. Our Vision"}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Pernyataan Visi" : "Vision Statement"}</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              value={visionContent}
              onChange={(e) => setVisionContent(e.target.value)}
              placeholder={isId ? "Tuliskan visi perusahaan di sini..." : "Write company vision here..."}
            />
          </div>
        </section>

        {/* SECTION 5: MISSION */}
        <section className={box}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                5. {isId ? "Misi" : "Mission"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">slug: {SLUGS.mission}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">{isId ? "Judul Misi" : "Mission Title"}</label>
            <input
              className={inputCls}
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              placeholder={isId ? "e.g. Misi Kami" : "e.g. Our Mission"}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide mb-2">{isId ? "Daftar Misi" : "Mission List"}</label>
            {missionItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  className={inputCls}
                  value={item}
                  placeholder={isId ? `Poin misi ke-${index + 1}...` : `Mission point ${index + 1}...`}
                  onChange={(e) => {
                    const next = [...missionItems];
                    next[index] = e.target.value;
                    setMissionItems(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setMissionItems((prev) =>
                      prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)
                    )
                  }
                  className="p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                  title={isId ? "Hapus" : "Delete"}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMissionItems((p) => [...p, ""])}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isId ? "Tambah Poin Misi" : "Add Mission Point"}
              </button>
            </div>
          </div>
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
            if (cropTarget === "body") setBodyImg(slot);
            if (cropTarget === "g1") setG1(slot);
            if (cropTarget === "g2") setG2(slot);
            if (cropTarget === "g3") setG3(slot);
            setCropSrc(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
}