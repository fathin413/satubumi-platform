"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Article = {
  id: number;
  category: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  status: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
};

const emptyForm = {
  category: "services",
  title: "",
  slug: "",
  author: "Satubumi Team",
  content: "",
  status: "published",
  tags: "",
};

export default function AdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = () => localStorage.getItem("access_token");

  const loadArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/articles/`);
      if (!res.ok) throw new Error(isId ? "Gagal memuat artikel" : "Failed to load articles");
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const openEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      category: article.category || "services",
      title: article.title || "",
      slug: article.slug || "",
      author: article.author || "Satubumi Team",
      content: article.content || "",
      status: article.status || "published",
      tags: article.tags || "",
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const t = token();
      const body = {
        category: form.category,
        title: form.title,
        slug: form.slug || undefined,
        author: form.author,
        content: form.content,
        status: form.status,
        tags: form.tags || undefined,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`${API_URL}/articles/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API_URL}/articles/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = isId ? "Gagal menyimpan" : "Failed to save";
        if (typeof data.detail === "string") msg = data.detail;
        else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => d.msg).join(", ");
        }
        throw new Error(msg);
      }

      setSuccess(
        editingId
          ? isId
            ? "Artikel diperbarui"
            : "Article updated"
          : isId
          ? "Artikel dibuat"
          : "Article created"
      );
      setShowForm(false);
      await loadArticles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isId ? "Hapus artikel ini?" : "Delete this article?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const t = token();
      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(isId ? "Gagal menghapus" : "Failed to delete");
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSuccess(isId ? "Artikel dihapus" : "Article deleted");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 tracking-tight mb-1">
            {isId ? "Kelola Konten" : "Content Manager"}
          </h1>
          <p className="text-emerald-900/50 font-medium text-sm">
            {isId
              ? "Tambah, edit, dan hapus artikel website"
              : "Create, edit, and delete website articles"}
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          {isId ? "Artikel Baru" : "New Article"}
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

      {/* Form Create / Edit */}
      {showForm && (
        <div className="mb-8 bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-emerald-950">
              {editingId
                ? isId
                  ? "Edit Artikel"
                  : "Edit Article"
                : isId
                ? "Artikel Baru"
                : "New Article"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="about">About</option>
                  <option value="services">Services</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Title
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  Slug (optional)
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generate if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  Author
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Tags
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="carbon, climate, esg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Content
              </label>
              <textarea
                required
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium resize-y"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "..." : isId ? "Simpan" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-emerald-100 text-emerald-800 font-bold rounded-xl hover:bg-emerald-50"
              >
                {isId ? "Batal" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {articles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-2xl py-20 text-center">
          <FileText className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-900/50 font-medium">
            {isId ? "Belum ada artikel" : "No articles yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white border border-emerald-100/80 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {article.category}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      article.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {article.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-emerald-950 truncate">
                  {article.title}
                </h3>
                <p className="text-sm text-emerald-900/40 font-medium mt-0.5">
                  {article.author} · {article.slug}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(article)}
                  className="p-2.5 rounded-xl border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  disabled={deletingId === article.id}
                  className="p-2.5 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}