"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  FileText,
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

  // Grup menu: Konten halaman → Operasional → Sistem
  const navGroups: NavGroup[] = [
    {
      title: isId ? "Konten Website" : "Website Content",
      items: [
        {
          href: `/${lang}/admin/home`,
          label: isId ? "Halaman Home" : "Home Page",
          icon: Home,
        },
        {
          href: `/${lang}/admin/about`,
          label: isId ? "Halaman About" : "About Page",
          icon: Info,
        },
        {
          href: `/${lang}/admin/services`,
          label: isId ? "Halaman Services" : "Services Page",
          icon: Briefcase,
        },
        {
          href: `/${lang}/admin/articles`,
          label: isId ? "Artikel" : "Articles",
          icon: FileText,
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
    if (exact) return pathname === href;
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
    navGroups.map((group) => (
      <div key={group.title} className="mb-8">
        <p className="px-4 mb-3 text-[11px] font-bold uppercase tracking-wider text-emerald-100/40">
          {group.title}
        </p>
        <div className="space-y-1">
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-emerald-900/60 text-white"
                    : "text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                {/* Pita Indikator Aktif (Solid, bukan glowing) */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-md" />
                )}
                
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-emerald-400" : "text-emerald-100/50"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex font-sans text-slate-800">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#042F24] text-white fixed inset-y-0 left-0 z-40 border-r border-emerald-900/30">
        {/* Logo Area */}
        <div className="h-[76px] flex items-center px-8 border-b border-emerald-900/30">
          <Link href={`/${lang}/admin`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800/80 border border-emerald-700 flex items-center justify-center font-bold text-emerald-100">
              S
            </div>
            <span className="font-bold tracking-tight text-lg text-emerald-50">
              Satubumi <span className="text-emerald-400/80 font-normal">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation - Scrollbar dihilangkan secara visual */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderNav()}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-emerald-900/30 space-y-2 bg-[#03261D]">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-emerald-100/60 hover:bg-emerald-900/40 hover:text-emerald-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-emerald-100/40" />
            {isId ? "Lihat Website" : "View Website"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-rose-300/80 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400/60" />
            Log Out
          </button>
        </div>
      </aside>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-emerald-950/60 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[80%] bg-[#042F24] text-white flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-[76px] flex items-center justify-between px-6 border-b border-emerald-900/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-800/80 border border-emerald-700 flex items-center justify-center font-bold text-emerald-100">
                  S
                </div>
                <span className="font-bold text-emerald-50">Admin</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-emerald-900/50 text-emerald-100/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Navigation Mobile - Scrollbar dihilangkan secara visual */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {renderNav(() => setSidebarOpen(false))}
            </nav>
            <div className="p-4 border-t border-emerald-900/30 bg-[#03261D]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-rose-300/80 hover:bg-rose-950/40 hover:text-rose-300"
              >
                <LogOut className="w-4 h-4 text-rose-400/60" />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen relative">
        
        {/* HEADER SOLID & BERSIH */}
        <header className="h-[76px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Indikator Halaman (Simple, bukan pil menyala) */}
            <div className="hidden md:flex items-center gap-2 text-[14px] font-medium text-slate-500">
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>{isId ? "Panel Admin" : "Admin Panel"}</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[14px] font-bold text-slate-800 leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {getInitials(user.full_name)}
              </div>
            </div>
          )}
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-6 md:p-10 max-w-[1400px] w-full">
          {children}
        </div>

      </div>
    </div>
  );
}