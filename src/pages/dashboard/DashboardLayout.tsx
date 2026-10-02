import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wallet, TrendingUp, Users, Settings,
  ShieldCheck, LogOut, Menu, X, Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { BrandLogo } from "@/components/BrandLogo";

const NAV = [
  { to: "/dashboard",          icon: LayoutDashboard, label: "Overview",   end: true },
  { to: "/dashboard/wallet",   icon: Wallet,          label: "Wallet"            },
  { to: "/dashboard/invest",   icon: TrendingUp,       label: "Invest"            },
  { to: "/dashboard/kyc",      icon: ShieldCheck,      label: "KYC Verification" },
  { to: "/dashboard/referral", icon: Users,            label: "Referral"          },
  { to: "/dashboard/settings", icon: Settings,         label: "Settings"          },
];

export default function DashboardLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  }

  const kycBadge = () => {
    if (!profile) return null;
    const colors: Record<string, string> = {
      pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      submitted: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
      verified: "bg-lime-400/10 text-lime-400 border-lime-400/20",
      rejected: "bg-red-400/10 text-red-400 border-red-400/20",
    };
    return (
      <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full capitalize ${colors[profile.kyc_status]}`}>
        {profile.kyc_status}
      </span>
    );
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-dark-600/60 backdrop-blur-xl border-r border-lime-400/10 w-64">
      <div className="flex items-center px-6 h-20 border-b border-lime-400/10">
        <BrandLogo size="sm" />
      </div>

      <div className="px-4 py-4 border-b border-lime-400/10">
        <div className="bg-dark-700/60 rounded-xl p-4">
          <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? "Loading…"}</p>
          <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          <div className="mt-2">{kycBadge()}</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                  : "text-gray-400 hover:text-white hover:bg-dark-500/40"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-lime-400/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-dark-800 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 lg:w-64">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-dark-800/90 backdrop-blur-xl border-b border-lime-400/10 h-16 flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 font-bold text-sm">
              {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile close */}
      {sidebarOpen && (
        <button className="fixed top-4 right-4 z-50 lg:hidden text-white bg-dark-600 rounded-xl p-2" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
