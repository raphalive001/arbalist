import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { BrandLogo } from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Reset link sent! Check your email.");
    }
  }

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <BrandLogo size="lg" />
          </Link>
          <h1 className="text-3xl font-bold font-serif text-white">Reset Password</h1>
          <p className="mt-2 text-gray-400">We'll send you a reset link</p>
        </div>

        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-lime-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email Sent!</h2>
              <p className="text-gray-400 text-sm">Check your inbox for the password reset link.</p>
              <Link to="/login" className="mt-6 block text-lime-400 font-semibold hover:text-lime-300">← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all disabled:opacity-50">
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <Link to="/login" className="block text-center text-sm text-gray-400 hover:text-lime-400 transition-colors">← Back to Login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
