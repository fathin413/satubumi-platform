"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getMonitorDashboard } from "@/lib/monitorDashboardApi";
import MonitorMap from "@/components/monitor/MonitorMap";
import KPIGrid from "@/components/monitor/dashboard/KPIGrid";
import ProgressSection from "@/components/monitor/dashboard/ProgressSection";
import ProgressChart from "@/components/monitor/dashboard/ProgressChart";
import CarbonSection from "@/components/monitor/dashboard/CarbonSection";
import CarbonChart from "@/components/monitor/dashboard/CarbonChart";
import BiodiversitySection from "@/components/monitor/dashboard/BiodiversitySection";
import AlertList from "@/components/monitor/dashboard/AlertList";
import ActivityTimeline from "@/components/monitor/dashboard/ActivityTimeline";
import ReportSummary from "@/components/monitor/dashboard/ReportSummary";
import BaselineComparison
from "@/components/monitor/dashboard/BaselineComparison";

export default function MonitorDashboardPage() {
  const params = useParams();
  const router = useRouter();

  const lang = (params?.lang as string) || "en";
  const projectId = params?.projectId as string;
  const isId = lang === "id";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace(`/${lang}/login`);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await getMonitorDashboard(projectId);

        console.log("MONITOR DATA:", result);

        setData(result);
      } catch (err) {
        console.error(err);
        setError(
          isId
            ? "Gagal memuat dashboard proyek."
            : "Failed to load project dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      load();
    }
  }, [projectId, lang, router, isId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <p className="text-slate-600 font-medium mb-4">
          {error ||
            (isId ? "Proyek tidak ditemukan." : "Project not found.")}
        </p>

        <Link
          href={`/${lang}/monitor`}
          className="text-emerald-700 font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {isId ? "Kembali" : "Back"}
        </Link>
      </main>
    );
  }

  const dashboard = data.dashboard;

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* HEADER */}
      <div className="bg-emerald-950 text-white pt-28 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/${lang}/monitor`}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isId ? "Semua proyek" : "All projects"}
          </Link>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {dashboard.project_name}
          </h1>

          <p className="mt-2 text-emerald-100/70 text-sm">
            {dashboard.area_ha ? `${dashboard.area_ha} ha · ` : ""}
            {dashboard.project_status || "-"}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              href={`/${lang}/monitor/${projectId}/alerts`}
              className="px-4 py-2 rounded-xl bg-white/10 text-sm font-bold"
            >
              Alerts
            </Link>

            <Link
              href={`/${lang}/monitor/${projectId}/field-reports`}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-sm font-bold"
            >
              {isId ? "Laporan lapangan" : "Field reports"}
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 space-y-8">
        <KPIGrid data={dashboard} isId={isId} />

        <MonitorMap projectId={projectId} />

        <ProgressSection data={data} isId={isId} />

        <ProgressChart data={data} isId={isId} />

        <CarbonSection data={data} isId={isId} />

        <CarbonChart data={data} isId={isId} />
        <BaselineComparison data={data}isId={isId}/>

        <BiodiversitySection data={data} isId={isId} />

        <div className="grid lg:grid-cols-2 gap-6">
          <AlertList data={data} isId={isId} />
          <ActivityTimeline data={data} isId={isId} />
        </div>

        <ReportSummary data={data} isId={isId}  projectId={projectId}/>
      </div>
    </main>
  );
}