import { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck, CheckCircle, XCircle, Clock, Eye, X,
  ExternalLink, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAdmin, type AdminKYC } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

type FilterStatus = 'pending' | 'verified' | 'rejected' | 'all';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20', icon: <Clock      className="w-3.5 h-3.5" /> },
  verified: { label: 'Approved', cls: 'bg-lime-400/10  text-lime-400  border-lime-400/20',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10   text-red-400   border-red-400/20',    icon: <XCircle    className="w-3.5 h-3.5" /> },
} as const;

const DOC_LABELS: Record<string, string> = {
  national_id:     'National ID',
  drivers_license: "Driver's License",
  passport:        'Passport',
  voters_card:     "Voter's Card",
};

function KYCReviewModal({
  doc, onClose, onAction,
}: {
  doc: AdminKYC;
  onClose: () => void;
  onAction: (id: string, userId: string, action: 'verified' | 'rejected', reason?: string) => Promise<void>;
}) {
  const [reason,     setReason]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview,    setPreview]    = useState<string | null>(null);

  async function handle(action: 'verified' | 'rejected') {
    if (action === 'rejected' && !reason.trim()) {
      toast.error('Enter a rejection reason');
      return;
    }
    setSubmitting(true);
    await onAction(doc.id, doc.user_id, action, reason);
    setSubmitting(false);
    onClose();
  }

  const DocImage = ({ url, label }: { url: string | null; label: string }) => {
    if (!url) return null;
    return (
      <div>
        <p className="text-xs text-gray-500 mb-2">{label}</p>
        <div
          onClick={() => setPreview(url)}
          className="relative rounded-xl overflow-hidden border border-lime-400/10 cursor-pointer hover:border-lime-400/30 transition-all group"
        >
          <img src={url} alt={label} className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 mt-1.5 transition-colors">
          <ExternalLink className="w-3 h-3" /> Open full size
        </a>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-dark-600 border border-lime-400/15 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-lime-400/10">
            <div>
              <h3 className="font-bold text-white">KYC Review</h3>
              <p className="text-xs text-gray-400 mt-0.5">{doc.profiles?.full_name ?? 'Unknown'} — {doc.profiles?.email}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* User info */}
            <div className="bg-dark-700/40 rounded-xl p-4 space-y-2">
              {[
                { k: 'Full Name',    v: doc.profiles?.full_name ?? '—'   },
                { k: 'Email',        v: doc.profiles?.email ?? '—'       },
                { k: 'Phone',        v: doc.profiles?.phone ?? '—'       },
                { k: 'Document',     v: DOC_LABELS[doc.doc_type] ?? doc.doc_type },
                { k: 'Doc Number',   v: doc.doc_number                   },
                { k: 'Submitted',    v: new Date(doc.created_at).toLocaleString() },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">{v}</span>
                </div>
              ))}
            </div>

            {/* Document images */}
            <div className="grid grid-cols-3 gap-3">
              <DocImage url={doc.front_url}  label="Front" />
              <DocImage url={doc.back_url}   label="Back"  />
              <DocImage url={doc.selfie_url} label="Selfie" />
            </div>

            {/* Current status */}
            {doc.status !== 'pending' && (
              <div className={`flex items-start gap-3 rounded-xl p-4 border ${STATUS_CONFIG[doc.status].cls}`}>
                <div className="mt-0.5">{STATUS_CONFIG[doc.status].icon}</div>
                <div>
                  <p className="text-sm font-semibold">Status: {STATUS_CONFIG[doc.status].label}</p>
                  {doc.rejection_reason && (
                    <p className="text-xs mt-1 opacity-80">Reason: {doc.rejection_reason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Rejection reason */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Rejection Reason <span className="text-gray-500">(required if rejecting)</span>
              </label>
              <textarea
                value={reason} onChange={e => setReason(e.target.value)} rows={2}
                placeholder="e.g. Document is blurry or expired"
                className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/30 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handle('rejected')} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-400/10 border border-red-400/20 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-400/20 transition-all disabled:opacity-50 text-sm"
              >
                <XCircle className="w-4 h-4" />
                {submitting ? 'Processing…' : 'Reject'}
              </button>
              <button
                onClick={() => handle('verified')} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold py-3 rounded-xl hover:bg-lime-400/20 transition-all disabled:opacity-50 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? 'Processing…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full size preview */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="Document" className="max-w-full max-h-full rounded-xl object-contain" />
          <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white bg-dark-600 rounded-xl p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}

export default function AdminKYC() {
  const { fetchKYCQueue, approveKYC } = useAdmin();
  const [docs,     setDocs]     = useState<AdminKYC[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<FilterStatus>('pending');
  const [selected, setSelected] = useState<AdminKYC | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchKYCQueue();
    setDocs((data as AdminKYC[]) ?? []);
    setLoading(false);
  }, [fetchKYCQueue]);

  useEffect(() => { load(); }, [load]);

  async function handleAction(id: string, userId: string, action: 'verified' | 'rejected', reason?: string) {
    const { error } = await approveKYC(id, userId, action, reason);
    if (error) toast.error(error.message);
    else {
      toast.success(`KYC ${action === 'verified' ? 'approved' : 'rejected'} successfully`);
      load();
    }
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter);
  const counts = {
    all:      docs.length,
    pending:  docs.filter(d => d.status === 'pending').length,
    verified: docs.filter(d => d.status === 'verified').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lime-400" /> KYC Review
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review and approve identity documents</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 bg-dark-600/60 border border-lime-400/10 text-gray-300 hover:text-lime-400 text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'verified', 'rejected', 'all'] as FilterStatus[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              filter === f
                ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                : 'bg-dark-600/40 border-lime-400/5 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'pending' && <Clock className="w-3.5 h-3.5 text-yellow-400" />}
            {f === 'verified' && <CheckCircle className="w-3.5 h-3.5 text-lime-400" />}
            {f === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
            <span className="capitalize">{f}</span>
            <span className="bg-dark-700 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* KYC table */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'pending' ? 'No pending KYC submissions' : `No ${filter} KYC records`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-lime-400/5">
            {filtered.map(doc => {
              const cfg = STATUS_CONFIG[doc.status];
              return (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-500/20 transition-all">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-400 text-xs font-bold flex-shrink-0">
                    {doc.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {doc.profiles?.full_name ?? 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{doc.profiles?.email}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {DOC_LABELS[doc.doc_type]} — {doc.doc_number}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="hidden sm:block flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-full ${cfg.cls}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden md:block text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">{new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setSelected(doc)}
                    className="flex items-center gap-1.5 bg-dark-700/60 border border-lime-400/10 hover:border-lime-400/30 text-gray-300 hover:text-lime-400 text-xs font-medium px-3 py-2 rounded-lg transition-all flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {counts.pending === 0 && filter === 'pending' && !loading && (
        <div className="flex items-center gap-3 bg-lime-400/5 border border-lime-400/10 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
          <p className="text-sm text-lime-400 font-medium">All KYC submissions are reviewed. Great work!</p>
        </div>
      )}

      {selected && (
        <KYCReviewModal doc={selected} onClose={() => setSelected(null)} onAction={handleAction} />
      )}
    </div>
  );
}
