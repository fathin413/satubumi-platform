"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  getProjectActivities,
  createActivity
} from "@/lib/monitorApi";



export default function ActivitiesPage(){


  const params = useParams();


  const projectId =
    params.id as string;



  const [activities,setActivities] =
    useState<any[]>([]);



  const [loading,setLoading] =
    useState(true);



  const [form,setForm] =
    useState({

      activity_type:"planting",
      activity_date:"",
      notes:"",
      target:"",
      realization:"",
      unit:"trees"

    });





  async function loadActivities(){

    try{

      const data =
        await getProjectActivities(
          projectId
        );


      setActivities(data);


    }catch(error){

      console.error(error);

    }
    finally{

      setLoading(false);

    }

  }





  useEffect(()=>{

    loadActivities();

  },[]);







  async function submit(){


    try{


      await createActivity(
        projectId,
        {

          ...form,

          target:Number(form.target),

          realization:Number(form.realization)

        }
      );


      setForm({

        activity_type:"planting",
        activity_date:"",
        notes:"",
        target:"",
        realization:"",
        unit:"trees"

      });


      loadActivities();


    }catch(error){

      console.error(error);

    }


  }







  return (

    <main className="p-8">


      <h1
        className="
        text-3xl
        font-bold
        "
      >
        Activities
      </h1>





      <div
        className="
        mt-6
        rounded-xl
        bg-white
        p-6
        shadow
        "
      >


        <h2 className="font-bold">
          Add Activity
        </h2>



        <select
          className="input mt-3"
          value={form.activity_type}
          onChange={
            e=>setForm({
              ...form,
              activity_type:e.target.value
            })
          }
        >
          <option value="planting">planting</option>
          <option value="restoration">restoration</option>
          <option value="biodiversity_survey">biodiversity_survey</option>
          <option value="community_development">community_development</option>
          <option value="fire_prevention">fire_prevention</option>
          <option value="forest_protection">forest_protection</option>
        </select>



        <input
          className="input mt-3"
          type="date"
          value={form.activity_date}
          onChange={
            e=>setForm({
              ...form,
              activity_date:e.target.value
            })
          }
        />



        <input
          className="input mt-3"
          placeholder="Notes"
          value={form.notes}
          onChange={
            e=>setForm({
              ...form,
              notes:e.target.value
            })
          }
        />



        <button
          onClick={submit}
          className="
          mt-5
          rounded-xl
          bg-emerald-700
          px-5
          py-2
          text-white
          "
        >
          Save Activity
        </button>


      </div>






      <div className="mt-8 space-y-4">


        {
          activities.map((item)=>(
            
            <div
              key={item.id}
              className="
              rounded-xl
              bg-white
              p-5
              shadow
              "
            >

              <h3 className="font-bold">
                {item.activity_type}
              </h3>


              <p>
                {item.notes || item.description || ""}
              </p>


              <p>
                {item.activity_date}
              </p>


            </div>

          ))
        }


      </div>



    </main>

  );

}