"use client";


interface Props {

  summary:any;

}



export default function TreeSummaryCard({

  summary

}:Props){


  const cards = [

    {
      title:"Total Trees",
      value:
        summary?.total_trees ?? 0
    },

    {
      title:"Alive Trees",
      value:
        summary?.alive_trees ?? 0
    },

    {
      title:"Dead Trees",
      value:
        summary?.dead_trees ?? 0
    },

    {
      title:"Survival Rate",
      value:
        `${summary?.survival_rate ?? 0}%`
    }

  ];





  return (

    <div

      className="
      grid
      grid-cols-1
      md:grid-cols-4
      gap-5
      "

    >


      {
        cards.map((item)=>(


          <div

            key={item.title}

            className="
            rounded-2xl
            bg-white
            p-6
            shadow
            "

          >

            <p

              className="
              text-sm
              text-slate-500
              "

            >

              {item.title}

            </p>



            <h3

              className="
              mt-2
              text-3xl
              font-bold
              text-emerald-900
              "

            >

              {item.value}

            </h3>


          </div>


        ))
      }



    </div>

  );

}