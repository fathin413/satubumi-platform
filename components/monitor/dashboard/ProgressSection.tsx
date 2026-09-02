"use client";


interface Props {

  data:any;

  isId:boolean;

}



function fmt(
  value:any
){

  if(
    value === null ||
    value === undefined
  ){

    return "—";

  }


  return Number(value).toLocaleString();

}





export default function ProgressSection({
  data,
  isId
}:Props){


  const progress =
    data?.progress || {};



  const items = [

    {
      label:
        isId
        ? "Progress keseluruhan"
        : "Overall progress",

      value:
        progress.overall_progress_pct != null
        ? `${progress.overall_progress_pct}%`
        : "—"

    },


    {
      label:
        isId
        ? "Pohon tertanam"
        : "Trees planted",

      value:
        fmt(
          progress.tree_summary?.planted
        )

    },


    {
      label:
        isId
        ? "Pohon hidup"
        : "Trees survived",

      value:
        fmt(
          progress.tree_summary?.survived
        )

    },


    {
      label:
        "Survival rate",

      value:
        progress.tree_summary?.survival_rate != null
        ?
        `${progress.tree_summary.survival_rate}%`
        :
        "—"

    }


  ];





  return (

    <section
      className="
      bg-white
      rounded-2xl
      border
      border-slate-200
      p-6
      shadow-sm
      "
    >


      <h2
        className="
        text-lg
        font-extrabold
        text-slate-900
        mb-5
        "
      >
        {isId
          ? "Progress Monitoring"
          : "Progress Monitoring"}
      </h2>



      <div
        className="
        grid
        grid-cols-2
        md:grid-cols-4
        gap-4
        "
      >

        {
          items.map(item=>(

            <div
              key={item.label}
              className="
              rounded-xl
              bg-slate-50
              p-4
              "
            >

              <p
                className="
                text-xs
                text-slate-500
                "
              >

                {item.label}

              </p>


              <p
                className="
                mt-2
                text-xl
                font-bold
                text-slate-900
                "
              >

                {item.value}

              </p>


            </div>

          ))
        }

      </div>


    </section>

  );

}