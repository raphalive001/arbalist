import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdmin, type AdminInvestment } from '@/hooks/useAdmin';
import { formatNGN, PLANS } from '@/lib/plans';

type InvFilter = 'all' | 'active' | 'completed' | 'cancelled';

const planLabel = (planId: string) =>
  PLANS.find(p => p.id === planId)?.label ?? planId;

const STATUS_CFG = {
  active:    { cls: 'bg-lime-400/10  text-lime-400  border-lime-400/20',  icon: <CheckCircle className="w-3 h-3" />, label: 'Active'    },
  completed: { cls: 'bg-blue-400/10  text-blue-400  border-blue-400/20',  icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' },
  cancelled: { cls: 'bg-red-400/10   text-red-400   border-red-400/20',   icon: <XCircle    className="w-3 h-3" />, label: 'Cancelled' },
} as const;

export default function AdminInvestments() {
  const { fetchInvestments } = useAdmin();
  const [investments, setInvestments] = useState<AdminInvestment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<InvFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchInvestments(filter);
    setInvestments((data as AdminInvestment[]) ?? []);
    setLoading(false);
  }, [filter, fetchInvestments]);

  useEffect(() => { load(); }, [load]);

  const totalActive   = investments.filter(i => i.status === 'active').length;
  const totalLocked   = investments.filter(i => i.status === 'active').reduce((s, i) => s + i.amount, 0);
  const totalPaidOut  = investments.reduce((s, i) => s + i.total_earned, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-lime-400" /> Investments
          </h1>
          <p className="text-gray-400 text-sm mt-1">{investments.length} total investment records</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 bg-dark-600/60 border border-lime-400/10 text-gray-300 hover:text-lime-400 text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Investments',  value: totalActive,           sub: 'plans running', cls: 'text-lime-400'    },
          { label: 'Total Capital Locked', value: formatNGN(totalLocked), sub: 'in active plans', cls: 'text-white'   },
          { label: 'Total ROI Paid Out',  value: formatNGN(totalPaidOut), sub: 'across all users', cls: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-600/40 border border-lime-400/5 rounded-2xl p-5">
            <p className={`text-xl font-bold font-serif ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            <p className="text-xs text-gray-600">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'completed', 'cancelled'] as InvFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
              filter === f
                ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                : 'bg-dark-600/40 border-lime-400/5 text-gray-400 hover:text-white'
            }`}>{f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-lime-400/10">
                {['Investor', 'Plan', 'Amount', 'Daily ROI', 'Total Earned', 'Status', 'Started'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5 first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-400/5">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="w-7 h-7 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : investments.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-500">No investments found</td></tr>
              ) : investments.map(inv => {
                const cfg   = STATUS_CFG[inv.status];
                const daily = inv.amount * inv.daily_rate;
                const days  = Math.floor((Date.now() - new Date(inv.start_date).getTime()) / 86400000);
                return (
                  <tr key={inv.id} className="hover:bg-dark-500/20 transition-all">
                    <td className="px-5 py-4 pl-6">
                      <p className="text-sm font-medium text-white truncate max-w-[140px]">{inv.profiles?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{inv.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-white font-semibold">{planLabel(inv.plan_id)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-lime-400">{formatNGN(inv.amount)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-emerald-400">{formatNGN(daily)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-white">{formatNGN(inv.total_earned)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 pr-6">
                      <p className="text-xs text-gray-400">{new Date(inv.start_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">Day {days}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
