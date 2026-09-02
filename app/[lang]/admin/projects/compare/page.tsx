"use client";

import { useEffect, useState } from "react";
import { compareProjects, getProjects } from "@/lib/monitorApi";

export default function ComparePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setError("Gagal memuat daftar proyek."));
  }, []);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function run() {
    if (selected.length < 2) {
      setError("Pilih minimal 2 proyek.");
      return;
    }
    try {
      setError(null);
      const data = await compareProjects(selected);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Gagal compare. Cek GET /projects/compare?project_ids=");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-emerald-950">
        Multi-Project Comparison
      </h1>
      <p className="mt-2 text-slate-600">
        GET /projects/compare?project_ids=1,2,3
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <section className="mt-6 grid gap-2">
        {projects.map((p) => (
          <label key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow">
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            <span>
              {p.name}{" "}
              <span className="text-slate-400">#{p.id}</span>
            </span>
          </label>
        ))}
      </section>

      <button
        onClick={run}
        className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-white font-bold"
      >
        Compare
      </button>

      {result?.projects && (
        <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Project</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Trees</th>
                <th className="p-3">Survival</th>
                <th className="p-3">Carbon</th>
                <th className="p-3">Species</th>
                <th className="p-3">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {result.projects.map((row: any) => (
                <tr key={row.project_id} className="border-b">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.overall_progress_pct}%</td>
                  <td className="p-3">{row.trees_planted}</td>
                  <td className="p-3">{row.survival_rate_pct}%</td>
                  <td className="p-3">{row.carbon_stock_tco2e}</td>
                  <td className="p-3">{row.species_recorded}</td>
                  <td className="p-3">{row.active_alerts_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
