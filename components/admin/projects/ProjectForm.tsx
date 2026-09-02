"use client";

import { useState } from "react";
import { createProject } from "@/lib/monitorApi";


interface Props {
  onCreated: () => void;
}


export default function ProjectForm({
  onCreated
}: Props) {


  const [open, setOpen] = useState(false);


  const [form, setForm] = useState({
    name:"",
    description:"",
    location_name:"",
    area_ha:"",
    project_type:"",
    status:"active",
  });



  function update(
    key:string,
    value:string
  ){

    setForm({
      ...form,
      [key]:value
    });

  }



  async function submit(){

    try{

      await createProject({

        ...form,

        area_ha:Number(form.area_ha)

      });


      setOpen(false);

      onCreated();


    }catch(error){

      console.error(error);

    }

  }




  return (

    <>

      <button
        onClick={()=>setOpen(true)}
        className="
        rounded-xl
        bg-emerald-700
        px-5
        py-3
        text-white
        "
      >
        + Add Project
      </button>



      {
        open && (

          <div
            className="
            mt-6
            rounded-xl
            bg-white
            p-6
            shadow
            "
          >

            <h2 className="
              text-xl
              font-bold
            ">
              Create Project
            </h2>



            <input
              className="input mt-4"
              placeholder="Project Name"
              onChange={
                e=>update(
                  "name",
                  e.target.value
                )
              }
            />


            <input
              className="input mt-3"
              placeholder="Location"
              onChange={
                e=>update(
                  "location_name",
                  e.target.value
                )
              }
            />



            <input
              className="input mt-3"
              placeholder="Area (ha)"
              onChange={
                e=>update(
                  "area_ha",
                  e.target.value
                )
              }
            />



            <input
              className="input mt-3"
              placeholder="Project Type"
              onChange={
                e=>update(
                  "project_type",
                  e.target.value
                )
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
              Save
            </button>


          </div>

        )

      }

    </>

  );

}