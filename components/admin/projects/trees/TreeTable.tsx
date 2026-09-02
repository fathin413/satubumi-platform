"use client";


interface Tree {

  id:string | number;

  species:string;

  quantity:number;

  planting_date?:string;

  condition?:string;

  is_alive?:boolean;

  location?:string;

}



interface Props {

  trees:Tree[];

  onDetail?:(tree:Tree)=>void;

  onEdit?:(tree:Tree)=>void;

  onMeasurement?:(tree:Tree)=>void;

  onGrowth?:(tree:Tree)=>void;

}







export default function TreeTable({

  trees,

  onDetail,

  onEdit,

  onMeasurement,

  onGrowth

}:Props){



  if(trees.length===0){

    return (

      <div

        className="
        rounded-xl
        bg-white
        p-6
        shadow
        "

      >

        No tree records available.

      </div>

    );

  }







  return (

    <div

      className="
      grid
      gap-4
      "

    >


      {
        trees.map((tree)=>(


          <div

            key={tree.id}

            className="
            rounded-2xl
            bg-white
            p-6
            shadow
            "

          >



            <div

              className="
              flex
              justify-between
              items-start
              "

            >



              <div>


                <h3

                  className="
                  text-xl
                  font-bold
                  text-emerald-950
                  "

                >

                  {tree.species}

                </h3>



                <p className="mt-2">

                  Quantity:
                  {" "}
                  {tree.quantity}

                </p>



                {
                  tree.planting_date && (

                    <p>

                      Planting:
                      {" "}
                      {tree.planting_date}

                    </p>

                  )
                }



                {
                  tree.condition && (

                    <p>

                      Condition:
                      {" "}
                      {tree.condition}

                    </p>

                  )
                }



                <p>

                  Status:
                  {" "}

                  {
                    tree.is_alive
                    ?
                    "Alive"
                    :
                    "Dead"
                  }

                </p>



                {
                  tree.location && (

                    <p>

                      Location:
                      {" "}
                      {tree.location}

                    </p>

                  )
                }



              </div>





            </div>







            <div

              className="
              mt-5
              flex
              flex-wrap
              gap-3
              "

            >



              <button

                onClick={()=>onDetail?.(tree)}

                className="
                rounded-lg
                border
                px-4
                py-2
                "

              >

                Detail

              </button>





              <button

                onClick={()=>onEdit?.(tree)}

                className="
                rounded-lg
                border
                border-emerald-700
                px-4
                py-2
                text-emerald-700
                "

              >

                Edit

              </button>





              <button

                onClick={()=>onMeasurement?.(tree)}

                className="
                rounded-lg
                bg-emerald-700
                px-4
                py-2
                text-white
                "

              >

                Add Measurement

              </button>





              <button

                onClick={()=>onGrowth?.(tree)}

                className="
                rounded-lg
                border
                border-blue-700
                px-4
                py-2
                text-blue-700
                "

              >

                View Growth

              </button>



            </div>




          </div>


        ))

      }


    </div>

  );

}