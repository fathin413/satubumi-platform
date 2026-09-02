"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  getProjectReport
} from "@/lib/monitorApi";



export default function ReportsPage(){

  const params = useParams();

  const projectId =
    params.id as string;


  const [report,setReport] =
    useState<any>(null);



  useEffect(()=>{


    async function load(){

      try{

        const data =
          await getProjectReport(
            projectId
          );


        console.log(
          "REPORT:",
          data
        );


        setReport(data);


      }catch(error){

        console.error(error);

      }

    }


    load();


  },[]);





  return (

    <main className="p-8">


      <h1
        className="
        text-3xl
        font-bold
        "
      >
        Project Report
      </h1>




      {
        !report ? (

          <p className="mt-5">
            Loading report...
          </p>

        ) : (

          <div
            className="
            mt-6
            rounded-xl
            bg-white
            p-6
            shadow
            "
          >

            <pre>
              {
                JSON.stringify(
                  report,
                  null,
                  2
                )
              }
            </pre>


          </div>

        )
      }



    </main>

  );

}