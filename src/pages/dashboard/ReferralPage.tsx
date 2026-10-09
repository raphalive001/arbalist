import { useEffect, useState } from "react";
import { Users, Copy, Share2, Gift, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { formatNGN, REFERRAL_BONUS_RATE } from "@/lib/plans";
import toast from "react-hot-toast";
import type { Database } from "@/types/database";

type Referral = Database["public"]["Tables"]["referrals"]["Row"] & {
  referred: { full_name: string | null; email: string; created_at: string } | null;
};

export default function ReferralPage() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code ?? ""}`;

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setReferrals(data.map(r => ({ ...r, referred: null })) as Referral[]);
        setLoading(false);
      });
  }, [profile]);

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({ title: "Join Arbalist Capital", text: "Earn 1.3% daily on your investments!", url: referralLink });
    } else {
      copyLink();
    }
  }

  const totalBonus = referrals.reduce((sum, r) => sum + r.bonus_amount, 0);
  const credited = referrals.filter((r) => r.status === "credited").length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-lime-400" /> Referral Program
        </h1>
        <p className="mt-1 text-gray-400">Earn {(REFERRAL_BONUS_RATE * 100).toFixed(0)}% of your referral's first deposit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Referrals", value: referrals.length, color: "text-white" },
          { label: "Active", value: credited, color: "text-lime-400" },
          { label: "Total Bonus", value: formatNGN(totalBonus), color: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Gift className="w-4 h-4 text-lime-400" /> How It Works</h2>
        <div className="space-y-3">
          {[
            { step: "1", text: "Share your unique referral link with friends and family" },
            { step: "2", text: "They sign up and make their first deposit" },
            { step: `3`, text: `You earn ${(REFERRAL_BONUS_RATE * 100).toFixed(0)}% of their deposit as a bonus, credited to your wallet` },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</div>
              <p className="text-sm text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Your Referral Link</h2>
        <div className="flex items-center gap-2 bg-dark-700/60 border border-lime-400/10 rounded-xl p-4">
          <p className="flex-1 text-sm text-gray-300 truncate font-mono">{referralLink}</p>
          <button onClick={copyLink} className={`flex-shrink-0 p-2 rounded-lg transition-all ${copied ? "text-lime-400 bg-lime-400/10" : "text-gray-400 hover:text-white hover:bg-dark-500"}`}>
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={copyLink} className="flex items-center justify-center gap-2 bg-dark-700/60 border border-lime-400/10 hover:border-lime-400/30 text-white font-semibold py-3 rounded-xl transition-all text-sm">
            <Copy className="w-4 h-4" /> Copy Link
          </button>
          <button onClick={shareLink} className="flex items-center justify-center gap-2 bg-lime-400/10 border border-lime-400/20 hover:bg-lime-400/20 text-lime-400 font-semibold py-3 rounded-xl transition-all text-sm">
            <Share2 className="w-4 h-4" /> Share Link
          </button>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Your referral code: <span className="text-lime-400 font-bold tracking-widest">{profile?.referral_code ?? "—"}</span></p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Your Referrals</h2>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" /></div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{r.referred?.full_name ?? "User"}</p>
                  <p className="text-xs text-gray-500">{r.referred?.email} • {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-400">+{formatNGN(r.bonus_amount)}</p>
                  <p className={`text-xs capitalize ${r.status === "credited" ? "text-lime-400" : "text-gray-400"}`}>{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
