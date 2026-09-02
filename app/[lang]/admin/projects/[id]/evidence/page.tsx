"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEvidenceTimeline } from "@/lib/monitorApi";

export default function EvidencePage() {
  const params = useParams();
  const projectId = params.id as string;
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const data = await getEvidenceTimeline(projectId, {
        limit: 20,
        source_type: source || undefined,
      });
      setMeta(data);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat evidence timeline.");
    }
  }

  useEffect(() => {
    if (projectId) load();
  }, [projectId, source]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Evidence Timeline</h1>
      <p className="mt-2 text-slate-600">
        GET /projects/{"{id}"}/evidence/timeline
      </p>

      <select
        className="mt-4 border rounded-xl p-3"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      >
        <option value="">All sources</option>
        <option value="field_report">field_report</option>
        <option value="activity">activity</option>
        <option value="tree_record">tree_record</option>
        <option value="biodiversity">biodiversity</option>
      </select>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {meta && (
        <p className="mt-3 text-sm text-slate-500">
          {meta.total_items ?? items.length} items
        </p>
      )}

      <section className="mt-6 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl bg-white p-5 shadow">
            <p className="text-xs uppercase text-slate-400">{item.source_type}</p>
            <h3 className="font-bold text-emerald-950">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.description}</p>
            <p className="mt-2 text-sm">
              {item.event_date} · {item.author || "—"}
            </p>
            {Array.isArray(item.photo_urls) && item.photo_urls.length > 0 && (
              <p className="text-sm text-emerald-700">
                {item.photo_urls.length} photo(s)
              </p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
