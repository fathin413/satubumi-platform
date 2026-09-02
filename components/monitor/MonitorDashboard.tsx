"use client";

import {
  useEffect,
  useState
} from "react";

import Link from "next/link";

import {
  getProjects
} from "@/lib/monitorApi";



interface Project {

  id: string;

  name: string;

  project_type?: string;

  location_name?: string;

}



export default function MonitorDashboard() {


  const [projects,setProjects] =
    useState<Project[]>([]);



  const [loading,setLoading] =
    useState(true);



  const [error,setError] =
    useState("");





  async function loadProjects(){

    try{

      setLoading(true);

      setError("");


      const data =
        await getProjects();


      console.log(
        "PROJECTS:",
        data
      );


      setProjects(data);


    }catch(error){

      console.error(error);

      setError(
        "Failed to load projects"
      );


    }finally{

      setLoading(false);

    }

  }





  useEffect(()=>{

    loadProjects();

  },[]);








  return (

    <main
      className="
      min-h-screen
      bg-[#F1F6F4]
      pt-32
      pb-24
      "
    >

      <div
        className="
        max-w-6xl
        mx-auto
        px-6
        "
      >


        <h1
          className="
          text-4xl
          font-bold
          text-emerald-950
          "
        >
          SATUBUMI Monitor
        </h1>



        <p
          className="
          mt-3
          text-emerald-900/60
          "
        >
          Digital monitoring platform
        </p>





        {
          error && (

            <div
              className="
              mt-6
              rounded-xl
              bg-red-100
              p-4
              text-red-700
              "
            >

              {error}

            </div>

          )
        }







        {
          loading ? (

            <div className="mt-8">

              Loading projects...

            </div>


          ) : projects.length === 0 ? (


            <div
              className="
              mt-8
              rounded-xl
              bg-white
              p-6
              shadow
              "
            >

              No project available.

            </div>



          ) : (



            <div
              className="
              mt-10
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
              "
            >


              {
                projects.map((project)=>(


                  <Link

                    key={project.id}

                    href={
                      `/monitor/${project.id}`
                    }

                  >


                    <div

                      className="
                      cursor-pointer
                      rounded-2xl
                      bg-white
                      p-6
                      shadow-sm
                      border
                      hover:shadow-lg
                      transition
                      "

                    >


                      <h2
                        className="
                        text-xl
                        font-bold
                        text-emerald-950
                        "
                      >

                        {project.name}

                      </h2>




                      {
                        project.location_name && (

                          <p
                            className="
                            mt-2
                            text-gray-500
                            "
                          >

                            {project.location_name}

                          </p>

                        )
                      }





                      {
                        project.project_type && (

                          <span
                            className="
                            inline-block
                            mt-4
                            rounded-full
                            bg-emerald-100
                            px-3
                            py-1
                            text-sm
                            text-emerald-800
                            "
                          >

                            {project.project_type}

                          </span>

                        )
                      }



                    </div>


                  </Link>


                ))
              }



            </div>


          )

        }




      </div>


    </main>

  );

}