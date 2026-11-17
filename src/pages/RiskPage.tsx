import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-dark-800 text-gray-300">
      {/* NAV */}
      <nav className="border-b border-lime-400/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/"><BrandLogo size="md" /></Link>
          <Link to="/" className="text-sm text-gray-400 hover:text-lime-400 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Risk Disclaimer</h1>
        <p className="text-sm text-gray-500 mb-10">Please read this disclaimer carefully before investing.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-5">
            <p className="text-yellow-400 font-semibold mb-2">Important Notice</p>
            <p className="text-gray-400">All investment activities involve financial risks. Returns are not automatically guaranteed, and past performance does not guarantee future results.</p>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Investment Disclaimer</h2>
            <p className="text-gray-400 mb-3">Potential risks include but are not limited to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Trading losses from adverse market movements</li>
              <li>Market fluctuations and volatility</li>
              <li>Operational challenges affecting service delivery</li>
              <li>Liquidity limitations on investment positions</li>
              <li>Unforeseen economic circumstances</li>
            </ul>
            <p className="mt-4 text-gray-400">Users are encouraged to understand the nature of each investment, review its terms and <strong className="text-white">seek independent professional advice</strong> before committing funds. Arbalist Capital shall provide relevant investment information and risk disclosures before accepting an investment.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Investor Risk Statement</h2>
            <p className="text-gray-400">Investing involves risk, including the possible loss of some or all invested capital. Returns are not guaranteed unless a specific legally enforceable guarantee exists and its terms are expressly disclosed. Market conditions, liquidity, counterparty events and other factors may affect investment performance.</p>
            <p className="mt-3 text-gray-400">Historical or illustrative performance does not guarantee future results. Prospective investors should carefully review all applicable offering documents, fees and risk disclosures and obtain independent professional advice where appropriate.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Limitation of Liability</h2>
            <p className="text-gray-400">Arbalist Capital shall take reasonable measures to maintain reliable services and protect users' legitimate interests. To the extent permitted by law, the Company shall not be responsible for losses arising solely from circumstances beyond its reasonable control, including external network interruptions and independent third-party service failures.</p>
            <p className="mt-3 text-gray-400">Nothing in this disclaimer excludes liability for fraud, wilful misconduct, unlawful conduct or obligations that cannot legally be excluded.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Regulatory Notice</h2>
            <p className="text-gray-400">No investment product shall be offered without the necessary regulatory authorisation. All Company activities are conducted in accordance with applicable laws and regulatory requirements of the Federal Republic of Nigeria.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Our Commitment</h2>
            <p className="text-gray-400">Arbalist Capital is committed to communicating risks clearly rather than promising "safe," "guaranteed," or unrealistically consistent returns. We believe informed investors make better decisions, and we are dedicated to providing the transparency necessary for that.</p>
          </section>

          <div className="border-t border-lime-400/10 pt-8 text-center">
            <p className="text-xs text-gray-600 font-semibold tracking-widest uppercase">ARBALIST CAPITAL — Professionalism. Transparency. Accountability.</p>
            <p className="text-xs text-gray-600 mt-2">© {new Date().getFullYear()} Arbalist Capital. All rights reserved. All services subject to applicable Nigerian laws.</p>
          </div>

        </div>
      </main>
    </div>
  );
}
