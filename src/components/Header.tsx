import { RefreshCw, Wifi, WifiOff, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { backendStatus, checkBackendHealth } = useApp();

  const statusMap = {
    connected: { label: 'Backend Connected', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
    disconnected: { label: 'Backend Disconnected', icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
    checking: { label: 'Checking Backend…', icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30' },
  } as const;

  const si = statusMap[backendStatus];
  const StatusIcon = si.icon;

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-navy-700 bg-navy-950/80 px-6 py-4 backdrop-blur">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${si.bg} ${si.color} ${si.border}`}
        >
          <StatusIcon size={14} className={backendStatus === 'checking' ? 'animate-pulse' : ''} />
          {si.label}
        </span>
        <button
          onClick={() => checkBackendHealth()}
          className="rounded-lg border border-navy-700 p-2 text-slate-400 transition hover:bg-navy-800 hover:text-white"
          title="Refresh backend status"
          aria-label="Refresh backend status"
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  );
}
