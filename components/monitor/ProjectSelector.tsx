"use client";

interface Project {
  id: string;
  name: string;
  project_type?: string;
}


interface Props {
  projects: Project[];
  selectedProject: string;
  onSelect: (id:string)=>void;
}


export default function ProjectSelector({
  projects,
  selectedProject,
  onSelect
}: Props){


  return (
    <div className="mt-8">

      <label className="block mb-2 font-semibold text-emerald-950">
        Select Project
      </label>


      <select
        value={selectedProject}
        onChange={(e)=>onSelect(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          bg-white
          p-3
        "
      >

        <option value="">
          Choose project
        </option>


        {projects.map((project)=>(
          <option
            key={project.id}
            value={project.id}
          >
            {project.name}
          </option>
        ))}


      </select>

    </div>
  );
}