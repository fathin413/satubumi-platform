"use client";

import {
  useEffect,
  useState
} from "react";

import dynamic from "next/dynamic";

import {
  getProjectMap,
  getProjectSatellite
} from "@/lib/monitorApi";



interface Props {

  projectId: string;

}





const MapContainer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.MapContainer
    ),
  {
    ssr: false,
  }
);


const TileLayer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.TileLayer
    ),
  {
    ssr: false,
  }
);


const GeoJSON = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.GeoJSON
    ),
  {
    ssr: false,
  }
);





export default function MonitorMap({
  projectId
}: Props) {


  const [mapData,setMapData] =
    useState<any>(null);



  const [loading,setLoading] =
    useState(true);

    const [satellite,setSatellite] =
  useState<any>(null);






  useEffect(()=>{


    async function loadMap(){


      try{


        const [
  map,
  satelliteData
] = await Promise.all([

  getProjectMap(projectId),

  getProjectSatellite(projectId)

]);


console.log(
  "MAP DATA:",
  map
);


console.log(
  "SATELLITE DATA:",
  satelliteData
);


setMapData(map);

setSatellite(
  satelliteData
);



      }catch(error){


        console.error(
          "MAP ERROR:",
          error
        );


      }finally{


        setLoading(false);


      }


    }





    if(projectId){

      loadMap();

    }



  },[projectId]);









  if(loading){


    return (

      <div
        className="
        mt-8
        rounded-xl
        bg-white
        p-6
        shadow
        "
      >

        Loading map...

      </div>

    );

  }









  return (

    <section
      className="
      mt-8
      rounded-2xl
      overflow-hidden
      bg-white
      shadow
      "
    >


      <div className="p-5">

  <h2
    className="
    text-xl
    font-bold
    text-slate-900
    "
  >
    GIS Monitoring Map
  </h2>


  {
    !mapData?.boundary &&
    mapData?.plots?.total_features === 0 && (

      <p
        className="
        mt-2
        text-sm
        text-slate-500
        "
      >
        No spatial monitoring data available yet.
      </p>

    )
  }

</div>







      <MapContainer

        center={[
          -2.5,
          118
        ]}

        zoom={5}

        style={{
          height:"500px",
          width:"100%"
        }}

      >



        <TileLayer

          url="
          https://tile.openstreetmap.org/{z}/{x}/{y}.png
          "

        />

       {
  satellite?.tile_url_template && (

    <TileLayer

      url={
        satellite.tile_url_template
      }

      opacity={0.6}

      attribution={
        satellite.attribution
      }

    />

  )
}






        {
          mapData?.boundary && (

            <GeoJSON

              data={
                mapData.boundary
              }

            />

          )
        }







        {
          mapData?.plots && (

            <GeoJSON

              data={
                mapData.plots
              }

            />

          )
        }




      </MapContainer>



    </section>

  );

}