import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingIndicator({
  label = 'Processing…',
  size = 'md',
  className = '',
}: LoadingIndicatorProps) {
  const dim = size === 'sm' ? 16 : size === 'lg' ? 28 : 20;
  return (
    <div className={`flex items-center gap-2 text-slate-300 ${className}`}>
      <Loader2 size={dim} className="animate-spin text-emerald-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
