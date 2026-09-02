"use client";


interface Props {

  data:any;

  isId:boolean;

}



function number(
  n:any
){

  if(n == null)
    return "—";

  return Number(n).toLocaleString();

}




export default function CarbonSection({
  data,
  isId
}:Props){


  const dashboard =
    data?.dashboard || {};



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
        mb-5
        "
      >

        {isId
        ? "Monitoring Karbon"
        : "Carbon Monitoring"}

      </h2>



      <div
        className="
        grid
        md:grid-cols-2
        gap-5
        "
      >


        <div
          className="
          rounded-xl
          bg-emerald-50
          p-5
          "
        >

          <p className="text-sm text-slate-600">
            Carbon Stock
          </p>

          <p className="text-3xl font-bold">
            {number(
              dashboard.carbon_stock_tco2e
            )}
          </p>

          <p>
            tCO₂e
          </p>

        </div>




        <div
          className="
          rounded-xl
          bg-green-50
          p-5
          "
        >

          <p className="text-sm text-slate-600">
            Estimated CO₂e
          </p>

          <p className="text-3xl font-bold">
            {number(
              dashboard.estimated_co2e
            )}
          </p>


        </div>


      </div>


    </section>

  );

}