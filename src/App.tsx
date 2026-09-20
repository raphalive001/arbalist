import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  TrendingUp,
  Shield,
  BarChart3,
  Globe,
  Users,
  Target,
  Award,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Mail,
  MessageCircle,
  Lock,
  LineChart,
  Clock,
  Star,
  Activity,
} from 'lucide-react';

/* ─── Constants ─── */
const WA_NUMBER = '2349054416277';
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const EMAIL = 'arbalistcapitalinvesting@gmail.com';
const LOGO_SRC = '/logo.png';

/* ─── WhatsApp SVG Icon ─── */
const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ─── Brand Logo Component ─── */
const BrandLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-8', md: 'h-10', lg: 'h-14' };
  return (
    <img
      src={LOGO_SRC}
      alt="Arbalist Capital"
      className={`${sizes[size]} w-auto object-contain drop-shadow-lg`}
    />
  );
};

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated Counter ─── */
function Counter({ end, suffix = '', prefix = '', duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Section Wrapper ─── */
function Section({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useInView();
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── Live Odds Ticker ─── */
function LiveOddsTicker() {
  const matches = [
    { teams: 'Man City vs Arsenal', odds: '2.10', sport: '⚽' },
    { teams: 'Lakers vs Celtics', odds: '1.85', sport: '🏀' },
    { teams: 'Djokovic vs Alcaraz', odds: '1.72', sport: '🎾' },
    { teams: 'Chiefs vs Eagles', odds: '1.95', sport: '🏈' },
    { teams: 'Real Madrid vs Bayern', odds: '2.35', sport: '⚽' },
    { teams: 'Yankees vs Dodgers', odds: '2.05', sport: '⚾' },
    { teams: 'PSG vs Inter Milan', odds: '1.90', sport: '⚽' },
    { teams: 'Fury vs Usyk', odds: '2.50', sport: '🥊' },
  ];
  return (
    <div className="bg-dark-700/80 border-y border-lime-400/10 overflow-hidden py-3">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...matches, ...matches].map((m, i) => (
          <div key={i} className="inline-flex items-center gap-3 mx-8">
            <span className="text-base">{m.sport}</span>
            <span className="text-sm text-gray-400">{m.teams}</span>
            <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded">{m.odds}</span>
            <span className="text-lime-400/30">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── WhatsApp FAB ─── */
function WhatsAppFAB() {
  return (
    <a
      href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20start%20investing%20in%20sports%20betting.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-5 py-3.5 rounded-full shadow-2xl animate-pulse-glow transition-all duration-300 hover:scale-105"
      aria-label="Contact us on WhatsApp"
    >
      <WhatsAppIcon className="w-7 h-7" />
      <span className="hidden sm:inline">Chat with Us</span>
    </a>
  );
}

/* ─── Investment Plans Data (from image) ─── */
const plans = [
  { deposit: '₦50.5K',  depositFull: '50,500',  daily: '₦656.50',   d7: '₦4,595.50',   d30: '₦19,735.50',   d90: '₦59,206.50',   popular: false },
  { deposit: '₦100.5K', depositFull: '100,500', daily: '₦1,306.50',  d7: '₦9,145.50',   d30: '₦39,271.50',   d90: '₦117,814.50',  popular: false },
  { deposit: '₦200.5K', depositFull: '200,500', daily: '₦2,606.50',  d7: '₦18,245.50',  d30: '₦78,271.50',   d90: '₦235,014.50',  popular: false },
  { deposit: '₦300.5K', depositFull: '300,500', daily: '₦3,906.50',  d7: '₦27,345.50',  d30: '₦117,271.50',  d90: '₦352,214.50',  popular: true  },
  { deposit: '₦400.5K', depositFull: '400,500', daily: '₦5,206.50',  d7: '₦36,445.50',  d30: '₦156,271.50',  d90: '₦469,414.50',  popular: false },
  { deposit: '₦500.5K', depositFull: '500,500', daily: '₦6,506.50',  d7: '₦45,545.50',  d30: '₦195,271.50',  d90: '₦586,614.50',  popular: false },
];

/* ─── All Plans Data (from image) ─── */
const allPlansData = [
  { deposit: '₦50.5K',  depositFull: '50,500',    daily: '₦656.50',   d7: '₦4,595.50',    d30: '₦19,735.50',    d90: '₦59,206.50'    },
  { deposit: '₦100.5K', depositFull: '100,500',   daily: '₦1,306.50',  d7: '₦9,145.50',    d30: '₦39,271.50',    d90: '₦117,814.50'   },
  { deposit: '₦200.5K', depositFull: '200,500',   daily: '₦2,606.50',  d7: '₦18,245.50',   d30: '₦78,271.50',    d90: '₦235,014.50'   },
  { deposit: '₦300.5K', depositFull: '300,500',   daily: '₦3,906.50',  d7: '₦27,345.50',   d30: '₦117,271.50',   d90: '₦352,214.50'   },
  { deposit: '₦400.5K', depositFull: '400,500',   daily: '₦5,206.50',  d7: '₦36,445.50',   d30: '₦156,271.50',   d90: '₦469,414.50'   },
  { deposit: '₦500.5K', depositFull: '500,500',   daily: '₦6,506.50',  d7: '₦45,545.50',   d30: '₦195,271.50',   d90: '₦586,614.50'   },
  { deposit: '₦1M',     depositFull: '1,000,000', daily: '₦13,006.50', d7: '₦91,045.50',   d30: '₦390,271.50',   d90: '₦1,171,814.50' },
  { deposit: '₦2M',     depositFull: '2,000,000', daily: '₦26,006.50', d7: '₦182,045.50',  d30: '₦780,271.50',   d90: '₦2,341,814.50' },
  { deposit: '₦3M',     depositFull: '3,000,000', daily: '₦39,006.50', d7: '₦273,045.50',  d30: '₦1,170,271.50', d90: '₦3,511,814.50' },
  { deposit: '₦4M',     depositFull: '4,000,000', daily: '₦52,006.50', d7: '₦364,045.50',  d30: '₦1,560,271.50', d90: '₦4,681,814.50' },
  { deposit: '₦5M',     depositFull: '5,000,000', daily: '₦65,006.50', d7: '₦455,045.50',  d30: '₦1,950,271.50', d90: '₦5,851,814.50' },
];

/* ─── All Plans Page ─── */
function AllPlansPage() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  return (
    <div className="bg-dark-800 text-white min-h-screen font-sans">
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-xl border-b border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-3 group">
            <BrandLogo size="md" />
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-lime-400 transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-lime-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>
          <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Full Earnings Table</span>
          <h1 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
            All Investment{' '}
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Plans</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg leading-relaxed">
            All plans earn <span className="text-lime-400 font-bold">1.3% daily</span>. Choose your deposit and start earning immediately.
          </p>
        </div>
      </section>

      {/* TABLE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Desktop */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-lime-400/10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-lime-400/10 border-b border-lime-400/20">
                <th className="px-5 py-4 text-left text-xs font-bold text-lime-400 tracking-widest uppercase">Deposit Amount (₦)</th>
                <th className="px-5 py-4 text-right text-xs font-bold text-lime-400 tracking-widest uppercase">Daily (1.3%)</th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-300 tracking-widest uppercase">7 Days</th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-300 tracking-widest uppercase">30 Days</th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-300 tracking-widest uppercase">90 Days</th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 tracking-widest uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {allPlansData.map((plan, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => setSelectedRow(i)}
                  onMouseLeave={() => setSelectedRow(null)}
                  className={`border-b border-lime-400/5 transition-all duration-200 ${
                    selectedRow === i ? 'bg-lime-400/5' : i % 2 === 0 ? 'bg-dark-700/20' : 'bg-transparent'
                  }`}
                >
                  <td className="px-5 py-4"><span className="text-base font-bold text-white">{plan.deposit}</span></td>
                  <td className="px-5 py-4 text-right"><span className="text-sm font-bold text-lime-400">{plan.daily}</span></td>
                  <td className="px-5 py-4 text-right"><span className="text-sm text-gray-300">{plan.d7}</span></td>
                  <td className="px-5 py-4 text-right"><span className="text-sm text-gray-300">{plan.d30}</span></td>
                  <td className="px-5 py-4 text-right"><span className="text-sm font-semibold text-white">{plan.d90}</span></td>
                  <td className="px-5 py-4 text-center">
                    <a
                      href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20invest%20%E2%82%A6${plan.depositFull}.`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-semibold text-xs px-4 py-2 rounded-lg transition-all"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      Invest
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {allPlansData.map((plan, i) => (
            <div key={i} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-black text-white">{plan.deposit}</span>
                <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full">{plan.daily}/day</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center bg-dark-700/60 rounded-xl py-2.5">
                  <p className="text-xs text-gray-500 mb-1">7 Days</p>
                  <p className="text-xs font-semibold text-gray-200">{plan.d7}</p>
                </div>
                <div className="text-center bg-dark-700/60 rounded-xl py-2.5">
                  <p className="text-xs text-gray-500 mb-1">30 Days</p>
                  <p className="text-xs font-semibold text-gray-200">{plan.d30}</p>
                </div>
                <div className="text-center bg-lime-400/5 border border-lime-400/10 rounded-xl py-2.5">
                  <p className="text-xs text-gray-500 mb-1">90 Days</p>
                  <p className="text-xs font-bold text-lime-400">{plan.d90}</p>
                </div>
              </div>
              <a
                href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20invest%20%E2%82%A6${plan.depositFull}.`}
                target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Invest on WhatsApp
              </a>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-dark-600/40 border border-lime-400/10 rounded-2xl p-10">
          <h2 className="text-2xl font-bold font-serif mb-3">Have Questions?</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">Our team is available 24/7 on WhatsApp and email.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20learn%20more%20about%20your%20investment%20plans.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-3 border border-lime-400/20 text-lime-400 font-bold px-8 py-4 rounded-xl hover:bg-lime-400/10 transition-all"
            >
              <Mail className="w-5 h-5" />
              {EMAIL}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-lime-400/10 py-8 text-center">
        <div className="flex justify-center mb-4"><BrandLogo size="sm" /></div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Arbalist Capital. All rights reserved.</p>
        <p className="text-xs text-gray-600 mt-2 max-w-lg mx-auto px-4">
          Investment involves risk. Earnings are based on a 1.3% daily rate. Past performance does not guarantee future results.
        </p>
      </footer>
      <WhatsAppFAB />
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState(3);
  const [showAllPlans, setShowAllPlans] = useState(
    () => window.location.pathname === '/plans'
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Router: listen for browser back/forward navigation
  useEffect(() => {
    const checkPath = () => setShowAllPlans(window.location.pathname === '/plans');
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // Intercept anchor clicks for SPA routing
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '/plans' || href === '/') {
        e.preventDefault();
        window.history.pushState({}, '', href);
        setShowAllPlans(href === '/plans');
        window.scrollTo(0, 0);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (showAllPlans) return <AllPlansPage />;

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Performance', href: '#performance' },
    { label: 'Plans', href: '#plans' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const stats = [
    { value: 92, suffix: '%', prefix: '', label: 'Win Rate', icon: <Target className="w-5 h-5" /> },
    { value: 15, suffix: 'K+', prefix: '', label: 'Active Investors', icon: <Users className="w-5 h-5" /> },
    { value: 4.2, suffix: 'M+', prefix: '₦', label: 'Paid Out', icon: <TrendingUp className="w-5 h-5" /> },
    { value: 3, suffix: ' Years', prefix: '', label: 'Track Record', icon: <Clock className="w-5 h-5" /> },
  ];

  const howItWorks = [
    { step: '01', icon: <MessageCircle className="w-8 h-8" />, title: 'Contact Us', desc: 'Reach out via WhatsApp to speak with our team. We\'ll understand your goals and risk appetite.' },
    { step: '02', icon: <TrendingUp className="w-8 h-8" />, title: 'Choose Your Plan', desc: 'Select an investment plan that matches your budget. Start with as little as ₦50,500.' },
    { step: '03', icon: <LineChart className="w-8 h-8" />, title: 'We Place Strategic Bets', desc: 'Our analysts use proprietary algorithms and deep sports knowledge to identify high-value opportunities.' },
    { step: '04', icon: <TrendingUp className="w-8 h-8" />, title: 'Earn Daily Returns', desc: 'Watch your portfolio grow at 1.3% daily. Withdraw your profits anytime — no lock-ins, no hidden fees.' },
  ];

  const sports = [
    { name: 'Football', emoji: '⚽', winRate: '94%', events: '200+/week' },
    { name: 'Basketball', emoji: '🏀', winRate: '91%', events: '150+/week' },
    { name: 'Tennis', emoji: '🎾', winRate: '89%', events: '180+/week' },
    { name: 'American Football', emoji: '🏈', winRate: '93%', events: '50+/week' },
    { name: 'Boxing / MMA', emoji: '🥊', winRate: '90%', events: '30+/week' },
    { name: 'Baseball', emoji: '⚾', winRate: '88%', events: '120+/week' },
  ];

  const testimonials = [
    { name: 'Marcus T.', location: 'London, UK', text: 'I was skeptical at first, but Arbalist Capital turned my ₦500K into ₦2.8M in just 3 months. Their team is transparent and professional.', rating: 5, profit: '+460%' },
    { name: 'Sofia R.', location: 'Dubai, UAE', text: 'The daily reports keep me informed and the returns are incredible. I\'ve never seen such consistent results in sports investing.', rating: 5, profit: '+320%' },
    { name: 'James K.', location: 'New York, USA', text: 'Best decision I made this year. The higher plans give me access to opportunities I didn\'t even know existed. Highly recommend.', rating: 5, profit: '+580%' },
    { name: 'Amara O.', location: 'Lagos, Nigeria', text: 'Withdrawals are fast and the WhatsApp support is always responsive. Arbalist Capital is the real deal for sports investment.', rating: 5, profit: '+290%' },
  ];

  const faqs = [
    { q: 'How does sports betting investment work?', a: 'We pool investor funds and use advanced statistical models, AI algorithms, and expert analysts to place strategic bets across multiple sports. Profits are distributed daily to investors at 1.3% per day based on their deposit.' },
    { q: 'What is the minimum investment?', a: 'You can start with as little as ₦50,500 on our entry plan. Higher deposit amounts yield larger daily returns.' },
    { q: 'How and when can I withdraw my profits?', a: 'You can request withdrawals anytime via WhatsApp. We process all withdrawal requests within 24 hours with no hidden fees.' },
    { q: 'Is my investment protected?', a: 'We employ strict bankroll management and risk mitigation strategies. We never risk more than 5% of the pool on any single event.' },
    { q: 'Which sports do you cover?', a: 'We cover Football (Soccer), Basketball, Tennis, American Football, Boxing/MMA, Baseball, and more. Our analysts specialize in major leagues worldwide.' },
    { q: 'How do I get started?', a: 'Simply click the WhatsApp button on this page to connect with our team. We\'ll guide you through the onboarding process in minutes.' },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const recentWins = [
    { match: 'Man City vs Chelsea', result: 'Over 2.5 Goals', odds: '1.85', status: 'won' },
    { match: 'Lakers vs Warriors', result: 'Lakers -3.5', odds: '1.92', status: 'won' },
    { match: 'Nadal vs Sinner', result: 'Sinner ML', odds: '1.65', status: 'won' },
    { match: 'Chiefs vs 49ers', result: 'Chiefs ML', odds: '2.10', status: 'won' },
    { match: 'Barcelona vs Atletico', result: 'BTTS', odds: '1.75', status: 'won' },
    { match: 'Celtics vs Bucks', result: 'Over 220.5', odds: '1.88', status: 'won' },
  ];

  return (
    <div className="bg-dark-800 text-white min-h-screen font-sans">
      {/* ──── NAVBAR ──── */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? 'bg-dark-800/95 backdrop-blur-xl shadow-2xl shadow-black/40 border-b border-lime-400/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <BrandLogo size="md" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-gray-400 hover:text-lime-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-lime-400 after:transition-all hover:after:w-full">
                {l.label}
              </a>
            ))}
            <a
              href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20start%20investing.`}
              target="_blank" rel="noopener noreferrer"
              className="ml-2 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold text-sm px-6 py-2.5 rounded-lg hover:from-lime-300 hover:to-lime-400 transition-all shadow-lg shadow-lime-400/20"
            >
              Start Investing
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-dark-800/98 backdrop-blur-xl border-t border-lime-400/10 animate-fade-in">
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-gray-300 hover:text-lime-400 transition-colors py-2">
                  {l.label}
                </a>
              ))}
              <a
                href={`${WA_BASE}`}
                target="_blank" rel="noopener noreferrer"
                className="block mt-4 text-center bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold text-sm px-5 py-3 rounded-lg"
              >
                Start Investing
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ──── HERO ──── */}
      <header className="relative min-h-screen flex items-center overflow-hidden bg-grid">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/30651230/pexels-photo-30651230.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1920"
            alt="Stadium"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-800/95 to-dark-800/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-transparent to-dark-800/60" />
        </div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/6 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="animate-fade-in-up mb-8 flex">
                <BrandLogo size="lg" />
              </div>
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-4 py-1.5 mb-8">
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                  <span className="text-lime-400 text-sm font-semibold tracking-wider uppercase">Live Sports Betting Investment</span>
                </div>
              </div>
              <h1 className="animate-fade-in-up delay-200 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] font-serif">
                Turn Sports Into{' '}
                <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 bg-clip-text text-transparent animate-neon-pulse">
                  Profit
                </span>
              </h1>
              <p className="animate-fade-in-up delay-300 mt-8 text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed">
                Arbalist Capital combines AI-powered analytics with expert sports knowledge to deliver consistent
                <span className="text-lime-400 font-bold"> 1.3% daily returns</span> on sports betting investments. Join thousands of investors earning daily.
              </p>
              <div className="animate-fade-in-up delay-400 mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20start%20investing%20in%20sports%20betting.`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold text-base px-8 py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all shadow-xl shadow-lime-400/20 hover:-translate-y-0.5"
                >
                  <WhatsAppIcon className="w-6 h-6" />
                  Start on WhatsApp
                </a>
                <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 border-2 border-gray-600/40 text-white font-semibold text-base px-8 py-4 rounded-xl hover:border-lime-400/40 hover:text-lime-400 transition-all">
                  How It Works
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <div className="animate-fade-in-up delay-600 mt-10 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-400"><Shield className="w-4 h-4 text-lime-400" /><span>Secured Funds</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><Clock className="w-4 h-4 text-lime-400" /><span>24h Withdrawals</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><Lock className="w-4 h-4 text-lime-400" /><span>No Lock-in Period</span></div>
              </div>
            </div>

            {/* Right - Live Results */}
            <div className="animate-fade-in-up delay-500 hidden lg:block">
              <div className="bg-dark-600/60 backdrop-blur-xl border border-lime-400/10 rounded-2xl p-6 animate-border-glow">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-lime-400" />
                    <span className="text-sm font-bold text-lime-400 uppercase tracking-wider">Recent Wins</span>
                  </div>
                  <div className="flex items-center gap-1 bg-lime-400/10 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                    <span className="text-xs text-lime-400 font-semibold">LIVE</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {recentWins.map((w, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-3 border border-dark-50/10">
                      <div>
                        <p className="text-sm font-medium text-white">{w.match}</p>
                        <p className="text-xs text-gray-400">{w.result}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-lime-400">@{w.odds}</p>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-lime-400" />
                          <span className="text-xs text-lime-400 font-semibold uppercase">Won</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-dark-50/10 text-center">
                  <span className="text-sm text-gray-400">Today's Record: </span>
                  <span className="text-sm font-bold text-lime-400">6/6 Wins ✅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-lime-400/50" />
        </div>
      </header>

      {/* ──── LIVE TICKER ──── */}
      <LiveOddsTicker />

      {/* ──── STATS ──── */}
      <Section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-dark-600/40 border border-lime-400/5 rounded-2xl p-6 text-center hover:border-lime-400/20 transition-all duration-300 glow-card">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-lime-400/10 text-lime-400 mb-3">{s.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold font-serif text-white">
                  <Counter end={s.value} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <p className="mt-1 text-sm text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──── HOW IT WORKS ──── */}
      <Section id="how-it-works" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Getting Started</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">How <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">It Works</span></h2>
            <p className="mt-6 text-gray-400 text-lg">Start earning from sports in 4 simple steps. No experience required — our experts handle everything.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative group bg-dark-600/40 border border-lime-400/5 hover:border-lime-400/20 rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 glow-card">
                <div className="absolute -top-4 -right-2 text-6xl font-black text-lime-400/5 font-serif">{step.step}</div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lime-400/10 to-lime-400/5 flex items-center justify-center text-lime-400 group-hover:from-lime-400 group-hover:to-lime-500 group-hover:text-dark-800 transition-all duration-500 mb-6">{step.icon}</div>
                <h3 className="text-xl font-bold font-serif text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{step.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 text-lime-400/20"><ArrowRight className="w-6 h-6" /></div>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──── SPORTS COVERAGE ──── */}
      <Section className="py-24 lg:py-32 bg-gradient-to-b from-dark-800 via-dark-700/20 to-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Markets We Cover</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">Sports <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Coverage</span></h2>
            <p className="mt-6 text-gray-400 text-lg">We analyze and invest across the world's biggest sporting events and leagues.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {sports.map((sport, i) => (
              <div key={i} className="group bg-dark-600/40 border border-lime-400/5 hover:border-lime-400/20 rounded-2xl p-6 lg:p-8 text-center transition-all duration-500 hover:-translate-y-1 glow-card">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{sport.emoji}</div>
                <h3 className="text-lg font-bold text-white font-serif">{sport.name}</h3>
                <div className="mt-3 flex justify-center gap-4">
                  <div><p className="text-xl font-bold text-lime-400">{sport.winRate}</p><p className="text-xs text-gray-500">Win Rate</p></div>
                  <div className="w-px bg-dark-50/20" />
                  <div><p className="text-xl font-bold text-white">{sport.events}</p><p className="text-xs text-gray-500">Events</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──── PERFORMANCE ──── */}
      <Section id="performance" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Track Record</span>
              <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif leading-tight">Proven <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Performance</span></h2>
              <p className="mt-6 text-gray-300 text-lg leading-relaxed">Our track record speaks for itself. Consistent 1.3% daily returns powered by data-driven strategies and decades of combined expertise in sports analytics.</p>
              <div className="mt-10 space-y-6">
                {[
                  { label: 'January 2025', value: 92, return: '+38.2%' },
                  { label: 'February 2025', value: 88, return: '+34.5%' },
                  { label: 'March 2025', value: 95, return: '+42.1%' },
                  { label: 'April 2025', value: 90, return: '+36.8%' },
                  { label: 'May 2025', value: 94, return: '+41.3%' },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">{p.label}</span>
                      <span className="text-sm font-bold text-lime-400">{p.return}</span>
                    </div>
                    <div className="h-2.5 bg-dark-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${p.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Target className="w-8 h-8" />, title: 'Hit Rate', value: '92%', desc: 'Winning predictions' },
                { icon: <TrendingUp className="w-8 h-8" />, title: 'Daily ROI', value: '1.3%', desc: 'Guaranteed daily return' },
                { icon: <Shield className="w-8 h-8" />, title: 'Risk Score', value: 'Low', desc: 'Bankroll management' },
                { icon: <Globe className="w-8 h-8" />, title: 'Leagues', value: '50+', desc: 'Worldwide coverage' },
                { icon: <BarChart3 className="w-8 h-8" />, title: 'Daily Picks', value: '15+', desc: 'Curated selections' },
                { icon: <Award className="w-8 h-8" />, title: 'Best Month', value: '+42%', desc: 'Peak returns' },
              ].map((card, i) => (
                <div key={i} className="bg-dark-600/40 border border-lime-400/5 rounded-2xl p-5 text-center hover:border-lime-400/20 transition-all duration-300 glow-card">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-lime-400/10 text-lime-400 mb-3">{card.icon}</div>
                  <div className="text-2xl font-bold font-serif text-white">{card.value}</div>
                  <div className="text-sm font-semibold text-lime-400 mt-1">{card.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ──── PLANS ──── */}
      <Section id="plans" className="py-24 lg:py-32 bg-gradient-to-b from-dark-800 via-dark-700/20 to-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Investment Plans</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
              Choose Your <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Plan</span>
            </h2>
            <p className="mt-6 text-gray-400 text-lg">All plans earn <span className="text-lime-400 font-bold">1.3% daily</span>. Select your deposit amount and start earning immediately.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                onMouseEnter={() => setActivePlan(i)}
                className={`relative bg-dark-600/40 border rounded-2xl p-7 transition-all duration-500 ${
                  activePlan === i ? 'border-lime-400/30 shadow-2xl shadow-lime-400/10 -translate-y-2 scale-[1.02]' : 'border-lime-400/5 hover:border-lime-400/15'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lime-400 to-emerald-400 text-dark-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                    🔥 Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="mt-1">
                    <span className="text-3xl font-black text-white font-serif">{plan.deposit}</span>
                    <span className="text-xs text-gray-400 ml-2 block mt-1">deposit amount</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 bg-lime-400/10 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4 text-lime-400" />
                    <span className="text-sm font-bold text-lime-400">1.3% Daily</span>
                  </div>
                </div>
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-2.5">
                    <span className="text-xs text-gray-400">Daily Earnings</span>
                    <span className="text-sm font-bold text-lime-400">{plan.daily}</span>
                  </div>
                  <div className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-2.5">
                    <span className="text-xs text-gray-400">7-Day Reward</span>
                    <span className="text-sm font-bold text-white">{plan.d7}</span>
                  </div>
                  <div className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-2.5">
                    <span className="text-xs text-gray-400">30-Day Reward</span>
                    <span className="text-sm font-bold text-white">{plan.d30}</span>
                  </div>
                  <div className="flex items-center justify-between bg-lime-400/5 border border-lime-400/10 rounded-xl px-4 py-2.5">
                    <span className="text-xs text-gray-400">90-Day Reward</span>
                    <span className="text-sm font-black text-lime-400">{plan.d90}</span>
                  </div>
                </div>
                <a
                  href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20invest%20%E2%82%A6${plan.depositFull}.`}
                  target="_blank" rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 hover:from-lime-300 hover:to-lime-400 shadow-lg shadow-lime-400/20'
                      : 'bg-dark-400 border border-lime-400/10 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400/30'
                  }`}
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Get Started
                </a>
              </div>
            ))}
          </div>

          {/* View All Plans */}
          <div className="mt-12 text-center">
            <a
              href="/plans"
              className="inline-flex items-center gap-3 border-2 border-lime-400/30 text-lime-400 font-bold text-base px-10 py-4 rounded-xl hover:bg-lime-400/10 hover:border-lime-400/60 transition-all duration-300"
            >
              View All Plans
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="mt-3 text-sm text-gray-500">Plans from ₦50.5K to ₦5M available</p>
          </div>
        </div>
      </Section>

      {/* ──── TESTIMONIALS ──── */}
      <Section id="testimonials" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Testimonials</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
              What Our Investors <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-dark-600/40 border border-lime-400/5 hover:border-lime-400/15 rounded-2xl p-8 transition-all duration-300 glow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-lime-400 text-lime-400" />)}</div>
                  <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full">{t.profit}</span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-emerald-400 flex items-center justify-center text-dark-800 font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──── FAQ ──── */}
      <Section id="faq" className="py-24 lg:py-32 bg-gradient-to-b from-dark-800 via-dark-700/20 to-dark-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">FAQ</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
              Frequently Asked <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-dark-600/40 border rounded-xl transition-all duration-300 overflow-hidden ${openFaq === i ? 'border-lime-400/20' : 'border-lime-400/5'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="font-semibold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-lime-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ${openFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-6 text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──── CTA ──── */}
      <Section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-lime-400/10 via-lime-400/5 to-emerald-400/10 border border-lime-400/20 rounded-3xl p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-60 h-60 bg-lime-400/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <div className="flex justify-center mb-6"><BrandLogo size="lg" /></div>
              <h2 className="text-4xl lg:text-5xl font-bold font-serif mt-4">
                Ready to Start <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Earning?</span>
              </h2>
              <p className="mt-6 text-gray-300 text-lg max-w-2xl mx-auto">
                Join thousands of investors earning 1.3% daily from sports. Message us on WhatsApp to get started in minutes.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20start%20earning%20from%20sports%20betting%20investment.`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold text-lg px-10 py-5 rounded-xl transition-all shadow-xl shadow-green-500/20 hover:-translate-y-0.5"
                >
                  <WhatsAppIcon className="w-7 h-7" />
                  Message Us on WhatsApp
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center justify-center gap-3 border-2 border-lime-400/30 text-lime-400 font-bold text-lg px-10 py-5 rounded-xl hover:bg-lime-400/10 transition-all"
                >
                  <Mail className="w-6 h-6" />
                  Email Us
                </a>
              </div>
              <p className="mt-6 text-sm text-gray-500">💬 Average response time: Under 5 minutes</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ──── CONTACT ──── */}
      <Section id="contact" className="py-24 lg:py-32 bg-gradient-to-b from-dark-800 via-dark-700/20 to-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Contact</span>
              <h2 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
                Get In <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Touch</span>
              </h2>
              <p className="mt-6 text-gray-300 text-lg leading-relaxed">Have questions? Our team is available 24/7 on WhatsApp and email. We'll get back to you in minutes.</p>
              <div className="mt-10 space-y-4">
                <a
                  href={`${WA_BASE}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-5 rounded-xl bg-dark-600/40 border border-lime-400/5 hover:border-[#25D366]/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">WhatsApp (Preferred)</p>
                    <p className="text-sm text-gray-400">+234 905 441 6277 — 24/7 Support</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#25D366] ml-auto transition-colors" />
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-4 group p-5 rounded-xl bg-dark-600/40 border border-lime-400/5 hover:border-lime-400/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400 group-hover:bg-lime-400 group-hover:text-dark-800 transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-sm text-gray-400">{EMAIL}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-lime-400 ml-auto transition-colors" />
                </a>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-dark-600/40 border border-lime-400/5">
                  <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400"><Globe className="w-6 h-6" /></div>
                  <div>
                    <p className="font-semibold text-white">Global Operations</p>
                    <p className="text-sm text-gray-400">Serving investors in 40+ countries</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 p-6 rounded-xl bg-dark-600/40 border border-lime-400/5">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-lime-400" />
                  <span className="font-bold text-white">Our Guarantees</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['No hidden fees', '24h withdrawals', 'Capital protection', 'Transparent reporting'].map((g) => (
                    <div key={g} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime-400 flex-shrink-0" />
                      <span className="text-sm text-gray-400">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-8 lg:p-10">
              <h3 className="text-2xl font-bold font-serif mb-2">Send a Message</h3>
              <p className="text-sm text-gray-400 mb-6">We'll reach out to you on WhatsApp within minutes.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                  const plan = (form.elements.namedItem('plan') as HTMLSelectElement).value;
                  const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                  const text = encodeURIComponent(`Hello Arbalist Capital! My name is ${name}. I'm interested in the ${plan} plan. ${message}`);
                  window.open(`${WA_BASE}?text=${text}`, '_blank');
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input name="name" type="text" required className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input name="email" type="email" required className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all" placeholder={EMAIL} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investment Plan</label>
                  <select name="plan" className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all">
                    <option value="₦50.5K">₦50.5K — ₦656.50/day</option>
                    <option value="₦100.5K">₦100.5K — ₦1,306.50/day</option>
                    <option value="₦200.5K">₦200.5K — ₦2,606.50/day</option>
                    <option value="₦300.5K" selected>₦300.5K — ₦3,906.50/day</option>
                    <option value="₦400.5K">₦400.5K — ₦5,206.50/day</option>
                    <option value="₦500.5K">₦500.5K — ₦6,506.50/day</option>
                    <option value="₦1M">₦1M — ₦13,006.50/day</option>
                    <option value="₦2M">₦2M — ₦26,006.50/day</option>
                    <option value="₦3M">₦3M — ₦39,006.50/day</option>
                    <option value="₦4M">₦4M — ₦52,006.50/day</option>
                    <option value="₦5M">₦5M — ₦65,006.50/day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message (Optional)</label>
                  <textarea name="message" rows={3} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all resize-none" placeholder="Tell us about your investment goals..." />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 text-base">
                  <WhatsAppIcon className="w-5 h-5" />
                  Send via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </Section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-lime-400/10 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <a href="#" className="flex items-center gap-3">
                <BrandLogo size="md" />
              </a>
              <p className="mt-6 text-gray-400 leading-relaxed max-w-md text-sm">
                Arbalist Capital is a premium sports betting investment platform. We combine cutting-edge analytics with expert sports knowledge to deliver consistent 1.3% daily returns for our investors worldwide.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={`${WA_BASE}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all w-fit">
                  <WhatsAppIcon className="w-4 h-4" />
                  +234 905 441 6277
                </a>
                <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/20 text-lime-400 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all w-fit">
                  <Mail className="w-4 h-4" />
                  {EMAIL}
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-lime-400 tracking-widest uppercase mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {navLinks.map((l) => (
                  <li key={l.label}><a href={l.href} className="text-gray-400 hover:text-lime-400 transition-colors text-sm">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-lime-400 tracking-widest uppercase mb-5">Sports</h4>
              <ul className="space-y-3">
                {sports.slice(0, 6).map((s) => (
                  <li key={s.name}><span className="text-gray-400 text-sm flex items-center gap-2"><span>{s.emoji}</span> {s.name}</span></li>
                ))}
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
