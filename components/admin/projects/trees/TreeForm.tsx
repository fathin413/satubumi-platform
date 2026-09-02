"use client";

import {
  useState
} from "react";

import {
  createTree
} from "@/lib/monitorApi";



interface Props {

  projectId:string;

  onCreated?:()=>void;

}



interface TreeFormData {

  species:string;

  quantity:string;

  planting_date:string;

  location:string;

  notes:string;

}





export default function TreeForm({

  projectId,

  onCreated

}:Props){



  const [loading,setLoading] =
    useState(false);



  const [form,setForm] =
    useState<TreeFormData>({

      species:"",

      quantity:"",

      planting_date:"",

      location:"",

      notes:""

    });







  function updateField(

    key:keyof TreeFormData,

    value:string

  ){

    setForm(prev=>({

      ...prev,

      [key]:value

    }));

  }








  async function submit(){


    try{


      setLoading(true);



      await createTree(

        projectId,

        {

          species:
            form.species,


          quantity:
            Number(form.quantity),


          planting_date:
            form.planting_date,


          location:
            form.location,


          notes:
            form.notes

        }

      );





      setForm({

        species:"",

        quantity:"",

        planting_date:"",

        location:"",

        notes:""

      });





      onCreated?.();




    }catch(error){


      console.error(
        "CREATE TREE ERROR:",
        error
      );


      alert(
        "Failed create tree record"
      );



    }finally{


      setLoading(false);


    }


  }








  return (

    <section

      className="
      rounded-2xl
      bg-white
      border
      shadow-sm
      p-6
      "

    >



      <h2

        className="
        text-xl
        font-bold
        text-emerald-950
        mb-5
        "

      >

        Add Tree Record

      </h2>







      <div

        className="
        grid
        gap-4
        "

      >





        <input

          value={
            form.species
          }

          onChange={

            e=>

            updateField(

              "species",

              e.target.value

            )

          }

          placeholder="Species"

          className="
          rounded-xl
          border
          p-3
          "

        />







        <input

          type="number"

          value={
            form.quantity
          }

          onChange={

            e=>

            updateField(

              "quantity",

              e.target.value

            )

          }

          placeholder="Quantity"

          className="
          rounded-xl
          border
          p-3
          "

        />







        <input

          type="date"

          value={
            form.planting_date
          }

          onChange={

            e=>

            updateField(

              "planting_date",

              e.target.value

            )

          }

          className="
          rounded-xl
          border
          p-3
          "

        />







        <input

          value={
            form.location
          }

          onChange={

            e=>

            updateField(

              "location",

              e.target.value

            )

          }

          placeholder="Location (lat, lng) e.g. -2.23, 113.85"

          className="
          rounded-xl
          border
          p-3
          "

        />







        <textarea

          value={
            form.notes
          }

          onChange={

            e=>

            updateField(

              "notes",

              e.target.value

            )

          }

          placeholder="Notes"

          rows={4}

          className="
          rounded-xl
          border
          p-3
          "

        />







        <button

          disabled={loading}

          onClick={submit}

          className="
          rounded-xl
          bg-emerald-700
          py-3
          font-bold
          text-white
          disabled:opacity-50
          "

        >

          {
            loading
            ?
            "Saving..."
            :
            "Save Tree Record"
          }


        </button>





      </div>



    </section>

  );

}