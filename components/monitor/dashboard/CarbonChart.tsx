"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";


interface Props {
  data:any;
  isId:boolean;
}



export default function CarbonChart({
  data,
  isId
}:Props){


  const dashboard =
    data?.dashboard || {};



  const chartData = [

    {
      name:"Carbon Stock",

      value:
        dashboard.carbon_stock_tco2e ?? 0
    },


    {
      name:"Estimated CO2e",

      value:
        dashboard.estimated_co2e ?? 0
    }

  ];



  return (

    <section
      className="
      bg-white
      rounded-2xl
      border
      p-6
      shadow-sm
      "
    >

      <h2
        className="
        font-extrabold
        text-lg
        mb-5
        "
      >

        {
          isId
          ? "Grafik Karbon"
          : "Carbon Chart"
        }

      </h2>



      <div className="h-72">


        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={chartData}
          >

            <XAxis
              dataKey="name"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
            />

          </BarChart>


        </ResponsiveContainer>


      </div>


    </section>

  );

}