// Context files intentionally export both a Provider component and a hook.
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  OptimizationResult,
  OptimizationRequest,
  BackendStatus,
  ServerInput,
} from '@/types';
import { api } from '@/services/api';
import { validateServerInputs, ServerValidationResult } from '@/utils/validation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createInitialServers(count: number): ServerInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Server ${i + 1}`,
    emission: '',
  }));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppContextValue {
  /** Configured number of servers (2 to 10) */
  serverCount: number;
  setServerCount: (count: number) => void;

  /** Dynamic list of server input records */
  serverInputs: ServerInput[];
  updateServerEmission: (id: number, value: number | '') => void;
  setServerInputs: (inputs: ServerInput[]) => void;
  resetServerInputs: () => void;

  /** Validation state of the entered server values */
  serverValidation: ServerValidationResult;

  /** Formats emissions array: { emissions: [75, 45, ...] } */
  getEmissionsPayload: () => OptimizationRequest;

  /** Most recent optimization result returned by the backend */
  optimizationResult: OptimizationResult | null;
  setOptimizationResult: (result: OptimizationResult | null) => void;

  /** In-flight request status */
  isOptimizing: boolean;
  setIsOptimizing: (val: boolean) => void;

  /** Error message from backend attempt */
  optimizationError: string | null;
  setOptimizationError: (err: string | null) => void;

  /** Backend connectivity status */
  backendStatus: BackendStatus;
  checkBackendHealth: () => Promise<void>;

  /** Session history */
  history: OptimizationResult[];
  addResultToHistory: (result: OptimizationResult) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [serverCount, setServerCountState] = useState<number>(4);
  const [serverInputs, setServerInputsState] = useState<ServerInput[]>(() =>
    createInitialServers(4)
  );

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [history, setHistory] = useState<OptimizationResult[]>([]);

  // Dynamically update server count while preserving existing entered values
  const setServerCount = useCallback((newCount: number) => {
    const clamped = Math.max(2, Math.min(10, Math.round(newCount)));
    setServerCountState(clamped);
    setServerInputsState((prev) => {
      if (prev.length === clamped) return prev;
      if (prev.length < clamped) {
        // Expand
        const added: ServerInput[] = Array.from(
          { length: clamped - prev.length },
          (_, i) => ({
            id: prev.length + i + 1,
            name: `Server ${prev.length + i + 1}`,
            emission: '',
          })
        );
        return [...prev, ...added];
      }
      // Shrink
      return prev.slice(0, clamped);
    });
    setOptimizationError(null);
  }, []);

  const updateServerEmission = useCallback((id: number, value: number | '') => {
    setServerInputsState((prev) =>
      prev.map((s) => (s.id === id ? { ...s, emission: value } : s))
    );
    setOptimizationError(null);
  }, []);

  const setServerInputs = useCallback((inputs: ServerInput[]) => {
    setServerCountState(inputs.length);
    setServerInputsState(inputs);
    setOptimizationError(null);
  }, []);

  const resetServerInputs = useCallback(() => {
    setServerInputsState(createInitialServers(serverCount));
    setOptimizationError(null);
  }, [serverCount]);

  // Real-time validation computation
  const serverValidation = validateServerInputs(serverInputs);

  const getEmissionsPayload = useCallback((): OptimizationRequest => {
    return {
      emissions: serverInputs.map((s) => (s.emission === '' ? 0 : Number(s.emission))),
    };
  }, [serverInputs]);

  // ---- Backend Health Check ----
  const checkBackendHealth = useCallback(async () => {
    setBackendStatus('checking');
    try {
      await api.checkHealth();
      setBackendStatus('connected');
    } catch {
      setBackendStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30_000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // ---- History ----
  const addResultToHistory = useCallback((result: OptimizationResult) => {
    setHistory((prev) => {
      const without = prev.filter((r) => r.result_id !== result.result_id);
      return [result, ...without].slice(0, 50);
    });
  }, []);

  const value: AppContextValue = {
    serverCount,
    setServerCount,
    serverInputs,
    updateServerEmission,
    setServerInputs,
    resetServerInputs,
    serverValidation,
    getEmissionsPayload,
    optimizationResult,
    setOptimizationResult,
    isOptimizing,
    setIsOptimizing,
    optimizationError,
    setOptimizationError,
    backendStatus,
    checkBackendHealth,
    history,
    addResultToHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>.');
  return ctx;
}
