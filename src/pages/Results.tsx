import { useRef } from 'react';
import {
  Cloud,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  ArrowRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  FileBarChart,
  ArrowUpDown,
} from 'lucide-react';
import Header from '@/components/Header';
import ComparisonCard from '@/components/ComparisonCard';
import EmissionChart from '@/components/EmissionChart';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatPercent } from '@/utils/calculations';
import { PageId } from '@/components/Sidebar';

interface ResultsProps {
  onNavigate: (page: PageId) => void;
}

export default function Results({ onNavigate }: ResultsProps) {
  const { optimizationResult } = useApp();
  const beforeChartRef = useRef<HTMLDivElement>(null);
  const afterChartRef = useRef<HTMLDivElement>(null);

  if (!optimizationResult) {
    return (
      <div>
        <Header title="Results & Analytics" subtitle="Before vs after optimization comparison" />
        <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 text-slate-500 ring-1 ring-navy-700">
            <Info size={32} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">
            Optimization results will appear here once the Python backend is connected.
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Configure your server emission inputs on the Server Input page. Once the Python ML service is connected, genuine optimization results will be displayed here.
          </p>
          <button
            onClick={() => onNavigate('servers')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-emerald-400 shadow-glow"
          >
            Go to Server Input
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const {
    server_results,
    total_co2_before,
    total_co2_after,
    emission_difference_percentage,
    worst_ratio_before,
    worst_ratio_after,
    workload_moved_percentage,
    all_servers_within_threshold,
    result_id,
  } = optimizationResult;

  // Compute consistent Y-axis maximum across both before and after graphs
  const allEmissionsAndThresholds = server_results.flatMap((s) => [
    s.co2_before,
    s.co2_after,
    s.threshold,
  ]);
  const yMax = Math.ceil(Math.max(...allEmissionsAndThresholds, 10) * 1.15);

  const diffTone =
    emission_difference_percentage < 0
      ? 'emerald'
      : emission_difference_percentage > 0
      ? 'red'
      : 'neutral';
  const DiffIcon =
    emission_difference_percentage < 0
      ? TrendingDown
      : emission_difference_percentage > 0
      ? TrendingUp
      : Minus;

  return (
    <div>
      <Header
        title="Results & Analytics"
        subtitle={`Backend Optimization Result: ${result_id}`}
        actions={
          <button
            onClick={() => onNavigate('reports')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-emerald-400"
          >
            <FileBarChart size={15} />
            View Reports
          </button>
        }
      />

      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Section E: Optimization Explanation based on actual backend results */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-5 shadow-card">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                all_servers_within_threshold
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
              }`}
            >
              {all_servers_within_threshold ? <ShieldCheck size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Optimization Status</h4>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                {all_servers_within_threshold
                  ? 'The fleet had sufficient clean capacity. Workload was redistributed to keep all servers within their carbon thresholds.'
                  : 'The fleet exceeded its available clean capacity. Workload was redistributed to balance the worst-case overload across servers.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section C: Performance Summary Cards */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <ComparisonCard
              label="Total CO₂ Before"
              value={formatNumber(total_co2_before, 2)}
              unit="kg"
              icon={Cloud}
              tone="neutral"
              sublabel="Initial fleet emission"
            />
            <ComparisonCard
              label="Total CO₂ After"
              value={formatNumber(total_co2_after, 2)}
              unit="kg"
              icon={Cloud}
              tone={diffTone}
              sublabel="Optimized fleet emission"
            />
            <ComparisonCard
              label="Emission Difference"
              value={formatPercent(emission_difference_percentage, 2)}
              icon={DiffIcon}
              tone={diffTone}
              sublabel={
                emission_difference_percentage < 0
                  ? 'Net emission reduction'
                  : emission_difference_percentage > 0
                  ? 'Trade-off for overload balance'
                  : 'Emissions unchanged'
              }
            />
            <ComparisonCard
              label="Worst Ratio Before"
              value={formatNumber(worst_ratio_before, 2)}
              icon={AlertTriangle}
              tone={worst_ratio_before > 1 ? 'red' : 'emerald'}
              sublabel="Max (Emission / Threshold)"
            />
            <ComparisonCard
              label="Worst Ratio After"
              value={formatNumber(worst_ratio_after, 2)}
              icon={ShieldCheck}
              tone={worst_ratio_after > 1 ? 'amber' : 'emerald'}
              sublabel="Post-optimization ratio"
            />
            <ComparisonCard
              label="Workload Moved"
              value={`${formatNumber(workload_moved_percentage, 1)}%`}
              icon={ArrowUpDown}
              tone="blue"
              sublabel="Workload shifted across fleet"
            />
          </div>
        </div>

        {/* Sections A & B: Side-by-Side Before vs After Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Section A: Before Optimization */}
          <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">A. Before Optimization</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Initial server emissions and carbon threshold boundaries
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="h-2.5 w-2.5 rounded bg-sky-400" />
                  Within Threshold
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="h-2.5 w-2.5 rounded bg-red-400" />
                  Exceeding Threshold
                </span>
              </div>
            </div>
            <EmissionChart
              ref={beforeChartRef}
              servers={server_results}
              mode="before"
              yMax={yMax}
            />
          </div>

          {/* Section B: After Optimization */}
          <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">B. After Optimization</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Post-optimization emissions with redistributed workloads
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="h-2.5 w-2.5 rounded bg-sky-400" />
                  Within Threshold
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-0.5 w-3 bg-emerald-400" />
                  Threshold Line
                </span>
              </div>
            </div>
            <EmissionChart
              ref={afterChartRef}
              servers={server_results}
              mode="after"
              yMax={yMax}
            />
          </div>
        </div>

        {/* Section D: Workload Redistribution Table */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">D. Workload Redistribution Table</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive before-and-after comparison of workloads and emissions per server
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-navy-700 bg-navy-950/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-700 bg-navy-800/80 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Server</th>
                  <th className="px-4 py-3 text-right font-medium">Workload Before</th>
                  <th className="px-4 py-3 text-right font-medium">Workload After</th>
                  <th className="px-4 py-3 text-right font-medium">Shift</th>
                  <th className="px-4 py-3 text-right font-medium">CO₂ Before</th>
                  <th className="px-4 py-3 text-right font-medium">CO₂ After</th>
                  <th className="px-4 py-3 text-right font-medium">Threshold</th>
                  <th className="px-4 py-3 text-center font-medium">Status After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {server_results.map((s, idx) => {
                  const shift = s.workload_after - s.workload_before;
                  const isSafe = s.status_after === 'safe';
                  return (
                    <tr key={idx} className="transition hover:bg-navy-800/40">
                      <td className="px-4 py-3 font-medium text-white">{s.server_name}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                        {formatNumber(s.workload_before, 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                        {formatNumber(s.workload_after, 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                        <span
                          className={
                            shift > 0.05
                              ? 'text-sky-400'
                              : shift < -0.05
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }
                        >
                          {shift > 0 ? `+${shift.toFixed(2)}` : shift.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                        {formatNumber(s.co2_before, 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-white font-semibold">
                        {formatNumber(s.co2_after, 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-400">
                        {formatNumber(s.threshold, 2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            isSafe
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-300 border-red-500/30'
                          }`}
                        >
                          {isSafe ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {isSafe ? 'Safe' : 'Overloaded'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
