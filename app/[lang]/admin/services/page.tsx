"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ImagePlus, Plus, Trash2, Save } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

type Article = {
  id: number;
  category: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  image_url?: string | null;
};

type Row = {
  key: string;
  id: number | null;
  title: string;
  content: string;
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

export default function AdminServicesPage() {
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

  const token = () => localStorage.getItem("access_token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/articles/`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : [];
        const services = list.filter((a) => a.category === "services");

        setRows(
          services.length
            ? services.map((a, i) => ({
                key: `id-${a.id}`,
                id: a.id,
                title: a.title || "",
                content: a.content || "",
                preview: resolveImageUrl(a.image_url),
                file: null,
              }))
            : [
                {
                  key: "new-0",
                  id: null,
                  title: "",
                  content: "",
                  preview: null,
                  file: null,
                },
              ]
        );
      } catch (err: any) {
        setError(err.message);
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
        content: "",
        preview: null,
        file: null,
      },
    ]);
  };

  const removeRow = async (index: number) => {
    const row = rows[index];
    if (row.id) {
      if (
        !confirm(
          isId
            ? `Hapus layanan "${row.title || "ini"}" dari server?`
            : `Delete service "${row.title || "this"}" from server?`
        )
      ) {
        return;
      }
      try {
        const res = await fetch(`${API_URL}/articles/${row.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) throw new Error(isId ? "Gagal menghapus" : "Delete failed");
      } catch (err: any) {
        setError(err.message);
        return;
      }
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
              content: "",
              preview: null,
              file: null,
            },
          ];
    });
  };

  const uploadImage = async (articleId: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/articles/${articleId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd,
    });
    if (!res.ok) throw new Error(isId ? "Upload gagal" : "Upload failed");
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const nextRows = [...rows];

      for (let i = 0; i < nextRows.length; i++) {
        const row = nextRows[i];
        const title = row.title.trim() || `Service ${i + 1}`;
        const body = {
          category: "services",
          title,
          slug: slugify(title, `service-${i + 1}-${Date.now()}`),
          content: row.content || "-",
          status: "published",
          author: "Satubumi Team",
        };

        let saved: Article;

        if (row.id) {
          const res = await fetch(`${API_URL}/articles/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token()}`,
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error(`Gagal update #${i + 1}`);
          saved = await res.json();
        } else {
          const res = await fetch(`${API_URL}/articles/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token()}`,
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error(`Gagal buat #${i + 1}`);
          saved = await res.json();
          nextRows[i] = { ...row, id: saved.id, key: `id-${saved.id}` };
        }

        if (row.file && saved.id) {
          await uploadImage(saved.id, row.file);
          nextRows[i] = { ...nextRows[i], file: null };
        }
      }

      setRows(nextRows);
      setSuccess(isId ? "Services berhasil disimpan" : "Services saved");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const openCrop = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropIndex(index);
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const layoutHint = (index: number) => {
    if (index % 3 === 0) {
      return isId ? "Kartu BESAR (full)" : "LARGE card (full)";
    }
    return isId ? "Kartu kecil (pasangan 2 kolom)" : "Small card (2-col pair)";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const box = "bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-4";
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 font-medium outline-none focus:border-emerald-400";

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 mb-1">
            {isId ? "Halaman Services" : "Services Page"}
          </h1>
          <p className="text-emerald-900/50 font-medium text-sm">
            {isId
              ? "Pola tampilan: 1 besar → 2 kecil → 1 besar → 2 kecil …"
              : "Layout pattern: 1 large → 2 small → 1 large → 2 small …"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "..." : isId ? "Simpan semua" : "Save all"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {rows.map((row, index) => (
          <section key={row.key} className={box}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-50 pb-3">
              <h2 className="text-lg font-extrabold text-emerald-950">
                {isId ? "Layanan" : "Service"} {index + 1}
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/70 bg-emerald-50 px-2.5 py-1 rounded-full">
                {layoutHint(index)}
              </span>
            </div>

            <input
              className={inputCls}
              value={row.title}
              onChange={(e) => updateRow(index, { title: e.target.value })}
              placeholder={isId ? "Judul layanan" : "Service title"}
            />

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                {isId
                  ? "Deskripsi + list ruang lingkup"
                  : "Description + scope list"}
              </label>
              <RichTextEditor
                value={row.content}
                onChange={(html) => updateRow(index, { content: html })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                {isId ? "Gambar" : "Image"} (16:9)
              </label>
              {row.preview && (
                <div className="mb-3 relative w-full aspect-video rounded-xl overflow-hidden border border-emerald-100">
                  <img
                    src={row.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-800 font-bold text-sm cursor-pointer hover:bg-emerald-50">
                <ImagePlus className="w-4 h-4" />
                {isId ? "Pilih & crop" : "Choose & crop"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => openCrop(index, e)}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => removeRow(index)}
              className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              {isId ? "Hapus layanan ini" : "Remove this service"}
            </button>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-50"
        >
          <Plus className="w-4 h-4" />
          {isId ? "Tambah layanan" : "Add service"}
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "..." : isId ? "Simpan semua" : "Save all"}
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
            const preview = URL.createObjectURL(file);
            updateRow(cropIndex, { preview, file });
            setCropSrc(null);
            setCropIndex(null);
          }}
        />
      )}
    </div>
  );
}