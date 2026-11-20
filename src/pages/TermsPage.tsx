import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Effective for all users of Arbalist Capital's services.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Terms and Conditions of Service</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Users must be at least 18 years old.</li>
              <li>All registration information must be accurate and verifiable.</li>
              <li>Users must protect their account passwords and security credentials.</li>
              <li>Fraud, impersonation, account manipulation and unauthorised activities are prohibited.</li>
              <li>All transactions must use officially designated payment channels.</li>
              <li>Users must comply with applicable investment agreements and Company policies.</li>
              <li>The Company may investigate suspicious transactions and restrict accounts where reasonably necessary.</li>
              <li>Users must treat Company representatives and other users respectfully.</li>
              <li>Material changes to these terms shall be communicated to affected users.</li>
              <li>All services are subject to applicable Nigerian laws and regulatory requirements.</li>
            </ol>
            <p className="mt-4 text-gray-500 italic">By using Arbalist Capital's services, users agree to comply with these terms.</p>
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
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Deposits and Payments Policy</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>All deposits must be made through officially designated Company payment channels.</li>
              <li>Users are responsible for confirming payment details before transferring funds.</li>
              <li>A deposit is recognised only after successful receipt, verification and confirmation by the Company.</li>
              <li>Users should retain transaction receipts and payment references.</li>
              <li>The Company reserves the right to investigate suspicious payments and request additional verification where necessary.</li>
              <li>Arbalist Capital shall not recognise unauthorised payments made to individuals or accounts that have not been officially verified as Company payment channels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Withdrawal Policy and Service Charges</h2>
            <div className="bg-lime-400/5 border border-lime-400/20 rounded-lg p-4 mb-4">
              <p className="text-lime-400 font-semibold text-sm">NOTE:</p>
              <p className="text-gray-400 mt-1">Arbalist Capital official withdrawal days are <strong className="text-white">Mondays and Fridays</strong>, meaning every active investor can withdraw only on Monday and Friday.</p>
            </div>
            <div className="space-y-2 text-gray-400">
              <p>Arbalist Capital applies a <strong className="text-white">5% withdrawal service charge</strong> on the gross withdrawal amount, subject to applicable laws and the user's prior agreement. The remaining 95% shall be payable to the user after the applicable withdrawal conditions have been satisfied.</p>
              <div className="bg-dark-700 rounded-lg p-4 mt-3 text-sm font-mono space-y-1">
                <p className="text-gray-500">Example:</p>
                <p>Withdrawal amount: <span className="text-white">₦100,000</span></p>
                <p>Service charge (5%): <span className="text-red-400">- ₦5,000</span></p>
                <p>Net amount payable: <span className="text-lime-400">₦95,000</span></p>
              </div>
              <p className="mt-3">The service charge covers applicable administrative, operational, processing and transaction-related expenses. All applicable charges shall be disclosed before users commit funds.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">User Conduct Policy</h2>
            <p className="text-gray-400 mb-3">All users are expected to maintain honesty, professionalism and respect when using Arbalist Capital's services. The following activities are prohibited:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 columns-2">
              <li>Fraudulent transactions</li>
              <li>Identity theft and impersonation</li>
              <li>Forged payment receipts</li>
              <li>Money laundering</li>
              <li>Unauthorised account access</li>
              <li>Manipulation of transaction records</li>
              <li>Hacking or disruption of Company systems</li>
              <li>Harassment, threats or abuse</li>
              <li>Deliberate exploitation of technical errors</li>
            </ul>
            <p className="mt-3 text-gray-500">Violations may result in investigation, account restrictions or appropriate legal action.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Account Suspension and Termination Policy</h2>
            <p className="text-gray-400">Arbalist Capital reserves the right to suspend, restrict or terminate accounts involved in fraudulent activities, identity manipulation, security violations or other serious breaches of Company policies. Accounts may also be restricted where required by competent regulatory or law-enforcement authorities. Where reasonably possible, affected users shall be notified of the reason for the action. Suspension or termination shall not automatically cancel legitimate outstanding financial obligations owed to users or the Company.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Limitation of Liability</h2>
            <p className="text-gray-400">Arbalist Capital shall take reasonable measures to maintain reliable services and protect users' legitimate interests. To the extent permitted by law, the Company shall not be responsible for losses arising solely from circumstances beyond its reasonable control, including external network interruptions and independent third-party service failures. Nothing in this policy excludes liability for fraud, wilful misconduct, unlawful conduct or obligations that cannot legally be excluded. All parties remain responsible for fulfilling their lawful contractual obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Customer Complaints and Dispute Resolution</h2>
            <p className="text-gray-400">Arbalist Capital values customer feedback and is committed to resolving complaints professionally and fairly. Users may report issues concerning deposits, withdrawals, account verification, transaction records, privacy or other Company services. Complaints should include relevant account information, transaction references and supporting evidence. The Company shall investigate complaints and provide appropriate responses within a reasonable period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Returning of Investor's Capital</h2>
            <p className="text-gray-400">Investment Capital shall be deposited back to an investor's account (wallet) after <strong className="text-white">90 days</strong> of an active investment with Arbalist Capital. Upon the completion of the 90-day investment period, the investor may choose to reinvest the returned capital into a new or existing investment plan, or submit a withdrawal request in accordance with the Company's Withdrawal Policy. All capital returns are subject to the standard withdrawal conditions and applicable service charges.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-lime-400 mb-3">Amendments and Updates</h2>
            <p className="text-gray-400">Arbalist Capital reserves the right to review and update its policies when necessary to reflect changes in business operations, security procedures, services or applicable laws. Material changes shall be communicated to affected users. Changes affecting existing investment agreements shall follow the appropriate contractual procedures. No policy update shall unlawfully remove accrued user rights or introduce undisclosed financial obligations.</p>
          </section>

          <div className="border-t border-lime-400/10 pt-8 text-center">
            <p className="text-xs text-gray-600 font-semibold tracking-widest uppercase">ARBALIST CAPITAL — Professionalism. Transparency. Accountability.</p>
            <p className="text-xs text-gray-500 mt-3">Last Updated: 20 November 2026</p>
            <p className="text-xs text-gray-600 mt-2">© {new Date().getFullYear()} Arbalist Capital. All rights reserved. All services subject to applicable Nigerian laws.</p>
          </div>

        </div>
      </main>
    </div>
  );
}
