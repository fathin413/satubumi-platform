"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getAlertSummary,
  getProjectAlerts,
  resolveAlert,
  runAlertCheck,
} from "@/lib/monitorApi";

export default function AlertsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [alerts, setAlerts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  async function loadAlerts() {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        getProjectAlerts(projectId, { only_active: !showResolved }),
        getAlertSummary(projectId),
      ]);
      setAlerts(Array.isArray(list) ? list : []);
      setSummary(sum);
    } catch (error) {
      console.error(error);
      setMessage("Gagal memuat alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) loadAlerts();
  }, [projectId, showResolved]);

  async function handleCheck() {
    try {
      const res = await runAlertCheck(projectId);
      setMessage(res?.message || "Alert check selesai.");
      await loadAlerts();
    } catch (error) {
      console.error(error);
      setMessage("Alert check gagal. Cek POST /alerts/check.");
    }
  }

  async function handleResolve(alert: any) {
    try {
      await resolveAlert(projectId, alert.id, {
        is_resolved: true,
        is_read: true,
      });
      setMessage(`Alert #${alert.id} di-resolve.`);
      await loadAlerts();
    } catch (error) {
      console.error(error);
      setMessage("Gagal resolve. Cek PUT /alerts/{id}.");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-emerald-950">Project Alerts</h1>
        <button
          onClick={handleCheck}
          className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white"
        >
          Run alert check
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm">
          {message}
        </p>
      )}

      {summary && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Total" value={summary.total_alerts} />
          <SummaryCard title="Active" value={summary.active_alerts} />
          <SummaryCard title="Resolved" value={summary.resolved_alerts} />
          <SummaryCard
            title="Resolution"
            value={`${summary.resolution_rate_pct ?? 0}%`}
          />
        </div>
      )}

      <label className="mt-6 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showResolved}
          onChange={(e) => setShowResolved(e.target.checked)}
        />
        Tampilkan yang sudah resolved juga
      </label>

      {loading && <p className="mt-5">Loading...</p>}

      {!loading && alerts.length === 0 && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          No alerts found.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-xl bg-white p-5 shadow">
            <h2 className="font-bold">
              {alert.alert_type || alert.title || "Alert"}
            </h2>
            <p>{alert.description}</p>
            <p>Severity: {alert.severity || "—"}</p>
            <p>
              Status:{" "}
              {alert.is_resolved
                ? "resolved"
                : alert.is_read
                  ? "read"
                  : "active"}
            </p>
            {!alert.is_resolved && (
              <button
                onClick={() => handleResolve(alert)}
                className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white"
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-emerald-950">{value}</p>
    </div>
  );
}