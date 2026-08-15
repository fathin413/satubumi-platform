"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Users,
  X,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Pencil,
  ShieldCheck,
  User as UserIcon,
  Crown,
  ChevronDown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type UserItem = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone_number?: string | null;
  is_active?: boolean;
};

const emptyForm = {
  email: "",
  password: "",
  full_name: "",
  phone_number: "",
  role: "client",
};

const roleOptions = [
  { value: "client", label: "Client (Pengguna Standar)" },
  { value: "admin", label: "Admin (Akses Dasar)" },
  { value: "super_admin", label: "Super Admin (Akses Penuh)" },
];

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
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");

  const token = () => localStorage.getItem("access_token");

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

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
    setSuccess(null);
    setRoleOpen(false);
  };

  const openEdit = (user: UserItem) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      role: user.role || "client",
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
    setRoleOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm(emptyForm);
    setRoleOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        const payload: Record<string, string> = {
          full_name: form.full_name,
          phone_number: form.phone_number,
          role: form.role,
        };
        if (form.password.trim()) {
          payload.password = form.password;
        }

        const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          let msg = isId ? "Gagal memperbarui pengguna" : "Failed to update user";
          if (typeof data.detail === "string") msg = data.detail;
          else if (Array.isArray(data.detail)) {
            msg = data.detail.map((d: any) => d.msg).join(", ");
          }
          throw new Error(msg);
        }

        setSuccess(isId ? "Pengguna berhasil diperbarui!" : "User successfully updated!");
      } else {
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
            phone_number: form.phone_number || undefined,
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
      }

      closeForm();
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

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "super_admin":
        return {
          card: "bg-rose-50/80 border-rose-100 hover:bg-rose-50 hover:border-rose-200 hover:shadow-[0_8px_30px_-12px_rgba(225,29,72,0.22)]",
          avatarBg: "bg-rose-100 border-rose-200",
          avatarText: "text-rose-700",
          badgeBg: "bg-white/90 border-rose-200",
          badgeText: "text-rose-700",
          icon: Crown,
        };
      case "admin":
        return {
          card: "bg-amber-50/80 border-amber-100 hover:bg-amber-50 hover:border-amber-200 hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.22)]",
          avatarBg: "bg-amber-100 border-amber-200",
          avatarText: "text-amber-700",
          badgeBg: "bg-white/90 border-amber-200",
          badgeText: "text-amber-700",
          icon: ShieldCheck,
        };
      default:
        return {
          card: "bg-emerald-50/80 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.22)]",
          avatarBg: "bg-emerald-100 border-emerald-200",
          avatarText: "text-emerald-700",
          badgeBg: "bg-white/90 border-emerald-200",
          badgeText: "text-emerald-700",
          icon: UserIcon,
        };
    }
  };

  const processedUsers = users
    .filter((u) => filterRole === "all" || u.role === filterRole)
    .sort((a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500 ease-out">
        <div className="w-16 h-16 relative flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <Users className="w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          {isId ? "Memuat Pengguna..." : "Loading Users..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative pb-12">
      {((error && !userToDelete) || success) && (
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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 animate-in slide-in-from-bottom-4 fade-in duration-500 ease-out">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            {isId ? "Kelola Pengguna" : "User Management"}
          </h1>
          <p className="text-slate-500 font-medium text-[15px]">
            {isId
              ? "Kendali penuh atas akses dan peran dalam ekosistem platform."
              : "Full control over access and roles within the platform ecosystem."}
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-950 transition-all duration-300 shadow-md shadow-emerald-950/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {isId ? "Tambah Pengguna" : "Add New User"}
        </button>
      </div>

      {showForm && (
        <div className="mb-10 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm animate-in slide-in-from-top-8 fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative z-20">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
                {editingUser
                  ? isId
                    ? "Edit Data Pengguna"
                    : "Edit User Details"
                  : isId
                  ? "Buat Pengguna Baru"
                  : "Create New User"}
              </h2>
              <p className="text-[14px] font-medium text-slate-500">
                {editingUser
                  ? isId
                    ? "Perbarui informasi akun. Kosongkan sandi jika tidak ingin diubah."
                    : "Update account info. Leave password blank to keep current."
                  : isId
                  ? "Lengkapi formulir kredensial di bawah ini."
                  : "Fill out the credentials form below."}
              </p>
            </div>
            <button
              onClick={closeForm}
              className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-50 transition-all duration-300 hover:rotate-90 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {isId ? "Nama Lengkap" : "Full Name"}
                </label>
                <input
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-[15px] text-slate-800 transition-all duration-300"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-[15px] text-slate-800 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {isId ? "No. Telepon" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-[15px] text-slate-800 transition-all duration-300"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="+62..."
                />
              </div>

              <div className="relative">
                <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {isId ? "Hak Akses / Role" : "System Role"}
                </label>
                <div 
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer flex justify-between items-center transition-all duration-300 hover:border-emerald-400 hover:bg-white focus:ring-4 focus:ring-emerald-500/10 select-none"
                >
                  <span className="font-medium text-[15px] text-slate-700">
                    {roleOptions.find(o => o.value === form.role)?.label || "Select Role"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${roleOpen ? 'rotate-180' : ''}`} />
                </div>

                {roleOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setRoleOpen(false)} />
                    <div className="absolute z-40 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {roleOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setForm({ ...form, role: opt.value });
                            setRoleOpen(false);
                          }}
                          className={`px-5 py-3.5 text-[14px] cursor-pointer transition-colors ${
                            form.role === opt.value 
                              ? 'bg-emerald-50 text-emerald-700 font-medium' 
                              : 'text-slate-600 font-normal hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {editingUser
                    ? isId
                      ? "Password Baru (Opsional)"
                      : "New Password (Optional)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={editingUser ? undefined : 6}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-[15px] text-slate-800 transition-all duration-300"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={
                    editingUser
                      ? isId
                        ? "Kosongkan jika tidak diubah"
                        : "Leave blank to keep current"
                      : "Min. 6 characters"
                  }
                />
              </div>

            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 mt-4">
              <button
                type="button"
                onClick={closeForm}
                className="px-8 py-4 border border-slate-200 text-slate-600 text-[14.5px] font-bold rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 text-center"
              >
                {isId ? "Batalkan" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-emerald-800 text-white text-[14.5px] font-bold rounded-2xl hover:bg-emerald-950 disabled:opacity-60 transition-all duration-300 shadow-md shadow-emerald-950/10 flex items-center justify-center min-w-[160px] active:scale-95"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin" />
                ) : editingUser ? (
                  isId ? "Simpan Pembaruan" : "Save Changes"
                ) : isId ? (
                  "Buat Pengguna"
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {users.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-500 text-[13px] font-bold shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            {isId ? "Filter Role:" : "Filter Role:"}
          </div>

          <div className="bg-slate-200/50 p-1.5 rounded-[1.25rem] inline-flex flex-wrap gap-1 border border-slate-200/60">
            {[
              { id: "all", label: isId ? "Semua" : "All" },
              { id: "super_admin", label: "Super Admin" },
              { id: "admin", label: "Admin" },
              { id: "client", label: "Client" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterRole(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 ease-out active:scale-95 ${
                  filterRole === tab.id
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/80 scale-100"
                    : "text-slate-500 border border-transparent hover:text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && !error && !loading ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] py-24 text-center shadow-sm animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 mb-2">
            {isId ? "Database Kosong" : "Database Empty"}
          </h3>
          <p className="text-slate-500 font-medium text-[15px]">
            {isId ? "Belum ada pengguna yang terdaftar di sistem." : "No users registered in the system yet."}
          </p>
        </div>
      ) : processedUsers.length === 0 && !loading ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] py-24 text-center shadow-sm animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 mb-2">
            {isId ? "Tidak Ditemukan" : "Not Found"}
          </h3>
          <p className="text-slate-500 font-medium text-[15px]">
            {isId ? "Tidak ada pengguna dengan filter role ini." : "No users match this role filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedUsers.map((user, index) => {
            const roleStyle = getRoleStyle(user.role);
            const Icon = roleStyle.icon;

            return (
              <div
                key={user.id}
                style={{ animationFillMode: "both", animationDelay: `${index * 60}ms` }}
                className="animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out"
              >
                <div
                  className={`h-full rounded-[2rem] p-7 transition-all duration-300 ease-out flex flex-col border hover:-translate-y-1 active:scale-[0.98] group cursor-default ${roleStyle.card}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-105 ${roleStyle.avatarBg}`}
                    >
                      <span className={`font-extrabold text-xl ${roleStyle.avatarText}`}>
                        {(user.full_name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors duration-300 ease-out shadow-sm ${roleStyle.badgeBg}`}
                    >
                      <Icon className={`w-3 h-3 ${roleStyle.badgeText}`} />
                      <span
                        className={`text-[10.5px] font-extrabold uppercase tracking-widest ${roleStyle.badgeText}`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="mb-8 flex-1 flex flex-col gap-1">
                    <h3
                      className="text-[17px] font-extrabold text-slate-800 truncate mb-0.5"
                      title={user.full_name}
                    >
                      {user.full_name}
                    </h3>
                    <p className="text-[14px] text-slate-600 font-semibold truncate" title={user.email}>
                      {user.email}
                    </p>
                    {user.phone_number && (
                      <p className="text-[14px] text-slate-600 font-semibold truncate" title={user.phone_number}>
                        {user.phone_number}
                      </p>
                    )}
                  </div>

                  <div className="pt-5 border-t border-black/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="w-11 h-11 rounded-xl bg-emerald-500 border border-emerald-400 text-white shadow-sm flex items-center justify-center transition-all duration-300 ease-out hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-none active:scale-90 group/btn"
                      title={isId ? "Edit Pengguna" : "Edit User"}
                    >
                      <Pencil className="w-[18px] h-[18px] transition-transform duration-300 group-hover/btn:scale-110" />
                    </button>
                    <button
                      type="button"
                      onClick={() => initiateDelete(user)}
                      className="w-11 h-11 rounded-xl bg-rose-500 border border-rose-500 text-white shadow-sm flex items-center justify-center transition-all duration-300 ease-out hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 hover:shadow-none active:scale-90 group/btn"
                      title={isId ? "Hapus Pengguna" : "Delete User"}
                    >
                      <Trash2 className="w-[18px] h-[18px] transition-transform duration-300 group-hover/btn:scale-110" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-[0.5] fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 border border-rose-100 relative">
                <div className="absolute inset-0 rounded-[1.8rem] border-2 border-rose-200 animate-ping opacity-50 duration-1000" />
                <AlertTriangle className="w-10 h-10 text-rose-500 relative z-10" />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
                {isId ? "Hapus Akun Ini?" : "Delete This Account?"}
              </h3>

              <p className="text-slate-500 text-[14.5px] mb-8 leading-relaxed px-2">
                {isId ? "Apakah Anda yakin ingin menghapus pengguna" : "Are you sure you want to delete user"}{" "}
                <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mx-1">
                  {userToDelete.full_name}
                </span>
                ?{" "}
                {isId
                  ? "Tindakan ini permanen dan tidak dapat dibatalkan."
                  : "This action is permanent and cannot be undone."}
              </p>

              {error && (
                <p className="text-[13px] text-rose-700 font-bold mb-6 bg-rose-50 p-4 rounded-xl border border-rose-200">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={deletingId === userToDelete.id}
                  className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-600 text-[14.5px] font-bold rounded-2xl hover:bg-slate-100 transition-colors disabled:opacity-50 active:scale-95"
                >
                  {isId ? "Batalkan" : "Cancel"}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId === userToDelete.id}
                  className="flex-1 py-4 bg-rose-600 text-white text-[14.5px] font-bold rounded-2xl hover:bg-rose-700 disabled:opacity-80 flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-rose-600/20 active:scale-95"
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