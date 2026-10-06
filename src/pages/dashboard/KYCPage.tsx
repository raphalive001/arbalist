import { useState } from 'react';
import { ShieldCheck, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type DocType = Database['public']['Tables']['kyc_documents']['Insert']['doc_type'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'national_id',     label: 'National ID Card'      },
  { value: 'drivers_license', label: "Driver's License"      },
  { value: 'passport',        label: 'International Passport' },
  { value: 'voters_card',     label: "Voter's Card"          },
];

async function uploadFile(userId: string, file: File, folder: string): Promise<string> {
  const ext  = file.name.split('.').pop();
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('kyc-documents').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('kyc-documents').getPublicUrl(path);
  return data.publicUrl;
}

export default function KYCPage() {
  const { profile, refetchProfile } = useAuth();
  const [docType,    setDocType]    = useState<DocType>('national_id');
  const [docNumber,  setDocNumber]  = useState('');
  const [frontFile,  setFrontFile]  = useState<File | null>(null);
  const [backFile,   setBackFile]   = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading,    setLoading]    = useState(false);

  const status = profile?.kyc_status ?? 'pending';

  const statusConfig = {
    pending:   { icon: <Clock        className="w-6 h-6" />, color: 'text-gray-400',   bg: 'bg-gray-400/10 border-gray-400/20',   label: 'Not Submitted'              },
    submitted: { icon: <Clock        className="w-6 h-6" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Under Review'               },
    verified:  { icon: <CheckCircle  className="w-6 h-6" />, color: 'text-lime-400',   bg: 'bg-lime-400/10 border-lime-400/20',   label: 'Verified'                   },
    rejected:  { icon: <XCircle      className="w-6 h-6" />, color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',     label: 'Rejected — Please Resubmit' },
  } as const;

  const cfg = statusConfig[status];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!frontFile || !selfieFile) { toast.error('Front photo and selfie are required'); return; }
    if (!profile) return;
    setLoading(true);
    try {
      const [frontUrl, selfieUrl] = await Promise.all([
        uploadFile(profile.id, frontFile,  'front'),
        uploadFile(profile.id, selfieFile, 'selfie'),
      ]);
      let backUrl: string | null = null;
      if (backFile) backUrl = await uploadFile(profile.id, backFile, 'back');

      const { error } = await supabase.from('kyc_documents').insert({
        user_id:    profile.id,
        doc_type:   docType,
        doc_number: docNumber,
        front_url:  frontUrl,
        back_url:   backUrl,
        selfie_url: selfieUrl,
        status:     'pending',
      });
      if (error) throw error;

      const profileUpdate: ProfileUpdate = { kyc_status: 'submitted' };
      await supabase.from('profiles').update(profileUpdate).eq('id', profile.id);

      refetchProfile?.();
      toast.success('KYC submitted successfully!');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function FileInput({
    label, accept = 'image/*,.pdf', onChange, file, required = false,
  }: { label: string; accept?: string; onChange: (f: File) => void; file: File | null; required?: boolean }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-lime-400/20 rounded-xl cursor-pointer hover:border-lime-400/40 hover:bg-lime-400/5 transition-all">
          <input type="file" className="hidden" accept={accept}
            onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
          {file ? (
            <div className="text-center px-4">
              <CheckCircle className="w-6 h-6 text-lime-400 mx-auto mb-1" />
              <p className="text-xs text-lime-400 font-medium truncate max-w-full">{file.name}</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Click to upload</p>
            </div>
          )}
        </label>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-400" /> KYC Verification
        </h1>
        <p className="mt-1 text-gray-400">Verify your identity to unlock withdrawals and higher deposit limits.</p>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-4 border rounded-2xl p-5 ${cfg.bg}`}>
        <div className={cfg.color}>{cfg.icon}</div>
        <div>
          <p className="text-sm font-semibold text-white">Status: <span className={cfg.color}>{cfg.label}</span></p>
          <p className="text-xs text-gray-400 mt-0.5">
            {status === 'verified'  ? 'Your identity has been successfully verified.' :
             status === 'submitted' ? 'Our team is reviewing your documents. This usually takes 24–48 hours.' :
             status === 'rejected'  ? 'Your documents were not accepted. Please resubmit with clearer images.' :
                                      'Submit your identity documents to complete verification.'}
          </p>
        </div>
      </div>

      {/* Form */}
      {status !== 'verified' && status !== 'submitted' && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Type <span className="text-red-400">*</span>
              </label>
              <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)}
                className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-lime-400/40 transition-all">
                {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Number <span className="text-red-400">*</span>
              </label>
              <input type="text" required value={docNumber} onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 transition-all"
                placeholder="Enter document number" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <FileInput label="Front of Document" file={frontFile} onChange={setFrontFile}  required />
              <FileInput label="Back of Document"  file={backFile}  onChange={setBackFile}           />
              <FileInput label="Selfie with Doc"   file={selfieFile} onChange={setSelfieFile} required />
            </div>

            <div className="bg-dark-700/60 rounded-xl p-4 text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300 mb-2">Requirements:</p>
              <p>• Documents must be clear, unedited and not expired</p>
              <p>• All 4 corners must be visible</p>
              <p>• Selfie must show your face and document clearly</p>
              <p>• Accepted formats: JPG, PNG, PDF (max 5 MB each)</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Uploading…' : 'Submit Documents'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
