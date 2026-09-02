"use client";


import {
  downloadProjectPDF,
  downloadProjectCSV
} from "@/lib/monitorDashboardApi";

import {
  downloadProjectGeoJSON
} from "@/lib/monitorApi";


interface Props {

  projectId:string;

  isId:boolean;

}




export default function ReportActions({

  projectId,

  isId

}:Props){



  async function handlePDF(){

    try{

      await downloadProjectPDF(
        projectId
      );

    }catch(error){

      console.error(error);

    }

  }





  async function handleCSV(){

    try{

      await downloadProjectCSV(
        projectId
      );

    }catch(error){

      console.error(error);

    }

  }

  async function handleGeoJSON(){

  try{

    await downloadProjectGeoJSON(
      projectId
    );

  }catch(error){

    console.error(error);

  }

}

  return (

    <div
      className="
      flex
      flex-wrap
      gap-3
      "
    >


      <button

        onClick={handlePDF}

        className="
        rounded-xl
        bg-emerald-700
        px-5
        py-3
        text-white
        font-bold
        "

      >

        📄
        {" "}
        {
          isId
          ? "Download PDF"
          : "Download PDF"
        }

      </button>





      <button

        onClick={handleCSV}

        className="
        rounded-xl
        border
        border-emerald-700
        px-5
        py-3
        text-emerald-700
        font-bold
        "

      >

        📊 Export CSV

      </button>

      <button

onClick={handleGeoJSON}

className="
rounded-xl
border
border-emerald-700
px-5
py-3
text-emerald-700
font-bold
"

>

🗺️ Export GeoJSON

</button>
      
    </div>

  );

}