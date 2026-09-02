"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjects } from "@/lib/monitorApi";
import ProjectForm from "@/components/admin/projects/ProjectForm";

export default function ProjectsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    try {
      setLoading(true);
      const data = await getProjects();
      console.log("ADMIN PROJECTS:", data);
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-950">
          Project Management
        </h1>
      </div>

      <div className="mt-6">
        <ProjectForm onCreated={loadProjects} />
      </div>

      {loading && <p className="mt-5">Loading...</p>}

      {!loading && projects.length === 0 && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          Belum ada project.
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/${lang}/admin/projects/${project.id}`}
          >
            <div className="rounded-xl bg-white p-6 shadow cursor-pointer hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold">{project.name}</h2>
              <p>{project.location_name}</p>
              <p>Type: {project.project_type}</p>
              <p>Status: {project.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}