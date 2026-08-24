"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ImagePlus,
  Save,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Star,
  UserCircle,
  ChevronDown
} from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function slugify(text: string, fallback: string) {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return s || fallback;
}

type TopicOption = {
  id: number;
  slug: string;
  label_id: string;
  label_en: string;
};

type Props = {
  mode: "create" | "edit";
  initial?: {
    id: number;
    title: string;
    title_en?: string | null;
    content: string;
    content_en?: string | null;
    slug: string;
    image_url?: string | null;
    author?: string | null;
    topic?: string | null;
    is_featured?: boolean | null;
  };
};

export default function InsightForm({ mode, initial }: Props) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [title, setTitle] = useState(initial?.title || "");
  const [titleEn, setTitleEn] = useState(initial?.title_en || "");
  const [content, setContent] = useState(initial?.content || "");
  const [contentEn, setContentEn] = useState(initial?.content_en || "");
  const [topic, setTopic] = useState(initial?.topic || "");
  const [isFeatured, setIsFeatured] = useState(!!initial?.is_featured);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  
  const [topicOpen, setTopicOpen] = useState(false); 
  
  // STATE BARU: Untuk mengatur tab bahasa mana yang sedang aktif di Rich Text Editor
  const [activeLangTab, setActiveLangTab] = useState<"id" | "en">("id");

  const [preview, setPreview] = useState<string | null>(
    resolveImageUrl(initial?.image_url)
  );
  const [file, setFile] = useState<File | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("Satubumi Team");

  const token = () => localStorage.getItem("access_token");
  
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-[15px] font-semibold text-slate-800 transition-all placeholder:text-slate-400";
  const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2";

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    const loadMe = async () => {
      const t = localStorage.getItem("access_token");
      if (!t) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) return;
        const me = await res.json();
        if (me.full_name && String(me.full_name).trim()) {
          setAuthorName(String(me.full_name).trim());
        }
      } catch {
        /* default */
      }
    };
    loadMe();
  }, []);

  useEffect(() => {
    const loadTopics = async () => {
      setTopicsLoading(true);
      try {
        const res = await fetch(`${API_URL}/insight-topics/`);
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        const list: TopicOption[] = Array.isArray(data) ? data : [];
        setTopics(list);
        
        if (!topic && list.length > 0) {
          const match = list.find((t) => t.slug === initial?.topic);
          setTopic(match?.slug || list[0].slug);
        }
      } catch {
        setTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    };
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadImage = async (articleId: number, f: File) => {
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch(`${API_URL}/articles/${articleId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd,
    });
    if (!res.ok)
      throw new Error(isId ? "Upload gambar gagal" : "Image upload failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      setError(
        isId
          ? "Topik belum tersedia. Buat di menu Topic Insight."
          : "Topic unavailable. Create one under Insight Topics."
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        category: "insight",
        title: title.trim() || "Insight",
        title_en: titleEn.trim() || null,
        content: content || "-",
        content_en: contentEn || null,
        status: "published",
        topic,
        is_featured: isFeatured,
        author:
          mode === "edit" && initial?.author?.trim()
            ? initial.author.trim()
            : authorName,
      };

      let id = initial?.id;
      if (mode === "create") {
        payload.slug = slugify(title, `insight-${Date.now()}`);
        const res = await fetch(`${API_URL}/articles/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok)
          throw new Error(isId ? "Gagal membuat insight" : "Create failed");
        const saved = await res.json();
        id = saved.id;
      } else if (id) {
        const res = await fetch(`${API_URL}/articles/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok)
          throw new Error(isId ? "Gagal menyimpan" : "Update failed");
      }

      if (file && id) await uploadImage(id, file);

      setSuccess(isId ? "Insight berhasil disimpan!" : "Insight saved successfully!");
      setTimeout(() => router.push(`/${lang}/admin/insights`), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans pb-8">
      {/* MODAL ERROR / SUCCESS */}
      {(error || success) && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center relative animate-in zoom-in-[0.5] fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            {error ? (
              <>
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-200 animate-ping opacity-50 duration-1000" />
                  <AlertTriangle className="w-10 h-10 text-rose-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
                  {isId ? "Terjadi Kesalahan" : "Action Failed"}
                </h3>
                <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed px-2">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="w-full py-4 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 hover:text-rose-700 transition-all duration-300 active:scale-95"
                >
                  {isId ? "Tutup Modal" : "Close"}
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-50 duration-1000" />
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
                  {isId ? "Berhasil!" : "Success!"}
                </h3>
                <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed px-2">
                  {success}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="w-full py-4 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-all duration-300 shadow-md shadow-emerald-950/20 active:scale-95"
                >
                  {isId ? "Tutup Modal" : "Close"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/80 rounded-[2rem] p-6 md:p-10 shadow-sm"
      >
        {/* AUTHOR BADGE */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl mb-8 w-max shadow-sm">
          <UserCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {isId ? "Penulis Publikasi" : "Publication Author"}
            </p>
            <p className="text-[13px] font-bold text-slate-700 leading-none">
              {mode === "edit" && initial?.author ? initial.author : authorName}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelCls}>Judul (ID) <span className="text-rose-500">*</span></label>
            <input
              className={inputCls}
              placeholder="Masukkan judul insight..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Title (EN)</label>
            <input
              className={inputCls}
              placeholder="Enter insight title..."
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
          </div>
        </div>

        {/* Topic + Featured Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          <div className="relative group">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Kategori Topik <span className="text-rose-500">*</span>
              </label>
              <Link
                href={`/${lang}/admin/insight-topics`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
              >
                <Tag className="w-3 h-3" />
                {isId ? "Kelola Topik" : "Manage Topics"}
              </Link>
            </div>
            
            <div
              onClick={() => !topicsLoading && topics.length > 0 && setTopicOpen(!topicOpen)}
              className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center transition-all duration-300 ${
                topicsLoading || topics.length === 0
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:border-emerald-500 hover:bg-white group-hover:ring-4 group-hover:ring-emerald-500/10"
              }`}
            >
              <span className="font-semibold text-[15px] text-slate-800">
                {topicsLoading
                  ? (isId ? "Memuat..." : "Loading...")
                  : topics.length === 0
                  ? (isId ? "Belum ada topik" : "No topics available")
                  : topics.find((t) => t.slug === topic)
                  ? isId
                    ? topics.find((t) => t.slug === topic)?.label_id
                    : topics.find((t) => t.slug === topic)?.label_en
                  : (isId ? "Pilih Topik" : "Select Topic")}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                  topicOpen ? "rotate-180 text-emerald-500" : "group-hover:text-emerald-500"
                }`}
              />
            </div>

            {topicOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTopicOpen(false)} />
                <div className="absolute z-40 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {topics.map((t) => (
                    <div
                      key={t.slug}
                      onClick={() => {
                        setTopic(t.slug);
                        setTopicOpen(false);
                      }}
                      className={`px-5 py-3.5 text-[14.5px] cursor-pointer transition-colors ${
                        topic === t.slug
                          ? "bg-emerald-50 text-emerald-700 font-bold"
                          : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {isId ? t.label_id : t.label_en}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-end">
            <label 
              className={`flex items-center justify-between w-full px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                isFeatured ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className={`w-5 h-5 ${isFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                <span className={`text-[14px] font-bold ${isFeatured ? "text-amber-800" : "text-slate-600"}`}>
                  {isId ? "Jadikan Sorotan (Top Insight)" : "Set as Top Insight"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* ================= TABS KONTEN FULL WIDTH ================= */}
        <div className="mb-10 mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <label className={`${labelCls} !mb-0`}>
              {isId ? "Konten Artikel (Layar Penuh)" : "Article Content"} <span className="text-rose-500">*</span>
            </label>
            
            {/* Tombol Tab Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveLangTab("id")}
                className={`px-5 py-2 text-[12px] font-extrabold rounded-lg transition-all duration-200 ${
                  activeLangTab === "id"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                🇮🇩 Indonesia (ID)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab("en")}
                className={`px-5 py-2 text-[12px] font-extrabold rounded-lg transition-all duration-200 ${
                  activeLangTab === "en"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                🇬🇧 English (EN)
              </button>
            </div>
          </div>

          {/* Wrapper untuk mempertahankan status Editor (Sembunyikan yang tidak aktif dengan class "hidden") */}
          <div className={activeLangTab === "id" ? "block animate-in fade-in duration-300" : "hidden"}>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all shadow-sm">
              <RichTextEditor 
                value={content} 
                onChange={setContent} 
                placeholder="Ketik isi artikel dalam Bahasa Indonesia di sini..." 
              />
            </div>
          </div>

          <div className={activeLangTab === "en" ? "block animate-in fade-in duration-300" : "hidden"}>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all shadow-sm">
              <RichTextEditor 
                value={contentEn} 
                onChange={setContentEn} 
                placeholder="Type the English article content here..." 
              />
            </div>
          </div>
        </div>
        {/* ================= END TABS ================= */}

        <div className="mb-10">
          <label className={labelCls}>
            {isId ? "Gambar Utama (16:9)" : "Cover Image (16:9)"}
          </label>
          {preview ? (
            <div className="relative aspect-video max-w-xl rounded-[1.5rem] overflow-hidden border-4 border-slate-100 shadow-md mb-4 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <label className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200">
            <ImagePlus className="w-5 h-5" />
            {isId ? "Pilih atau Ganti Gambar" : "Choose / change image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCropSrc(URL.createObjectURL(f));
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="pt-6 border-t border-slate-200/80">
          <button
            type="submit"
            disabled={saving || topicsLoading || topics.length === 0}
            className="w-full py-4 bg-emerald-800 text-white text-[15px] font-extrabold rounded-xl flex items-center justify-center gap-2.5 disabled:opacity-50 hover:bg-emerald-950 transition-all shadow-md shadow-emerald-950/20 active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isId ? "Simpan Publikasi Insight" : "Save Insight Publication"}
          </button>
        </div>
      </form>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={16 / 9}
          onCancel={() => setCropSrc(null)}
          onComplete={(f) => {
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
}