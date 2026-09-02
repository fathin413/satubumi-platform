"use client";

import ReportActions
from "./ReportActions";

interface Props {

  data:any;

  isId:boolean;

  projectId:string;

}



export default function ReportSummary({
  data,
  isId,
  projectId
}:Props){


  const report =
    data?.report || {};



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

        {
          isId
          ? "Ringkasan Laporan"
          : "Report Summary"
        }

      </h2>

   <ReportActions
  projectId={projectId}
  isId={isId}
/>

      
      <pre
        className="
        overflow-auto
        rounded-xl
        bg-slate-50
        p-4
        text-xs
        "
      >

        {
          JSON.stringify(
            report,
            null,
            2
          )
        }

      </pre>


    </section>

  );

}