"use client";


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

  tree:Tree | null;

  onClose:()=>void;

}





export default function TreeDetailModal({

  tree,

  onClose

}:Props){



  if(!tree){

    return null;

  }







  return (

    <div

      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      "

    >



      <div

        className="
        w-full
        max-w-lg
        rounded-2xl
        bg-white
        p-6
        shadow-xl
        "

      >



        <div

          className="
          flex
          justify-between
          items-center
          "

        >


          <h2

            className="
            text-2xl
            font-bold
            text-emerald-950
            "

          >

            Tree Detail

          </h2>



          <button

            onClick={onClose}

            className="
            text-slate-500
            "

          >

            ✕


          </button>


        </div>







        <div

          className="
          mt-6
          space-y-3
          "

        >



          <Info

            label="Species"

            value={tree.species}

          />



          <Info

            label="Quantity"

            value={tree.quantity}

          />



          <Info

            label="Planting Date"

            value={
              tree.planting_date ?? "-"
            }

          />



          <Info

            label="Condition"

            value={
              tree.condition ?? "-"
            }

          />



          <Info

            label="Status"

            value={
              tree.is_alive
              ?
              "Alive"
              :
              "Dead"
            }

          />



          <Info

            label="Location"

            value={
              tree.location ?? "-"
            }

          />



          <Info

            label="Notes"

            value={
              tree.notes ?? "-"
            }

          />



        </div>






        <button

          onClick={onClose}

          className="
          mt-6
          w-full
          rounded-xl
          bg-emerald-700
          py-3
          font-bold
          text-white
          "

        >

          Close

        </button>



      </div>



    </div>

  );

}








function Info({

  label,

  value

}:{

  label:string;

  value:string|number;

}){


  return (

    <div

      className="
      rounded-lg
      bg-slate-50
      p-3
      "

    >

      <p

        className="
        text-sm
        text-slate-500
        "

      >

        {label}

      </p>



      <p

        className="
        mt-1
        font-semibold
        "

      >

        {value}

      </p>


    </div>

  );

}