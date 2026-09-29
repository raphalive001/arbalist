import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield, CheckCircle, AlertCircle, ChevronLeft, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  checkPasswordStrength,
  validateEmail,
  validatePhone,
  sanitizeInput,
  checkRateLimit,
  getRateLimitRemaining,
  generateCSRFToken,
} from '../utils/security';

const WA_BASE = 'https://wa.me/2349054416277';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
  initialMode?: 'login' | 'register';
  prefillReferral?: string;
}

function InputField({
  label, name, type = 'text', placeholder, value, onChange, error, icon, hint, autoComplete,
}: {
  label: string; name: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string;
  icon?: React.ReactNode; hint?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-300">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{icon}</div>}
        <input
          id={name}
          name={name}
          type={isPassword ? (show ? 'text' : 'password') : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full bg-dark-700/60 border rounded-xl py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm
            ${icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-11' : 'pr-4'}
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-lime-400/10 focus:border-lime-400/40 focus:ring-lime-400/10'}
          `}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function AuthPage({ onSuccess, onBack, initialMode = 'login', prefillReferral = '' }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [csrfToken] = useState(() => generateCSRFToken());
  const { login, register, isLoading } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: prefillReferral,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState('');
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  const pwStrength = checkPasswordStrength(form.password);
  const remaining = getRateLimitRemaining('login', 5);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit('login', 5, 60000)) {
      setLoginError('Too many attempts. Wait 1 minute and try again.');
      return;
    }
    setLoginError('');
    const res = await login(loginEmail.trim().toLowerCase(), loginPassword);
    if (res.success) onSuccess();
    else setLoginError(res.message);
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().split(' ').filter(Boolean).length < 2)
      errors.fullName = 'Enter your full name (first and last)';
    if (!validateEmail(form.email)) errors.email = 'Enter a valid email address';
    if (!validatePhone(form.phone)) errors.phone = 'Enter a valid Nigerian phone number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (pwStrength.score < 2) errors.password = 'Password is too weak — add uppercase, numbers or symbols';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!agreed) errors.agreed = 'You must accept the terms to continue';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    if (!checkRateLimit('register', 3, 300000)) {
      setRegisterError('Too many registration attempts. Please wait 5 minutes.');
      return;
    }
    setRegisterError('');
    const res = await register({
      fullName: sanitizeInput(form.fullName),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      referralCode: form.referralCode.trim() || undefined,
    });
    if (res.success) onSuccess();
    else setRegisterError(res.message);
  };

  return (
    // FIX: Use min-h-screen with py padding + overflow-y-auto so content is never clipped
    <div className="min-h-screen bg-dark-800 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-8">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-lime-400 transition-colors mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 backdrop-blur-xl">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-400/10 rounded-2xl mb-3">
              <Shield className="w-6 h-6 text-lime-400" />
            </div>
            <h1 className="text-xl font-bold font-serif text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'login' ? 'Sign in to your Arbalist Capital account' : 'Join thousands of investors earning daily'}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-dark-700/60 rounded-xl p-1 mb-5">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-lime-400 text-dark-800' : 'text-gray-400 hover:text-white'}`}>
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setStep(1); setRegisterError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'register' ? 'bg-lime-400 text-dark-800' : 'text-gray-400 hover:text-white'}`}>
              Register
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="hidden" name="_csrf" value={csrfToken} />
              <InputField label="Email Address" name="email" type="email"
                placeholder="you@example.com" value={loginEmail}
                onChange={setLoginEmail} icon={<Mail className="w-4 h-4" />}
                autoComplete="email" />
              <InputField label="Password" name="password" type="password"
                placeholder="Your password" value={loginPassword}
                onChange={setLoginPassword} icon={<Lock className="w-4 h-4" />}
                autoComplete="current-password" />

              {loginError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{loginError}</p>
                </div>
              )}
              {remaining < 5 && remaining > 0 && (
                <p className="text-xs text-yellow-400">{remaining} attempt{remaining !== 1 ? 's' : ''} remaining</p>
              )}

              <button type="submit"
                disabled={isLoading || !loginEmail || !loginPassword}
                className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3.5 rounded-xl transition-all hover:from-lime-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading
                  ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="text-center">
                <a href={`${WA_BASE}?text=I%20forgot%20my%20Arbalist%20Capital%20password.%20Email%3A%20${encodeURIComponent(loginEmail)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-lime-400 hover:text-lime-300 transition-colors">
                  Forgot password? Contact support →
                </a>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <form onSubmit={step === 1
              ? (e) => { e.preventDefault(); if (validateStep1()) setStep(2); }
              : handleRegister}>
              <input type="hidden" name="_csrf" value={csrfToken} />

              {/* Step indicator */}
              <div className="flex items-center mb-5">
                {[
                  { n: 1, label: 'Your Info' },
                  { n: 2, label: 'Security' },
                ].map(({ n, label }, idx) => (
                  <div key={n} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                        n < step ? 'bg-lime-400 text-dark-800'
                        : n === step ? 'border-2 border-lime-400 text-lime-400 bg-transparent'
                        : 'bg-dark-700 text-gray-500'
                      }`}>
                        {n < step ? <CheckCircle className="w-4 h-4" /> : n}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${n === step ? 'text-lime-400' : 'text-gray-500'}`}>
                        {label}
                      </span>
                    </div>
                    {idx < 1 && <div className="flex-1 h-px bg-dark-700 mx-3" />}
                  </div>
                ))}
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <InputField label="Full Name" name="fullName" placeholder="John Doe"
                    value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))}
                    error={formErrors.fullName} icon={<User className="w-4 h-4" />} autoComplete="name" />
                  <InputField label="Email Address" name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))}
                    error={formErrors.email} icon={<Mail className="w-4 h-4" />} autoComplete="email" />
                  <InputField label="Phone Number" name="phone" type="tel" placeholder="08012345678"
                    value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))}
                    error={formErrors.phone} icon={<Phone className="w-4 h-4" />}
                    hint="Nigerian number (08XX or +234...)" autoComplete="tel" />
                  <InputField label="Referral Code (Optional)" name="referralCode" placeholder="E.g. JOHN4AB2"
                    value={form.referralCode} onChange={v => setForm(f => ({ ...f, referralCode: v }))}
                    icon={<Gift className="w-4 h-4" />} hint="Earn ₦500 when you use a valid referral code" />

                  {/* ALWAYS VISIBLE — no content pushing it away */}
                  <button type="submit"
                    className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3.5 rounded-xl transition-all hover:from-lime-300 flex items-center justify-center gap-2 mt-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Password field + strength meter inline */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        name="password" type={form.password ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={e => {
                          setForm(f => ({ ...f, password: e.target.value }));
                          if (formErrors.password) setFormErrors(fe => ({ ...fe, password: '' }));
                        }}
                        autoComplete="new-password"
                        className={`w-full bg-dark-700/60 border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm
                          ${formErrors.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-lime-400/10 focus:border-lime-400/40 focus:ring-lime-400/10'}`}
                      />
                    </div>
                    {/* Strength bar — compact, won't push button */}
                    {form.password.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex gap-1 flex-1">
                          {[0,1,2,3,4].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all"
                              style={{ backgroundColor: i <= pwStrength.score ? pwStrength.color : '#2a2f3a' }} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold flex-shrink-0" style={{ color: pwStrength.color }}>
                          {pwStrength.label}
                        </span>
                      </div>
                    )}
                    {formErrors.password && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />{formErrors.password}
                      </p>
                    )}
                  </div>

                  <InputField label="Confirm Password" name="confirmPassword" type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={v => setForm(f => ({ ...f, confirmPassword: v }))}
                    error={formErrors.confirmPassword} icon={<Lock className="w-4 h-4" />}
                    autoComplete="new-password" />

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-lime-400 flex-shrink-0 rounded" />
                    <span className="text-xs text-gray-400 leading-relaxed">
                      I agree to the{' '}
                      <a href="#terms" className="text-lime-400 hover:underline">Terms of Service</a>{' '}and{' '}
                      <a href="#privacy" className="text-lime-400 hover:underline">Privacy Policy</a>.{' '}
                      I understand investments carry risk.
                    </span>
                  </label>
                  {formErrors.agreed && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />{formErrors.agreed}
                    </p>
                  )}

                  {registerError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{registerError}</p>
                    </div>
                  )}

                  {/* Buttons always at bottom, always visible */}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setStep(1); setFormErrors({}); }}
                      className="px-5 py-3 rounded-xl border border-lime-400/20 text-lime-400 text-sm font-semibold hover:bg-lime-400/10 transition-all flex-shrink-0">
                      Back
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3 rounded-xl transition-all hover:from-lime-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isLoading
                        ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
                        : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Trust row */}
          <div className="mt-5 pt-5 border-t border-lime-400/5 flex items-center justify-center gap-5">
            {[
              { icon: <Shield className="w-3.5 h-3.5 text-lime-400" />, label: '256-bit SSL' },
              { icon: <Lock className="w-3.5 h-3.5 text-lime-400" />, label: 'Encrypted' },
              { icon: <CheckCircle className="w-3.5 h-3.5 text-lime-400" />, label: 'Secure' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                {icon}{label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
