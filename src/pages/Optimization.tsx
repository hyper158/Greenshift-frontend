import { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Server,
  Activity,
  Wifi,
  WifiOff,
  ArrowRight,
  Database,
  Calculator,
  Brain,
  Wrench,
  FileBarChart,
  RefreshCw,
  Code2,
} from 'lucide-react';
import Header from '@/components/Header';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { PageId } from '@/components/Sidebar';

interface OptimizationProps {
  onNavigate: (page: PageId) => void;
}

const WORKFLOW_STEPS = [
  {
    step: 1,
    label: 'Receive server emission inputs',
    icon: Database,
    description: 'Accepts raw emissions array: {"emissions": [...]} from frontend',
  },
  {
    step: 2,
    label: 'Generate server parameters',
    icon: Calculator,
    description: 'Generates carbon threshold (T), carbon factor (k), and server capacity (cap)',
  },
  {
    step: 3,
    label: 'Convert emissions to workloads',
    icon: Activity,
    description: 'Calculates initial server computing load from carbon factors',
  },
  {
    step: 4,
    label: 'Predict distribution with MLPRegressor',
    icon: Brain,
    description: 'Executes trained multi-layer perceptron neural network',
  },
  {
    step: 5,
    label: 'Apply Workload Repair & Guardrails',
    icon: Wrench,
    description: 'Preserves total compute capacity and enforces operational thresholds',
  },
  {
    step: 6,
    label: 'Calculate metrics & return results',
    icon: FileBarChart,
    description: 'Computes before/after emissions, ratios, and returns structured JSON',
  },
];

export default function Optimization({ onNavigate }: OptimizationProps) {
  const {
    serverCount,
    serverValidation,
    getEmissionsPayload,
    isOptimizing,
    setIsOptimizing,
    setOptimizationResult,
    addResultToHistory,
    backendStatus,
    checkBackendHealth,
    optimizationError,
    setOptimizationError,
  } = useApp();

  const [localError, setLocalError] = useState<string | null>(null);

  const payload = getEmissionsPayload();
  const hasValidInputs = serverValidation.isValid;

  const handleRunOptimization = async () => {
    if (!hasValidInputs) {
      setLocalError('Please complete all server emission inputs before running optimization.');
      return;
    }

    setLocalError(null);
    setOptimizationError(null);

    // If backend is disconnected, do not fake execution; clearly notify user
    if (backendStatus === 'disconnected') {
      setLocalError(
        'Python ML backend is not connected. Optimization cannot be performed on the frontend. Please start the FastAPI service at http://localhost:8000 to enable optimization.'
      );
      return;
    }

    setIsOptimizing(true);

    try {
      // Send the genuine emissions payload to the Python FastAPI backend
      const result = await api.runOptimization(payload);
      setOptimizationResult(result);
      addResultToHistory(result);
      // Navigate to Results & Analytics only after genuine backend processing completes
      onNavigate('results');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An error occurred during backend optimization.';
      setLocalError(message);
      setOptimizationError(message);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div>
      <Header
        title="Workload Optimization"
        subtitle="Execute intelligent workload redistribution via Python ML backend"
      />

      <div className="space-y-8 p-6 max-w-5xl mx-auto">
        {/* Status & Inputs Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Fleet Size */}
          <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              <Server size={15} className="text-emerald-400" />
              Configured Fleet
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-white">
              {serverCount} Servers
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasValidInputs ? 'Ready for ML pipeline' : 'Inputs incomplete'}
            </p>
          </div>

          {/* Validation Status */}
          <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              <CheckCircle2
                size={15}
                className={hasValidInputs ? 'text-emerald-400' : 'text-slate-500'}
              />
              Input Validation
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  hasValidInputs
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {hasValidInputs ? 'All Inputs Valid' : 'Validation Pending'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {hasValidInputs ? 'Range: 0–100 CO₂' : 'Check server inputs'}
            </p>
          </div>

          {/* Backend Connection Status */}
          <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              {backendStatus === 'connected' ? (
                <Wifi size={15} className="text-emerald-400" />
              ) : backendStatus === 'disconnected' ? (
                <WifiOff size={15} className="text-red-400" />
              ) : (
                <Activity size={15} className="text-slate-400" />
              )}
              Backend Status
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`font-mono text-xs font-semibold uppercase ${
                  backendStatus === 'connected'
                    ? 'text-emerald-400'
                    : backendStatus === 'disconnected'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {backendStatus === 'connected'
                  ? 'Connected'
                  : backendStatus === 'disconnected'
                  ? 'Backend Not Connected'
                  : 'Checking…'}
              </span>
              <button
                onClick={() => checkBackendHealth()}
                className="rounded p-1 text-slate-400 hover:text-white"
                title="Check connection"
              >
                <RefreshCw size={13} />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Python FastAPI ML Service</p>
          </div>

          {/* Integration Status */}
          <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              <Code2 size={15} className="text-sky-400" />
              ML Execution
            </div>
            <p className="mt-2 font-mono text-sm font-semibold text-sky-300">
              Backend-Exclusive
            </p>
            <p className="mt-1 text-xs text-slate-500">No frontend simulation</p>
          </div>
        </div>

        {/* Backend Not Connected Notice Banner */}
        {backendStatus === 'disconnected' && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-card">
            <div className="flex items-start gap-3.5">
              <AlertCircle size={20} className="shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs text-amber-200">
                <h4 className="font-semibold text-amber-300 text-sm">
                  Python Backend Not Connected
                </h4>
                <p className="mt-1 text-amber-200/90 leading-relaxed">
                  The frontend is ready and configured to communicate with your Python FastAPI ML backend at{' '}
                  <code className="rounded bg-navy-950/80 px-1.5 py-0.5 font-mono text-amber-300">
                    http://localhost:8000
                  </code>.
                  Actual workload optimization, threshold calculations, and MLPRegressor predictions are performed exclusively on the backend.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning if inputs not valid */}
        {!hasValidInputs && (
          <div className="rounded-2xl border border-navy-700 bg-navy-900/50 p-6 text-center">
            <AlertCircle size={24} className="mx-auto text-amber-400" />
            <h4 className="mt-2 text-sm font-semibold text-white">Incomplete Server Inputs</h4>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Please enter valid emission values (0–100) for all servers before proceeding to optimization.
            </p>
            <button
              onClick={() => onNavigate('servers')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-emerald-400"
            >
              Go to Server Input
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {(localError || optimizationError) && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 shadow-card">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-red-300">Optimization Notice</h4>
                <p className="text-xs text-red-200/90 leading-relaxed font-mono">
                  {localError || optimizationError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entered Payload Preview */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Backend Request Payload</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target JSON contract sent to Python endpoint <code className="text-emerald-400">POST /api/optimization/run</code>
              </p>
            </div>
            <button
              onClick={() => onNavigate('servers')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              Edit Inputs <ArrowRight size={12} />
            </button>
          </div>

          <div className="rounded-xl border border-navy-800 bg-navy-950/80 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <span className="text-slate-500">// Collected fleet emissions:</span>
            <pre className="text-emerald-400 mt-1">{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </div>

        {/* Backend Pipeline Sequence */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Python Backend ML Pipeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculations executed exclusively by the Python ML service upon request
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="flex flex-col justify-between rounded-xl border border-navy-800 bg-navy-950/60 p-4 transition hover:border-navy-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-emerald-400 ring-1 ring-navy-700">
                      <Icon size={18} />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Step 0{step.step}
                      </span>
                      <h4 className="text-xs font-semibold text-white mt-0.5">{step.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button & Processing State */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-navy-700 bg-navy-900/60 p-8 text-center shadow-card">
          {isOptimizing ? (
            <div className="space-y-3 py-4">
              <LoadingIndicator size="lg" label="Running Python ML Workload Optimization..." />
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Waiting for genuine response from Python FastAPI backend...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold text-white">Run Workload Optimization</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                  {backendStatus === 'connected'
                    ? 'Transmits collected emissions array to the Python FastAPI backend for neural prediction and constraint enforcement.'
                    : 'The Python ML backend is currently not connected. The button is disabled until FastAPI is reachable.'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunOptimization}
                  disabled={!hasValidInputs || isOptimizing || backendStatus === 'disconnected'}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-7 py-3 text-sm font-bold text-navy-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={18} fill="currentColor" />
                  {backendStatus === 'connected' ? 'Run Optimization' : 'Backend Not Connected'}
                </button>

                {backendStatus === 'disconnected' && (
                  <p className="text-xs text-amber-400/90">
                    Integration Pending: Start your Python backend to run optimization.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
