import { useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Clock, Users, CheckCircle } from 'lucide-react';

const WA_NUMBER = '2349054416277';
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const LOGO_SRC = '/logo.png';

const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── All 11 plans from the image (₦) ── */
const allPlans = [
  { deposit: '₦50.5K',  depositFull: '50,500',    daily: '₦656.50',    d7: '₦4,595.50',    d30: '₦19,735.50',    d90: '₦59,206.50'    },
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

/* ── First 6 shown on landing page ── */
export const landingPlans = allPlans.slice(0, 6).map((p, i) => ({ ...p, popular: i === 3 }));

const trustBadges = [
  { icon: <Shield className="w-5 h-5" />,      label: 'Secure & Reliable'     },
  { icon: <TrendingUp className="w-5 h-5" />,  label: 'Consistent Returns'    },
  { icon: <Clock className="w-5 h-5" />,       label: 'Daily Payouts'         },
  { icon: <Users className="w-5 h-5" />,       label: 'Open to Everyone'      },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Transparent & Trusted' },
];

export default function AllPlans() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  return (
    <div className="bg-dark-800 text-white min-h-screen font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-xl border-b border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-3 group">
            <img src={LOGO_SRC} alt="Arbalist Capital" className="h-10 w-auto object-contain drop-shadow-lg" />
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-lime-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-lime-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <img src={LOGO_SRC} alt="Arbalist Capital" className="h-14 w-auto object-contain drop-shadow-lg" />
          </div>
          <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Full Earnings Table</span>
          <h1 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
            All Investment{' '}
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Plans</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg leading-relaxed">
            All plans earn <span className="text-lime-400 font-bold">1.3% daily</span>. Choose any deposit amount and watch your returns grow.
            Tap <span className="text-white font-semibold">Invest</span> on any row to get started instantly on WhatsApp.
          </p>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-2 bg-dark-600/40 border border-lime-400/10 rounded-full px-5 py-2.5">
              <span className="text-lime-400">{b.icon}</span>
              <span className="text-sm font-semibold text-gray-300">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-lime-400/10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-lime-400/10 border-b border-lime-400/20">
                <th className="px-6 py-5 text-left   text-xs font-bold text-lime-400  tracking-widest uppercase">Deposit Amount (₦)</th>
                <th className="px-6 py-5 text-right  text-xs font-bold text-lime-400  tracking-widest uppercase">Daily (1.3%)</th>
                <th className="px-6 py-5 text-right  text-xs font-bold text-gray-300  tracking-widest uppercase">7 Days</th>
                <th className="px-6 py-5 text-right  text-xs font-bold text-gray-300  tracking-widest uppercase">30 Days</th>
                <th className="px-6 py-5 text-right  text-xs font-bold text-gray-300  tracking-widest uppercase">90 Days</th>
                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500  tracking-widest uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {allPlans.map((plan, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => setSelectedRow(i)}
                  onMouseLeave={() => setSelectedRow(null)}
                  className={`border-b border-lime-400/5 transition-all duration-200 cursor-pointer ${
                    selectedRow === i
                      ? 'bg-lime-400/5 border-lime-400/15'
                      : i % 2 === 0
                      ? 'bg-dark-700/20'
                      : 'bg-transparent'
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-base font-bold text-white">{plan.deposit}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-lime-400">{plan.daily}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-300">{plan.d7}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-300">{plan.d30}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-white">{plan.d90}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <a
                      href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20invest%20%E2%82%A6${plan.depositFull}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 hover:border-[#25D366]/40 text-[#25D366] font-semibold text-xs px-4 py-2 rounded-lg transition-all"
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
          {allPlans.map((plan, i) => (
            <div key={i} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5 hover:border-lime-400/25 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-black text-white">{plan.deposit}</span>
                <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full">
                  {plan.daily}/day
                </span>
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
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Invest on WhatsApp
              </a>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-dark-600/40 border border-lime-400/10 rounded-2xl p-10">
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-lime-400 text-sm font-semibold tracking-wider uppercase">Ready to Start?</span>
          </div>
          <h2 className="text-3xl font-bold font-serif mb-4">Have Questions About a Plan?</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Our team is available on WhatsApp 24/7. We'll help you choose the right plan for your goals.
          </p>
          <a
            href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20learn%20more%20about%20your%20investment%20plans.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold text-base px-10 py-4 rounded-xl transition-all shadow-xl shadow-green-500/20"
          >
            <WhatsAppIcon className="w-6 h-6" />
            Chat with Us: +234 905 441 6277
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-lime-400/10 py-8 text-center">
        <div className="flex justify-center mb-4">
          <img src={LOGO_SRC} alt="Arbalist Capital" className="h-8 w-auto object-contain opacity-70" />
        </div>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Arbalist Capital. All rights reserved.
        </p>
        <p className="text-xs text-gray-600 mt-2 max-w-lg mx-auto px-4">
          Investment involves risk. Earnings are based on a 1.3% daily rate. Past performance does not guarantee future results.
        </p>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20start%20investing.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
      >
        <WhatsAppIcon className="w-7 h-7" />
        <span className="hidden sm:inline">Chat with Us</span>
      </a>
    </div>
  );
}
