import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Wallet, Users, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { formatNGN } from "@/lib/plans";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Investment = Database["public"]["Tables"]["investments"]["Row"];

export default function DashboardHome() {
  const { profile, loading: authLoading } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until auth has resolved before deciding what to do
    if (authLoading) return;
    // Auth resolved but no profile row yet — stop the spinner
    if (!profile) {
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("investments").select("*").eq("user_id", profile.id).eq("status", "active"),
      supabase.from("transactions").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(5),
    ]).then(([invRes, txRes]) => {
      if (invRes.data) setInvestments(invRes.data);
      if (txRes.data) setTransactions(txRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profile, authLoading]);

  const txTypeColors: Record<string, string> = {
    deposit: "text-lime-400",
    withdrawal: "text-red-400",
    roi: "text-blue-400",
    referral_bonus: "text-yellow-400",
  };

  const txSign: Record<string, string> = {
    deposit: "+",
    withdrawal: "-",
    roi: "+",
    referral_bonus: "+",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      icon: <Wallet className="w-6 h-6" />,
      label: "Wallet Balance",
      value: formatNGN(profile?.wallet_balance ?? 0),
      color: "text-lime-400",
      bg: "bg-lime-400/10",
      link: "/dashboard/wallet",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Total Invested",
      value: formatNGN(profile?.total_invested ?? 0),
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      link: "/dashboard/invest",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      label: "Total Earned",
      value: formatNGN(profile?.total_earned ?? 0),
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      link: "/dashboard/wallet",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      label: "KYC Status",
      value: profile?.kyc_status?.toUpperCase() ?? "PENDING",
      color:
        profile?.kyc_status === "verified"
          ? "text-lime-400"
          : profile?.kyc_status === "submitted"
          ? "text-yellow-400"
          : "text-gray-400",
      bg: "bg-dark-500/60",
      link: "/dashboard/kyc",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-white">
          Good day, {profile?.full_name?.split(" ")[0] ?? "Investor"} 👋
        </h1>
        <p className="mt-1 text-gray-400">Here's your portfolio overview</p>
      </div>

      {/* KYC Warning */}
      {profile?.kyc_status !== "verified" && (
        <Link to="/dashboard/kyc" className="flex items-center justify-between gap-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 hover:bg-yellow-400/10 transition-all">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Complete KYC Verification</p>
              <p className="text-xs text-gray-400 mt-0.5">Verify your identity to unlock withdrawals and higher limits</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.link} className="bg-dark-600/40 border border-lime-400/5 hover:border-lime-400/20 rounded-2xl p-5 transition-all group">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.bg} ${s.color} mb-3`}>{s.icon}</div>
            <div className={`text-xl font-bold font-serif ${s.color}`}>{s.value}</div>
            <p className="mt-1 text-xs text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Active Investments */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-lime-400" /> Active Investments
          </h2>
          <Link to="/dashboard/invest" className="text-sm text-lime-400 hover:text-lime-300 flex items-center gap-1">
            Invest more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {investments.length === 0 ? (
          <div className="text-center py-10">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No active investments yet</p>
            <Link to="/dashboard/invest" className="mt-4 inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-lime-400/20 transition-all">
              Start Investing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => {
              const dailyEarnings = inv.amount * inv.daily_rate;
              const daysActive = Math.floor((Date.now() - new Date(inv.start_date).getTime()) / 86400000);
              return (
                <div key={inv.id} className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatNGN(inv.amount)} Plan</p>
                    <p className="text-xs text-gray-400 mt-0.5">Day {daysActive} • Active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-lime-400">+{formatNGN(dailyEarnings)}/day</p>
                    <p className="text-xs text-gray-400 mt-0.5">Total: {formatNGN(inv.total_earned)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" /> Recent Transactions
          </h2>
          <Link to="/dashboard/wallet" className="text-sm text-lime-400 hover:text-lime-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-dark-50/10 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white capitalize">{tx.type.replace("_", " ")}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${txTypeColors[tx.type]}`}>
                    {txSign[tx.type]}{formatNGN(tx.amount)}
                  </p>
                  <p className={`text-xs mt-0.5 capitalize ${tx.status === "success" ? "text-lime-400" : tx.status === "pending" ? "text-yellow-400" : "text-red-400"}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
