"use client";

import {
  Trees,
  Leaf,
  Users,
} from "lucide-react";


interface KPIGridProps {

  data:any;

  isId:boolean;

}



function fmt(
  n?:number | null
){

  if(
    n === undefined ||
    n === null ||
    Number.isNaN(n)
  ){

    return "—";

  }


  return Number(n).toLocaleString();

}






export default function KPIGrid({

  data,

  isId,

}:KPIGridProps){



  const kpis = [

    {
      label: isId
        ? "Pohon ditanam"
        : "Trees planted",

      value: fmt(
        data.trees_planted
      ),

      icon: Trees,

    },


    {
      label: isId
        ? "Pohon hidup"
        : "Trees survived",

      value: fmt(
        data.trees_survived
      ),

      icon: Trees,

    },


    {
      label:
        "Survival rate",

      value:
        data.survival_rate != null
        ? `${Number(
            data.survival_rate
          ).toFixed(1)}%`
        : "—",

      icon: Leaf,

    },


    {
      label: isId
        ? "Estimasi CO₂e"
        : "Estimated CO₂e",

      value: fmt(
        data.estimated_co2e ??
        data.carbon_stock_tco2e
      ),

      icon: Leaf,

      hint: isId
        ? "Estimasi monitoring"
        : "Monitoring estimate",

    },


    {
      label: isId
        ? "Spesies"
        : "Species",

      value: fmt(
        data.species_recorded
      ),

      icon: Leaf,

    },


    {
      label: isId
        ? "Penerima manfaat"
        : "Beneficiaries",

      value: fmt(
        data.total_beneficiaries
      ),

      icon: Users,

    },


  ];






  return (

    <div
      className="
      grid
      grid-cols-2
      md:grid-cols-3
      gap-4
      "
    >

      {
        kpis.map((k)=>(

          <div

            key={k.label}

            className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-sm
            "

          >


            <k.icon
              className="
              w-5
              h-5
              text-emerald-600
              mb-3
              "
            />



            <p
              className="
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
              mb-1
              "
            >

              {k.label}

            </p>



            <p
              className="
              text-xl
              md:text-2xl
              font-extrabold
              text-slate-900
              "
            >

              {k.value}

            </p>





            {
              k.hint && (

                <p
                  className="
                  text-[11px]
                  text-amber-700/80
                  font-medium
                  mt-1
                  "
                >

                  {k.hint}

                </p>

              )
            }


          </div>


        ))
      }


    </div>

  );

}