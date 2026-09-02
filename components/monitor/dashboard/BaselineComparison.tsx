"use client";


interface Props {

  data:any;

  isId:boolean;

}



function formatValue(
  value:any
){

  if(
    value === null ||
    value === undefined
  ){

    return "-";

  }


  return Number(value).toLocaleString();

}





export default function BaselineComparison({
  data,
  isId
}:Props){


  const baseline =
    data?.baseline || {};



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
        mb-6
        "
      >

        {
          isId
          ? "Perbandingan Baseline"
          : "Baseline Comparison"
        }

      </h2>





      <div
        className="
        overflow-x-auto
        "
      >

        <table
          className="
          w-full
          text-sm
          "
        >

          <thead>

            <tr
              className="
              border-b
              "
            >

              <th
                className="
                text-left
                py-3
                "
              >
                Metric
              </th>


              <th>
                Baseline
              </th>


              <th>
                Current
              </th>


            </tr>

          </thead>



          <tbody>


            <tr className="border-b">

              <td className="py-3">
                Trees
              </td>

              <td>
                {
                  formatValue(
                    baseline.trees_baseline
                  )
                }
              </td>

              <td>
                {
                  formatValue(
                    baseline.trees_current
                  )
                }
              </td>

            </tr>





            <tr className="border-b">

              <td className="py-3">
                Carbon
              </td>


              <td>
                {
                  formatValue(
                    baseline.carbon_baseline
                  )
                }
              </td>


              <td>
                {
                  formatValue(
                    baseline.carbon_current
                  )
                }
              </td>


            </tr>






            <tr>

              <td className="py-3">
                Progress
              </td>


              <td>
                {
                  formatValue(
                    baseline.progress_baseline
                  )
                }
              </td>


              <td>
                {
                  formatValue(
                    baseline.progress_current
                  )
                }
              </td>


            </tr>


          </tbody>


        </table>


      </div>


    </section>

  );

}