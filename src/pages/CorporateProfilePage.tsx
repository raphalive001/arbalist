import { Link } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';

export default function CorporateProfilePage() {
  return (
    <div className="min-h-screen bg-dark-800 text-gray-300">
      {/* NAV */}
      <nav className="border-b border-lime-400/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/"><BrandLogo size="md" /></Link>
          <Link to="/" className="text-sm text-gray-400 hover:text-lime-400 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-b from-lime-400/5 to-transparent border-b border-lime-400/10 py-14 px-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-lime-400 uppercase mb-3">Corporate Company Profile</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Arbalist Capital Trading &amp; Investment Platform</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">Disciplined Investing. Transparent Relationships. Responsible Growth.</p>
      </div>

      {/* CORPORATE DETAILS */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12 text-sm leading-relaxed">

        {/* Registration info */}
        <section className="grid sm:grid-cols-2 gap-6">
          {[
            { label: 'Registered Legal Name', value: 'ARBALIST CPITL INT\'E ENTERPRISE' },
            { label: 'Registration Number', value: 'RC: 9848883' },
            { label: 'Industry', value: 'Trading | Investment & Financial Services' },
            { label: 'Website', value: 'www.arbalistcapital.com.ng' },
            { label: 'Registered Office', value: 'No. 3, Lord\'s Chosen Street, Port Harcourt, Rivers State, Nigeria.' },
            { label: 'Customer Support', value: 'arbalistcapitalinvesting@gmail.com' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-dark-700/50 border border-lime-400/10 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-white font-medium">{value}</p>
            </div>
          ))}
        </section>

        {/* Company Overview */}
        <section>
          <h2 className="text-xl font-semibold text-lime-400 mb-4">Company Overview</h2>
          <p className="text-gray-400 mb-3"><strong className="text-white">ARBALIST CPITL INT'E ENTERPRISE (ACIE)</strong> is a private investment company built with one simple goal in mind: to help everyday people grow their money in a structured, organized, and transparent way.</p>
          <p className="text-gray-400">We understand that many people want to invest, but they don't know where to start, they don't have large capital, or they are afraid of losing their money to unorganized schemes. That is why ACIE was created — to give people a clear, simple, and well-managed way to put their money to work.</p>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="text-xl font-semibold text-lime-400 mb-4">What We Do</h2>
          <p className="text-gray-400 mb-4">We offer structured investment plans designed to suit different levels of investors — from beginners who are just starting out, to experienced investors who want to diversify their portfolio.</p>
          <p className="text-gray-400 mb-3">When you invest with us, you get:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>A clear investment plan with a defined duration</li>
            <li>Regular updates on how your investment is performing</li>
            <li>A dedicated support team to answer your questions</li>
            <li>Payouts processed as agreed in your investment terms</li>
          </ul>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-semibold text-lime-400 mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Transparency', desc: 'We believe you deserve to know what is happening with your money. We communicate openly with our investors.' },
              { title: 'Discipline', desc: 'We follow structure. No confusion, no last-minute changes.' },
              { title: 'Trust', desc: 'Your trust is our biggest asset. We work hard every day to protect it.' },
              { title: 'Growth', desc: 'Our focus is long-term, sustainable growth for both our investors and the company.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-dark-700/50 border border-lime-400/10 rounded-lg p-5">
                <p className="text-lime-400 font-semibold mb-2">{title}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid sm:grid-cols-2 gap-6">
          <div className="bg-dark-700/50 border border-lime-400/10 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Our Vision</h2>
            <p className="text-gray-400">To build a trusted African investment brand recognised for disciplined capital allocation, responsible risk management, transparency and long-term value creation.</p>
          </div>
          <div className="bg-dark-700/50 border border-lime-400/10 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Our Mission</h2>
            <p className="text-gray-400">To provide investors with well-structured investment solutions supported by research, clear communication, prudent risk controls and a strong commitment to protecting the integrity of the investment process.</p>
          </div>
        </section>

        {/* Investment Philosophy */}
        <section>
          <h2 className="text-xl font-semibold text-lime-400 mb-6">Our Investment Philosophy</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Capital Preservation', desc: 'Risk to investor capital must be considered before potential returns.' },
              { title: 'Research Before Deployment', desc: 'Investment decisions should have an identifiable rationale rather than depend on hype or market sentiment.' },
              { title: 'Risk-Adjusted Returns', desc: 'Performance should be evaluated against the risks taken to achieve it.' },
              { title: 'Diversification', desc: 'Where appropriate, exposures should be distributed to reduce excessive concentration risk.' },
              { title: 'Continuous Monitoring', desc: 'Market conditions and portfolio risks change; investment positions therefore require ongoing review.' },
            ].map(({ title, desc }) => (
              <div key={title} className="border border-lime-400/10 rounded-lg p-5">
                <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">{title}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section>
          <h2 className="text-xl font-semibold text-lime-400 mb-6">Our Services</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Trading Solutions',
                desc: 'Structured trading solutions focused on identifying and capturing opportunities across approved financial markets. Our approach combines market research, technical and fundamental analysis, defined trading strategies, disciplined execution and risk-management controls.',
              },
              {
                title: 'Investment Solutions',
                desc: 'Structured investment solutions designed around different financial objectives, investment horizons and risk profiles — covering capital growth, income generation, capital preservation, diversified strategies, and bespoke solutions for eligible investors.',
              },
              {
                title: 'Portfolio & Capital Management',
                desc: 'Professional portfolio and capital-management solutions based on clearly defined investment mandates, including investor profiling, asset allocation, portfolio construction, risk monitoring and performance reporting.',
              },
              {
                title: 'Investment Advisory & Market Intelligence',
                desc: 'Research-led market insights to help eligible clients evaluate financial opportunities and make more informed capital-allocation decisions, incorporating market research, investment analysis, economic trends and risk evaluation.',
              },
              {
                title: 'Wealth & Financial Solutions',
                desc: 'Financial solutions for individuals and businesses seeking to build, preserve or strategically deploy capital — addressing wealth accumulation, investment planning, capital preservation and portfolio diversification.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-dark-700/30 border border-lime-400/10 rounded-lg p-5">
                <p className="text-white font-semibold mb-2">{title}</p>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who Is It For */}
        <section className="bg-lime-400/5 border border-lime-400/15 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-lime-400 mb-3">Who Is Arbalist Capital For?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Arbalist is for students, workers, business owners, and anyone who wants to make their money work for them instead of leaving it idle. Whether you are investing to save for a goal, to build extra income, or to secure your future, there is a plan for you.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/plans" className="bg-lime-400 text-dark-800 font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-lime-300 transition-colors">View Investment Plans</Link>
            <Link to="/register" className="border border-lime-400/40 text-lime-400 font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-lime-400/10 transition-colors">Create Account</Link>
          </div>
        </section>

        {/* Client Onboarding */}
        <section>
          <h2 className="text-xl font-semibold text-lime-400 mb-4">Client Onboarding Process</h2>
          <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
            {['Registration', 'Identity Verification / KYC', 'Investor Suitability Assessment', 'Product Selection', 'Agreement & Disclosures', 'Funding', 'Investment Allocation', 'Portfolio Monitoring', 'Reporting / Withdrawal'].map((step, i, arr) => (
              <>
                <span key={step} className="bg-dark-700 border border-lime-400/10 rounded-full px-3 py-1 text-gray-400">{step}</span>
                {i < arr.length - 1 && <span key={`arrow-${i}`} className="text-lime-400">→</span>}
              </>
            ))}
          </div>
        </section>

        {/* Corporate Declaration */}
        <div className="border-t border-lime-400/10 pt-10 text-center">
          <p className="text-lime-400 font-semibold mb-2">Corporate Declaration</p>
          <p className="text-gray-400 max-w-2xl mx-auto">Arbalist Capital is committed to operating with professionalism, transparency, accountability and integrity. Our objective is to establish a responsible business environment where the interests of the Company and its users are treated with fairness and respect.</p>
          <p className="mt-6 text-xs text-gray-600 font-semibold tracking-widest uppercase">ARBALIST CAPITAL — Professionalism. Transparency. Accountability.</p>
          <p className="text-xs text-gray-600 mt-2">© {new Date().getFullYear()} Arbalist Capital. All rights reserved. All activities conducted in accordance with applicable laws of the Federal Republic of Nigeria.</p>
        </div>

      </main>
    </div>
  );
}
