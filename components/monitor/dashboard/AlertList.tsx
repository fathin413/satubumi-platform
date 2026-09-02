"use client";


interface Props {

  data:any;

  isId:boolean;

}



export default function AlertList({
  data,
  isId
}:Props){


  const alerts =
    data?.alerts || [];





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
          ? "Alert Terbaru"
          : "Recent Alerts"}

      </h2>





      {
        alerts.length === 0 ? (

          <p className="text-sm text-slate-500">
            {
              isId
              ? "Tidak ada alert."
              : "No alerts."
            }
          </p>


        ) : (


          <div className="space-y-3">

            {
              alerts.map(
                (alert:any)=>(

                  <div
                    key={alert.id}
                    className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    "
                  >

                    <p
                      className="
                      text-xs
                      font-bold
                      uppercase
                      text-slate-400
                      "
                    >
                      {
                        alert.alert_type ||
                        alert.type ||
                        "Alert"
                      }

                      {" · "}

                      {
                        alert.severity ||
                        "-"
                      }

                    </p>


                    <p
                      className="
                      mt-2
                      text-sm
                      text-slate-700
                      "
                    >
                      {
                        alert.description ||
                        "-"
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