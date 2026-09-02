"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { downloadProjectGeoJSON, getProjectReport } from "@/lib/monitorApi";
import {
  downloadProjectCSV,
  downloadProjectPDF,
} from "@/lib/monitorDashboardApi";

export default function ReportsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvType, setCsvType] = useState("overview");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjectReport(projectId);
        setReport(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat report/summary.");
      }
    }
    if (projectId) load();
  }, [projectId]);

  async function handlePDF() {
    try {
      setBusy("pdf");
      await downloadProjectPDF(projectId);
    } catch (err) {
      console.error(err);
      alert("Gagal download PDF");
    } finally {
      setBusy(null);
    }
  }

  async function handleCSV() {
    try {
      setBusy("csv");
      await downloadProjectCSV(projectId, csvType);
    } catch (err) {
      console.error(err);
      alert("Gagal download CSV");
    } finally {
      setBusy(null);
    }
  }

  async function handleGeoJSON() {
    try {
      setBusy("geo");
      await downloadProjectGeoJSON(projectId);
    } catch (err) {
      console.error(err);
      alert("Gagal download GeoJSON");
    } finally {
      setBusy(null);
    }
  }

  const m = report?.measurement || {};
  const r = report?.reporting || {};
  const v = report?.verification || {};

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Project Report</h1>
      <p className="mt-2 text-slate-600">
        {report?.project_name || "MRV summary"} · {report?.location_name || ""}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handlePDF}
          disabled={!!busy}
          className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          {busy === "pdf" ? "Downloading..." : "Download PDF"}
        </button>
        <select
          value={csvType}
          onChange={(e) => setCsvType(e.target.value)}
          className="rounded-xl border p-3"
        >
          <option value="overview">overview</option>
          <option value="trees">trees</option>
          <option value="activities">activities</option>
          <option value="field_reports">field_reports</option>
          <option value="biodiversity">biodiversity</option>
          <option value="carbon">carbon</option>
        </select>
        <button
          onClick={handleCSV}
          disabled={!!busy}
          className="rounded-xl border border-emerald-700 px-5 py-3 font-bold text-emerald-700 disabled:opacity-50"
        >
          {busy === "csv" ? "Downloading..." : "Export CSV"}
        </button>
        <button
          onClick={handleGeoJSON}
          disabled={!!busy}
          className="rounded-xl border border-emerald-700 px-5 py-3 font-bold text-emerald-700 disabled:opacity-50"
        >
          {busy === "geo" ? "Downloading..." : "Export GeoJSON"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!report && !error && <p className="mt-5">Loading report...</p>}

      {report && (
        <>
          {report.executive_summary && (
            <section className="mt-8 rounded-xl bg-white p-6 shadow">
              <h2 className="font-bold">Executive summary</h2>
              <p className="mt-2 text-slate-700">{report.executive_summary}</p>
            </section>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Block title="Measurement">
              <Row label="Trees planted" value={m.trees_planted} />
              <Row label="Survived" value={m.trees_survived} />
              <Row label="Survival" value={`${m.survival_rate_pct ?? 0}%`} />
              <Row label="Carbon tCO2e" value={m.carbon_stock_tco2e ?? "—"} />
              <Row label="Species" value={m.unique_species_count} />
            </Block>
            <Block title="Reporting">
              <Row label="Progress" value={`${r.overall_progress_pct ?? 0}%`} />
              <Row label="Activities" value={r.total_activities} />
              <Row label="Field reports" value={r.total_field_reports} />
            </Block>
            <Block title="Verification">
              <Row label="Photos" value={v.total_photos_count} />
              <Row label="Videos" value={v.total_videos_count} />
              <Row label="GPS points" value={v.gps_verified_points_count} />
              <Row label="Active alerts" value={v.active_alerts} />
            </Block>
          </div>
        </>
      )}
    </main>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h3 className="font-bold text-emerald-950">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <p className="flex justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value ?? "—"}</span>
    </p>
  );
}