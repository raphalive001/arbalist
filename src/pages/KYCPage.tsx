import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, User, CreditCard, Building2, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sanitizeInput, validateAccountNumber, validateNIN } from '../utils/security';

interface Props {
  onComplete: () => void;
}

const BANKS = [
  'Access Bank', 'GTBank', 'First Bank', 'Zenith Bank', 'UBA',
  'Fidelity Bank', 'FCMB', 'Stanbic IBTC', 'Sterling Bank', 'Wema Bank',
  'Union Bank', 'Heritage Bank', 'Keystone Bank', 'Polaris Bank', 'Ecobank',
  'Opay', 'Kuda Bank', 'Carbon', 'Palmpay', 'VBank', 'Moniepoint',
];

export default function KYCPage({ onComplete }: Props) {
  const { user, submitKYC } = useAuth();
  const profile = user?.profile;
  const kyc     = user?.kyc;

  const [step, setStep]         = useState(1);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(
    kyc?.status === 'pending' || kyc?.status === 'verified'
  );

  const [form, setForm] = useState({
    fullName:      profile?.full_name ?? '',
    nin:           '',
    bankName:      '',
    accountNumber: '',
    accountName:   '',
  });

  if (kyc?.status === 'verified') {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-lime-400" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mb-3">KYC Approved!</h1>
          <p className="text-gray-400 mb-8">Your identity has been verified. You can now make full use of your account.</p>
          <button onClick={onComplete}
            className="bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold px-10 py-4 rounded-xl hover:from-lime-300 transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted || kyc?.status === 'pending') {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mb-3">KYC Under Review</h1>
          <p className="text-gray-400 mb-4">Your documents are being reviewed by our compliance team. This usually takes 1–24 hours.</p>
          <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5 text-left mb-8 space-y-2">
            <p className="text-sm text-gray-400"><span className="text-white font-semibold">Name:</span> {profile?.full_name}</p>
            <p className="text-sm text-gray-400"><span className="text-white font-semibold">Status:</span> Under Review</p>
          </div>
          <button onClick={onComplete}
            className="bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold px-10 py-4 rounded-xl hover:from-lime-300 transition-all">
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.nin || !validateNIN(form.nin)) errs.nin = 'Enter a valid 11-digit NIN';
    }
    if (s === 2) {
      if (!form.bankName) errs.bankName = 'Select your bank';
      if (!validateAccountNumber(form.accountNumber)) errs.accountNumber = 'Enter a valid 10-digit account number';
      if (!form.accountName.trim()) errs.accountName = 'Enter your account name as it appears on your bank statement';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    const result = await submitKYC({
      nin:            form.nin,
      bank_name:      form.bankName,
      account_number: form.accountNumber,
      account_name:   sanitizeInput(form.accountName),
    });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-400/10 rounded-2xl mb-4">
            <Shield className="w-7 h-7 text-lime-400" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-white">Verify Your Identity</h1>
          <p className="text-gray-400 mt-2">KYC verification is required to deposit funds and start earning</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {['ID Verification', 'Bank Details', 'Review'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < step ? 'bg-lime-400 text-dark-800' :
                i + 1 === step ? 'border-2 border-lime-400 text-lime-400 bg-dark-700' :
                'bg-dark-700 text-gray-600'
              }`}>
                {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-lime-400' : 'text-gray-600'}`}>{label}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-700 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-8">
          {/* Step 1: NIN */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-lime-400" />
                <h2 className="text-lg font-bold text-white">National Identity</h2>
              </div>
              <div className="bg-dark-700/60 border border-lime-400/5 rounded-xl p-4 text-sm text-gray-400 leading-relaxed">
                <p>Your NIN (National Identification Number) is used to verify your identity in line with CBN KYC regulations. Your data is encrypted and never shared.</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-300">Full Name (as on ID)</label>
                <input
                  value={form.fullName} readOnly
                  className="w-full bg-dark-700/40 border border-lime-400/10 rounded-xl px-4 py-3.5 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-300">NIN (11 digits)</label>
                <input
                  type="text" inputMode="numeric" maxLength={11}
                  placeholder="00000000000"
                  value={form.nin}
                  onChange={e => setForm(f => ({ ...f, nin: e.target.value.replace(/\D/g, '') }))}
                  className={`w-full bg-dark-700/60 border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm tracking-widest
                    ${errors.nin ? 'border-red-500/50 focus:ring-red-500/20' : 'border-lime-400/10 focus:border-lime-400/40 focus:ring-lime-400/10'}`}
                />
                {errors.nin && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="w-3 h-3" />{errors.nin}</p>}
              </div>
              <div className="bg-lime-400/5 border border-lime-400/10 rounded-xl p-4">
                <p className="text-xs text-lime-400 font-semibold mb-1">🔒 Your Privacy is Protected</p>
                <p className="text-xs text-gray-400">We use 256-bit AES encryption. Your NIN is only used for KYC compliance and is never stored in plain text.</p>
              </div>
              <button onClick={() => { if (validateStep(1)) setStep(2); }}
                className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 transition-all flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-lime-400" />
                <h2 className="text-lg font-bold text-white">Bank Account Details</h2>
              </div>
              <p className="text-sm text-gray-400">Your withdrawal payments will be sent to this account. Ensure details are correct.</p>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-300">Bank Name</label>
                <select value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                  className={`w-full bg-dark-700/60 border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 transition-all text-sm
                    ${errors.bankName ? 'border-red-500/50 focus:ring-red-500/20' : 'border-lime-400/10 focus:border-lime-400/40 focus:ring-lime-400/10'}`}>
                  <option value="">-- Select Bank --</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bankName && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bankName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-300">Account Number</label>
                <input type="text" inputMode="numeric" maxLength={10} placeholder="0123456789"
                  value={form.accountNumber}
                  onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }))}
                  className={`w-full bg-dark-700/60 border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm tracking-widest
                    ${errors.accountNumber ? 'border-red-500/50 focus:ring-red-500/20' : 'border-lime-400/10 focus:border-lime-400/40 focus:ring-lime-400/10'}`}
                />
                {errors.accountNumber && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.accountNumber}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-300">Account Name</label>
                <input type="text" placeholder="JOHN DOE"
                  value={form.accountName}
                  onChange={e => setForm(f => ({ ...f, accountName: e.target.value.toUpperCase() }))}
                  className={`w-full bg-dark-700/60 border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm tracking-wide uppercase
                    ${errors.accountName ? 'border-red-500/50 focus:ring-red-500/20' : 'border-lime-400/10 focus:border-lime-400/40 focus:ring-lime-400/10'}`}
                />
                <p className="text-xs text-gray-500">Enter your name exactly as it appears on your bank account</p>
                {errors.accountName && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.accountName}</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-lime-400/20 text-lime-400 text-sm font-semibold hover:bg-lime-400/10 transition-all">
                  Back
                </button>
                <button onClick={() => { if (validateStep(2)) setStep(3); }}
                  className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3.5 rounded-xl hover:from-lime-300 transition-all flex items-center justify-center gap-2">
                  Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-lime-400" />
                <h2 className="text-lg font-bold text-white">Review & Submit</h2>
              </div>
              <p className="text-sm text-gray-400">Please confirm your details before submitting for review.</p>

              <div className="space-y-3 bg-dark-700/40 rounded-xl p-5 border border-lime-400/10">
                {[
                  { label: 'Full Name',       value: form.fullName },
                  { label: 'NIN',             value: '***-***-' + form.nin.slice(-4) },
                  { label: 'Bank',            value: form.bankName },
                  { label: 'Account Number',  value: '*'.repeat(6) + form.accountNumber.slice(-4) },
                  { label: 'Account Name',    value: form.accountName },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
                <p className="text-xs text-yellow-400 font-semibold mb-1">⏱ Processing Time</p>
                <p className="text-xs text-gray-400">KYC review typically takes 1–24 hours. You'll be notified via WhatsApp once approved.</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-xl border border-lime-400/20 text-lime-400 text-sm font-semibold hover:bg-lime-400/10 transition-all">
                  Edit
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3.5 rounded-xl hover:from-lime-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {submitting ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" /> : 'Submit KYC'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
