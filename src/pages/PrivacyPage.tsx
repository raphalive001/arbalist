import { Link } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Arbalist Capital respects the privacy and confidentiality of its users.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Information We Collect</h2>
            <p className="text-gray-400 mb-3">We may collect the following where necessary to provide our services:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Personal information and contact details</li>
              <li>Identification documents</li>
              <li>Bank information</li>
              <li>Transaction records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">How We Use Your Information</h2>
            <p className="text-gray-400 mb-3">Collected information may be used for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Account registration and verification</li>
              <li>Deposit and withdrawal processing</li>
              <li>Fraud prevention and security</li>
              <li>Customer support</li>
              <li>Financial recordkeeping</li>
              <li>Legal and regulatory compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Information Sharing</h2>
            <p className="text-gray-400">We do not sell users' personal information. Information may be shared with authorised service providers or competent authorities where legally necessary.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Data Protection</h2>
            <p className="text-gray-400">We implement reasonable measures to protect personal information in accordance with the <strong className="text-white">Nigeria Data Protection Act 2023</strong>. Users may exercise their applicable data protection rights by contacting the Company.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Account Security Policy</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Users are responsible for protecting their account passwords, login details and verification codes.</li>
              <li>Users must not share confidential security credentials with unauthorised individuals.</li>
              <li>Arbalist Capital implements reasonable security measures to protect user accounts and transaction records.</li>
              <li>Suspicious activities should be reported immediately.</li>
              <li>The Company may temporarily restrict accounts where necessary to investigate suspected fraud, unauthorised access or security threats.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Contact Us</h2>
            <p className="text-gray-400">To exercise your data protection rights or report a privacy concern, please contact us at:</p>
            <a href="mailto:support@arbalistcapital.com.ng" className="inline-block mt-2 text-lime-400 hover:underline">support@arbalistcapital.com.ng</a>
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
