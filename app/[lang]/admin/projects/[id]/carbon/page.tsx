"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createCarbon, getProjectCarbon } from "@/lib/monitorApi";

export default function CarbonPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    period_start: "",
    period_end: "",
    carbon_stock_tco2e: "",
    biomass_ton: "",
    estimated_co2e: "",
    methodology: "",
    notes: "",
  });

  async function load() {
    try {
      const data = await getProjectCarbon(projectId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat carbon records.");
    }
  }

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function submit() {
    try {
      setError(null);
      await createCarbon(projectId, {
        period_start: form.period_start,
        period_end: form.period_end,
        carbon_stock_tco2e: form.carbon_stock_tco2e
          ? Number(form.carbon_stock_tco2e)
          : null,
        biomass_ton: form.biomass_ton ? Number(form.biomass_ton) : null,
        estimated_co2e: form.estimated_co2e ? Number(form.estimated_co2e) : null,
        methodology: form.methodology || null,
        notes: form.notes || null,
      });
      setForm({
        period_start: "",
        period_end: "",
        carbon_stock_tco2e: "",
        biomass_ton: "",
        estimated_co2e: "",
        methodology: "",
        notes: "",
      });
      load();
    } catch (err) {
      console.error(err);
      setError("Gagal simpan carbon. Wajib period_start dan period_end.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Carbon Monitoring</h1>
      <section className="mt-6 max-w-xl rounded-xl bg-white p-6 shadow grid gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="text-sm text-slate-500">Period start</label>
        <input type="date" className="border rounded-xl p-3" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
        <label className="text-sm text-slate-500">Period end</label>
        <input type="date" className="border rounded-xl p-3" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
        <input className="border rounded-xl p-3" placeholder="Carbon stock tCO2e" value={form.carbon_stock_tco2e} onChange={(e) => setForm({ ...form, carbon_stock_tco2e: e.target.value })} />
        <input className="border rounded-xl p-3" placeholder="Biomass (ton)" value={form.biomass_ton} onChange={(e) => setForm({ ...form, biomass_ton: e.target.value })} />
        <input className="border rounded-xl p-3" placeholder="Estimated CO2e" value={form.estimated_co2e} onChange={(e) => setForm({ ...form, estimated_co2e: e.target.value })} />
        <input className="border rounded-xl p-3" placeholder="Methodology" value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} />
        <textarea className="border rounded-xl p-3" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button onClick={submit} className="rounded-xl bg-emerald-700 py-3 font-bold text-white">Save carbon record</button>
      </section>
      <section className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="font-bold">{item.period_start} → {item.period_end}</h3>
            <p>Stock: {item.carbon_stock_tco2e ?? "—"} tCO2e</p>
            <p>Biomass: {item.biomass_ton ?? "—"} ton</p>
            <p>Estimated: {item.estimated_co2e ?? "—"}</p>
          </article>
        ))}
      </section>
    </main>
  );
}