import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Public pages
import HomePage           from '@/pages/HomePage';
import AllPlansPage       from '@/pages/AllPlansPage';
import LoginPage          from '@/pages/LoginPage';
import RegisterPage       from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage  from '@/pages/ResetPasswordPage';   // ← NEW

// User dashboard
import DashboardLayout   from '@/pages/dashboard/DashboardLayout';
import DashboardHome     from '@/pages/dashboard/DashboardHome';
import KYCPage           from '@/pages/dashboard/KYCPage';
import WalletPage        from '@/pages/dashboard/WalletPage';
import InvestPage        from '@/pages/dashboard/InvestPage';
import ReferralPage      from '@/pages/dashboard/ReferralPage';
import SettingsPage      from '@/pages/dashboard/SettingsPage';

// Admin dashboard
import AdminLayout       from '@/pages/admin/AdminLayout';
import AdminOverview     from '@/pages/admin/AdminOverview';
import AdminUsers        from '@/pages/admin/AdminUsers';
import AdminKYC          from '@/pages/admin/AdminKYC';
import AdminInvestments  from '@/pages/admin/AdminInvestments';
import AdminTransactions from '@/pages/admin/AdminTransactions';

function Spinner() {
  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ───────────────────────────────── */}
      <Route path="/"      element={<HomePage />} />
      <Route path="/plans" element={<AllPlansPage />} />

      {/* ── Auth ─────────────────────────────────── */}
      <Route path="/login"            element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="/register"         element={<RequireGuest><RegisterPage /></RequireGuest>} />
      <Route path="/forgot-password"  element={<RequireGuest><ForgotPasswordPage /></RequireGuest>} />

      {/* Reset password — must be PUBLIC (no RequireGuest) because Supabase
          redirects here with a recovery token before the user is signed in */}
      <Route path="/reset-password"   element={<ResetPasswordPage />} />

      {/* ── User Dashboard ───────────────────────── */}
      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index           element={<DashboardHome />} />
        <Route path="kyc"      element={<KYCPage />} />
        <Route path="wallet"   element={<WalletPage />} />
        <Route path="invest"   element={<InvestPage />} />
        <Route path="referral" element={<ReferralPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ── Admin Dashboard ──────────────────────── */}
      <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index               element={<AdminOverview />}     />
        <Route path="users"        element={<AdminUsers />}        />
        <Route path="kyc"          element={<AdminKYC />}          />
        <Route path="investments"  element={<AdminInvestments />}  />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>

      {/* ── Fallback ─────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
