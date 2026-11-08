// GreenShift Domain and API Types

export type ServerStatus = 'safe' | 'overloaded';

/** Manual server input record for dynamic form */
export interface ServerInput {
  id: number;
  name: string;
  emission: number | '';
}

/** Payload sent to future Python FastAPI backend */
export interface OptimizationRequest {
  emissions: number[];
}

/** Individual server result returned by Python backend */
export interface ServerOptimizationResult {
  server_name: string;
  workload_before: number;
  workload_after: number;
  co2_before: number;
  co2_after: number;
  threshold: number;
  status_after: ServerStatus | string;
}

/** Complete optimization response schema returned by Python backend */
export interface OptimizationResponse {
  result_id: string;
  total_servers: number;
  server_results: ServerOptimizationResult[];
  total_co2_before: number;
  total_co2_after: number;
  emission_difference_percentage: number;
  worst_ratio_before: number;
  worst_ratio_after: number;
  workload_moved_percentage: number;
  all_servers_within_threshold: boolean;
  optimization_status: string;
  created_at?: string;
}

// Type alias for application consistency
export type OptimizationResult = OptimizationResponse;

export type BackendStatus = 'connected' | 'disconnected' | 'checking';

export interface HealthResponse {
  status: 'ok' | 'error' | string;
  version?: string;
}
