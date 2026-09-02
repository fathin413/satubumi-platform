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
  const response = await fetch(`${API_URL}/projects?limit=100`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch projects");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.items ?? data.results ?? [];
}

export async function getProject(projectId: string | number) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch project");
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
  const payload = {
    activity_type: data.activity_type,
    activity_date: data.activity_date,
    location_geojson: data.location_geojson ?? null,
    target: data.target != null && data.target !== "" ? Number(data.target) : null,
    realization:
      data.realization != null && data.realization !== ""
        ? Number(data.realization)
        : null,
    unit: data.unit || null,
    executor: data.executor || null,
    photo_urls: data.photo_urls ?? null,
    notes: data.notes ?? data.description ?? null,
  };

  const response = await fetch(`${API_URL}/projects/${projectId}/activities`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed create activity");
  }

  return response.json();
}

// ======================
// TREES
// ======================

export async function getProjectTrees(
  projectId: string,
  opts?: { species?: string; plot_id?: string },
) {
  const params = new URLSearchParams();
  if (opts?.species) params.set("species", opts.species);
  if (opts?.plot_id) params.set("plot_id", opts.plot_id);
  const qs = params.toString();
  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees${qs ? `?${qs}` : ""}`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed fetch trees");
  }

  return response.json();
}

function parseLoosePoint(value: unknown) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split(/[, ]+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  // If first number looks like latitude (|lat|<=90), treat as lat,lng
  const [lng, lat] = Math.abs(a) <= 90 && Math.abs(b) <= 180 ? [b, a] : [a, b];
  return { type: "Point", coordinates: [lng, lat] };
}

export async function createTree(projectId: string, data: any) {
  const payload = {
    plot_id: data.plot_id || null,
    species: data.species,
    quantity: Number(data.quantity),
    planting_date: data.planting_date,
    location_geojson: data.location_geojson ?? parseLoosePoint(data.location),
    condition: data.condition || "healthy",
    height_cm: data.height_cm != null && data.height_cm !== "" ? Number(data.height_cm) : null,
    dbh_cm: data.dbh_cm != null && data.dbh_cm !== "" ? Number(data.dbh_cm) : null,
    is_alive: data.is_alive ?? true,
    photo_urls: data.photo_urls ?? null,
    notes: data.notes || (typeof data.location === "string" && !parseLoosePoint(data.location) ? data.location : null),
  };

  const response = await fetch(`${API_URL}/projects/${projectId}/trees`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
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
  const payload: Record<string, unknown> = {
    species: data.species || undefined,
    quantity:
      data.quantity != null && data.quantity !== ""
        ? Number(data.quantity)
        : undefined,
    planting_date: data.planting_date || undefined,
    plot_id: data.plot_id || undefined,
    location_geojson:
      data.location_geojson ?? parseLoosePoint(data.location) ?? undefined,
    condition: data.condition || undefined,
    height_cm:
      data.height_cm != null && data.height_cm !== ""
        ? Number(data.height_cm)
        : undefined,
    dbh_cm:
      data.dbh_cm != null && data.dbh_cm !== ""
        ? Number(data.dbh_cm)
        : data.diameter_cm != null && data.diameter_cm !== ""
          ? Number(data.diameter_cm)
          : undefined,
    is_alive: data.is_alive,
    notes: data.notes || undefined,
  };

  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees/${treeId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Failed update tree");
  }

  return response.json();
}

export async function deleteTree(projectId: string, treeId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees/${treeId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed delete tree");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : { ok: true };
}

export async function createTreeMeasurement(
  projectId: string,
  treeId: string,
  data: any,
) {
  const payload = {
    measurement_date: data.measurement_date,
    height_cm:
      data.height_cm != null && data.height_cm !== ""
        ? Number(data.height_cm)
        : null,
    dbh_cm:
      data.dbh_cm != null && data.dbh_cm !== ""
        ? Number(data.dbh_cm)
        : data.diameter_cm != null && data.diameter_cm !== ""
          ? Number(data.diameter_cm)
          : null,
    condition: data.condition || data.health_status || "healthy",
    is_alive:
  data.is_alive ??
  (data.condition !== "dead" && data.health_status !== "dead"),
    measured_by: data.measured_by || null,
    photo_urls: data.photo_urls ?? null,
    notes: data.notes || null,
  };

  const response = await fetch(
    `${API_URL}/projects/${projectId}/trees/${treeId}/measurements`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Failed create tree measurement");
  }

  return response.json();
}

export async function getTreeGrowth(projectId: string, treeId: string) {
  const url = `${API_URL}/projects/${projectId}/trees/${treeId}/growth`;

  const response = await fetch(url, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed fetch tree growth");
  }

  return response.json();
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
  const rawType = data.species_type || data.category || "fauna";
  const speciesType =
    rawType === "flora" || rawType === "fauna" ? rawType : "fauna";

  const payload = {
    species_name: data.species_name || data.species,
    species_type: speciesType,
    location_geojson: data.location_geojson ?? null,
    observed_date: data.observed_date || data.observation_date,
    habitat: data.habitat || null,
    observer: data.observer || null,
    photo_url: data.photo_url || null,
    notes: data.notes || null,
  };

  const response = await fetch(
    `${API_URL}/projects/${projectId}/biodiversity`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
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

export async function getProjectAlerts(
  projectId: string,
  opts?: { only_active?: boolean },
) {
  const params = new URLSearchParams();
  if (opts?.only_active === false) params.set("only_active", "false");
  if (opts?.only_active === true) params.set("only_active", "true");
  const qs = params.toString();
  const response = await fetch(
    `${API_URL}/projects/${projectId}/alerts${qs ? `?${qs}` : ""}`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    throw new Error("Failed fetch alerts");
  }

  return response.json();
}

export async function getAlertSummary(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/alerts/summary`,
    { headers: authHeaders() },
  );
  if (!response.ok) throw new Error("Failed fetch alert summary");
  return response.json();
}

export async function runAlertCheck(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/alerts/check`,
    { method: "POST", headers: authHeaders() },
  );
  if (!response.ok) throw new Error("Failed run alert check");
  return response.json();
}

export async function resolveAlert(
  projectId: string,
  alertId: string | number,
  body: { is_resolved?: boolean; is_read?: boolean } = {
    is_resolved: true,
    is_read: true,
  },
) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/alerts/${alertId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error("Failed update alert");
  return response.json();
}

export async function getProjectPlots(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/plots`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed fetch plots");
  return response.json();
}

export async function createPlot(projectId: string, data: any) {
  const response = await fetch(`${API_URL}/projects/${projectId}/plots`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed create plot");
  return response.json();
}

export async function syncProjectGee(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/gee/sync`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed GEE sync");
  return response.json();
}

export async function getEvidenceTimeline(
  projectId: string,
  opts?: { page?: number; limit?: number; source_type?: string },
) {
  const params = new URLSearchParams();
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.source_type) params.set("source_type", opts.source_type);
  const qs = params.toString();
  const response = await fetch(
    `${API_URL}/projects/${projectId}/evidence/timeline${qs ? `?${qs}` : ""}`,
    { headers: authHeaders() },
  );
  if (!response.ok) throw new Error("Failed fetch evidence");
  return response.json();
}

export async function compareProjects(projectIds: Array<string | number>) {
  const response = await fetch(
    `${API_URL}/projects/compare?project_ids=${projectIds.join(",")}`,
    { headers: authHeaders() },
  );
  if (!response.ok) throw new Error("Failed compare projects");
  return response.json();
}

export async function updateProject(projectId: string | number, data: any) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed update project");
  return response.json();
}

export async function deleteProject(projectId: string | number) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed delete project");
  return response.json().catch(() => ({ ok: true }));
}

export async function getFieldReports(projectId: string) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/field-reports`,
    { headers: authHeaders() },
  );
  if (!response.ok) throw new Error("Failed fetch field reports");
  return response.json();
}

export async function createFieldReport(projectId: string, data: any) {
  const payload = {
    officer_name: data.officer_name,
    plot_id: data.plot_id || null,
    location_geojson: data.location_geojson ?? null,
    report_date: data.report_date,
    report_type: data.report_type,
    activity_description: data.activity_description || null,
    result_description: data.result_description || null,
    photo_urls: data.photo_urls || null,
    video_urls: data.video_urls || null,
    tree_record_id: data.tree_record_id || null,
    biodiversity_id: data.biodiversity_id || null,
  };
  const response = await fetch(
    `${API_URL}/projects/${projectId}/field-reports`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) throw new Error("Failed create field report");
  return response.json();
}

export { API_URL };
