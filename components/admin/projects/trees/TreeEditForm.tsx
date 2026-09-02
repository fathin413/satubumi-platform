"use client";

import {
  useState
} from "react";

import {
  updateTree
} from "@/lib/monitorApi";



interface Tree {

  id:string | number;

  species:string;

  quantity:number;

  planting_date?:string;

  condition?:string;

  is_alive?:boolean;

  location?:string;

  notes?:string;

}



interface Props {

  projectId:string;

  tree:Tree;

  onUpdated?:()=>void;

  onClose?:()=>void;

}





export default function TreeEditForm({

  projectId,

  tree,

  onUpdated,

  onClose

}:Props){



  const [loading,setLoading] =
    useState(false);





  const [form,setForm] =
    useState({

      species:
        tree.species ?? "",


      quantity:
        String(tree.quantity ?? ""),


      planting_date:
        tree.planting_date ?? "",


      condition:
        tree.condition ?? "healthy",


      is_alive:
        tree.is_alive ?? true,


      location:
        tree.location ?? "",


      notes:
        tree.notes ?? ""

    });







  function updateField(

    key:string,

    value:any

  ){

    setForm(prev=>({

      ...prev,

      [key]:value

    }));

  }







  async function submit(){


    try{


      setLoading(true);



      await updateTree(

        projectId,

        String(tree.id),

        {

          species:
            form.species,


          quantity:
            Number(form.quantity),


          planting_date:
            form.planting_date,


          condition:
            form.condition,


          is_alive:
            form.is_alive,


          location:
            form.location,


          notes:
            form.notes

        }

      );





      onUpdated?.();





    }catch(error){


      console.error(
        "UPDATE TREE ERROR:",
        error
      );


      alert(
        "Failed update tree"
      );



    }finally{


      setLoading(false);


    }


  }







  return (

    <div

      className="
      rounded-2xl
      bg-white
      border
      p-6
      shadow
      "

    >



      <div

        className="
        flex
        justify-between
        mb-5
        "

      >

        <h2

          className="
          text-xl
          font-bold
          text-emerald-950
          "

        >

          Edit Tree

        </h2>



        {
          onClose && (

            <button

              onClick={onClose}

              className="
              text-slate-500
              "

            >

              ✕

            </button>

          )
        }


      </div>







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
          border
          rounded-xl
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
          border
          rounded-xl
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
          border
          rounded-xl
          p-3
          "

        />







        <select

          value={
            form.condition
          }

          onChange={

            e=>

            updateField(
              "condition",
              e.target.value
            )

          }

          className="
          border
          rounded-xl
          p-3
          "

        >

          <option value="healthy">
            Healthy
          </option>


          <option value="damaged">
            Damaged
          </option>


          <option value="dead">
            Dead
          </option>


        </select>







        <label

          className="
          flex
          items-center
          gap-3
          "

        >

          <input

            type="checkbox"

            checked={
              form.is_alive
            }

            onChange={

              e=>

              updateField(
                "is_alive",
                e.target.checked
              )

            }

          />

          Alive

        </label>







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

          placeholder="Location"

          className="
          border
          rounded-xl
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

          className="
          border
          rounded-xl
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
          text-white
          font-bold
          disabled:opacity-50
          "

        >

          {
            loading
            ?
            "Saving..."
            :
            "Update Tree"
          }


        </button>




      </div>



    </div>

  );

}