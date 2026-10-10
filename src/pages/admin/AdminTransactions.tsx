import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeftRight, CheckCircle, XCircle, Clock,
  RefreshCw, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useAdmin, type AdminTransaction } from '@/hooks/useAdmin';
import { formatNGN } from '@/lib/plans';
import toast from 'react-hot-toast';

type TxType   = 'all' | 'deposit' | 'withdrawal' | 'roi' | 'referral_bonus';
type TxStatus = 'all' | 'pending' | 'success' | 'failed';

const TYPE_CFG: Record<string, { label: string; color: string; sign: string; bg: string }> = {
  deposit:        { label: 'Deposit',        color: 'text-lime-400',   sign: '+', bg: 'bg-lime-400/10'   },
  withdrawal:     { label: 'Withdrawal',     color: 'text-red-400',    sign: '-', bg: 'bg-red-400/10'    },
  roi:            { label: 'ROI',            color: 'text-blue-400',   sign: '+', bg: 'bg-blue-400/10'   },
  referral_bonus: { label: 'Referral Bonus', color: 'text-yellow-400', sign: '+', bg: 'bg-yellow-400/10' },
};

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20', icon: <Clock      className="w-3 h-3" /> },
  success: { label: 'Success', cls: 'bg-lime-400/10  text-lime-400  border-lime-400/20',    icon: <CheckCircle className="w-3 h-3" /> },
  failed:  { label: 'Failed',  cls: 'bg-red-400/10   text-red-400   border-red-400/20',     icon: <XCircle    className="w-3 h-3" /> },
};

const PAGE_SIZE = 30;

export default function AdminTransactions() {
  const { fetchTransactions, processWithdrawal } = useAdmin();
  const [txs,        setTxs]        = useState<AdminTransaction[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [typeFilter, setTypeFilter] = useState<TxType>('all');
  const [page,       setPage]       = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchTransactions(typeFilter, page, PAGE_SIZE);
    setTxs((data as AdminTransaction[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [typeFilter, page, fetchTransactions]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [typeFilter]);

  const pendingWithdrawals = txs.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  async function handleWithdrawal(tx: AdminTransaction, action: 'success' | 'failed') {
    setProcessing(tx.id);
    const { error } = await processWithdrawal(tx.id, tx.user_id, tx.amount, action);
    if (error) toast.error(error.message);
    else toast.success(`Withdrawal ${action === 'success' ? 'approved' : 'rejected'} — ${action === 'failed' ? 'balance refunded' : 'marked as paid'}`);
    setProcessing(null);
    load();
  }

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-lime-400" /> Transactions
          </h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total transactions</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 bg-dark-600/60 border border-lime-400/10 text-gray-300 hover:text-lime-400 text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Pending withdrawals alert */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-orange-400/5 border border-orange-400/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-400">
              {pendingWithdrawals.length} pending withdrawal{pendingWithdrawals.length !== 1 ? 's' : ''} require action
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Total: {formatNGN(pendingWithdrawals.reduce((s, t) => s + t.amount, 0))} — filter by "Withdrawal" below
            </p>
          </div>
        </div>
      )}

      {/* Type filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'withdrawal', 'deposit', 'roi', 'referral_bonus'] as TxType[]).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              typeFilter === t
                ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                : 'bg-dark-600/40 border-lime-400/5 text-gray-400 hover:text-white'
            }`}>
            {t === 'all' ? 'All' : TYPE_CFG[t]?.label}
            {t === 'withdrawal' && pendingWithdrawals.length > 0 && (
              <span className="ml-1.5 bg-orange-400/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-lime-400/10">
                {['User', 'Type', 'Amount', 'Reference', 'Bank Details', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5 first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-400/5">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="w-7 h-7 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : txs.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-500">No transactions found</td></tr>
              ) : txs.map(tx => {
                const typeCfg   = TYPE_CFG[tx.type]   ?? TYPE_CFG.deposit;
                const statusCfg = STATUS_CFG[tx.status] ?? STATUS_CFG.pending;
                const isPendingWithdrawal = tx.type === 'withdrawal' && tx.status === 'pending';

                return (
                  <tr key={tx.id} className={`hover:bg-dark-500/20 transition-all ${isPendingWithdrawal ? 'bg-orange-400/3' : ''}`}>
                    <td className="px-4 py-3.5 pl-6">
                      <p className="text-sm font-medium text-white truncate max-w-[120px]">{tx.profiles?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{tx.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.color}`}>
                        {typeCfg.sign} {typeCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className={`text-sm font-bold ${typeCfg.color}`}>
                        {typeCfg.sign}{formatNGN(tx.amount)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-400 font-mono truncate max-w-[100px]">{tx.reference ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {tx.bank_name ? (
                        <div>
                          <p className="text-xs text-white">{tx.bank_name}</p>
                          <p className="text-xs text-gray-500">{tx.account_name}</p>
                          <p className="text-xs text-gray-600 font-mono">{tx.account_number}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3.5 pr-6">
                      {isPendingWithdrawal ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleWithdrawal(tx, 'success')}
                            disabled={processing === tx.id}
                            className="flex items-center gap-1 bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-lime-400/20 transition-all disabled:opacity-50"
                          >
                            {processing === tx.id ? '…' : <><CheckCircle className="w-3 h-3" /> Pay</>}
                          </button>
                          <button
                            onClick={() => handleWithdrawal(tx, 'failed')}
                            disabled={processing === tx.id}
                            className="flex items-center gap-1 bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-400/20 transition-all disabled:opacity-50"
                          >
                            {processing === tx.id ? '…' : <><XCircle className="w-3 h-3" /> Reject</>}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-lime-400/10">
            <p className="text-xs text-gray-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 rounded-lg border border-lime-400/10 text-gray-400 hover:text-lime-400 hover:border-lime-400/30 disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">{page + 1} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
                className="p-2 rounded-lg border border-lime-400/10 text-gray-400 hover:text-lime-400 hover:border-lime-400/30 disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
