export interface Plan {
  id: string;
  label: string;
  amount: number;
  dailyRate: number; // 0.013 = 1.3%
  dailyEarnings: number;
  d7: number;
  d30: number;
  d90: number;
  popular: boolean;
}

export const DAILY_RATE = 0.013; // 1.3%

export const PLANS: Plan[] = [
  { id: "p1",  label: "₦50.5K",  amount: 50500,    dailyRate: DAILY_RATE, dailyEarnings: 656.50,    d7: 4595.50,    d30: 19735.50,    d90: 59206.50,    popular: false },
  { id: "p2",  label: "₦100.5K", amount: 100500,   dailyRate: DAILY_RATE, dailyEarnings: 1306.50,   d7: 9145.50,    d30: 39271.50,    d90: 117814.50,   popular: false },
  { id: "p3",  label: "₦200.5K", amount: 200500,   dailyRate: DAILY_RATE, dailyEarnings: 2606.50,   d7: 18245.50,   d30: 78271.50,    d90: 235014.50,   popular: false },
  { id: "p4",  label: "₦300.5K", amount: 300500,   dailyRate: DAILY_RATE, dailyEarnings: 3906.50,   d7: 27345.50,   d30: 117271.50,   d90: 352214.50,   popular: true  },
  { id: "p5",  label: "₦400.5K", amount: 400500,   dailyRate: DAILY_RATE, dailyEarnings: 5206.50,   d7: 36445.50,   d30: 156271.50,   d90: 469414.50,   popular: false },
  { id: "p6",  label: "₦500.5K", amount: 500500,   dailyRate: DAILY_RATE, dailyEarnings: 6506.50,   d7: 45545.50,   d30: 195271.50,   d90: 586614.50,   popular: false },
  { id: "p7",  label: "₦1M",     amount: 1000000,  dailyRate: DAILY_RATE, dailyEarnings: 13006.50,  d7: 91045.50,   d30: 390271.50,   d90: 1171814.50,  popular: false },
  { id: "p8",  label: "₦2M",     amount: 2000000,  dailyRate: DAILY_RATE, dailyEarnings: 26006.50,  d7: 182045.50,  d30: 780271.50,   d90: 2341814.50,  popular: false },
  { id: "p9",  label: "₦3M",     amount: 3000000,  dailyRate: DAILY_RATE, dailyEarnings: 39006.50,  d7: 273045.50,  d30: 1170271.50,  d90: 3511814.50,  popular: false },
  { id: "p10", label: "₦4M",     amount: 4000000,  dailyRate: DAILY_RATE, dailyEarnings: 52006.50,  d7: 364045.50,  d30: 1560271.50,  d90: 4681814.50,  popular: false },
  { id: "p11", label: "₦5M",     amount: 5000000,  dailyRate: DAILY_RATE, dailyEarnings: 65006.50,  d7: 455045.50,  d30: 1950271.50,  d90: 5851814.50,  popular: false },
];

export const formatNGN = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(amount);

// Referral bonus: 3% of the referred user's FIRST deposit, paid to the referrer.
// The database does the paying (supabase/005_referral_3_percent.sql), so if you
// ever change this rate, change referral_bonus_rate() in that SQL file as well.
export const REFERRAL_BONUS_RATE = 0.03;
export const REFERRAL_BONUS_PERCENT = Math.round(REFERRAL_BONUS_RATE * 10000) / 100; // 3
export const referralBonusFor = (firstDeposit: number) =>
  Math.round(firstDeposit * REFERRAL_BONUS_RATE * 100) / 100;

// Withdrawal fee: 5% of every withdrawal. Shown to investors INSIDE their dashboard only (never on public pages).
// The fee is recorded on the withdrawal's own transaction (transactions.metadata) and enforced by the database
// (supabase/withdrawal_fee_5pct.sql). If you ever change this percentage, change the SQL constant too.
export const WITHDRAWAL_FEE_PERCENT = 5;
export const WITHDRAWAL_FEE_RATE = WITHDRAWAL_FEE_PERCENT / 100;

// Whole-kobo arithmetic so the preview matches the database's rounding exactly.
export const withdrawalFee = (amount: number) => {
  const kobo    = Math.round(amount * 100);
  const feeKobo = Math.round((kobo * WITHDRAWAL_FEE_PERCENT) / 100);
  return { fee: feeKobo / 100, net: (kobo - feeKobo) / 100 };
};

// Reads the fee recorded on a withdrawal transaction. null = no fee recorded (withdrawals made before the fee existed).
export function withdrawalBreakdown(metadata: unknown): { fee: number; net: number } | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m   = metadata as Record<string, unknown>;
  const fee = Number(m.fee);
  const net = Number(m.net);
  return Number.isFinite(fee) && Number.isFinite(net) && fee > 0 ? { fee, net } : null;
}
