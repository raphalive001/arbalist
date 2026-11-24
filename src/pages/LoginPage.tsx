import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BrandLogo } from '@/components/BrandLogo';
import { checkRateLimit, getRateLimitRemaining } from '@/utils/security';
import toast from 'react-hot-toast';

const RATE_KEY    = 'login';
const MAX_TRIES   = 5;
const WINDOW_MS   = 60_000; // 1 minute

export default function LoginPage() {
  const { signIn }   = useAuth();
  const navigate     = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // FIX: Enforce client-side rate limiting before every login attempt.
    // checkRateLimit returns false once MAX_TRIES is exceeded within the window.
    if (!checkRateLimit(RATE_KEY, MAX_TRIES, WINDOW_MS)) {
      const remaining = Math.ceil(WINDOW_MS / 1000);
      toast.error(`Too many login attempts. Please wait ${remaining} seconds before trying again.`);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      const left = getRateLimitRemaining(RATE_KEY, MAX_TRIES);
      const suffix = left > 0 ? ` (${left} attempt${left !== 1 ? 's' : ''} left)` : '';
      toast.error((error.message ?? 'Login failed') + suffix);
    } else {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <BrandLogo size="lg" />
          </Link>
          <h1 className="text-3xl font-bold font-serif text-white">Welcome back</h1>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-lime-400 hover:text-lime-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
                : 'Sign In'
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-lime-400 hover:text-lime-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
