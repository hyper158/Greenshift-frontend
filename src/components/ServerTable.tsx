import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatNumber } from '@/utils/calculations';
import { ServerOptimizationResult } from '@/types';

interface ServerTableProps {
  servers?: ServerOptimizationResult[];
  emptyMessage?: string;
}

export default function ServerTable({ servers = [], emptyMessage }: ServerTableProps) {
  if (servers.length === 0) {
    return (
      <div className="rounded-xl border border-navy-700 bg-navy-800/40 p-8 text-center text-sm text-slate-400">
        {emptyMessage || 'No server data available. Configure your server fleet to get started.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-navy-700 bg-navy-800/50">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-navy-700 bg-navy-800/80 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Server</th>
            <th className="px-4 py-3 text-right font-medium">CO₂ Emission</th>
            <th className="px-4 py-3 text-right font-medium">Threshold</th>
            <th className="px-4 py-3 text-right font-medium">Workload</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700/60">
          {servers.map((s, idx) => {
            const isOverloaded = s.status_after === 'overloaded';
            return (
              <tr key={idx} className="transition hover:bg-navy-700/30">
                <td className="px-4 py-3 font-medium text-white">{s.server_name}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-white">
                  {formatNumber(s.co2_after)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                  {formatNumber(s.threshold)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                  {formatNumber(s.workload_after)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isOverloaded
                        ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isOverloaded ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
                    {isOverloaded ? 'Overloaded' : 'Safe'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
