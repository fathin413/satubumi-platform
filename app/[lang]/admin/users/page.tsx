"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Users, X, AlertTriangle, CheckCircle2, Filter } from "lucide-react";

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

// Prioritas pengurutan hierarki (Makin kecil makin di atas)
const rolePriority: Record<string, number> = {
  super_admin: 1,
  admin: 2,
  client: 3,
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
  
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State untuk Tab Filter
  const [filterRole, setFilterRole] = useState<string>("all");

  const token = () => localStorage.getItem("access_token");

  // Efek untuk menghilangkan Modal Notifikasi secara otomatis setelah 5 detik
  useEffect(() => {
    if (success || (error && !userToDelete)) {
      const timer = setTimeout(() => {
        setSuccess(null);
        if (!userToDelete) setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, userToDelete]);

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
      if (!res.ok) throw new Error(isId ? "Gagal memuat pengguna" : "Failed to load users");
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
        let msg = isId ? "Gagal membuat pengguna" : "Failed to create user";
        if (typeof data.detail === "string") msg = data.detail;
        else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => d.msg).join(", ");
        }
        throw new Error(msg);
      }

      setSuccess(isId ? "Pengguna berhasil dibuat!" : "User successfully created!");
      setShowForm(false);
      setForm(emptyForm);
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initiateDelete = (user: UserItem) => {
    setUserToDelete(user);
    setError(null);
    setSuccess(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setDeletingId(userToDelete.id);
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(isId ? "Gagal menghapus pengguna" : "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccess(isId ? "Pengguna berhasil dihapus!" : "User successfully deleted!");
      setUserToDelete(null); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Mengubah shadow bawaan menjadi custom shadow lembut yang sesuai tema role
  const getCardStyle = (role: string) => {
    switch (role) {
      case "super_admin":
        return "border-rose-200 bg-gradient-to-b from-rose-50/50 to-white hover:border-rose-300 hover:shadow-[0_8px_30px_-12px_rgba(225,29,72,0.3)]";
      case "admin":
        return "border-amber-200 bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-300 hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.3)]";
      default:
        return "border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white hover:border-emerald-300 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.3)]";
    }
  };

  const getAvatarStyle = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "admin":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  // Logika Filter dan Pengurutan Hierarkis
  const processedUsers = users
    .filter((u) => filterRole === "all" || u.role === filterRole)
    .sort((a, b) => {
      const priorityA = rolePriority[a.role] || 99;
      const priorityB = rolePriority[b.role] || 99;
      return priorityA - priorityB;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      
      {/* ========================================= */}
      {/* CENTERED POP-UP NOTIFICATIONS (Berhasil / Gagal) dengan Spring Animation */}
      {/* ========================================= */}
      {((error && !userToDelete) || success) && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center relative animate-in zoom-in-[0.5] fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            {error ? (
              <>
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100 relative">
                  <div className="absolute inset-0 rounded-full border border-rose-200 animate-ping opacity-50 duration-1000" />
                  <AlertTriangle className="w-10 h-10 text-rose-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
                  {isId ? "Terjadi Kesalahan" : "Action Failed"}
                </h3>
                <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed px-2">
                  {error}
                </p>
                <button 
                  onClick={() => setError(null)} 
                  className="w-full py-4 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 hover:text-rose-700 transition-colors active:scale-95"
                >
                  {isId ? "Tutup" : "Close"}
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 relative">
                  <div className="absolute inset-0 rounded-full border border-emerald-200 animate-ping opacity-50 duration-1000" />
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
                  {isId ? "Berhasil!" : "Success!"}
                </h3>
                <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed px-2">
                  {success}
                </p>
                <button 
                  onClick={() => setSuccess(null)} 
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  {isId ? "Tutup" : "Close"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            {isId ? "Kelola Pengguna" : "User Management"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {isId
              ? "Tambah dan hapus akun pengguna (Akses Super Admin)"
              : "Create and delete user accounts (Super Admin Access)"}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setError(null);
            setSuccess(null);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-950 hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          {isId ? "User Baru" : "New User"}
        </button>
      </div>

      {/* Form Tambah User */}
      {showForm && (
        <div className="mb-10 bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm animate-in slide-in-from-top-6 fade-in duration-500 ease-out relative z-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">
                {isId ? "Buat User Baru" : "Create New User"}
              </h2>
              <p className="text-sm text-slate-500">
                {isId ? "Isi formulir di bawah untuk menambahkan kredensial." : "Fill the form below to add credentials."}
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors hover:rotate-90 duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-sm transition-all duration-300"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-sm transition-all duration-300"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-sm transition-all duration-300"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-sm transition-all duration-300 appearance-none cursor-pointer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-emerald-800 text-white text-[14px] font-bold rounded-xl hover:bg-emerald-950 disabled:opacity-60 transition-all duration-300 shadow-sm flex items-center justify-center min-w-[120px] active:scale-95"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin" />
                ) : isId ? "Simpan User" : "Save User"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-8 py-3.5 border border-slate-200 text-slate-600 text-[14px] font-bold rounded-xl hover:bg-slate-50 transition-colors active:scale-95"
              >
                {isId ? "Batal" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================= */}
      {/* FILTER ROLE TABS                          */}
      {/* ========================================= */}
      {users.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl mr-2 text-slate-500 text-[13px] font-bold shadow-sm">
            <Filter className="w-4 h-4" />
            {isId ? "Filter" : "Filters"}
          </div>
          {[
            { id: "all", label: isId ? "Semua" : "All" },
            { id: "super_admin", label: "Super Admin" },
            { id: "admin", label: "Admin" },
            { id: "client", label: "Client" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-95 ${
                filterRole === tab.id
                  ? "bg-emerald-800 text-white shadow-md border border-emerald-800 scale-105"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* List / Grid Pengguna */}
      {users.length === 0 && !error && !loading ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] py-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium text-[15px]">
            {isId ? "Belum ada pengguna yang terdaftar." : "No users registered yet."}
          </p>
        </div>
      ) : processedUsers.length === 0 && !loading ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] py-24 text-center animate-in fade-in duration-300">
          <p className="text-slate-500 font-medium text-[15px]">
            {isId ? "Tidak ada pengguna dengan role ini." : "No users found for this role."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedUsers.map((user, index) => (
            /* BUNGKUS LUAR (Animasi Muncul Pertama Kali) */
            <div
              key={user.id}
              style={{ animationFillMode: "both", animationDelay: `${index * 60}ms` }}
              className="animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out"
            >
              {/* KARTU ASLI (Animasi Hover dipisah agar mulus!) */}
              <div 
                className={`h-full rounded-[1.5rem] p-6 transition-all duration-300 ease-in-out group flex flex-col border hover:-translate-y-1.5 ${getCardStyle(user.role)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-full font-extrabold text-lg flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${getAvatarStyle(user.role)}`}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
                    user.role === 'super_admin' ? 'bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-100' :
                    user.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mb-6 flex-1">
                  <h3 className="text-[16px] font-extrabold text-slate-800 truncate mb-1" title={user.full_name}>
                    {user.full_name}
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium truncate" title={user.email}>
                    {user.email}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => initiateDelete(user)}
                    className="p-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all duration-300 hover:rotate-6 active:scale-90"
                    title={isId ? "Hapus Pengguna" : "Delete User"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================= */}
      {/* CUSTOM POPUP (MODAL) DELETE CONFIRMATION  dengan Spring Animation */}
      {/* ========================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-[0.5] fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            
            <div className="p-8 text-center pt-10">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100 relative">
                <div className="absolute inset-0 rounded-full border border-rose-200 animate-ping opacity-50 duration-1000" />
                <AlertTriangle className="w-8 h-8 text-rose-500 relative z-10" />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                {isId ? "Hapus Pengguna?" : "Delete User?"}
              </h3>
              
              <p className="text-slate-500 text-[14px] mb-8 leading-relaxed px-2">
                {isId ? "Apakah Anda yakin ingin menghapus pengguna" : "Are you sure you want to delete user"}{" "}
                <span className="font-bold text-rose-600 block my-1 text-[15px]">
                  &quot;{userToDelete.full_name}&quot; ?
                </span>
                {isId ? "Tindakan ini tidak dapat dibatalkan." : "This action cannot be undone."}
              </p>
              
              {/* Error khusus di dalam modal hapus (misal API gagal) */}
              {error && (
                <p className="text-[13px] text-rose-600 font-bold mb-6 bg-rose-50 py-3 rounded-xl border border-rose-100">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={deletingId === userToDelete.id}
                  className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 active:scale-95"
                >
                  {isId ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId === userToDelete.id}
                  className="flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-80 flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-rose-600/20 active:scale-95"
                >
                  {deletingId === userToDelete.id ? (
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

    </div>
  );
}