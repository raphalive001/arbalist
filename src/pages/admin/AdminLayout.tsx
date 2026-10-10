import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, TrendingUp,
  ArrowLeftRight, LogOut, Menu, X, Bell, ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { BrandLogo } from '@/components/BrandLogo';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',              icon: LayoutDashboard,  label: 'Overview',     end: true  },
  { to: '/admin/users',        icon: Users,            label: 'Users'                    },
  { to: '/admin/kyc',         icon: ShieldCheck,      label: 'KYC Review'               },
  { to: '/admin/investments',  icon: TrendingUp,       label: 'Investments'              },
  { to: '/admin/transactions', icon: ArrowLeftRight,   label: 'Transactions'             },
];

function Spinner() {
  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
    </div>
  );
}

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 text-sm mb-6">
          You do not have administrator privileges. Contact the platform owner to request access.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold px-6 py-3 rounded-xl hover:bg-lime-400/20 transition-all text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin, checking }      = useAdmin();
  const navigate                   = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || checking) return <Spinner />;
  if (!isAdmin)          return <AccessDenied />;

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  }

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-dark-600/70 backdrop-blur-xl border-r border-lime-400/10 w-64">
      {/* Logo */}
      <div className="flex items-center px-6 h-18 py-5 border-b border-lime-400/10">
        <BrandLogo size="sm" />
        <span className="ml-2 text-xs bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-2 py-0.5 rounded-full">
          ADMIN
        </span>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 border-b border-lime-400/10">
        <div className="bg-dark-700/60 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="text-sm font-semibold text-white truncate mt-0.5">{profile?.full_name ?? 'Admin'}</p>
          <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-500/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-lime-400' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-lime-400/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* View user dashboard */}
      <div className="px-3 py-2 border-t border-lime-400/10">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-lime-400 hover:bg-lime-400/5 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          User Dashboard
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full mt-1"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-dark-800 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 lg:w-64">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <SidebarContent />
          </div>
          <button
            className="absolute top-4 right-4 z-50 text-white bg-dark-600 rounded-xl p-2"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-dark-800/90 backdrop-blur-xl border-b border-lime-400/10 h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-sm font-semibold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500">Arbalist Capital</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-400 hidden sm:block">Admin Mode</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 font-bold text-sm">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
