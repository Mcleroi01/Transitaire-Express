import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import TrackingPage from '@/pages/TrackingPage';

function AppRouter() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<'tracking' | 'auth' | 'dashboard'>('tracking');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard' || path.startsWith('/dashboard')) {
      if (user) {
        setRoute('dashboard');
      } else {
        setRoute('auth');
      }
    } else {
      setRoute('tracking');
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      const path = window.location.pathname;
      if (path === '/dashboard' || path.startsWith('/dashboard')) {
        if (user) {
          setRoute('dashboard');
        } else {
          setRoute('auth');
        }
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-300 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (route === 'tracking') {
    return <TrackingPage />;
  }

  if (route === 'auth' || (!user && route === 'dashboard')) {
    return <LoginPage />;
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
