"use client";


import {
  useEffect,
  useState
} from "react";


import {
  useParams
} from "next/navigation";


import {
  getProjects
} from "@/lib/monitorApi";



export default function ProjectDetailPage(){


  const params = useParams();


  const id =
    params.id as string;



  const [project,setProject] =
    useState<any>(null);



  const [loading,setLoading] =
    useState(true);




  async function loadProject(){


    try{


      const projects =
        await getProjects();



      const found =
        projects.find(
          (item:any)=>
            String(item.id) === id
        );



      setProject(found);



    }catch(error){

      console.error(error);


    }finally{

      setLoading(false);

    }


  }





  useEffect(()=>{

    loadProject();

  },[]);







  if(loading){

    return (

      <main className="p-8">

        Loading...

      </main>

    );

  }







  if(!project){

    return (

      <main className="p-8">

        Project tidak ditemukan.

      </main>

    );

  }







  return (

    <main
      className="
      p-8
      "
    >


      <h1
        className="
        text-3xl
        font-bold
        text-emerald-950
        "
      >
        {project.name}
      </h1>



      <div
        className="
        mt-6
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
        "
      >


        <InfoCard

          title="Location"

          value={
            project.location_name
          }

        />


        <InfoCard

          title="Area"

          value={
            `${project.area_ha ?? 0} ha`
          }

        />


        <InfoCard

          title="Type"

          value={
            project.project_type
          }

        />


      </div>





      <section
        className="
        mt-10
        rounded-xl
        bg-white
        p-6
        shadow
        "
      >

        <h2
          className="
          text-xl
          font-bold
          "
        >
          Monitoring Data
        </h2>


      <div
  className="
  mt-5
  grid
  gap-3
  "
>

  <a href={`/admin/projects/${project.id}/trees`}>
    🌱 Trees Management
  </a>


  <a href={`/admin/projects/${project.id}/activities`}>
    📋 Activities
  </a>


  <a href={`/admin/projects/${project.id}/carbon`}>
    🌳 Carbon Monitoring
  </a>


  <a href={`/admin/projects/${project.id}/biodiversity`}>
    🦋 Biodiversity
  </a>


  <a href={`/admin/projects/${project.id}/alerts`}>
    🚨 Alerts
  </a>


  <a href={`/admin/projects/${project.id}/reports`}>
    📄 Reports
  </a>

</div>


      </section>



    </main>

  );

}





function InfoCard({
  title,
  value
}:{
  title:string;
  value:string;
}){


  return (

    <div
      className="
      rounded-xl
      bg-white
      p-5
      shadow
      "
    >

      <p className="text-gray-500">
        {title}
      </p>


      <h3
        className="
        mt-2
        text-xl
        font-bold
        "
      >
        {value}
      </h3>


    </div>

  );

}