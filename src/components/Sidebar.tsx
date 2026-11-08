import { useState } from 'react';
import {
  LayoutDashboard,
  Server,
  Cpu,
  BarChart3,
  FileText,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wifi,
  WifiOff,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageId = 'overview' | 'servers' | 'optimization' | 'results' | 'reports';

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview',     label: 'Overview',              icon: LayoutDashboard },
  { id: 'servers',      label: 'Server Input',          icon: Server          },
  { id: 'optimization', label: 'Workload Optimization',  icon: Cpu             },
  { id: 'results',      label: 'Results & Analytics',    icon: BarChart3       },
  { id: 'reports',      label: 'Reports',                icon: FileText        },
];

// ---------------------------------------------------------------------------
// Backend status display config
// ---------------------------------------------------------------------------

type BackendStatusDisplay = {
  label: string;
  Icon: typeof Wifi;
  textColor: string;
  dotClass: string;
};

const BACKEND_STATUS_MAP: Record<string, BackendStatusDisplay> = {
  connected:    { label: 'Backend Connected',    Icon: Wifi,     textColor: 'text-emerald-400', dotClass: 'bg-emerald-400' },
  disconnected: { label: 'Backend Disconnected', Icon: WifiOff,  textColor: 'text-red-400',     dotClass: 'bg-red-400'     },
  checking:     { label: 'Checking…',            Icon: Activity, textColor: 'text-slate-400',   dotClass: 'bg-slate-400 animate-pulse' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { backendStatus, checkBackendHealth } = useApp();
  const { session, signOut } = useAuth();

  const statusDisplay = BACKEND_STATUS_MAP[backendStatus] ?? BACKEND_STATUS_MAP.checking;
  const { Icon: StatusIcon } = statusDisplay;

  // Derive a friendly display name from the session email.
  const displayName = session?.email.split('@')[0] ?? 'User';
  const displayEmail = session?.email ?? '';

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-navy-700 bg-navy-900/90 backdrop-blur transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ---- Brand header ---- */}
      <div className="flex items-center gap-3 border-b border-navy-700 px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <Leaf size={22} className="text-emerald-400" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-white">GreenShift</h1>
            <p className="truncate text-xs text-slate-400">Workload Management</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-navy-800 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ---- Navigation ---- */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = current === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:bg-navy-800/80 hover:text-white'
              }`}
            >
              <Icon size={19} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ---- Footer ---- */}
      <div className="space-y-3 border-t border-navy-700 p-3">
        {/* Backend connection status */}
        <button
          onClick={() => checkBackendHealth()}
          title="Click to recheck backend connection"
          className={`flex w-full items-center gap-2.5 rounded-xl border border-navy-800 bg-navy-950/60 p-2.5 text-xs transition hover:bg-navy-800/60 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDisplay.dotClass}`} />
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between">
              <span className={`font-medium ${statusDisplay.textColor}`}>
                {statusDisplay.label}
              </span>
              <StatusIcon size={13} className="text-slate-500" />
            </div>
          )}
        </button>

        {/* User profile */}
        <div
          className={`flex items-center gap-2.5 rounded-xl bg-navy-800/40 p-2 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
            <UserIcon size={15} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              {displayEmail && (
                <p className="truncate text-[11px] text-slate-400">{displayEmail}</p>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
