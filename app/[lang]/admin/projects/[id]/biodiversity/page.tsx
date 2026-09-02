"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  getProjectBiodiversity,
  createBiodiversity
} from "@/lib/monitorApi";



export default function BiodiversityPage(){


  const params = useParams();


  const projectId =
    params.id as string;



  const [records,setRecords] =
    useState<any[]>([]);



  const [form,setForm] =
    useState({

      species:"",
      category:"",
      observation_date:"",
      quantity:"",
      notes:""

    });





  async function loadData(){

    try{

      const data =
        await getProjectBiodiversity(
          projectId
        );


      console.log(
        "BIODIVERSITY:",
        data
      );


      setRecords(data);


    }catch(error){

      console.error(error);

    }

  }





  useEffect(()=>{

    loadData();

  },[]);







  async function submit(){


    try{


      await createBiodiversity(
        projectId,
        {

          ...form,

          quantity:
            Number(form.quantity)

        }
      );



      setForm({

        species:"",
        category:"",
        observation_date:"",
        quantity:"",
        notes:""

      });



      loadData();



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
        Biodiversity Monitoring
      </h1>





      <section
        className="
        mt-6
        rounded-xl
        bg-white
        p-6
        shadow
        "
      >

        <h2 className="font-bold">
          Add Observation
        </h2>



        <input
          className="input mt-3"
          placeholder="Species"
          value={form.species}
          onChange={
            e=>setForm({
              ...form,
              species:e.target.value
            })
          }
        />



        <input
          className="input mt-3"
          placeholder="Category"
          value={form.category}
          onChange={
            e=>setForm({
              ...form,
              category:e.target.value
            })
          }
        />



        <input
          className="input mt-3"
          type="date"
          value={form.observation_date}
          onChange={
            e=>setForm({
              ...form,
              observation_date:e.target.value
            })
          }
        />



        <input
          className="input mt-3"
          placeholder="Quantity"
          type="number"
          value={form.quantity}
          onChange={
            e=>setForm({
              ...form,
              quantity:e.target.value
            })
          }
        />



        <textarea
          className="
          input
          mt-3
          "
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
          py-3
          text-white
          "
        >
          Save Observation
        </button>


      </section>






      <section className="mt-8 space-y-4">


        {
          records.map((item)=>(

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
                {item.species}
              </h3>


              <p>
                Category: {item.category}
              </p>


              <p>
                Quantity: {item.quantity}
              </p>


            </div>

          ))
        }


      </section>


    </main>

  );

}