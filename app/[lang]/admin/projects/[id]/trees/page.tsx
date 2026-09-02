"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  deleteTree,
  getProjectTrees,
  getTreeSummary,
} from "@/lib/monitorApi";

import TreeForm from "@/components/admin/projects/trees/TreeForm";
import TreeSummaryCard from "@/components/admin/projects/trees/TreeSummaryCard";
import TreeTable from "@/components/admin/projects/trees/TreeTable";
import TreeDetailModal from "@/components/admin/projects/trees/TreeDetailModal";
import TreeEditForm from "@/components/admin/projects/trees/TreeEditForm";
import TreeMeasurementForm from "@/components/admin/projects/trees/TreeMeasurementForm";
import TreeGrowthChart from "@/components/admin/projects/trees/TreeGrowthChart";

export default function TreesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [trees, setTrees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [editTree, setEditTree] = useState<any>(null);
  const [measurementTree, setMeasurementTree] = useState<any>(null);
  const [growthTree, setGrowthTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [treesData, summaryData] = await Promise.all([
        getProjectTrees(projectId),
        getTreeSummary(projectId),
      ]);
      setTrees(Array.isArray(treesData) ? treesData : []);
      setSummary(summaryData);
    } catch (err) {
      console.error("LOAD TREE ERROR:", err);
      setError("Failed to load tree records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  async function handleDelete(tree: any) {
    const ok = window.confirm(
      `Delete tree record #${tree.id} (${tree.species})? This also removes measurement history.`,
    );
    if (!ok) return;
    try {
      await deleteTree(projectId, String(tree.id));
      await loadData();
    } catch (err) {
      console.error(err);
      alert(
        "Delete gagal. Endpoint DELETE tree belum ada di backend. Minta tim BE: DELETE /projects/{id}/trees/{tree_id}. Sementara tandai dead lewat Edit.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F1F6F4] p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Tree Management</h1>
      <p className="mt-2 text-slate-600">
        Manage planting records, measurements, and growth tracking.
      </p>

      <section className="mt-8">
        <TreeSummaryCard summary={summary} />
      </section>

      <section className="mt-8">
        <TreeForm projectId={projectId} onCreated={loadData} />
      </section>

      <section className="mt-8">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {loading ? (
          <div>Loading trees...</div>
        ) : (
          <TreeTable
            trees={trees}
            onDetail={setSelectedTree}
            onEdit={setEditTree}
            onMeasurement={setMeasurementTree}
            onGrowth={setGrowthTree}
            onDelete={handleDelete}
          />
        )}
      </section>

      {selectedTree && (
        <TreeDetailModal
          tree={selectedTree}
          onClose={() => setSelectedTree(null)}
        />
      )}

      {editTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg">
            <TreeEditForm
              projectId={projectId}
              tree={editTree}
              onUpdated={() => {
                setEditTree(null);
                loadData();
              }}
              onClose={() => setEditTree(null)}
            />
          </div>
        </div>
      )}

      {measurementTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg">
            <TreeMeasurementForm
              projectId={projectId}
              treeId={String(measurementTree.id)}
              onCreated={() => {
                setMeasurementTree(null);
                loadData();
              }}
              onClose={() => setMeasurementTree(null)}
            />
          </div>
        </div>
      )}

      {growthTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <TreeGrowthChart
              projectId={projectId}
              treeId={String(growthTree.id)}
              onClose={() => setGrowthTree(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
