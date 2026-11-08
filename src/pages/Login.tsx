import { useState } from 'react';
import { Leaf, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Development sign-in page.
 *
 * This is a temporary frontend-only gate. The user enters any email address
 * and clicks "Continue" to access the dashboard. No credentials are verified.
 * Replace this with a real authentication flow before going to production.
 */
export default function Login() {
  const { signIn, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signIn(email);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="h-[400px] w-[400px] rounded-full bg-navy-700/30 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30 shadow-glow">
            <Leaf size={32} className="text-emerald-400" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">GreenShift</h1>
          <p className="mt-1 text-sm text-slate-400">Intelligent Server Workload Management</p>
        </div>

        {/* Sign-in card */}
        <div className="mt-8 rounded-3xl border border-navy-700 bg-navy-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-white">Sign in to continue</h2>
            <p className="mt-1 text-xs text-slate-400">
              Enter your email address to access the dashboard
            </p>
          </div>

          {/* Error banner */}
          {authError && (
            <div className="mb-5 flex items-start justify-between gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-xs leading-relaxed text-red-200">{authError}</p>
              </div>
              <button
                onClick={clearAuthError}
                className="shrink-0 text-xs text-red-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (authError) clearAuthError();
                }}
                className="w-full rounded-xl border border-navy-600 bg-navy-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-navy-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Development notice — honest about what this is */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Development access only — no credentials are verified.
          </p>
        </div>

        {/* App description */}
        <p className="mt-8 text-center text-xs text-slate-500">
          GreenShift optimises multi-server workload distributions to reduce total CO₂ emissions
          while maintaining computing thresholds and quality of service.
        </p>
      </div>
    </div>
  );
}
