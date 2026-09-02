import {
  API_URL,
  authHeaders
} from "./monitorApi";



export async function getMonitorDashboard(
  projectId:string
){

  const [
  dashboard,
  progress,
  map,
  indicators,
  report,
  alerts,
  activities,
  baseline
] = await Promise.all([


    fetch(
      `${API_URL}/projects/${projectId}/dashboard`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),



    fetch(
      `${API_URL}/projects/${projectId}/progress`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),



    fetch(
      `${API_URL}/projects/${projectId}/map/layers`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),



    fetch(
      `${API_URL}/projects/${projectId}/indicators`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),



    fetch(
      `${API_URL}/projects/${projectId}/report/summary`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),



    fetch(
      `${API_URL}/projects/${projectId}/alerts`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),



    fetch(
      `${API_URL}/projects/${projectId}/activities`,
      {
        headers:authHeaders()
      }
    ).then(r=>r.json()),


    fetch(
  `${API_URL}/projects/${projectId}/compare/baseline`,
  {
    headers:authHeaders()
  }
).then(r=>r.json()),


  ]);




  return {

  dashboard,

  progress,

  map,

  indicators,

  report,

  alerts,

  activities,

  baseline

};

}

export async function downloadProjectPDF(
  projectId:string
){

  const response = await fetch(
    `${API_URL}/projects/${projectId}/report/pdf`,
    {
      headers: authHeaders(),
    }
  );


  if(!response.ok){

    throw new Error(
      "Failed download PDF"
    );

  }


  const blob =
    await response.blob();


  const url =
    window.URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;


  link.download =
    "satubumi-monitor-report.pdf";


  document.body.appendChild(link);


  link.click();


  link.remove();


  window.URL.revokeObjectURL(url);

}







export async function downloadProjectCSV(
  projectId:string
){

  const response = await fetch(
    `${API_URL}/projects/${projectId}/export/csv`,
    {
      headers: authHeaders(),
    }
  );


  if(!response.ok){

    throw new Error(
      "Failed download CSV"
    );

  }


  const blob =
    await response.blob();


  const url =
    window.URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;


  link.download =
    "satubumi-project-data.csv";


  document.body.appendChild(link);


  link.click();


  link.remove();


  window.URL.revokeObjectURL(url);

}