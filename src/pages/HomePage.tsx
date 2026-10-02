import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Shield, Users, Zap, ChevronDown, ChevronUp,
  CheckCircle, ArrowRight, Star, Globe, Lock, BarChart3,
} from "lucide-react";
import { PLANS, formatNGN } from "@/lib/plans";
import { BrandLogo } from "@/components/BrandLogo";

const FAQS = [
  { q: "How does Arbalist Capital work?", a: "Arbalist Capital is an investment platform where you deposit funds and earn 1.3% daily ROI. Your earnings are credited to your wallet every day and you can withdraw at any time after KYC verification." },
  { q: "What is the minimum investment?", a: "The minimum investment starts from ₦50,500. You can invest in multiple plans simultaneously to maximize your earnings." },
  { q: "How do I withdraw my earnings?", a: "After completing KYC verification, you can withdraw directly to your Nigerian bank account. Withdrawals are processed within 24 business hours. Minimum withdrawal is ₦5,000." },
  { q: "Is my money safe?", a: "We use bank-grade security, SSL encryption, and Supabase's secure infrastructure. All payments are processed through Paystack, a CBN-licensed payment gateway." },
  { q: "How does the referral program work?", a: "Share your unique referral link. When someone signs up and makes their first deposit, you earn 5% of their deposit amount directly to your wallet." },
  { q: "What is KYC verification?", a: "KYC (Know Your Customer) is a one-time identity verification required by financial regulations. You submit a valid government ID and selfie. Verification takes 24–48 hours." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-lime-400/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-lime-400/5 transition-all">
        <span className="font-medium text-white pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-lime-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-lime-400/10 pt-4">{a}</div>}
    </div>
  );
}

export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);
  const featuredPlans = PLANS.slice(0, 6);

  return (
    <div className="min-h-screen bg-dark-800 text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-dark-800/90 backdrop-blur-xl border-b border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#plans" className="text-sm text-gray-400 hover:text-white transition-colors">Plans</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-dark-600/60 transition-all">Sign In</Link>
            <Link to="/register" className="text-sm font-bold bg-lime-400 text-dark-800 px-5 py-2.5 rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20">Get Started</Link>
          </div>
          <button className="md:hidden text-white p-2" onClick={() => setNavOpen(!navOpen)}>
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-white" />
              <span className="block w-6 h-0.5 bg-white" />
              <span className="block w-4 h-0.5 bg-white" />
            </div>
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden bg-dark-700/95 backdrop-blur-xl border-t border-lime-400/10 px-4 py-6 space-y-4">
            <a href="#plans" onClick={() => setNavOpen(false)} className="block text-gray-300 hover:text-lime-400 py-2">Plans</a>
            <a href="#how-it-works" onClick={() => setNavOpen(false)} className="block text-gray-300 hover:text-lime-400 py-2">How It Works</a>
            <a href="#faq" onClick={() => setNavOpen(false)} className="block text-gray-300 hover:text-lime-400 py-2">FAQ</a>
            <div className="pt-2 flex flex-col gap-3">
              <Link to="/login" className="block text-center py-3 border border-lime-400/20 rounded-xl text-gray-300 font-medium">Sign In</Link>
              <Link to="/register" className="block text-center py-3 bg-lime-400 rounded-xl text-dark-800 font-bold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(163,230,53,0.12),rgba(0,0,0,0))]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-4 py-2 text-sm text-lime-400 font-medium mb-8">
            <Star className="w-4 h-4" /> Trusted by 10,000+ Nigerians
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif leading-tight">
            Earn <span className="text-lime-400">1.3% Daily</span> Returns<br />on Your Investments
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Join Arbalist Capital and grow your wealth with consistent daily returns. From ₦50,500 to ₦5M+ — choose a plan, invest, and watch your money work for you.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="flex items-center gap-2 bg-lime-400 text-dark-800 font-bold px-8 py-4 rounded-xl hover:bg-lime-300 transition-all shadow-xl shadow-lime-400/25 text-lg w-full sm:w-auto justify-center">
              Start Investing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/plans" className="flex items-center gap-2 border border-lime-400/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-lime-400/5 transition-all text-lg w-full sm:w-auto justify-center">
              View All Plans
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "1.3%", label: "Daily ROI" },
              { value: "₦5M+", label: "Max Plan" },
              { value: "5%", label: "Referral Bonus" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold font-serif text-lime-400">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 bg-dark-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">How It Works</h2>
            <p className="mt-3 text-gray-400">Start earning in 4 simple steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users className="w-7 h-7" />, step: "01", title: "Create Account", desc: "Sign up in minutes with your email. No paperwork needed to get started." },
              { icon: <Shield className="w-7 h-7" />, step: "02", title: "Verify Identity", desc: "Complete KYC with a valid government ID to unlock all features." },
              { icon: <TrendingUp className="w-7 h-7" />, step: "03", title: "Choose a Plan", desc: "Pick from 11 investment plans starting from ₦50,500. Fund your wallet first." },
              { icon: <Zap className="w-7 h-7" />, step: "04", title: "Earn Daily", desc: "Watch 1.3% daily returns credit to your wallet automatically every day." },
            ].map((item) => (
              <div key={item.step} className="relative bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
                <div className="absolute -top-3 -right-3 text-xs font-bold text-lime-400/30 text-4xl font-serif">{item.step}</div>
                <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400 mb-4">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Investment Plans</h2>
            <p className="mt-3 text-gray-400">All plans earn 1.3% daily. Returns shown are cumulative earnings.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPlans.map((plan) => (
              <div key={plan.id} className={`relative bg-dark-600/40 border rounded-2xl p-6 transition-all hover:border-lime-400/30 hover:shadow-lg hover:shadow-lime-400/5 ${plan.popular ? "border-lime-400/40" : "border-lime-400/10"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-6 bg-lime-400 text-dark-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <p className="text-2xl font-bold font-serif text-white">{plan.label}</p>
                <p className="text-xs text-gray-500 mt-1">{formatNGN(plan.amount)} investment</p>
                <div className="mt-5 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Daily Earnings</span>
                    <span className="text-lime-400 font-bold">{formatNGN(plan.dailyEarnings)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">7 Days ROI</span>
                    <span className="text-white font-semibold">{formatNGN(plan.d7)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">30 Days ROI</span>
                    <span className="text-white font-semibold">{formatNGN(plan.d30)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">90 Days ROI</span>
                    <span className="text-emerald-400 font-bold">{formatNGN(plan.d90)}</span>
                  </div>
                </div>
                <Link to="/register" className="mt-5 flex items-center justify-center gap-2 w-full bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold py-3 rounded-xl hover:bg-lime-400/20 transition-all text-sm">
                  Invest Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/plans" className="inline-flex items-center gap-2 border border-lime-400/20 text-lime-400 font-semibold px-8 py-3.5 rounded-xl hover:bg-lime-400/10 transition-all">
              View All 11 Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 bg-dark-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Why Choose Arbalist Capital</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Lock className="w-6 h-6" />, title: "Bank-Grade Security", desc: "SSL encryption, secure storage via Supabase, and CSP headers protect every transaction." },
              { icon: <Globe className="w-6 h-6" />, title: "Paystack Payment", desc: "Deposit and withdraw securely via Paystack — a CBN-licensed, PCI-DSS compliant gateway." },
              { icon: <BarChart3 className="w-6 h-6" />, title: "Daily ROI Dashboard", desc: "Track your earnings, portfolio performance, and transaction history in real-time." },
              { icon: <Shield className="w-6 h-6" />, title: "KYC Protected", desc: "Verified identities protect all users and ensure compliance with financial regulations." },
              { icon: <Users className="w-6 h-6" />, title: "Referral Earnings", desc: "Earn 5% on every referral's first deposit. No limit on how many people you refer." },
              { icon: <Zap className="w-6 h-6" />, title: "Instant Crediting", desc: "Daily ROI is automatically credited at midnight. Deposits reflect instantly after payment." },
            ].map((f) => (
              <div key={f.title} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 hover:border-lime-400/20 transition-all">
                <div className="w-11 h-11 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400 mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">What Our Investors Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Chioma A.", location: "Lagos", text: "I started with ₦100K and earned ₦39K in just 30 days. The daily credits are real and withdrawals are fast!", stars: 5 },
              { name: "Emeka O.", location: "Abuja", text: "Referred 5 friends and earned referral bonuses on top of my daily ROI. This platform is the real deal.", stars: 5 },
              { name: "Fatima I.", location: "Kano", text: "KYC was smooth, deposit was instant via Paystack, and I received my first ROI the very next day.", stars: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 font-bold text-sm">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-dark-700/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-lime-400/10 to-emerald-500/5 border border-lime-400/20 rounded-3xl px-8 py-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Ready to Grow Your Wealth?</h2>
            <p className="mt-4 text-gray-400">Join 10,000+ Nigerians already earning 1.3% daily. Start today.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="flex items-center justify-center gap-2 bg-lime-400 text-dark-800 font-bold px-8 py-4 rounded-xl hover:bg-lime-300 transition-all shadow-xl shadow-lime-400/25">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="flex items-center justify-center gap-2 border border-lime-400/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-lime-400/5 transition-all">
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              {["No hidden fees", "Daily ROI credited automatically", "Withdraw anytime", "Nigerian-based platform"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-lime-400" />{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark-700/50 border-t border-lime-400/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <BrandLogo size="md" />
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">Nigeria's trusted investment platform. Earn 1.3% daily returns on your capital.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-3 text-sm">Platform</p>
              <div className="space-y-2">
                <Link to="/plans" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">Investment Plans</Link>
                <Link to="/register" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">Create Account</Link>
                <Link to="/login" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">Sign In</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white mb-3 text-sm">Legal</p>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">Terms of Service</a>
                <a href="#" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">Risk Disclaimer</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white mb-3 text-sm">Contact</p>
              <div className="space-y-2">
                <a href="mailto:support@arbalistcapital.com.ng" className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">support@arbalistcapital.com.ng</a>
                <p className="text-sm text-gray-500">www.arbalistcapital.com.ng</p>
              </div>
            </div>
          </div>
          <div className="border-t border-lime-400/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Arbalist Capital. All rights reserved.</p>
            <p className="text-xs text-gray-600">Payments secured by Paystack</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
