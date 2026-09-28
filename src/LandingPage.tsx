// Re-export the original App as LandingPage with added auth buttons
// The original App.tsx code goes here but with added props for auth navigation

import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  TrendingUp, Shield, BarChart3, Globe, Users, Target, Award,
  ChevronDown, ArrowRight, Menu, X, CheckCircle, Mail, MessageCircle,
  Lock, LineChart, Clock, Activity, LogIn, UserPlus,
} from 'lucide-react';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

const WA_NUMBER = '2349054416277';
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const EMAIL = 'arbalistcapitalinvesting@gmail.com';

const LOGO_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxMiIgZmlsbD0iIzg0Y2MxNiIvPjx0ZXh0IHg9IjMyIiB5PSI0NiIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzFhMWYyZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD48L3N2Zz4=';

const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const BrandLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return (
    <div className={`${sizes[size]} rounded-xl overflow-hidden flex-shrink-0`}>
      <img src={LOGO_SRC} alt="Arbalist Capital" className="w-full h-full object-cover" />
    </div>
  );
};

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Plans', href: '#plans' },
  { label: 'FAQ', href: '#faq' },
];

const sports = [
  { name: 'Football', emoji: '⚽' }, { name: 'Basketball', emoji: '🏀' },
  { name: 'Tennis', emoji: '🎾' }, { name: 'Cricket', emoji: '🏏' },
  { name: 'Hockey', emoji: '🏒' }, { name: 'Baseball', emoji: '⚾' },
  { name: 'Golf', emoji: '⛳' }, { name: 'Boxing', emoji: '🥊' },
];

const WhatsAppFAB = () => (
  <a href={WA_BASE} target="_blank" rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-5 py-3.5 rounded-full shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105">
    <WhatsAppIcon className="w-5 h-5" />
    <span className="text-sm">Chat with us</span>
  </a>
);

export default function LandingPage({ onLogin, onRegister }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const plans = [
    { label: '₦50.5K', min: 50500, daily: '₦656', monthly: '₦19,695', popular: false },
    { label: '₦100.5K', min: 100500, daily: '₦1,307', monthly: '₦39,195', popular: false },
    { label: '₦200.5K', min: 200500, daily: '₦2,607', monthly: '₦78,195', popular: false },
    { label: '₦300.5K', min: 300500, daily: '₦3,907', monthly: '₦117,195', popular: true },
    { label: '₦400.5K', min: 400500, daily: '₦5,207', monthly: '₦156,195', popular: false },
    { label: '₦500.5K', min: 500500, daily: '₦6,507', monthly: '₦195,195', popular: false },
    { label: '₦1M', min: 1000000, daily: '₦13,000', monthly: '₦390,000', popular: false },
    { label: '₦2M', min: 2000000, daily: '₦26,000', monthly: '₦780,000', popular: false },
    { label: '₦3M+', min: 3000000, daily: '₦39,000+', monthly: '₦1.17M+', popular: false },
  ];

  const faqs = [
    { q: 'How does Arbalist Capital generate returns?', a: 'We leverage data-driven sports analytics and expert market knowledge to identify value in sports betting markets globally, generating consistent returns that we share with investors.' },
    { q: 'What is the minimum investment amount?', a: 'Our minimum investment starts at ₦50,500. We offer tiered plans to suit different investment capacities and goals.' },
    { q: 'How often are returns paid?', a: 'Returns accrue daily at 1.3% and are added to your wallet balance in real-time. You can withdraw at any time once your KYC is verified.' },
    { q: 'How do I withdraw my earnings?', a: 'Withdrawals are processed directly to your verified Nigerian bank account within 24 hours. The minimum withdrawal amount is ₦500.' },
    { q: 'Is my investment safe?', a: 'We employ strict risk management protocols. However, as with all investments, there are inherent risks. We strongly advise only investing amounts you are comfortable with.' },
    { q: 'What is KYC and why is it required?', a: 'Know Your Customer (KYC) verification is a regulatory requirement to prevent fraud and ensure security. It involves verifying your identity (NIN) and bank account details for withdrawal processing.' },
  ];

  return (
    <div className="min-h-screen bg-dark-800 text-white font-sans">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-800/95 backdrop-blur-xl border-b border-lime-400/10 shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="font-bold font-serif text-lg text-white">Arbalist Capital</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="text-sm text-gray-400 hover:text-lime-400 transition-colors font-medium">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onLogin} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-lime-400 transition-colors px-4 py-2 rounded-lg hover:bg-lime-400/10">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button onClick={onRegister} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-dark-800 font-bold text-sm px-5 py-2.5 rounded-xl transition-all">
              <UserPlus className="w-4 h-4" /> Get Started
            </button>
          </div>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-700/95 backdrop-blur-xl border-t border-lime-400/10 px-4 py-4 space-y-3">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-gray-300 hover:text-lime-400 transition-colors py-2">{l.label}</a>
            ))}
            <div className="pt-3 border-t border-lime-400/10 space-y-2">
              <button onClick={onLogin} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-300 border border-lime-400/20 py-3 rounded-xl hover:bg-lime-400/10 transition-all">
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button onClick={onRegister} className="w-full flex items-center justify-center gap-2 bg-lime-400 text-dark-800 font-bold text-sm py-3 rounded-xl transition-all">
                <UserPlus className="w-4 h-4" /> Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 via-transparent to-emerald-400/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-lime-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/5 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-4 py-2 mb-6 text-sm text-lime-400 font-semibold">
            <Activity className="w-4 h-4" />
            1.3% Daily Returns • Verified by thousands of investors
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-serif text-white leading-tight mb-6">
            Invest Smarter.<br />
            <span className="text-lime-400">Earn Daily.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join Arbalist Capital — Nigeria's premier sports investment platform delivering consistent 1.3% daily returns through data-driven sports analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onRegister}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-dark-800 font-black text-lg px-8 py-4 rounded-2xl transition-all shadow-lg shadow-lime-400/25">
              Start Investing Now <ArrowRight className="w-5 h-5" />
            </button>
            <a href={`${WA_BASE}?text=Hello%2C%20I%20want%20to%20learn%20more%20about%20Arbalist%20Capital`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-lime-400/30 text-lime-400 hover:bg-lime-400/10 font-bold text-lg px-8 py-4 rounded-2xl transition-all">
              <WhatsAppIcon className="w-5 h-5" /> Talk to Us
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12">
            {[['10,000+', 'Active Investors'], ['1.3%', 'Daily Return'], ['₦500M+', 'Total Paid Out'], ['24/7', 'Support']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-lime-400">{val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-dark-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-serif text-white mb-4">Why Choose Arbalist?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">We combine cutting-edge analytics with transparent operations to maximize your returns.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Consistent Returns', desc: '1.3% daily returns powered by our proven sports analytics system. Real-time ROI tracking in your dashboard.' },
              { icon: <Shield className="w-6 h-6" />, title: 'Bank-Level Security', desc: 'KYC verification, 256-bit SSL encryption, and multi-factor authentication protect your account and funds.' },
              { icon: <Activity className="w-6 h-6" />, title: 'Live Portfolio Tracker', desc: 'Watch your money grow in real-time. Our live counter shows earnings accumulating second by second.' },
              { icon: <Users className="w-6 h-6" />, title: 'Referral Program', desc: 'Earn ₦500 instantly for every friend you refer. Unlimited referrals, unlimited earnings.' },
              { icon: <Clock className="w-6 h-6" />, title: 'Fast Withdrawals', desc: 'Request withdrawals anytime. Funds processed directly to your verified bank account within 24 hours.' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Multiple Plans', desc: 'Investment tiers from ₦50.5K to ₦5M+. Scale your portfolio as your confidence grows.' },
            ].map(f => (
              <div key={f.title} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 hover:border-lime-400/30 transition-all">
                <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400 mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-serif text-white mb-4">Get Started in Minutes</h2>
            <p className="text-gray-400">Four simple steps to start earning daily returns.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Account', desc: 'Register with your email and phone number in under 2 minutes.' },
              { step: '02', title: 'Verify KYC', desc: 'Submit your NIN and bank details for compliance verification.' },
              { step: '03', title: 'Fund & Invest', desc: 'Pay securely via Paystack. Choose your preferred investment plan.' },
              { step: '04', title: 'Earn Daily', desc: 'Watch your 1.3% daily returns accumulate in real-time on your dashboard.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="text-center">
                  <div className="w-14 h-14 bg-lime-400 text-dark-800 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">{s.step}</div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-lime-400/40 to-transparent -translate-y-1/2" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="py-20 px-4 bg-dark-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-serif text-white mb-4">Investment Plans</h2>
            <p className="text-gray-400">All plans earn 1.3% daily. Choose the amount that works for you.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.label} className={`relative rounded-2xl p-6 border transition-all hover:scale-105 ${p.popular ? 'bg-lime-400/10 border-lime-400/40' : 'bg-dark-600/40 border-lime-400/10 hover:border-lime-400/30'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-dark-800 text-xs font-black px-3 py-1 rounded-full">MOST POPULAR</div>}
                <div className="text-3xl font-black font-serif text-white mb-1">{p.label}</div>
                <div className="text-sm text-gray-400 mb-4">Minimum Investment</div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Daily Returns</span>
                    <span className="text-lime-400 font-bold">{p.daily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Monthly (~30 days)</span>
                    <span className="text-lime-400 font-bold">{p.monthly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Daily Rate</span>
                    <span className="font-bold text-white">1.3%</span>
                  </div>
                </div>
                <button onClick={onRegister}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${p.popular ? 'bg-lime-400 text-dark-800 hover:bg-lime-300' : 'border border-lime-400/30 text-lime-400 hover:bg-lime-400/10'}`}>
                  Start with {p.label}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href={`${WA_BASE}?text=I%20want%20to%20invest%20more%20than%20%E2%82%A65M%20with%20Arbalist%20Capital`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:text-lime-300 transition-colors">
              <WhatsAppIcon className="w-4 h-4" /> Interested in investing ₦5M+? Contact us directly
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-serif text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-dark-600/40 border border-lime-400/10 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-white pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-lime-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-lime-400/10 via-lime-400/5 to-emerald-400/10 border-y border-lime-400/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black font-serif text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-400 mb-8">Join 10,000+ investors already earning 1.3% daily with Arbalist Capital.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onRegister}
              className="flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-dark-800 font-black text-lg px-8 py-4 rounded-2xl transition-all">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onLogin}
              className="flex items-center justify-center gap-2 border border-lime-400/30 text-lime-400 hover:bg-lime-400/10 font-bold text-lg px-8 py-4 rounded-2xl transition-all">
              <LogIn className="w-5 h-5" /> Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark-700/30 border-t border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <a href="#" className="flex items-center gap-3"><BrandLogo size="md" /></a>
              <p className="mt-6 text-gray-400 leading-relaxed max-w-md text-sm">
                Arbalist Capital is a premium sports betting investment platform. We combine cutting-edge analytics with expert sports knowledge to deliver consistent 1.3% daily returns for our investors.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={WA_BASE} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all w-fit">
                  <WhatsAppIcon className="w-4 h-4" /> +234 905 441 6277
                </a>
                <a href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/20 text-lime-400 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all w-fit">
                  <Mail className="w-4 h-4" /> {EMAIL}
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-lime-400 tracking-widest uppercase mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {navLinks.map(l => <li key={l.label}><a href={l.href} className="text-gray-400 hover:text-lime-400 transition-colors text-sm">{l.label}</a></li>)}
                <li><button onClick={onLogin} className="text-gray-400 hover:text-lime-400 transition-colors text-sm text-left">Sign In</button></li>
                <li><button onClick={onRegister} className="text-gray-400 hover:text-lime-400 transition-colors text-sm text-left">Register</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-lime-400 tracking-widest uppercase mb-5">Sports</h4>
              <ul className="space-y-3">
                {sports.slice(0, 6).map(s => <li key={s.name}><span className="text-gray-400 text-sm flex items-center gap-2"><span>{s.emoji}</span> {s.name}</span></li>)}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-lime-400/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Arbalist Capital. All rights reserved.</p>
            <p className="text-xs text-gray-600 max-w-lg text-center md:text-right">
              Disclaimer: Sports betting investments carry risk. Past performance does not guarantee future results. Only invest what you can afford to lose. Must be 18+ to participate.
            </p>
          </div>
        </div>
      </footer>
      <WhatsAppFAB />
    </div>
  );
}
