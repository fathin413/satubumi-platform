"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  getProjectAlerts
} from "@/lib/monitorApi";



export default function AlertsPage(){

  const params = useParams();

  const projectId =
    params.id as string;


  const [alerts,setAlerts] =
    useState<any[]>([]);


  const [loading,setLoading] =
    useState(true);



  async function loadAlerts(){

    try{

      const data =
        await getProjectAlerts(
          projectId
        );


      console.log(
        "ALERTS:",
        data
      );


      setAlerts(data);


    }catch(error){

      console.error(error);

    }finally{

      setLoading(false);

    }

  }




  useEffect(()=>{

    loadAlerts();

  },[]);





  return (

    <main className="p-8">


      <h1
        className="
        text-3xl
        font-bold
        text-emerald-950
        "
      >
        Project Alerts
      </h1>



      {
        loading && (
          <p className="mt-5">
            Loading...
          </p>
        )
      }





      {
        !loading &&
        alerts.length === 0 && (

          <div
            className="
            mt-6
            rounded-xl
            bg-white
            p-6
            shadow
            "
          >

            No alerts found.

          </div>

        )
      }






      <div
        className="
        mt-6
        space-y-4
        "
      >

        {
          alerts.map((alert)=>(

            <div
              key={alert.id}
              className="
              rounded-xl
              bg-white
              p-5
              shadow
              "
            >

              <h2
                className="
                font-bold
                "
              >
                {alert.title}
              </h2>


              <p>
                {alert.description}
              </p>


              <p>
                Status:
                {" "}
                {alert.status}
              </p>


            </div>

          ))
        }

      </div>


    </main>

  );

}