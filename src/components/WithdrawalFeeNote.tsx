import { WITHDRAWAL_FEE_PERCENT, formatNGN, withdrawalBreakdown } from "@/lib/plans";

/** Small "fee / you receive" line shown under a withdrawal in the INVESTOR's dashboard. */
export default function WithdrawalFeeNote({ tx }: { tx: { type: string; metadata?: unknown } }) {
  if (tx.type !== "withdrawal") return null;
  const b = withdrawalBreakdown(tx.metadata);
  if (!b) return null;
  return (
    <p className="text-[11px] text-gray-500 mt-0.5">
      {WITHDRAWAL_FEE_PERCENT}% fee {formatNGN(b.fee)} · You receive {formatNGN(b.net)}
    </p>
  );
}
