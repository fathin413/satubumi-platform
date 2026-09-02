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



export default function ProgressChart({
  data,
  isId
}:Props){


  const progress =
    data?.progress || {};



  const chartData = [

    {
      name:
        isId
        ? "Pohon ditanam"
        : "Planted",

      value:
        progress.tree_summary?.planted ?? 0
    },


    {
      name:
        isId
        ? "Pohon hidup"
        : "Survived",

      value:
        progress.tree_summary?.survived ?? 0
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
          ? "Grafik Progress"
          : "Progress Chart"
        }
      </h2>



      <div
        className="
        h-72
        "
      >

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