import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail, User, Phone, Eye, EyeOff, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { BrandLogo } from "@/components/BrandLogo";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: params.get("ref") ?? "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone, form.referralCode || undefined);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to verify.");
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <BrandLogo size="lg" />
          </Link>
          <h1 className="text-3xl font-bold font-serif text-white">Create Account</h1>
          <p className="mt-2 text-gray-400">Start earning 1.3% daily</p>
        </div>

        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" required value={form.fullName} onChange={set("fullName")} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="John Doe" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" required value={form.email} onChange={set("email")} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="you@example.com" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="tel" required value={form.phone} onChange={set("phone")} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="+234 800 000 0000" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPw ? "text" : "password"} required value={form.password} onChange={set("password")} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="password" required value={form.confirmPassword} onChange={set("confirmPassword")} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="Repeat password" />
              </div>
            </div>

            {/* Referral */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Referral Code <span className="text-gray-500">(optional)</span></label>
              <div className="relative">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={form.referralCode} onChange={set("referralCode")} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="Enter referral code" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all shadow-lg shadow-lime-400/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">By registering, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-lime-400 font-semibold hover:text-lime-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
