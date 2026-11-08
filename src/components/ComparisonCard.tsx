import { LucideIcon } from 'lucide-react';

interface ComparisonCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'emerald' | 'red' | 'blue' | 'amber';
  sublabel?: string;
}

const toneMap: Record<NonNullable<ComparisonCardProps['tone']>, string> = {
  neutral: 'text-white',
  emerald: 'text-emerald-400',
  red: 'text-red-400',
  blue: 'text-sky-400',
  amber: 'text-amber-400',
};

export default function ComparisonCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'neutral',
  sublabel,
}: ComparisonCardProps) {
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        <Icon size={14} />
        {label}
      </div>
      <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${toneMap[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
      </p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}
