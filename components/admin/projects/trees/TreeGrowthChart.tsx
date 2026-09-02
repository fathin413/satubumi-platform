"use client";

import { useEffect, useState } from "react";
import { getTreeGrowth } from "@/lib/monitorApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  projectId: string;
  treeId: string;
  onClose?: () => void;
}

interface GrowthData {
  measurement_date: string;
  height_cm: number;
  diameter_cm: number;
}

export default function TreeGrowthChart({
  projectId,
  treeId,
  onClose,
}: Props) {
  const [data, setData] = useState<GrowthData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadGrowth() {
    try {
      const result = await getTreeGrowth(projectId, treeId);

      console.log("TREE GROWTH RESPONSE:", result);
      console.log("TIMELINE:", result?.timeline);

      setSummary(result);

      const timeline = Array.isArray(result?.timeline) ? result.timeline : [];

      const chartTimeline = timeline.filter(
        (item: any) => item.height_cm !== null || item.dbh_cm !== null
      );

      setData(
        chartTimeline.map((item: any) => ({
          measurement_date: item.date ?? item.measurement_date ?? "-",
          height_cm: Number(item.height_cm ?? 0),
          diameter_cm: Number(item.dbh_cm ?? 0),
        }))
      );
    } catch (error) {
      console.error("TREE GROWTH ERROR:", error);
      setData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId && treeId) {
      loadGrowth();
    }
  }, [projectId, treeId]);

  if (loading) {
    return (
      <section className="mt-5 rounded-xl bg-white p-5 shadow">
        Loading growth data...
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="mt-5 rounded-xl bg-white p-5 shadow">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-emerald-950">Tree Growth</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-500">
              ✕
            </button>
          )}
        </div>
        <p className="mt-4 text-slate-500">
          No growth measurement available.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl bg-white p-6 shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-emerald-950">
          Tree Growth Monitoring
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-500">
            ✕
          </button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-gray-500">Current Height</p>
            <h4 className="text-xl font-bold">
              {summary.current_height_cm ?? "-"} cm
            </h4>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-gray-500">Height Growth</p>
            <h4 className="text-xl font-bold">
              {summary.height_growth_delta_cm ?? summary.height_growth_cm ?? "-"} cm
            </h4>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-gray-500">Current DBH</p>
            <h4 className="text-xl font-bold">
              {summary.current_dbh_cm ?? "-"} cm
            </h4>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-gray-500">Measurements</p>
            <h4 className="text-xl font-bold">
              {summary.total_measurements ?? 0}
            </h4>
          </div>
        </div>
      )}

      <div className="mt-6 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid />
            <XAxis dataKey="measurement_date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="height_cm" name="Height (cm)" />
            <Line type="monotone" dataKey="diameter_cm" name="Diameter (cm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Height</th>
              <th className="p-3 text-left">Diameter</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{item.measurement_date}</td>
                <td className="p-3">{item.height_cm} cm</td>
                <td className="p-3">{item.diameter_cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}