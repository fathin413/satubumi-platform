/** Types copied from BE handoff: API_HANDOFF_MONITOR.md */

export interface GeoJSONGeometry {
  type: "Point" | "Polygon" | "MultiPolygon" | "LineString";
  coordinates: any;
}

export interface GeoJSONFeature<T = Record<string, any>> {
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: T;
}

export interface GeoJSONFeatureCollection<T = Record<string, any>> {
  type: "FeatureCollection";
  total_features: number;
  features: GeoJSONFeature<T>[];
}

export interface ProjectMapLayersResponse {
  project_id: number;
  project_name: string;
  boundary: GeoJSONFeature | null;
  plots: GeoJSONFeatureCollection;
  activities: GeoJSONFeatureCollection;
  tree_locations: GeoJSONFeatureCollection;
  alerts: GeoJSONFeatureCollection;
  field_reports: GeoJSONFeatureCollection;
  biodiversity: GeoJSONFeatureCollection;
  summary: {
    has_boundary: boolean;
    total_plots: number;
    total_activities: number;
    total_tree_batches: number;
    total_alerts: number;
    total_field_reports: number;
    total_biodiversity: number;
    center_coordinates: [number, number] | null;
  };
}

export interface TreeGrowthResponse {
  tree_id?: number;
  tree_record_id?: number;
  species: string;
  initial_planting_date?: string | null;
  planting_date?: string | null;
  initial_height_cm: number | null;
  initial_dbh_cm: number | null;
  current_height_cm: number | null;
  current_dbh_cm: number | null;
  height_growth_delta_cm?: number | null;
  height_growth_cm?: number | null;
  dbh_growth_delta_cm?: number | null;
  dbh_growth_cm?: number | null;
  current_condition?: string;
  is_alive?: boolean;
  total_measurements: number;
  timeline: Array<{
    date: string;
    height_cm: number | null;
    dbh_cm: number | null;
    condition: string;
    is_alive: boolean;
    measured_by?: string;
  }>;
}
