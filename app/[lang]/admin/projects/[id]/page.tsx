"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteProject,
  getProject,
  runAlertCheck,
  syncProjectGee,
  updateProject,
} from "@/lib/monitorApi";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const lang = (params.lang as string) || "en";

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location_name: "",
    area_ha: "",
    project_type: "reforestation",
    status: "active",
    start_date: "",
    end_date: "",
  });

  async function loadProject() {
    try {
      const found = await getProject(id);
      setProject(found);
      setForm({
        name: found?.name ?? "",
        description: found?.description ?? "",
        location_name: found?.location_name ?? "",
        area_ha: found?.area_ha != null ? String(found.area_ha) : "",
        project_type: found?.project_type ?? "reforestation",
        status: found?.status ?? "active",
        start_date: (found?.start_date || "").slice(0, 10),
        end_date: (found?.end_date || "").slice(0, 10),
      });
    } catch (error) {
      console.error(error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  async function handleSave() {
    try {
      setSaving(true);
      setActionMsg(null);
      await updateProject(id, {
        name: form.name,
        description: form.description || null,
        location_name: form.location_name || null,
        area_ha: form.area_ha ? Number(form.area_ha) : null,
        project_type: form.project_type,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setEditing(false);
      await loadProject();
      setActionMsg("Project updated.");
    } catch (error) {
      console.error(error);
      setActionMsg("Gagal update project. Cek PUT /projects/{id}.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      `Hapus project "${project?.name}"? Tidak bisa dibatalkan.`,
    );
    if (!ok) return;
    try {
      await deleteProject(id);
      router.push(`/${lang}/admin/projects`);
    } catch (error) {
      console.error(error);
      setActionMsg("Gagal hapus project. Cek DELETE /projects/{id}.");
    }
  }

  async function handleGee() {
    try {
      setActionMsg("Menjalankan GEE sync...");
      const res = await syncProjectGee(id);
      setActionMsg(res?.message || "GEE sync selesai.");
    } catch (error) {
      console.error(error);
      setActionMsg("GEE sync gagal. Butuh role admin. Cek POST /gee/sync.");
    }
  }

  async function handleAlertCheck() {
    try {
      setActionMsg("Menjalankan evaluasi alert...");
      const res = await runAlertCheck(id);
      setActionMsg(res?.message || "Alert check selesai.");
    } catch (error) {
      console.error(error);
      setActionMsg("Alert check gagal. Cek POST /alerts/check.");
    }
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!project) {
    return <main className="p-8">Project tidak ditemukan.</main>;
  }

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">{project.name}</h1>
          <p className="mt-1 text-slate-500">Status: {project.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-xl border border-emerald-700 px-4 py-2 font-bold text-emerald-800"
          >
            {editing ? "Tutup form" : "Edit project"}
          </button>
          <button
            onClick={handleAlertCheck}
            className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white"
          >
            Run alert check
          </button>
          <button
            onClick={handleGee}
            className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white"
          >
            Sync GEE
          </button>
          <button
            onClick={handleDelete}
            className="rounded-xl border border-red-600 px-4 py-2 font-bold text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {actionMsg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {actionMsg}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <InfoCard title="Location" value={project.location_name} />
        <InfoCard title="Area" value={`${project.area_ha ?? 0} ha`} />
        <InfoCard title="Type" value={project.project_type} />
      </div>

      {editing && (
        <section className="mt-8 rounded-xl bg-white p-6 shadow grid gap-3 max-w-xl">
          <h2 className="text-xl font-bold">Edit project</h2>
          <input
            className="border rounded-xl p-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
          />
          <textarea
            className="border rounded-xl p-3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
          />
          <input
            className="border rounded-xl p-3"
            value={form.location_name}
            onChange={(e) => setForm({ ...form, location_name: e.target.value })}
            placeholder="Location"
          />
          <input
            className="border rounded-xl p-3"
            value={form.area_ha}
            onChange={(e) => setForm({ ...form, area_ha: e.target.value })}
            placeholder="Area (ha)"
          />
          <select
            className="border rounded-xl p-3"
            value={form.project_type}
            onChange={(e) => setForm({ ...form, project_type: e.target.value })}
          >
            <option value="reforestation">reforestation</option>
            <option value="mangrove">mangrove</option>
            <option value="peatland">peatland</option>
            <option value="agroforestry">agroforestry</option>
            <option value="blue_carbon">blue_carbon</option>
          </select>
          <select
            className="border rounded-xl p-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">active</option>
            <option value="completed">completed</option>
            <option value="suspended">suspended</option>
          </select>
          <label className="text-sm text-slate-500">Start date</label>
          <input
            type="date"
            className="border rounded-xl p-3"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <label className="text-sm text-slate-500">End date</label>
          <input
            type="date"
            className="border rounded-xl p-3"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
          <button
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-emerald-700 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </section>
      )}

      <section className="mt-10 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">Monitoring Data</h2>
        <div className="mt-5 grid gap-3">
          <a href={`/${lang}/admin/projects/${project.id}/trees`}>🌱 Trees Management</a>
          <a href={`/${lang}/admin/projects/${project.id}/plots`}>📐 Monitoring Plots</a>
          <a href={`/${lang}/admin/projects/${project.id}/activities`}>📋 Activities</a>
          <a href={`/${lang}/admin/projects/${project.id}/carbon`}>🌳 Carbon Monitoring</a>
          <a href={`/${lang}/admin/projects/${project.id}/biodiversity`}>🦋 Biodiversity</a>
          <a href={`/${lang}/admin/projects/${project.id}/alerts`}>🚨 Alerts</a>
          <a href={`/${lang}/admin/projects/${project.id}/evidence`}>📷 Evidence Timeline</a>
          <a href={`/${lang}/admin/projects/${project.id}/reports`}>📄 Reports</a>
          <a href={`/${lang}/admin/projects/${project.id}/field-reports`}>📝 Field Reports</a>
          <a href={`/${lang}/admin/projects/compare`}>📊 Compare Projects</a>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="mt-2 text-xl font-bold">{value}</h3>
    </div>
  );
}