import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BrandLogo } from '@/components/BrandLogo';
import toast from 'react-hot-toast';

type PageState = 'verifying' | 'ready' | 'success' | 'error';

export default function ResetPasswordPage() {
  const navigate   = useNavigate();
  const [state,    setState]   = useState<PageState>('verifying');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errMsg,   setErrMsg]   = useState('');

  // Supabase sends the user back with a hash fragment:
  // /reset-password#access_token=...&type=recovery
  // onAuthStateChange fires with event='PASSWORD_RECOVERY'
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setState('ready');
        }
      }
    );

    // Also check if there's already an active session with recovery tokens
    // (handles page refresh after Supabase processes the hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState('ready');
      } else {
        // Give Supabase a moment to process the URL hash
        setTimeout(() => {
          setState(prev => prev === 'verifying' ? 'error' : prev);
          setErrMsg('Invalid or expired reset link. Please request a new one.');
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setState('success');
      toast.success('Password updated! Redirecting…');
      setTimeout(() => navigate('/login'), 2500);
    }
  }

  const inputCls = 'w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all text-sm';

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <BrandLogo size="lg" />
          </Link>
          <h1 className="text-3xl font-bold font-serif text-white">Set New Password</h1>
          <p className="mt-2 text-gray-400">Choose a strong password for your account</p>
        </div>

        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-8">

          {/* Verifying */}
          {state === 'verifying' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Verifying your reset link…</p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Link Invalid or Expired</h2>
              <p className="text-gray-400 text-sm mb-6">{errMsg}</p>
              <Link
                to="/forgot-password"
                className="inline-block bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold px-8 py-3 rounded-xl hover:from-lime-300 transition-all text-sm"
              >
                Request New Link
              </Link>
            </div>
          )}

          {/* Success */}
          {state === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-lime-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Password Updated!</h2>
              <p className="text-gray-400 text-sm">Redirecting you to login…</p>
            </div>
          )}

          {/* Form */}
          {state === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength hint */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                          password.length >= i * 3
                            ? password.length >= 12 ? 'bg-lime-400'
                              : password.length >= 8  ? 'bg-yellow-400'
                              : 'bg-red-400'
                            : 'bg-dark-500'
                        }`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      password.length >= 12 ? 'text-lime-400' :
                      password.length >= 8  ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Fair' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={`${inputCls} pr-4`}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords don't match
                  </p>
                )}
                {confirm && password === confirm && confirm.length > 0 && (
                  <p className="mt-1.5 text-xs text-lime-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 8}
                className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 transition-all shadow-lg shadow-lime-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
                  : 'Update Password'
                }
              </button>

              <Link
                to="/login"
                className="block text-center text-sm text-gray-400 hover:text-lime-400 transition-colors"
              >
                ← Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
