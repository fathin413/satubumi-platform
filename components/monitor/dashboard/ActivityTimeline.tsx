"use client";


interface Props {

  data:any;

  isId:boolean;

}



export default function ActivityTimeline({
  data,
  isId
}:Props){


  const activities =
    data?.activities || [];





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
          ? "Aktivitas Terbaru"
          : "Recent Activities"
        }

      </h2>




      {
        activities.length === 0 ? (

          <p className="text-sm text-slate-500">
            No activities.
          </p>


        ) : (

          <div className="space-y-4">

            {
              activities.map(
                (item:any)=>(

                  <div
                    key={item.id}
                    className="
                    border-l-2
                    border-emerald-500
                    pl-4
                    "
                  >

                    <p className="font-bold">
                      {
                        item.type ||
                        item.activity_type ||
                        "Activity"
                      }
                    </p>


                    <p className="text-sm text-slate-500">

                      {
                        item.date ||
                        item.activity_date ||
                        ""
                      }

                    </p>


                  </div>

                )
              )
            }

          </div>

        )

      }


    </section>

  );

}