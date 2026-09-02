"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
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

  async function loadData() {
    try {
      setLoading(true);

      const [treesData, summaryData] = await Promise.all([
        getProjectTrees(projectId),
        getTreeSummary(projectId),
      ]);

      setTrees(treesData);
      setSummary(summaryData);
    } catch (error) {
      console.error("LOAD TREE ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  return (
    <main className="min-h-screen bg-[#F1F6F4] p-8">
      <h1 className="text-3xl font-bold text-emerald-950">Tree Management</h1>

      <p className="mt-2 text-slate-600">
        Manage planting records and tree monitoring.
      </p>

      <section className="mt-8">
        <TreeSummaryCard summary={summary} />
      </section>

      <section className="mt-8">
        <TreeForm projectId={projectId} onCreated={loadData} />
      </section>

      <section className="mt-8">
        {loading ? (
          <div>Loading trees...</div>
        ) : (
          <TreeTable
            trees={trees}
            onDetail={setSelectedTree}
            onEdit={setEditTree}
            onMeasurement={setMeasurementTree}
            onGrowth={setGrowthTree}
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
        <TreeEditForm
          projectId={projectId}
          tree={editTree}
          onUpdated={() => {
            setEditTree(null);
            loadData();
          }}
          onClose={() => setEditTree(null)}
        />
      )}

      {measurementTree && (
        <TreeMeasurementForm
          projectId={projectId}
          treeId={String(measurementTree.id)}
          onCreated={() => {
            setMeasurementTree(null);
            loadData();
          }}
          onClose={() => setMeasurementTree(null)}
        />
      )}

      {growthTree && (
        <TreeGrowthChart
          projectId={projectId}
          treeId={String(growthTree.id)}
          onClose={() => setGrowthTree(null)}
        />
      )}
    </main>
  );
}