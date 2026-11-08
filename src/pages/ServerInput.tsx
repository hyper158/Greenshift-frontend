import { useState } from 'react';
import {
  Server,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { PageId } from '@/components/Sidebar';
import { MIN_SERVERS, MAX_SERVERS } from '@/utils/validation';

interface ServerInputProps {
  onNavigate: (page: PageId) => void;
}

export default function ServerInput({ onNavigate }: ServerInputProps) {
  const {
    serverCount,
    setServerCount,
    serverInputs,
    updateServerEmission,
    setServerInputs,
    resetServerInputs,
    serverValidation,
  } = useApp();

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Quick fill sample data for fast testing without simulation logic
  const handleQuickFill = () => {
    const samples = [75, 45, 85, 60, 30, 90, 50, 70, 40, 65];
    const updated = serverInputs.map((s, idx) => ({
      ...s,
      emission: samples[idx % samples.length],
    }));
    setServerInputs(updated);
  };

  const handleContinue = () => {
    setHasAttemptedSubmit(true);
    if (serverValidation.isValid) {
      onNavigate('optimization');
    }
  };

  return (
    <div>
      <Header
        title="Server Input"
        subtitle="Configure fleet size and individual server CO₂ emission metrics"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickFill}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-700 bg-navy-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-navy-700 hover:text-white"
              title="Populate fields with sample emission values"
            >
              <Sparkles size={14} className="text-amber-400" />
              Quick Fill Sample
            </button>
            <button
              onClick={resetServerInputs}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-700 bg-navy-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-navy-700 hover:text-white"
              title="Reset all emission inputs"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        }
      />

      <div className="space-y-8 p-6 max-w-5xl mx-auto">
        {/* Architecture Notice */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-5 shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
              <Info size={20} />
            </div>
            <div className="text-sm">
              <h3 className="font-semibold text-white">Manual Fleet Configuration</h3>
              <p className="mt-1 text-slate-300 leading-relaxed">
                Define between <strong>2 and 10 servers</strong> and provide their current CO₂ emission levels (0–100).
                The Python ML backend will automatically generate carbon thresholds (T), carbon factors (k), and server capacities (cap) during optimization.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Number of Servers Dynamic Selector */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sliders size={15} className="text-emerald-400" />
                Step 1: Select Fleet Size
              </div>
              <h3 className="text-base font-semibold text-white mt-1">
                Number of Servers ({MIN_SERVERS}–{MAX_SERVERS})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecting a number dynamically updates the server input cards below.
              </p>
            </div>

            {/* Quick Pills Selector */}
            <div className="flex flex-wrap items-center gap-1.5 bg-navy-950/80 p-1.5 rounded-xl border border-navy-800">
              {Array.from({ length: MAX_SERVERS - MIN_SERVERS + 1 }, (_, i) => i + MIN_SERVERS).map(
                (num) => {
                  const isSelected = serverCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setServerCount(num)}
                      className={`h-8 w-8 rounded-lg text-xs font-mono font-semibold transition ${
                        isSelected
                          ? 'bg-emerald-500 text-navy-950 shadow-glow'
                          : 'text-slate-400 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* 2. Dynamic Server Input Fields */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Server size={15} className="text-emerald-400" />
                Step 2: Enter Server Emissions
              </div>
              <h3 className="text-base font-semibold text-white mt-1">
                Individual CO₂ Emission Values
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify baseline CO₂ emission values between 0 and 100 for each server.
              </p>
            </div>
            <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-mono text-emerald-400 border border-navy-700">
              {serverInputs.length} Servers Active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serverInputs.map((server) => {
              const error = serverValidation.errors[server.id];
              const showError = hasAttemptedSubmit && Boolean(error);
              const hasValidValue = server.emission !== '' && !error;

              return (
                <div
                  key={server.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 transition ${
                    showError
                      ? 'border-red-500/50 bg-red-500/5'
                      : hasValidValue
                      ? 'border-emerald-500/30 bg-navy-950/70'
                      : 'border-navy-700 bg-navy-950/40 hover:border-navy-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-800 text-emerald-400 ring-1 ring-navy-700">
                        <Server size={14} />
                      </div>
                      <span className="text-sm font-semibold text-white">{server.name}</span>
                    </div>

                    {hasValidValue && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 size={13} />
                        Valid
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`emission-${server.id}`}
                      className="block text-xs font-medium text-slate-400 mb-1"
                    >
                      CO₂ Emission (0–100)
                    </label>
                    <div className="relative">
                      <input
                        id={`emission-${server.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="e.g. 75"
                        value={server.emission}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          updateServerEmission(server.id, val);
                        }}
                        className={`w-full rounded-xl border bg-navy-900 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 outline-none transition ${
                          showError
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-navy-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">
                        CO₂
                      </span>
                    </div>
                  </div>

                  {showError && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle size={12} className="shrink-0" />
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Review Entered Values Table */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Step 3: Review Entered Fleet Metrics
              </div>
              <h3 className="text-base font-semibold text-white mt-1">
                Fleet Review Summary
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your emissions before proceeding. Values can be modified anytime.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-navy-700 bg-navy-950/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-700 bg-navy-800/80 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Server Name</th>
                  <th className="px-4 py-3 text-right font-medium">Entered CO₂ Emission</th>
                  <th className="px-4 py-3 text-center font-medium">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {serverInputs.map((server, idx) => {
                  const error = serverValidation.errors[server.id];
                  const isFilled = server.emission !== '';
                  const isValid = isFilled && !error;

                  return (
                    <tr key={server.id} className="transition hover:bg-navy-800/40">
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-white">{server.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                        {isFilled ? (
                          <span className={isValid ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {server.emission}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Not entered</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                            <CheckCircle2 size={12} />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                            <AlertCircle size={12} />
                            {error || 'Pending input'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Continue Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-navy-800">
            <div className="text-xs text-slate-400">
              Payload Format for Python Backend:{' '}
              <code className="text-emerald-400 font-mono bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                {JSON.stringify({
                  emissions: serverInputs.map((s) => (s.emission === '' ? 0 : Number(s.emission))),
                })}
              </code>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-emerald-400 shadow-glow"
            >
              Continue to Optimization
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
