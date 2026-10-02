import { useEffect, useState } from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { formatNGN } from "@/lib/plans";
import toast from "react-hot-toast";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: object) => { openIframe: () => void };
    };
  }
}

export default function WalletPage() {
  const { profile, refetchProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    fetchTransactions();
    // Load Paystack script
    if (!document.getElementById("paystack-script")) {
      const s = document.createElement("script");
      s.id = "paystack-script";
      s.src = "https://js.paystack.co/v1/inline.js";
      document.head.appendChild(s);
    }
  }, [profile]);

  async function fetchTransactions() {
    if (!profile) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setTransactions(data);
    setLoading(false);
  }

  function handleDeposit() {
    const amt = parseFloat(amount);
    if (!amt || amt < 1000) { toast.error("Minimum deposit is ₦1,000"); return; }
    if (!profile) return;

    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;
    if (!key) { toast.error("Payment gateway not configured"); return; }

    const ref = `ARB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const handler = window.PaystackPop.setup({
      key,
      email: profile.email,
      amount: Math.round(amt * 100), // kobo
      currency: "NGN",
      ref,
      metadata: { user_id: profile.id, custom_fields: [{ display_name: "User ID", variable_name: "user_id", value: profile.id }] },
      callback: async (response: { reference: string }) => {
        // Verify & credit via Supabase Edge Function (or directly for demo)
        const { error } = await supabase.from("transactions").insert({
          user_id: profile.id,
          type: "deposit",
          amount: amt,
          status: "success",
          reference: ref,
          paystack_reference: response.reference,
          description: "Wallet deposit via Paystack",
        });
        if (!error) {
          await supabase.from("profiles").update({ wallet_balance: (profile.wallet_balance ?? 0) + amt }).eq("id", profile.id);
          if (refetchProfile) refetchProfile();
          toast.success(`₦${amt.toLocaleString()} deposited successfully!`);
          setAmount("");
          fetchTransactions();
        }
      },
      onClose: () => toast("Payment cancelled", { icon: "ℹ️" }),
    });
    handler.openIframe();
  }

  async function handleWithdraw() {
    const amt = parseFloat(amount);
    if (!profile) return;
    if (!amt || amt < 5000) { toast.error("Minimum withdrawal is ₦5,000"); return; }
    if (amt > (profile.wallet_balance ?? 0)) { toast.error("Insufficient wallet balance"); return; }
    if (profile.kyc_status !== "verified") { toast.error("Complete KYC verification before withdrawing"); return; }
    if (!bankName || !accountNumber || !accountName) { toast.error("Fill in all bank details"); return; }

    setSubmitting(true);
    const ref = `WDR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { error } = await supabase.from("transactions").insert({
      user_id: profile.id,
      type: "withdrawal",
      amount: amt,
      status: "pending",
      reference: ref,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      description: "Withdrawal request",
    });
    if (!error) {
      await supabase.from("profiles").update({ wallet_balance: (profile.wallet_balance ?? 0) - amt }).eq("id", profile.id);
      if (refetchProfile) refetchProfile();
      toast.success("Withdrawal request submitted! Processing within 24hrs.");
      setAmount(""); setBankName(""); setAccountNumber(""); setAccountName("");
      fetchTransactions();
    } else {
      toast.error("Failed to submit withdrawal");
    }
    setSubmitting(false);
  }

  const txIcon: Record<string, React.ReactNode> = {
    deposit: <ArrowDownCircle className="w-5 h-5 text-lime-400" />,
    withdrawal: <ArrowUpCircle className="w-5 h-5 text-red-400" />,
    roi: <ArrowDownCircle className="w-5 h-5 text-blue-400" />,
    referral_bonus: <ArrowDownCircle className="w-5 h-5 text-yellow-400" />,
  };

  const statusIcon = (s: string) => s === "success"
    ? <CheckCircle className="w-4 h-4 text-lime-400" />
    : s === "pending"
    ? <Clock className="w-4 h-4 text-yellow-400" />
    : <XCircle className="w-4 h-4 text-red-400" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-lime-400" /> Wallet
        </h1>
        <p className="mt-1 text-gray-400">Manage your funds</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-lime-400/15 to-emerald-500/10 border border-lime-400/20 rounded-2xl p-6">
        <p className="text-sm text-gray-400">Available Balance</p>
        <p className="text-4xl font-bold font-serif text-white mt-1">{formatNGN(profile?.wallet_balance ?? 0)}</p>
        <p className="text-xs text-gray-500 mt-2">Total Earned: {formatNGN(profile?.total_earned ?? 0)}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-600/40 border border-lime-400/10 rounded-2xl p-1">
        {(["deposit", "withdraw"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all capitalize ${tab === t ? "bg-lime-400 text-dark-800 shadow-lg" : "text-gray-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Deposit */}
      {tab === "deposit" && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Deposit via Paystack</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (NGN)</label>
            <input
              type="number" min="1000" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 transition-all"
              placeholder="Minimum ₦1,000"
            />
          </div>
          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2">
            {[5000, 10000, 50000, 100000, 500000, 1000000].map((q) => (
              <button key={q} onClick={() => setAmount(q.toString())} className="py-2 text-xs font-semibold rounded-xl bg-dark-700/60 border border-lime-400/10 text-gray-300 hover:border-lime-400/30 hover:text-lime-400 transition-all">
                {formatNGN(q)}
              </button>
            ))}
          </div>
          <button onClick={handleDeposit} className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all shadow-lg shadow-lime-400/20">
            Proceed to Pay
          </button>
          <p className="text-xs text-center text-gray-500">Secured by Paystack. Your payment info is never stored on our servers.</p>
        </div>
      )}

      {/* Withdraw */}
      {tab === "withdraw" && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Withdraw to Bank</h2>
          {profile?.kyc_status !== "verified" && (
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 text-sm text-yellow-400">
              ⚠️ You must complete KYC verification before withdrawing.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (NGN)</label>
            <input type="number" min="5000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 transition-all" placeholder="Minimum ₦5,000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 transition-all" placeholder="e.g. Zenith Bank" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
            <input type="text" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 transition-all" placeholder="10-digit account number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Name</label>
            <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 transition-all" placeholder="Name on account" />
          </div>
          <button onClick={handleWithdraw} disabled={submitting || profile?.kyc_status !== "verified"} className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 hover:to-lime-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? "Submitting…" : "Request Withdrawal"}
          </button>
          <p className="text-xs text-center text-gray-500">Withdrawals are processed within 24 business hours.</p>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Transaction History</h2>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" /></div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 py-3 border-b border-dark-50/10 last:border-0">
                <div className="flex-shrink-0">{txIcon[tx.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white capitalize">{tx.type.replace("_", " ")}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                  {tx.description && <p className="text-xs text-gray-600 truncate">{tx.description}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${tx.type === "withdrawal" ? "text-red-400" : "text-lime-400"}`}>
                    {tx.type === "withdrawal" ? "-" : "+"}{formatNGN(tx.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">{statusIcon(tx.status)}<span className="text-xs text-gray-500 capitalize">{tx.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
