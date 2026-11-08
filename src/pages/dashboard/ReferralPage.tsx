import { useEffect, useState } from "react";
import { Users, Copy, Share2, Gift, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { formatNGN, REFERRAL_BONUS_PERCENT, referralBonusFor } from "@/lib/plans";
import toast from "react-hot-toast";

interface ReferralRow {
  id: string;
  name: string;
  email: string;
  bonus: number;
  credited: boolean;
  createdAt: string;
  paidAt: string | null;
}

async function loadReferrals(referrerId: string): Promise<ReferralRow[]> {
  // Preferred: database function, which also returns who the referred person is
  const { data, error } = await supabase.rpc("get_my_referrals");
  if (!error && data) {
    return data.map((r) => ({
      id: r.id,
      name: r.referred_name || "New user",
      email: r.referred_email || "",
      bonus: Number(r.bonus_amount ?? 0),
      credited: r.status === "credited",
      createdAt: r.created_at,
      paidAt: r.paid_at,
    }));
  }

  // Fallback (only if supabase/005_referral_3_percent.sql has not been run yet)
  const { data: rows } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", referrerId)
    .order("created_at", { ascending: false });

  return (rows ?? []).map((r) => ({
    id: r.id,
    name: "New user",
    email: "",
    bonus: Number(r.bonus_amount ?? 0),
    credited: r.status === "credited",
    createdAt: r.created_at,
    paidAt: r.paid_at ?? null,
  }));
}

export default function ReferralPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const hasCode = Boolean(profile?.referral_code);
  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code ?? ""}`;

  useEffect(() => {
    if (!profile?.id) return;
    let alive = true;
    loadReferrals(profile.id)
      .then((r) => { if (alive) setRows(r); })
      .catch(() => { if (alive) setRows([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [profile?.id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy automatically. Please copy the link by hand.");
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Arbalist Capital",
          text: "Earn 1.3% daily on your investments!",
          url: referralLink,
        });
      } catch {
        /* person closed the share sheet: nothing to do */
      }
    } else {
      void copyLink();
    }
  }

  const paidRows = rows.filter((r) => r.credited);
  const pendingCount = rows.length - paidRows.length;
  const totalBonus = paidRows.reduce((sum, r) => sum + r.bonus, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-lime-400" /> Referral Program
        </h1>
        <p className="mt-1 text-gray-400">Earn {REFERRAL_BONUS_PERCENT}% of your referral's first deposit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Referrals", value: rows.length, color: "text-white" },
          { label: "Paid", value: paidRows.length, color: "text-lime-400" },
          { label: "Total Bonus", value: formatNGN(totalBonus), color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {pendingCount > 0 && (
        <p className="-mt-3 text-center text-xs text-gray-500">
          {pendingCount} referral{pendingCount !== 1 ? "s are" : " is"} waiting for a first deposit.
        </p>
      )}

      {/* How it works */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Gift className="w-4 h-4 text-lime-400" /> How It Works</h2>
        <div className="space-y-3">
          {[
            { step: "1", text: "Share your unique referral link with friends and family" },
            { step: "2", text: "They sign up with your link and make their first deposit" },
            { step: "3", text: `You earn ${REFERRAL_BONUS_PERCENT}% of that first deposit, credited to your wallet automatically` },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</div>
              <p className="text-sm text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Example: a {formatNGN(100000)} first deposit earns you {formatNGN(referralBonusFor(100000))}.
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Your Referral Link</h2>
        <div className="flex items-center gap-2 bg-dark-700/60 border border-lime-400/10 rounded-xl p-4">
          <p className="flex-1 text-sm text-gray-300 truncate font-mono">{hasCode ? referralLink : "Loading your link…"}</p>
          <button
            onClick={copyLink}
            disabled={!hasCode}
            className={`flex-shrink-0 p-2 rounded-lg transition-all disabled:opacity-40 ${copied ? "text-lime-400 bg-lime-400/10" : "text-gray-400 hover:text-white hover:bg-dark-500"}`}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={copyLink} disabled={!hasCode} className="flex items-center justify-center gap-2 bg-dark-700/60 border border-lime-400/10 hover:border-lime-400/30 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-40">
            <Copy className="w-4 h-4" /> Copy Link
          </button>
          <button onClick={shareLink} disabled={!hasCode} className="flex items-center justify-center gap-2 bg-lime-400/10 border border-lime-400/20 hover:bg-lime-400/20 text-lime-400 font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-40">
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
        ) : rows.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 bg-dark-700/60 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {r.email ? `${r.email} • ` : ""}Joined {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {r.credited ? (
                    <>
                      <p className="text-sm font-bold text-yellow-400">+{formatNGN(r.bonus)}</p>
                      <p className="text-xs text-lime-400 flex items-center justify-end gap-1">
                        <CheckCircle className="w-3 h-3" /> Paid{r.paidAt ? ` ${new Date(r.paidAt).toLocaleDateString()}` : ""}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-300">Pending</p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> Awaiting first deposit
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
