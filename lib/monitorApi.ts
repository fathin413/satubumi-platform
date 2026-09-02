const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

console.log("API URL:", API_URL);

// ======================
// AUTH HEADER
// ======================

export function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

// ======================
// PROJECT
// ======================

export async function getProjects() {
  const response = await fetch(`${API_URL}/projects`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch projects");
  }

  return response.json();
}

export async function createProject(data: any) {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed create project");
  }

  return response.json();
}

// ======================
// MONITOR DASHBOARD
// ======================

export async function getProjectProgress(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/progress`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch progress");
  }

  return response.json();
}

export async function getProjectIndicators(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/indicators`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch indicators");
  }

  return response.json();
}

// ======================
// MAP
// ======================

export async function getProjectMap(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/map/layers`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch map");
  }

  return response.json();
}

export async function getProjectSatellite(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/map/satellite?layer_type=true_color`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed fetch satellite");
  }

  return response.json();
}

// ======================
// BASELINE
// ======================

export async function getBaselineComparison(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/compare/baseline`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed fetch baseline");
  }

  return response.json();
}

// ======================
// REPORT
// ======================

export async function getProjectReport(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/report/summary`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed fetch report");
  }

  return response.json();
}

export async function downloadProjectGeoJSON(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/export/geojson`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed download geojson");
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "satubumi-monitor.geojson";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

// ======================
// ACTIVITIES
// ======================

export async function getProjectActivities(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/activities`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch activities");
  }

  return response.json();
}

export async function createActivity(projectId: string, data: any) {
  const response = await fetch(`${API_URL}/projects/${projectId}/activities`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed create activity");
  }

  return response.json();
}

// ======================
// TREES
// ======================

export async function getProjectTrees(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/trees`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch trees");
  }

  return response.json();
}

export async function createTree(projectId: string, data: any) {
  const response = await fetch(`${API_URL}/projects/${projectId}/trees`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed create tree");
  }

  return response.json();
}

export async function getTreeSummary(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees/summary`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed fetch tree summary");
  }

  return response.json();
}

export async function updateTree(projectId: string, treeId: string, data: any) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees/${treeId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Failed update tree");
  }

  return response.json();
}

export async function createTreeMeasurement(
  projectId: string,
  treeId: string,
  data: any,
) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees/${treeId}/measurements`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Failed create tree measurement");
  }

  return response.json();
}

export async function getTreeGrowth(projectId: string, treeId: string) {
  const url = `${API_URL}/projects/${projectId}/trees/${treeId}/growth`;

  console.log("TREE GROWTH URL:", url);
  console.log("API URL:", API_URL);

  const response = await fetch(url, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch tree growth");
  }

  const json = await response.json();

  console.log("TREE GROWTH API JSON:", json);

  return json;
}

// ======================
// CARBON
// ======================

export async function getProjectCarbon(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/carbon`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch carbon");
  }

  return response.json();
}

export async function createCarbon(projectId: string, data: any) {
  const response = await fetch(`${API_URL}/projects/${projectId}/carbon`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed create carbon");
  }

  return response.json();
}

// ======================
// BIODIVERSITY
// ======================

export async function getProjectBiodiversity(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/biodiversity`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed fetch biodiversity");
  }

  return response.json();
}

export async function createBiodiversity(projectId: string, data: any) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/biodiversity`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Failed create biodiversity");
  }

  return response.json();
}

// ======================
// ALERTS
// ======================

export async function getProjectAlerts(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/alerts`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch alerts");
  }

  return response.json();
}

export { API_URL };
