import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Star, TrendingUp } from "lucide-react";
import { PLANS, formatNGN, DAILY_RATE } from "@/lib/plans";
import { BrandLogo } from "@/components/BrandLogo";

export default function AllPlansPage() {
  return (
    <div className="min-h-screen bg-dark-800 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-dark-800/90 backdrop-blur-xl border-b border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <BrandLogo size="sm" />
          <Link to="/register" className="text-sm font-bold bg-lime-400 text-dark-800 px-4 py-2 rounded-xl hover:bg-lime-300 transition-all">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">All Investment Plans</h1>
          <p className="mt-3 text-gray-400">All plans earn <span className="text-lime-400 font-semibold">{(DAILY_RATE * 100).toFixed(1)}% daily</span>. Returns shown are cumulative ROI earnings.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative bg-dark-600/40 border rounded-2xl p-6 transition-all hover:border-lime-400/30 hover:shadow-lg hover:shadow-lime-400/5 ${plan.popular ? "border-lime-400/30" : "border-lime-400/10"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-6 bg-lime-400 text-dark-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                <p className="text-2xl font-bold font-serif text-white">{plan.label}</p>
              </div>
              <p className="text-xs text-gray-500 mb-5">{formatNGN(plan.amount)} investment</p>

              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-sm py-1.5 border-b border-dark-50/10">
                  <span className="text-gray-400">Daily Earnings</span>
                  <span className="text-lime-400 font-bold">{formatNGN(plan.dailyEarnings)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-dark-50/10">
                  <span className="text-gray-400">7-Day ROI</span>
                  <span className="text-white font-semibold">{formatNGN(plan.d7)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-dark-50/10">
                  <span className="text-gray-400">30-Day ROI</span>
                  <span className="text-white font-semibold">{formatNGN(plan.d30)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-400">90-Day ROI</span>
                  <span className="text-emerald-400 font-bold">{formatNGN(plan.d90)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold px-3 py-1 rounded-full">
                  {(DAILY_RATE * 100).toFixed(1)}% Daily
                </span>
                <Link to="/register" className="flex items-center gap-1.5 text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors">
                  Start <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/register" className="inline-flex items-center gap-2 bg-lime-400 text-dark-800 font-bold px-10 py-4 rounded-xl hover:bg-lime-300 transition-all shadow-xl shadow-lime-400/20 text-lg">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-xs text-gray-500">* Investment capital is locked for 90 days. Daily ROI is credited to your wallet automatically.</p>
        </div>
      </div>
    </div>
  );
}
