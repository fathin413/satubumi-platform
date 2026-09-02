"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createPlot, getProjectPlots } from "@/lib/monitorApi";

export default function PlotsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [plots, setPlots] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    plot_code: "",
    plot_name: "",
    plot_type: "permanent_plot",
    area_ha: "",
    lat: "",
    lng: "",
    notes: "",
  });

  async function load() {
    try {
      const data = await getProjectPlots(projectId);
      setPlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat plots. Cek GET /projects/{id}/plots.");
    }
  }

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function submit() {
    setError(null);
    try {
      const lat = Number(form.lat);
      const lng = Number(form.lng);
      await createPlot(projectId, {
        plot_code: form.plot_code,
        plot_name: form.plot_name || null,
        plot_type: form.plot_type,
        area_ha: form.area_ha ? Number(form.area_ha) : null,
        location_geojson:
          form.lat && form.lng && !Number.isNaN(lat) && !Number.isNaN(lng)
            ? { type: "Point", coordinates: [lng, lat] }
            : null,
        notes: form.notes || null,
      });
      setForm({
        plot_code: "",
        plot_name: "",
        plot_type: "permanent_plot",
        area_ha: "",
        lat: "",
        lng: "",
        notes: "",
      });
      load();
    } catch (err) {
      console.error(err);
      setError("Gagal membuat plot. Payload: plot_code, plot_type, location_geojson.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Monitoring Plots</h1>
      <p className="mt-2 text-slate-600">
        Kontrak BE: POST/GET /projects/{"{id}"}/plots
      </p>

      <section className="mt-6 rounded-xl bg-white p-6 shadow grid gap-3 max-w-xl">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          className="input border rounded-xl p-3"
          placeholder="Plot code (PL-SBG-01)"
          value={form.plot_code}
          onChange={(e) => setForm({ ...form, plot_code: e.target.value })}
        />
        <input
          className="input border rounded-xl p-3"
          placeholder="Plot name"
          value={form.plot_name}
          onChange={(e) => setForm({ ...form, plot_name: e.target.value })}
        />
        <select
          className="border rounded-xl p-3"
          value={form.plot_type}
          onChange={(e) => setForm({ ...form, plot_type: e.target.value })}
        >
          <option value="permanent_plot">permanent_plot</option>
          <option value="transect">transect</option>
          <option value="point">point</option>
        </select>
        <input
          className="border rounded-xl p-3"
          placeholder="Area (ha)"
          value={form.area_ha}
          onChange={(e) => setForm({ ...form, area_ha: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl p-3"
            placeholder="Latitude"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
          />
          <input
            className="border rounded-xl p-3"
            placeholder="Longitude"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
          />
        </div>
        <textarea
          className="border rounded-xl p-3"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button
          onClick={submit}
          className="rounded-xl bg-emerald-700 py-3 text-white font-bold"
        >
          Save Plot
        </button>
      </section>

      <section className="mt-8 space-y-3">
        {plots.map((plot) => (
          <div key={plot.id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="font-bold">
              {plot.plot_code} — {plot.plot_name || "Untitled"}
            </h3>
            <p>Type: {plot.plot_type || "—"}</p>
            <p>Area: {plot.area_ha ?? "—"} ha</p>
            <p>Status: {plot.status || "—"}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
