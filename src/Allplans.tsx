import { useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Clock, Users, Zap, CheckCircle } from 'lucide-react';

const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const allPlans = [
  { deposit: '50,000',      daily: '650',      d7: '4,550',     d30: '19,500',     d90: '58,500' },
  { deposit: '100,000',     daily: '1,300',    d7: '9,100',     d30: '39,000',     d90: '117,000' },
  { deposit: '150,000',     daily: '1,950',    d7: '13,650',    d30: '58,500',     d90: '175,500' },
  { deposit: '200,000',     daily: '2,600',    d7: '18,200',    d30: '78,000',     d90: '234,000' },
  { deposit: '250,000',     daily: '3,250',    d7: '22,750',    d30: '97,500',     d90: '292,500' },
  { deposit: '300,000',     daily: '3,900',    d7: '27,300',    d30: '117,000',    d90: '351,000' },
  { deposit: '350,000',     daily: '4,550',    d7: '31,850',    d30: '136,500',    d90: '409,500' },
  { deposit: '400,000',     daily: '5,200',    d7: '36,400',    d30: '156,000',    d90: '468,000' },
  { deposit: '450,000',     daily: '5,850',    d7: '40,950',    d30: '175,500',    d90: '526,500' },
  { deposit: '500,000',     daily: '6,500',    d7: '45,500',    d30: '195,000',    d90: '585,000' },
  { deposit: '550,000',     daily: '7,150',    d7: '50,050',    d30: '214,500',    d90: '643,500' },
  { deposit: '600,000',     daily: '7,800',    d7: '54,600',    d30: '234,000',    d90: '702,000' },
  { deposit: '650,000',     daily: '8,450',    d7: '59,150',    d30: '253,500',    d90: '760,500' },
  { deposit: '700,000',     daily: '9,100',    d7: '63,700',    d30: '273,000',    d90: '819,000' },
  { deposit: '750,000',     daily: '9,750',    d7: '68,250',    d30: '292,500',    d90: '877,500' },
  { deposit: '800,000',     daily: '10,400',   d7: '72,800',    d30: '312,000',    d90: '936,000' },
  { deposit: '850,000',     daily: '11,050',   d7: '77,350',    d30: '331,500',    d90: '994,500' },
  { deposit: '900,000',     daily: '11,700',   d7: '81,900',    d30: '351,000',    d90: '1,053,000' },
  { deposit: '950,000',     daily: '12,350',   d7: '86,450',    d30: '370,500',    d90: '1,111,500' },
  { deposit: '1,000,000',   daily: '13,000',   d7: '91,000',    d30: '390,000',    d90: '1,170,000' },
  { deposit: '1,500,000',   daily: '19,500',   d7: '136,500',   d30: '585,000',    d90: '1,755,000' },
  { deposit: '2,000,000',   daily: '26,000',   d7: '182,000',   d30: '780,000',    d90: '2,340,000' },
  { deposit: '2,500,000',   daily: '32,500',   d7: '227,500',   d30: '975,000',    d90: '2,925,000' },
  { deposit: '3,000,000',   daily: '39,000',   d7: '273,000',   d30: '1,170,000',  d90: '3,510,000' },
  { deposit: '3,500,000',   daily: '45,500',   d7: '318,500',   d30: '1,365,000',  d90: '4,095,000' },
  { deposit: '4,000,000',   daily: '52,000',   d7: '364,000',   d30: '1,560,000',  d90: '4,680,000' },
  { deposit: '4,500,000',   daily: '58,500',   d7: '409,500',   d30: '1,755,000',  d90: '5,265,000' },
  { deposit: '5,000,000',   daily: '65,000',   d7: '455,000',   d30: '1,950,000',  d90: '5,850,000' },
];

export default function AllPlans() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const trustBadges = [
    { icon: <Shield className="w-5 h-5" />, label: 'Secure & Reliable' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Consistent Returns' },
    { icon: <Clock className="w-5 h-5" />, label: 'Daily Payouts' },
    { icon: <Users className="w-5 h-5" />, label: 'Open to Everyone' },
    { icon: <CheckCircle className="w-5 h-5" />, label: 'Transparent & Trusted' },
  ];

  return (
    <div className="bg-dark-800 text-white min-h-screen font-sans">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-xl border-b border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-600 rounded-lg flex items-center justify-center shadow-lg shadow-lime-400/20">
              <Zap className="w-6 h-6 text-dark-800" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide font-serif text-white group-hover:text-lime-400 transition-colors">ARBALIST</span>
              <span className="block text-[10px] tracking-[0.35em] text-lime-400 font-semibold -mt-1">CAPITAL</span>
            </div>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-lime-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-lime-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <span className="text-lime-400 font-semibold text-sm tracking-widest uppercase">Full Earnings Table</span>
          <h1 className="mt-4 text-4xl lg:text-5xl font-bold font-serif">
            All Investment{' '}
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Plans</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg leading-relaxed">
            All plans earn <span className="text-lime-400 font-bold">1.3% daily</span>. Choose any deposit amount and watch your returns grow.
            Tap any row to get started instantly on WhatsApp.
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-lime-400/10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-lime-400/10 border-b border-lime-400/20">
                <th className="px-6 py-5 text-left text-xs font-bold text-lime-400 tracking-widest uppercase">Deposit Amount ($)</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-lime-400 tracking-widest uppercase">Daily (1.3%)</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-300 tracking-widest uppercase">7 Days</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-300 tracking-widest uppercase">30 Days</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-300 tracking-widest uppercase">90 Days</th>
                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 tracking-widest uppercase">Action</th>
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
                    <span className="text-base font-bold text-white">${plan.deposit}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-lime-400">${plan.daily}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-300">${plan.d7}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-300">${plan.d30}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-white">${plan.d90}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <a
                      href={`https://wa.me/2347087521891?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20invest%20%24${plan.deposit}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/20 hover:border-lime-400/40 text-lime-400 font-semibold text-xs px-4 py-2 rounded-lg transition-all"
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
            <div
              key={i}
              className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5 hover:border-lime-400/25 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black text-white">${plan.deposit}</span>
                <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full">
                  ${plan.daily}/day
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-dark-700/60 rounded-xl py-2.5">
                  <p className="text-xs text-gray-500 mb-1">7 Days</p>
                  <p className="text-sm font-semibold text-gray-200">${plan.d7}</p>
                </div>
                <div className="text-center bg-dark-700/60 rounded-xl py-2.5">
                  <p className="text-xs text-gray-500 mb-1">30 Days</p>
                  <p className="text-sm font-semibold text-gray-200">${plan.d30}</p>
                </div>
                <div className="text-center bg-lime-400/5 border border-lime-400/10 rounded-xl py-2.5">
                  <p className="text-xs text-gray-500 mb-1">90 Days</p>
                  <p className="text-sm font-bold text-lime-400">${plan.d90}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/2347087521891?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20invest%20%24${plan.deposit}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-dark-400 border border-lime-400/10 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400/30 font-bold py-3 rounded-xl transition-all text-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Get Started on WhatsApp
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
            href="https://wa.me/2347087521891?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20learn%20more%20about%20your%20investment%20plans."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold text-base px-10 py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all shadow-xl shadow-lime-400/20"
          >
            <WhatsAppIcon className="w-6 h-6" />
            Chat with Us: +234 708 752 1891
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-lime-400/10 py-8 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Arbalist Capital. All rights reserved.
        </p>
        <p className="text-xs text-gray-600 mt-2 max-w-lg mx-auto px-4">
          Investment involves risk. Earnings are based on a 1.3% daily rate. Past performance does not guarantee future results.
        </p>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/2347087521891?text=Hello%20Arbalist%20Capital%2C%20I%20want%20to%20start%20investing."
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
