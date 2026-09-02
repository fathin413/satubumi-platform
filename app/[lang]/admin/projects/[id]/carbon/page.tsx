"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  getProjectCarbon,
  createCarbon
} from "@/lib/monitorApi";



export default function CarbonPage(){


  const params = useParams();


  const projectId =
    params.id as string;



  const [records,setRecords] =
    useState<any[]>([]);



  const [form,setForm] =
    useState({

      period_start:"",
      period_end:"",
      carbon_stock_tco2e:"",
      estimated_co2e:"",
      methodology:""

    });





  async function loadCarbon(){

    try{

      const data =
        await getProjectCarbon(
          projectId
        );


      console.log(
        "CARBON:",
        data
      );


      setRecords(data);


    }catch(error){

      console.error(error);

    }

  }





  useEffect(()=>{

    loadCarbon();

  },[]);







  async function submit(){


    try{


      await createCarbon(
        projectId,
        {

          ...form,

          carbon_stock_tco2e:
            Number(
              form.carbon_stock_tco2e
            ),

          estimated_co2e:
            Number(
              form.estimated_co2e
            )

        }
      );



      setForm({

        period_start:"",
        period_end:"",
        carbon_stock_tco2e:"",
        estimated_co2e:"",
        methodology:""

      });



      loadCarbon();



    }catch(error){

      console.error(error);

    }

  }







  return (

    <main className="p-8">


      <h1 className="
      text-3xl
      font-bold
      ">
        Carbon Monitoring
      </h1>




      <section
        className="
        mt-6
        bg-white
        rounded-xl
        p-6
        shadow
        "
      >


        <h2 className="font-bold">
          Add Carbon Record
        </h2>



        <input
          className="input mt-3"
          placeholder="Carbon Stock tCO2e"
          value={
            form.carbon_stock_tco2e
          }
          onChange={
            e=>setForm({
              ...form,
              carbon_stock_tco2e:e.target.value
            })
          }
        />



        <input
          className="input mt-3"
          placeholder="Estimated CO2e"
          value={
            form.estimated_co2e
          }
          onChange={
            e=>setForm({
              ...form,
              estimated_co2e:e.target.value
            })
          }
        />



        <input
          className="input mt-3"
          placeholder="Methodology"
          value={
            form.methodology
          }
          onChange={
            e=>setForm({
              ...form,
              methodology:e.target.value
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
          py-3
          text-white
          "
        >
          Save Carbon
        </button>


      </section>






      <section className="mt-8 space-y-4">


        {
          records.map((item)=>(

            <div
              key={item.id}
              className="
              bg-white
              rounded-xl
              p-5
              shadow
              "
            >

              <h3 className="font-bold">

                {item.carbon_stock_tco2e}
                {" "}
                tCO2e

              </h3>


              <p>
                CO2:
                {" "}
                {item.estimated_co2e}
              </p>


              <p>
                {item.methodology}
              </p>


            </div>

          ))
        }


      </section>


    </main>

  );

}