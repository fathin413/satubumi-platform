import {
  API_URL,
  authHeaders
} from "./monitorApi";

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }
  return response.json();
}

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
    fetchJson(`${API_URL}/projects/${projectId}/dashboard`),
    fetchJson(`${API_URL}/projects/${projectId}/progress`),
    fetchJson(`${API_URL}/projects/${projectId}/map/layers`),
    fetchJson(`${API_URL}/projects/${projectId}/indicators`),
    fetchJson(`${API_URL}/projects/${projectId}/report/summary`),
    fetchJson(`${API_URL}/projects/${projectId}/alerts`),
    fetchJson(`${API_URL}/projects/${projectId}/activities`),
    fetchJson(`${API_URL}/projects/${projectId}/compare/baseline`),
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
    throw new Error("Failed download PDF");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "satubumi-monitor-report.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadProjectCSV(
  projectId:string,
  dataType: string = "overview",
){

  const response = await fetch(
    `${API_URL}/projects/${projectId}/export/csv?data_type=${encodeURIComponent(dataType)}`,
    {
      headers: authHeaders(),
    }
  );

  if(!response.ok){
    throw new Error("Failed download CSV");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "satubumi-project-data.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
