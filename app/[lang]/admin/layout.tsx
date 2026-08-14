"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ClipboardList,
  Home,
  Info,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isId = lang === "id";

  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push(`/${lang}/login`);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("access_token");
          router.push(`/${lang}/login`);
          return;
        }
        const me = await res.json();
        if (me.role !== "admin" && me.role !== "super_admin") {
          router.push(`/${lang}`);
          return;
        }
        setUser(me);
      } catch {
        router.push(`/${lang}/login`);
      }
    };
    check();
  }, [lang, router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = `/${lang}/login`;
  };

  const navGroups: NavGroup[] = [
    {
      title: isId ? "Utama" : "Main",
      items: [
        {
          href: `/${lang}/admin`,
          label: isId ? "Dashboard" : "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      title: isId ? "Konten Website" : "Website Content",
      items: [
        { href: `/${lang}/admin/home`, label: isId ? "Halaman Home" : "Home Page", icon: Home },
        { href: `/${lang}/admin/about`, label: isId ? "Halaman About" : "About Page", icon: Info },
        {
          href: `/${lang}/admin/services`,
          label: isId ? "Halaman Services" : "Services Page",
          icon: Briefcase,
        },
      ],
    },
    {
      title: isId ? "Operasional" : "Operations",
      items: [
        {
          href: `/${lang}/admin/assessments`,
          label: isId ? "Semua Assessment" : "All Assessments",
          icon: ClipboardList,
        },
      ],
    },
  ];

  if (user?.role === "super_admin") {
    navGroups.push({
      title: isId ? "Sistem" : "System",
      items: [
        {
          href: `/${lang}/admin/users`,
          label: isId ? "Manajemen Pengguna" : "User Management",
          icon: Users,
        },
      ],
    });
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    if (href === `/${lang}/admin`) {
      return pathname === href || pathname === `/${lang}/admin/`;
    }
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderNav = (onNavigate?: () => void) =>
    navGroups.map((group, groupIdx) => (
      <div
        key={group.title}
        className="mb-8 animate-in slide-in-from-left-4 fade-in duration-500 fill-mode-both"
        style={{ animationDelay: `${groupIdx * 100}ms` }}
      >
        <p className="px-5 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-800">
          {group.title}
        </p>
        <div className="space-y-1 px-3">
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-bold transition-all duration-300 active:scale-95 ${
                  active
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50"
                    : "text-slate-800 hover:bg-slate-50 hover:text-slate-400 hover:translate-x-1"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    active
                      ? "text-emerald-600 scale-110"
                      : "text-slate-700 group-hover:scale-110 group-hover:text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-[280px] flex-col bg-white fixed inset-y-0 left-0 z-40 border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-[76px] flex items-center pl-5 pr-8 border-b-2 border-slate-200 shrink-0">
          <Link href={`/${lang}/admin`} className="flex items-center gap-1 group">
            <Image
              src="/logo.png"
              alt="Satubumi Logo"
              width={140}
              height={36}
              className="h-7 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              unoptimized
            />
            <span className="text-emerald-600 font-extrabold text-[20px] tracking-wide transition-colors group-hover:text-emerald-500 -mt-1">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderNav()}
        </nav>

        <div className="p-5 border-t border-slate-100 flex flex-col gap-2 bg-slate-50/50 shrink-0">
          <Link
            href={`/${lang}`}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-bold text-slate-800 hover:bg-white hover:text-slate-400 hover:shadow-sm transition-all duration-300 hover:translate-x-1 active:scale-95 border border-transparent hover:border-slate-200"
          >
            <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            {isId ? "Lihat Website" : "View Website"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-bold text-rose-700 hover:bg-rose-50 hover:text-rose-400 transition-all duration-300 hover:translate-x-1 active:scale-95 border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4 text-rose-700 group-hover:text-rose-400 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Log Out
          </button>

          <div className="mt-3 pt-5 flex flex-col items-center justify-center gap-2.5 border-t border-slate-200/60">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Powered By
            </p>
            <Image
              src="/logo2.png"
              alt="Satubumi Powered By"
              width={100}
              height={24}
              className="h-5 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
              unoptimized
            />
          </div>
        </div>
      </aside>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[80%] bg-white flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r border-slate-200">
            <div className="h-[76px] flex items-center justify-between px-6 border-b-2 border-slate-200 shrink-0">
              <Link
                href={`/${lang}/admin`}
                className="flex items-center gap-1.5"
                onClick={() => setSidebarOpen(false)}
              >
                <Image
                  src="/logo.png"
                  alt="Satubumi Logo"
                  width={120}
                  height={32}
                  className="h-6 w-auto object-contain"
                  unoptimized
                />
                <span className="text-emerald-600 font-extrabold text-[20px] tracking-wide">
                  Admin
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 transition-all active:scale-90 hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {renderNav(() => setSidebarOpen(false))}
            </nav>

            <div className="p-5 border-t border-slate-100 flex flex-col gap-2 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={handleLogout}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-bold text-rose-700 hover:bg-rose-50 hover:text-rose-400 transition-all active:scale-95 border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4 text-rose-700 group-hover:text-rose-400" />
                Log Out
              </button>

              <div className="mt-3 pt-5 flex flex-col items-center justify-center gap-2.5 border-t border-slate-200/60">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Powered By
                </p>
                <Image
                  src="/logo2.png"
                  alt="Satubumi Powered By"
                  width={100}
                  height={24}
                  className="h-5 w-auto object-contain opacity-50 transition-opacity duration-300"
                  unoptimized
                />
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        <header className="h-[76px] bg-white/80 backdrop-blur-xl border-b-2 border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-800 transition-all active:scale-90"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-2.5 text-[13px] font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm">
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>{isId ? "Panel Admin" : "Admin Workspace"}</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4 group cursor-pointer p-1.5 pr-4 rounded-[1.25rem] hover:bg-slate-50 transition-all active:scale-95 border border-transparent hover:border-slate-200">
              <div className="w-10 h-10 rounded-[12px] bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm shadow-sm group-hover:shadow-md group-hover:-rotate-6 transition-all duration-300">
                {getInitials(user.full_name)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[14px] font-extrabold text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">
                  {user.full_name}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-10">
          <div
            key={pathname}
            className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] h-full"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}