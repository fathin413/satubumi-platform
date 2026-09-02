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

      species_name:"",
      species_type:"fauna",
      observed_date:"",
      habitat:"",
      notes:""

    });

  const [error,setError] =
    useState<string | null>(null);





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


      setError(null);
      await createBiodiversity(
        projectId,
        form
      );



      setForm({

        species_name:"",
        species_type:"fauna",
        observed_date:"",
        habitat:"",
        notes:""

      });



      loadData();



    }catch(error){

      console.error(error);
      setError("Gagal menyimpan observasi. Cek nama spesies, tipe, dan tanggal.");

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

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        <input
          className="input mt-3"
          placeholder="Species name"
          value={form.species_name}
          onChange={
            e=>setForm({
              ...form,
              species_name:e.target.value
            })
          }
        />

        <select
          className="input mt-3"
          value={form.species_type}
          onChange={
            e=>setForm({
              ...form,
              species_type:e.target.value
            })
          }
        >
          <option value="fauna">fauna</option>
          <option value="flora">flora</option>
        </select>

        <input
          className="input mt-3"
          type="date"
          value={form.observed_date}
          onChange={
            e=>setForm({
              ...form,
              observed_date:e.target.value
            })
          }
        />

        <input
          className="input mt-3"
          placeholder="Habitat"
          value={form.habitat}
          onChange={
            e=>setForm({
              ...form,
              habitat:e.target.value
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
                {item.species_name || item.species}
              </h3>


              <p>
                Type: {item.species_type || item.category || "—"}
              </p>


              <p>
                Date: {item.observed_date || item.observation_date || "—"}
              </p>


            </div>

          ))
        }


      </section>


    </main>

  );

}