import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'emerald' | 'red' | 'blue';
  hint?: string;
  loading?: boolean;
}

const toneStyles: Record<NonNullable<SummaryCardProps['tone']>, { ring: string; icon: string; text: string }> = {
  neutral: { ring: 'ring-navy-600/40', icon: 'text-slate-300 bg-navy-700/60', text: 'text-white' },
  emerald: { ring: 'ring-emerald-500/30', icon: 'text-emerald-400 bg-emerald-500/10', text: 'text-white' },
  red: { ring: 'ring-red-500/30', icon: 'text-red-400 bg-red-500/10', text: 'text-white' },
  blue: { ring: 'ring-sky-500/30', icon: 'text-sky-400 bg-sky-500/10', text: 'text-white' },
};

export default function SummaryCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'neutral',
  hint,
  loading = false,
}: SummaryCardProps) {
  const t = toneStyles[tone];
  return (
    <div
      className={`rounded-2xl bg-navy-800/70 ring-1 ${t.ring} p-5 shadow-card transition hover:bg-navy-800/90 hover:shadow-glow`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className={`mt-2 font-mono text-2xl font-semibold ${t.text} tabular-nums`}>
            {loading ? <span className="animate-pulse-glow text-slate-500">—</span> : value}
            {unit && !loading && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
