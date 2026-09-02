"use client";


interface Props {

  data:any;

  isId:boolean;

}



function fmt(
  value:any
){

  if(value == null){

    return "—";

  }


  return Number(value).toLocaleString();

}





export default function BiodiversitySection({
  data,
  isId
}:Props){


  const dashboard =
    data?.dashboard || {};



  const indicators =
    data?.indicators || {};





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
          ? "Keanekaragaman Hayati"
          : "Biodiversity"}

      </h2>




      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-4
        "
      >


        <div
          className="
          rounded-xl
          bg-green-50
          p-5
          "
        >

          <p className="text-sm text-slate-500">
            {isId
            ? "Spesies tercatat"
            : "Species recorded"}
          </p>


          <p className="mt-2 text-2xl font-bold">
            {fmt(
              dashboard.species_recorded
            )}
          </p>

        </div>





        <div
          className="
          rounded-xl
          bg-emerald-50
          p-5
          "
        >

          <p className="text-sm text-slate-500">
            Indicators
          </p>


          <p className="mt-2 text-2xl font-bold">
            {
              fmt(
                indicators.total_species
              )
            }
          </p>

        </div>





        <div
          className="
          rounded-xl
          bg-lime-50
          p-5
          "
        >

          <p className="text-sm text-slate-500">
            Observation
          </p>


          <p className="mt-2 text-2xl font-bold">
            {
              fmt(
                indicators.total_observation
              )
            }
          </p>

        </div>


      </div>


    </section>

  );

}