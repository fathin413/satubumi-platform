"use client";

import { useMemo, useState } from "react";

export interface Tree {
  id: string | number;
  species: string;
  quantity: number;
  planting_date?: string;
  condition?: string;
  is_alive?: boolean;
  location?: string;
  location_geojson?: { type?: string; coordinates?: number[] } | null;
  height_cm?: number | null;
  dbh_cm?: number | null;
  plot_id?: string | null;
  notes?: string;
}

interface Props {
  trees: Tree[];
  onDetail?: (tree: Tree) => void;
  onEdit?: (tree: Tree) => void;
  onMeasurement?: (tree: Tree) => void;
  onGrowth?: (tree: Tree) => void;
  onDelete?: (tree: Tree) => void;
}

function formatLocation(tree: Tree) {
  const coords = tree.location_geojson?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const [lng, lat] = coords;
    return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }
  return tree.location || "—";
}

const PAGE_SIZE = 8;

export default function TreeTable({
  trees,
  onDetail,
  onEdit,
  onMeasurement,
  onGrowth,
  onDelete,
}: Props) {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("all");
  const [alive, setAlive] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trees.filter((tree) => {
      if (q && !String(tree.species || "").toLowerCase().includes(q)) {
        return false;
      }
      if (condition !== "all" && tree.condition !== condition) return false;
      if (alive === "alive" && !tree.is_alive) return false;
      if (alive === "dead" && tree.is_alive) return false;
      return true;
    });
  }, [trees, query, condition, alive]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow grid gap-3 md:grid-cols-4">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search species..."
          className="rounded-xl border p-3"
        />
        <select
          value={condition}
          onChange={(e) => {
            setCondition(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border p-3"
        >
          <option value="all">All conditions</option>
          <option value="healthy">Healthy</option>
          <option value="stressed">Stressed</option>
          <option value="dead">Dead</option>
        </select>
        <select
          value={alive}
          onChange={(e) => {
            setAlive(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border p-3"
        >
          <option value="all">All status</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
        </select>
        <p className="flex items-center text-sm text-slate-500">
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {pageItems.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow">
          No tree records available.
        </div>
      ) : (
        <div className="grid gap-4">
          {pageItems.map((tree) => (
            <div key={tree.id} className="rounded-2xl bg-white p-6 shadow">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    {tree.species}
                  </h3>
                  <p className="mt-2">Quantity: {tree.quantity}</p>
                  {tree.planting_date && <p>Planting: {tree.planting_date}</p>}
                  <p>Condition: {tree.condition || "—"}</p>
                  <p>Status: {tree.is_alive ? "Alive" : "Dead"}</p>
                  <p>
                    Height / DBH: {tree.height_cm ?? "—"} / {tree.dbh_cm ?? "—"}{" "}
                    cm
                  </p>
                  <p>Location: {formatLocation(tree)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => onDetail?.(tree)}
                  className="rounded-lg border px-4 py-2"
                >
                  Detail
                </button>
                <button
                  onClick={() => onEdit?.(tree)}
                  className="rounded-lg border border-emerald-700 px-4 py-2 text-emerald-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onMeasurement?.(tree)}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
                >
                  Add Measurement
                </button>
                <button
                  onClick={() => onGrowth?.(tree)}
                  className="rounded-lg border border-blue-700 px-4 py-2 text-blue-700"
                >
                  View Growth
                </button>
                <button
                  onClick={() => onDelete?.(tree)}
                  className="rounded-lg border border-red-600 px-4 py-2 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border px-4 py-2 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
