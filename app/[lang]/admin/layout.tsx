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
          href: `/${lang}/admin/articles`,
          label: isId ? "Services & Artikel" : "Services & Articles",
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
    // Hindari /admin aktif untuk semua path — hanya exact untuk dashboard root
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
      <div key={group.title} className="mb-5">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500/70">
          {group.title}
        </p>
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  active
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-100/60 hover:bg-emerald-900 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-emerald-950 text-white fixed inset-y-0 left-0 z-40">
        <div className="h-16 flex items-center px-6 border-b border-emerald-900">
          <Link href={`/${lang}/admin`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center font-bold text-emerald-300">
              S
            </div>
            <span className="font-extrabold tracking-tight">
              Satubumi{" "}
              <span className="text-emerald-400 text-sm font-bold">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">{renderNav()}</nav>

        <div className="p-4 border-t border-emerald-900 space-y-1">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-emerald-100/60 hover:bg-emerald-900 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {isId ? "Lihat Website" : "View Website"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-emerald-950 text-white flex flex-col z-50">
            <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-900">
              <span className="font-extrabold">Satubumi Admin</span>
              <button type="button" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              {renderNav(() => setSidebarOpen(false))}
            </nav>
            <div className="p-4 border-t border-emerald-900">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-300"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 text-emerald-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-900/50">
              <LayoutDashboard className="w-4 h-4" />
              <span>{isId ? "Panel Admin" : "Admin Panel"}</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-emerald-950 leading-none">
                  {user.full_name}
                </p>
                <p className="text-[11px] font-bold text-emerald-700/50 uppercase tracking-wider mt-1">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                {getInitials(user.full_name)}
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}