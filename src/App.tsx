import { useState } from 'react';
import Sidebar, { PageId } from '@/components/Sidebar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import Login from '@/pages/Login';
import Overview from '@/pages/Overview';
import ServerInput from '@/pages/ServerInput';
import Optimization from '@/pages/Optimization';
import Results from '@/pages/Results';
import Reports from '@/pages/Reports';
import LoadingIndicator from '@/components/LoadingIndicator';

// ---------------------------------------------------------------------------
// Inner shell — rendered once the user is signed in.
// ---------------------------------------------------------------------------

function AppShell() {
  const { session, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('overview');

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy-950">
        <LoadingIndicator size="lg" label="Loading GreenShift…" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950 text-slate-200">
      <Sidebar current={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 overflow-y-auto">
        {currentPage === 'overview'     && <Overview     onNavigate={setCurrentPage} />}
        {currentPage === 'servers'      && <ServerInput  onNavigate={setCurrentPage} />}
        {currentPage === 'optimization' && <Optimization onNavigate={setCurrentPage} />}
        {currentPage === 'results'      && <Results      onNavigate={setCurrentPage} />}
        {currentPage === 'reports'      && <Reports />}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root — wraps everything in context providers.
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  );
}
