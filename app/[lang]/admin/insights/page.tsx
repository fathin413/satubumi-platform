"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  ImagePlus, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2 
} from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

type Article = {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  content: string;
  content_en?: string | null;
  image_url?: string | null;
  status: string;
};

type Row = {
  key: string;
  id: number | null;
  title: string;
  title_en: string;
  content: string;
  content_en: string;
  slug: string;
  preview: string | null;
  file: File | null;
};

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

export default function AdminInsightsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  // State khusus untuk Custom Delete Modal
  const [insightToDelete, setInsightToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = () => localStorage.getItem("access_token");

  // Auto-dismiss popup modal
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
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/?category=insight&lang=id`);
        if (!res.ok) throw new Error("Failed to load insights");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        setRows(
          list.length
            ? list.map((a) => ({
                key: `id-${a.id}`,
                id: a.id,
                title: a.title || "",
                title_en: a.title_en || "",
                content: a.content || "",
                content_en: a.content_en || "",
                slug: a.slug || "",
                preview: resolveImageUrl(a.image_url),
                file: null,
              }))
            : [
                {
                  key: "new-0",
                  id: null,
                  title: "",
                  title_en: "",
                  content: "",
                  content_en: "",
                  slug: "",
                  preview: null,
                  file: null,
                },
              ]
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        id: null,
        title: "",
        title_en: "",
        content: "",
        content_en: "",
        slug: "",
        preview: null,
        file: null,
      },
    ]);

    // Auto scroll ke bawah saat menambah baris baru
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  // Eksekusi penghapusan sesudah konfirmasi
  const executeDelete = async () => {
    if (insightToDelete === null) return;
    
    const index = insightToDelete;
    const row = rows[index];
    
    if (row.id) {
      setIsDeleting(true);
      try {
        const res = await fetch(`${API_URL}/articles/${row.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) throw new Error(isId ? "Gagal menghapus insight" : "Delete insight failed");
        
        setSuccess(isId ? "Insight berhasil dihapus!" : "Insight successfully deleted!");
      } catch (err: any) {
        setError(err.message);
        setIsDeleting(false);
        setInsightToDelete(null);
        return;
      }
    } else {
      // Jika insight baru (belum disimpan), langsung munculkan sukses
      setSuccess(isId ? "Insight batal ditambahkan." : "Draft insight removed.");
    }

    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length
        ? next
        : [
            {
              key: `new-${Date.now()}`,
              id: null,
              title: "",
              title_en: "",
              content: "",
              content_en: "",
              slug: "",
              preview: null,
              file: null,
            },
          ];
    });

    setIsDeleting(false);
    setInsightToDelete(null);
  };

  const uploadImage = async (articleId: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/articles/${articleId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const next = [...rows];
      for (let i = 0; i < next.length; i++) {
        const row = next[i];
        const title = row.title.trim() || `Insight ${i + 1}`;
        const payload: Record<string, unknown> = {
          category: "insight",
          title,
          title_en: row.title_en.trim() || null,
          content: row.content || "-",
          content_en: row.content_en || null,
          status: "published",
          author: "Satubumi Team",
        };
        
        if (!row.id) {
          payload.slug = slugify(row.slug || title, `insight-${Date.now()}`);
        }

        let saved: Article;
        if (row.id) {
          const res = await fetch(`${API_URL}/articles/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token()}`,
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Gagal update insight #${i + 1}`);
          saved = await res.json();
        } else {
          const res = await fetch(`${API_URL}/articles/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token()}`,
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Gagal buat insight #${i + 1}`);
          saved = await res.json();
          next[i] = { ...row, id: saved.id, key: `id-${saved.id}`, slug: saved.slug };
        }
        
        if (row.file && saved.id) {
          await uploadImage(saved.id, row.file);
          next[i] = { ...next[i], file: null };
        }
      }
      setRows(next);
      setSuccess(isId ? "Semua insight berhasil disimpan!" : "All insights saved successfully!");
    } catch (e: any) {
      setError(e.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

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

  // Consistent Styling variables
  const box = "bg-white border border-slate-200/60 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6 relative overflow-hidden";
  const inputCls = "w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400";

  return (
    <div className="max-w-5xl mx-auto pb-20 font-sans relative">
      
      {/* GLOBAL POPUP MODAL NOTIFICATION */}
      {(error || success) && !insightToDelete && (
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {insightToDelete !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-[0.5] fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 border border-rose-100 relative">
                <div className="absolute inset-0 rounded-[1.8rem] border-2 border-rose-200 animate-ping opacity-50 duration-1000" />
                <AlertTriangle className="w-10 h-10 text-rose-500 relative z-10" />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
                {isId ? "Hapus Insight Ini?" : "Delete This Insight?"}
              </h3>

              <p className="text-slate-500 text-[14.5px] mb-8 leading-relaxed px-2">
                {isId ? "Apakah Anda yakin ingin menghapus insight" : "Are you sure you want to delete insight"}{" "}
                <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mx-1 truncate max-w-[200px] align-bottom">
                  {rows[insightToDelete]?.title || (isId ? "Baru" : "New")}
                </span>
                ?{" "}
                {isId
                  ? "Tindakan ini permanen dan tidak dapat dibatalkan."
                  : "This action is permanent and cannot be undone."}
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setInsightToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-600 text-[14.5px] font-bold rounded-2xl hover:bg-slate-100 transition-colors disabled:opacity-50 active:scale-95"
                >
                  {isId ? "Batalkan" : "Cancel"}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-rose-600 text-white text-[14.5px] font-bold rounded-2xl hover:bg-rose-700 disabled:opacity-80 flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-rose-600/20 active:scale-95"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-rose-200 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {isId ? "Ya, Hapus" : "Yes, Delete"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY TOP BAR */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 p-4 md:px-8 md:py-5 mb-10 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 rounded-b-3xl md:rounded-3xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] mx-[-1rem] md:mx-0 translate-y-[-1rem] md:translate-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            {isId ? "Kelola Insights" : "Manage Insights"}
          </h1>
          <p className="text-slate-500 font-medium text-[13px] hidden md:block">
            {isId
              ? "Hanya admin yang dapat mempublikasikan ini. Isi versi ID & EN."
              : "Admin-only publish. Fill Indonesian (ID) and English (EN)."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-60"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {saving ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan Semua" : "Save All")}
          </span>
        </button>
      </div>

      <div className="space-y-8">
        {rows.map((row, index) => (
          <section key={row.key} className={box}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-2">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                Insight
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                {row.slug || "New Draft"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                  Judul (ID)
                </label>
                <input
                  className={inputCls}
                  value={row.title}
                  onChange={(e) => updateRow(index, { title: e.target.value })}
                  placeholder={isId ? "Judul artikel insight..." : "Insight title..."}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                  Title (EN)
                </label>
                <input
                  className={inputCls}
                  value={row.title_en}
                  onChange={(e) => updateRow(index, { title_en: e.target.value })}
                  placeholder="Insight title in English..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                  Konten (ID)
                </label>
                <div className="rounded-2xl overflow-hidden border-2 border-transparent bg-slate-50">
                  <RichTextEditor
                    value={row.content}
                    onChange={(html) => updateRow(index, { content: html })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                  Content (EN)
                </label>
                <div className="rounded-2xl overflow-hidden border-2 border-transparent bg-slate-50">
                  <RichTextEditor
                    value={row.content_en}
                    onChange={(html) => updateRow(index, { content_en: html })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                  {isId ? "Gambar Insight" : "Insight Image"}
                </label>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
                  Ratio: 16:9
                </span>
              </div>

              {row.preview ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                  <img src={row.preview} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-start justify-end p-4 opacity-0 group-hover:opacity-100">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md text-slate-700 text-sm font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg cursor-pointer">
                      <ImagePlus className="w-4 h-4" />
                      {isId ? "Ganti Gambar" : "Change Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCropIndex(index);
                          setCropSrc(URL.createObjectURL(file));
                          e.target.value = "";
                        }}
                      />
                    </label>
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCropIndex(index);
                      setCropSrc(URL.createObjectURL(file));
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInsightToDelete(index)}
                className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isId ? "Hapus Insight Ini" : "Remove this insight"}
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="mt-10 pt-8 border-t border-slate-200/60 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pb-12">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-emerald-100 bg-white text-emerald-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-colors w-full sm:w-auto shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {isId ? "Tambah Insight Baru" : "Add New Insight"}
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-60 text-[15px] w-full sm:w-auto min-w-[240px]"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving 
            ? (isId ? "Menyimpan ke Server..." : "Saving to Server...") 
            : (isId ? "Simpan Semua Perubahan" : "Save All Changes")}
        </button>
      </div>

      {cropSrc && cropIndex !== null && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={16 / 9}
          onCancel={() => {
            setCropSrc(null);
            setCropIndex(null);
          }}
          onComplete={(file) => {
            updateRow(cropIndex, { preview: URL.createObjectURL(file), file });
            setCropSrc(null);
            setCropIndex(null);
          }}
        />
      )}
    </div>
  );
}