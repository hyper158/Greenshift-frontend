import { Server, Cloud, AlertTriangle, Gauge, ArrowRight, Leaf } from 'lucide-react';
import Header from '@/components/Header';
import SummaryCard from '@/components/SummaryCard';
import ServerTable from '@/components/ServerTable';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/utils/calculations';
import { PageId } from '@/components/Sidebar';

interface OverviewProps {
  onNavigate: (page: PageId) => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const { optimizationResult } = useApp();

  const hasData = Boolean(optimizationResult && optimizationResult.server_results.length > 0);

  // Derive metrics strictly from backend results if available
  const totalServers = hasData ? optimizationResult!.total_servers : '--';
  const totalCo2 = hasData ? formatNumber(optimizationResult!.total_co2_after, 1) : '--';
  const overloadedCount = hasData
    ? optimizationResult!.server_results.filter((s) => s.status_after === 'overloaded').length
    : '--';

  // Workload utilization strictly from backend data if available
  const workloadUtilization = hasData
    ? `${formatNumber(
        (optimizationResult!.server_results.reduce((sum, s) => sum + s.workload_after, 0) /
          Math.max(1, optimizationResult!.server_results.length * 100)) *
          100,
        1
      )}%`
    : '--';

  return (
    <div>
      <Header
        title="Welcome to GreenShift"
        subtitle="Intelligent Server Workload Management"
        actions={
          <button
            onClick={() => onNavigate('servers')}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-emerald-400 shadow-glow"
          >
            <Server size={16} />
            Server Input
          </button>
        }
      />

      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Purpose Explanation Banner */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">About GreenShift</h3>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                GreenShift provides carbon-intelligent server workload optimization for cloud and
                data center infrastructures. By assessing server operational carbon emissions and
                capacity boundaries, GreenShift shifts compute jobs toward lower-emission servers,
                enforcing environmental thresholds while maintaining system stability and performance.
              </p>
            </div>
          </div>
        </div>

        {/* Four Summary Cards — Initial empty state: '--' */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Fleet Metrics
            </h3>
            {!hasData && (
              <span className="text-xs text-slate-500">No active data — configure servers to populate</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Servers"
              value={totalServers}
              icon={Server}
              tone="blue"
              hint={hasData ? 'Active server count' : 'Awaiting server input'}
            />
            <SummaryCard
              label="Total CO₂ Emissions"
              value={totalCo2}
              unit={hasData ? 'kg CO₂' : undefined}
              icon={Cloud}
              tone="neutral"
              hint={hasData ? 'Optimized total emissions' : 'Awaiting backend results'}
            />
            <SummaryCard
              label="Overloaded Servers"
              value={overloadedCount}
              icon={AlertTriangle}
              tone={hasData && typeof overloadedCount === 'number' && overloadedCount > 0 ? 'red' : 'emerald'}
              hint={hasData ? 'Exceeding carbon threshold' : 'Awaiting backend results'}
            />
            <SummaryCard
              label="Workload Utilization"
              value={workloadUtilization}
              icon={Gauge}
              tone="emerald"
              hint={hasData ? 'Fleet workload distribution' : 'Awaiting backend results'}
            />
          </div>
        </div>

        {/* Server Fleet Overview */}
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Server Fleet Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current server status and carbon threshold compliance
              </p>
            </div>
            {hasData && (
              <button
                onClick={() => onNavigate('results')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                View Analytics <ArrowRight size={14} />
              </button>
            )}
          </div>

          {hasData ? (
            <ServerTable servers={optimizationResult!.server_results} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-700 bg-navy-950/40 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800 text-slate-400">
                <Server size={28} />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-white">No server data available</h4>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Configure your server fleet and emission values to get started. GreenShift will validate your inputs and prepare them for optimization.
              </p>
              <button
                onClick={() => onNavigate('servers')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-emerald-400"
              >
                <Server size={14} />
                Configure Server Fleet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
