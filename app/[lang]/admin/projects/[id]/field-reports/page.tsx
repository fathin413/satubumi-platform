"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createFieldReport, getFieldReports } from "@/lib/monitorApi";

function toIsoDateTime(value: string) {
  if (!value) return new Date().toISOString();
  if (value.length === 16) return `${value}:00`;
  return value;
}

export default function FieldReportsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    officer_name: "",
    plot_id: "",
    report_date: "",
    report_type: "general",
    activity_description: "",
    result_description: "",
    lat: "",
    lng: "",
  });

  async function load() {
    try {
      const data = await getFieldReports(projectId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat field reports.");
    }
  }

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function submit() {
    try {
      setError(null);
      const lat = Number(form.lat);
      const lng = Number(form.lng);
      await createFieldReport(projectId, {
        officer_name: form.officer_name,
        plot_id: form.plot_id || null,
        report_date: toIsoDateTime(form.report_date),
        report_type: form.report_type,
        activity_description: form.activity_description || null,
        result_description: form.result_description || null,
        location_geojson:
          form.lat && form.lng && !Number.isNaN(lat) && !Number.isNaN(lng)
            ? { type: "Point", coordinates: [lng, lat] }
            : null,
      });
      setForm({
        officer_name: "",
        plot_id: "",
        report_date: "",
        report_type: "general",
        activity_description: "",
        result_description: "",
        lat: "",
        lng: "",
      });
      load();
    } catch (err) {
      console.error(err);
      setError("Gagal simpan. Wajib: officer_name, report_date, report_type.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Field Reports</h1>

      <section className="mt-6 max-w-xl rounded-xl bg-white p-6 shadow grid gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          className="border rounded-xl p-3"
          placeholder="Officer name"
          value={form.officer_name}
          onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
        />
        <input
          className="border rounded-xl p-3"
          placeholder="Plot code (optional)"
          value={form.plot_id}
          onChange={(e) => setForm({ ...form, plot_id: e.target.value })}
        />
        <input
          type="datetime-local"
          className="border rounded-xl p-3"
          value={form.report_date}
          onChange={(e) => setForm({ ...form, report_date: e.target.value })}
        />
        <select
          className="border rounded-xl p-3"
          value={form.report_type}
          onChange={(e) => setForm({ ...form, report_type: e.target.value })}
        >
          <option value="general">general</option>
          <option value="tree_monitoring">tree_monitoring</option>
          <option value="biodiversity">biodiversity</option>
          <option value="incident">incident</option>
          <option value="community">community</option>
        </select>
        <textarea
          className="border rounded-xl p-3"
          placeholder="Activity description"
          value={form.activity_description}
          onChange={(e) =>
            setForm({ ...form, activity_description: e.target.value })
          }
        />
        <textarea
          className="border rounded-xl p-3"
          placeholder="Result / findings"
          value={form.result_description}
          onChange={(e) =>
            setForm({ ...form, result_description: e.target.value })
          }
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
        <button
          onClick={submit}
          className="rounded-xl bg-emerald-700 py-3 font-bold text-white"
        >
          Save field report
        </button>
      </section>

      <section className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl bg-white p-5 shadow">
            <p className="text-xs uppercase text-slate-400">{item.report_type}</p>
            <h3 className="font-bold">{item.officer_name}</h3>
            <p className="text-sm text-slate-600">
              {item.activity_description || "—"}
            </p>
            <p className="text-sm">{item.result_description}</p>
            <p className="mt-2 text-sm text-slate-500">
              {item.report_date} · plot {item.plot_id || "—"}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}