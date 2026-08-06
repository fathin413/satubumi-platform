"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Users, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type UserItem = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active?: boolean;
};

const emptyForm = {
  email: "",
  password: "",
  full_name: "",
  role: "client",
};

export default function AdminUsersPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = () => localStorage.getItem("access_token");

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.status === 403) {
        setError(isId ? "Hanya Super Admin yang dapat mengakses." : "Super Admin only.");
        setUsers([]);
        return;
      }
      if (!res.ok) throw new Error(isId ? "Gagal memuat users" : "Failed to load users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const t = token();
      if (!t) {
        router.push(`/${lang}/login`);
        return;
      }
      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!meRes.ok) {
          router.push(`/${lang}/login`);
          return;
        }
        const me = await meRes.json();
        if (me.role !== "super_admin") {
          setError(isId ? "Hanya Super Admin yang dapat mengakses." : "Super Admin only.");
          setLoading(false);
          return;
        }
        await loadUsers();
      } catch {
        router.push(`/${lang}/login`);
      }
    };
    init();
  }, [lang, router, isId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = isId ? "Gagal membuat user" : "Failed to create user";
        if (typeof data.detail === "string") msg = data.detail;
        else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => d.msg).join(", ");
        }
        throw new Error(msg);
      }

      setSuccess(isId ? "User berhasil dibuat" : "User created");
      setShowForm(false);
      setForm(emptyForm);
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isId ? "Hapus user ini?" : "Delete this user?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(isId ? "Gagal menghapus" : "Failed to delete");
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess(isId ? "User dihapus" : "User deleted");
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
            {isId ? "Kelola Pengguna" : "User Management"}
          </h1>
          <p className="text-emerald-900/50 font-medium text-sm">
            {isId
              ? "Tambah dan hapus akun pengguna (Super Admin)"
              : "Create and delete user accounts (Super Admin)"}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setError(null);
            setSuccess(null);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          {isId ? "User Baru" : "New User"}
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

      {/* Form */}
      {showForm && (
        <div className="mb-8 bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-emerald-950">
              {isId ? "User Baru" : "New User"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Full Name
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">
                Role
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 outline-none focus:border-emerald-400 font-medium"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
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
      {users.length === 0 && !error ? (
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-2xl py-20 text-center">
          <Users className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-900/50 font-medium">
            {isId ? "Belum ada user" : "No users yet"}
          </p>
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-emerald-100/80 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {user.role}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-emerald-950 truncate">
                  {user.full_name}
                </h3>
                <p className="text-sm text-emerald-900/40 font-medium mt-0.5">
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingId === user.id}
                className="p-2.5 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}