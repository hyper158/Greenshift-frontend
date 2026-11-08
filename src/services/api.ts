import { OptimizationRequest, OptimizationResponse, HealthResponse } from '@/types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:8000';

export { API_BASE_URL as apiBaseUrl };

// ---------------------------------------------------------------------------
// Response Normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises raw JSON returned from Python FastAPI backend into a typed OptimizationResponse.
 * Handles both snake_case and camelCase field variations.
 */
export function parseOptimizationResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): OptimizationResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backend response: expected a JSON object.');
  }

  const rawServers: unknown[] = data.server_results ?? data.servers ?? [];

  const serverResults = rawServers.map((s, idx) => {
    const row = s as Record<string, unknown>;
    const co2After = Number(row.co2_after ?? row.emission_after ?? row.emissionAfter ?? 0);
    const threshold = Number(row.threshold ?? 0);
    const statusAfter =
      (row.status_after as string) ??
      (row.statusAfter as string) ??
      (co2After > threshold ? 'overloaded' : 'safe');

    return {
      server_name: String(row.server_name ?? row.name ?? `Server ${idx + 1}`),
      workload_before: Number(row.workload_before ?? row.workloadBefore ?? 0),
      workload_after: Number(row.workload_after ?? row.workloadAfter ?? 0),
      co2_before: Number(row.co2_before ?? row.emission_before ?? row.emissionBefore ?? 0),
      co2_after: co2After,
      threshold,
      status_after: statusAfter as 'safe' | 'overloaded',
    };
  });

  return {
    result_id: String(data.result_id ?? data.id ?? `GS-${Date.now()}`),
    total_servers: Number(data.total_servers ?? data.server_count ?? serverResults.length),
    server_results: serverResults,
    total_co2_before: Number(data.total_co2_before ?? data.summary?.total_co2_before ?? 0),
    total_co2_after: Number(data.total_co2_after ?? data.summary?.total_co2_after ?? 0),
    emission_difference_percentage: Number(
      data.emission_difference_percentage ?? data.summary?.emission_difference_pct ?? 0
    ),
    worst_ratio_before: Number(data.worst_ratio_before ?? data.summary?.worst_ratio_before ?? 0),
    worst_ratio_after: Number(data.worst_ratio_after ?? data.summary?.worst_ratio_after ?? 0),
    workload_moved_percentage: Number(
      data.workload_moved_percentage ?? data.summary?.workload_moved_pct ?? 0
    ),
    all_servers_within_threshold: Boolean(
      data.all_servers_within_threshold ??
        data.summary?.all_below_threshold ??
        serverResults.every((s) => s.status_after === 'safe')
    ),
    optimization_status: String(
      data.optimization_status ?? data.summary?.summary_text ?? 'Completed'
    ),
    created_at: (data.created_at as string | undefined) ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Python FastAPI Client Layer
// ---------------------------------------------------------------------------

export const api = {
  /**
   * GET /api/health
   * Checks Python backend availability.
   */
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Backend health check failed (HTTP ${res.status}).`);
    }

    const data = await res.json();
    return { status: data.status ?? 'ok', version: data.version };
  },

  /**
   * POST /api/optimization/run
   * Transmits the collected server emissions array in format:
   * { "emissions": [75, 45, 85, 60] }
   */
  async runOptimization(payload: OptimizationRequest): Promise<OptimizationResponse> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/api/optimization/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Network error';
      throw new Error(
        `Python backend is not reachable at ${API_BASE_URL}. Ensure FastAPI server is running. (${detail})`
      );
    }

    if (!res.ok) {
      const errorDetail = await extractErrorDetail(res);
      throw new Error(errorDetail);
    }

    return parseOptimizationResponse(await res.json());
  },

  /**
   * GET /api/optimization/results/{resultId}
   * Retrieves previously calculated optimization results by ID.
   */
  async getResults(resultId: string): Promise<OptimizationResponse> {
    const res = await fetch(
      `${API_BASE_URL}/api/optimization/results/${encodeURIComponent(resultId)}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );

    if (!res.ok) {
      throw new Error(
        `Could not retrieve results for ID "${resultId}" (HTTP ${res.status}).`
      );
    }

    return parseOptimizationResponse(await res.json());
  },
};

// ---------------------------------------------------------------------------
// Error Response Helper
// ---------------------------------------------------------------------------

async function extractErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    if (body.detail) return JSON.stringify(body.detail);
    if (typeof body.message === 'string') return body.message;
  } catch {
    // Return standard HTTP status string if body is unparseable
  }
  return `Backend error (HTTP ${res.status}).`;
}
