"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Edit3,
  Trash2,
  UploadCloud,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ChevronDown,
  Check,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type MyActivityLogItem = {
  id: number;
  user_id?: number | null;
  action: string;
  module: string;
  target_id?: number | null;
  target_name?: string | null;
  description?: string | null;
  created_at: string;
};

export default function MyActivityPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [logs, setLogs] = useState<MyActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");

  // State Dropdown Kustom
  const [actionOpen, setActionOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);

  const actionRef = useRef<HTMLDivElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("token")
      : null;

  const loadMyLogs = async () => {
    setLoading(true);
    try {
      const t = token();
      if (!t) {
        router.push(`/${lang}/login`);
        return;
      }

      const res = await fetch(`${API_URL}/activity/me`, {
        headers: { Authorization: `Bearer ${t}` },
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push(`/${lang}/login`);
        return;
      }

      if (!res.ok) throw new Error("Gagal memuat aktivitas pribadi");

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyLogs();
  }, [lang]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setActionOpen(false);
      }
      if (moduleRef.current && !moduleRef.current.contains(event.target as Node)) {
        setModuleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString(isId ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const getActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    switch (act) {
      case "CREATE":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case "UPDATE":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Edit3 className="w-3.5 h-3.5 text-amber-600" />,
        };
      case "DELETE":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
        };
      case "UPLOAD":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <UploadCloud className="w-3.5 h-3.5 text-blue-600" />,
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <Activity className="w-3.5 h-3.5 text-slate-500" />,
        };
    }
  };

  const availableModules = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)));

  const actionOptions = [
    { value: "ALL", label: isId ? "Semua Aksi" : "All Actions" },
    { value: "CREATE", label: "CREATE" },
    { value: "UPDATE", label: "UPDATE" },
    { value: "DELETE", label: "DELETE" },
    { value: "UPLOAD", label: "UPLOAD" },
  ];

  const filteredLogs = logs.filter((item) => {
    const matchSearch =
      (item.target_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.module || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchAction =
      selectedAction === "ALL" || (item.action || "").toUpperCase() === selectedAction.toUpperCase();

    const matchModule =
      selectedModule === "ALL" || (item.module || "").toUpperCase() === selectedModule.toUpperCase();

    return matchSearch && matchAction && matchModule;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isId ? "Aktivitas Saya" : "My Activity Logs"}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              {isId
                ? "Daftar histori tindakan dan perubahan data yang telah Anda lakukan."
                : "History of actions, edits, and operations performed by your account."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadMyLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{isId ? "Segarkan" : "Refresh"}</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isId ? "Cari riwayat tindakan..." : "Search my activities..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* CUSTOM ACTION DROPDOWN */}
          <div className="relative" ref={actionRef}>
            <button
              type="button"
              onClick={() => {
                setActionOpen(!actionOpen);
                setModuleOpen(false);
              }}
              className="inline-flex items-center justify-between gap-2.5 px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[130px]"
            >
              <span>
                {actionOptions.find((opt) => opt.value === selectedAction)?.label || selectedAction}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  actionOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {actionOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                {actionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedAction(opt.value);
                      setActionOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors ${
                      selectedAction === opt.value
                        ? "bg-emerald-50 text-emerald-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedAction === opt.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CUSTOM MODULE DROPDOWN */}
          {availableModules.length > 0 && (
            <div className="relative" ref={moduleRef}>
              <button
                type="button"
                onClick={() => {
                  setModuleOpen(!moduleOpen);
                  setActionOpen(false);
                }}
                className="inline-flex items-center justify-between gap-2.5 px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[130px]"
              >
                <span className="uppercase truncate max-w-[110px]">
                  {selectedModule === "ALL" ? (isId ? "Semua Modul" : "All Modules") : selectedModule}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    moduleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {moduleOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModule("ALL");
                      setModuleOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors ${
                      selectedModule === "ALL"
                        ? "bg-emerald-50 text-emerald-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{isId ? "Semua Modul" : "All Modules"}</span>
                    {selectedModule === "ALL" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  {availableModules.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => {
                        setSelectedModule(mod);
                        setModuleOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold uppercase transition-colors ${
                        selectedModule === mod
                          ? "bg-emerald-50 text-emerald-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate">{mod}</span>
                      {selectedModule === mod && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {isId ? "Memuat aktivitas Anda..." : "Loading your activities..."}
            </p>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-bold text-sm">
              {isId ? "Belum ada riwayat aktivitas yang ditemukan." : "No personal activity records found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">{isId ? "Waktu Eksekusi" : "Timestamp"}</th>
                  <th className="py-3.5 px-5">{isId ? "Target Objek" : "Target Subject"}</th>
                  <th className="py-3.5 px-5">{isId ? "Aksi & Modul" : "Action & Module"}</th>
                  <th className="py-3.5 px-5">{isId ? "Keterangan Tindakan" : "Description"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((item) => {
                  const badge = getActionBadge(item.action);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors duration-150"
                    >
                      {/* 1. Time / Timestamp */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-slate-500 font-semibold text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>

                      {/* 2. Target Subject */}
                      <td className="py-4 px-5">
                        <div className="max-w-[240px]">
                          <p className="font-extrabold text-slate-900 truncate">
                            {item.target_name || `ID #${item.target_id || "-"}`}
                          </p>
                          {item.target_id && item.target_name && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              ID: {item.target_id}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Action & Module */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${badge.bg}`}
                          >
                            {badge.icon}
                            {item.action}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {item.module}
                          </span>
                        </div>
                      </td>

                      {/* 4. Description */}
                      <td className="py-4 px-5">
                        <p className="text-slate-600 font-medium text-[13px] leading-relaxed max-w-md line-clamp-2">
                          {item.description || "-"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500">
              {isId
                ? `Menampilkan ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    filteredLogs.length
                  )} dari ${filteredLogs.length} data`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    filteredLogs.length
                  )} of ${filteredLogs.length} records`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}