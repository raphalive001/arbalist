import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import KYCPage from './pages/KYCPage';
import Dashboard from './pages/Dashboard';

// Import the original landing page components
import LandingPage from './LandingPage';

type AppView = 'landing' | 'auth' | 'kyc' | 'dashboard';

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const [view, setView] = useState<AppView>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [prefillReferral, setPrefillReferral] = useState('');

  // Handle URL referral code on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setPrefillReferral(ref.toUpperCase());
      setAuthMode('register');
      setView('auth');
    }
  }, []);

  // Route authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      setView('dashboard');
    }
  }, [isAuthenticated]);

  const handleGoToDashboard = () => {
    if (!user?.kyc) {
      setView('kyc');
    } else {
      setView('dashboard');
    }
  };

  if (view === 'auth') {
    return (
      <AuthPage
        onSuccess={handleGoToDashboard}
        onBack={() => setView('landing')}
        initialMode={authMode}
        prefillReferral={prefillReferral}
      />
    );
  }

  if (view === 'kyc' && isAuthenticated) {
    return (
      <KYCPage
        onComplete={() => setView('dashboard')}
      />
    );
  }

  if (view === 'dashboard' && isAuthenticated) {
    return (
      <Dashboard
        onLogout={() => setView('landing')}
        onKYC={() => setView('kyc')}
      />
    );
  }

  return (
    <LandingPage
      onLogin={() => { setAuthMode('login'); setView('auth'); }}
      onRegister={() => { setAuthMode('register'); setView('auth'); }}
    />
  );
}
