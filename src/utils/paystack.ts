/* ─── Paystack Payment Gateway Integration ─── */
// Replace with your actual Paystack public key
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => { openIframe: () => void };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in kobo
  currency: string;
  ref: string;
  metadata?: Record<string, unknown>;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

interface PaystackResponse {
  reference: string;
  trans: string;
  status: 'success' | 'failed';
  message: string;
  transaction: string;
  trxref: string;
}

export interface PaymentOptions {
  email: string;
  amount: number; // in Naira
  fullName: string;
  phone: string;
  planLabel: string;
  userId: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

function generateReference(userId: string): string {
  return `ARB-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    const existing = document.querySelector('script[src*="paystack"]');
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.head.appendChild(script);
  });
}

export async function initiatePayment(options: PaymentOptions): Promise<void> {
  try {
    await loadPaystackScript();
  } catch {
    // Fallback: open Paystack hosted page
    const ref = generateReference(options.userId);
    const url = `https://paystack.com/pay/${PAYSTACK_PUBLIC_KEY}?amount=${options.amount * 100}&email=${options.email}&ref=${ref}`;
    window.open(url, '_blank');
    return;
  }

  if (!window.PaystackPop) {
    throw new Error('Paystack not loaded');
  }

  const ref = generateReference(options.userId);

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: options.email,
    amount: options.amount * 100, // convert to kobo
    currency: 'NGN',
    ref,
    metadata: {
      custom_fields: [
        { display_name: 'Full Name', variable_name: 'full_name', value: options.fullName },
        { display_name: 'Phone', variable_name: 'phone', value: options.phone },
        { display_name: 'Plan', variable_name: 'plan', value: options.planLabel },
        { display_name: 'User ID', variable_name: 'user_id', value: options.userId },
      ],
    },
    callback: (response: PaystackResponse) => {
      if (response.status === 'success') {
        options.onSuccess(response.reference);
      } else {
        options.onCancel();
      }
    },
    onClose: options.onCancel,
  });

  handler.openIframe();
}

// Verify payment (in production this MUST be done server-side)
export async function verifyPayment(reference: string): Promise<{ verified: boolean; amount: number }> {
  // IMPORTANT: In production, call your backend endpoint which verifies with Paystack server-to-server.
  // Never use the secret key on the client!
  // For demo purposes, we simulate verification:
  console.log(`[DEMO] Verifying payment reference: ${reference}`);
  await new Promise(r => setTimeout(r, 500));
  return { verified: true, amount: 0 };
}

export const PLAN_AMOUNTS: Record<string, number> = {
  '₦50.5K':  50500,
  '₦100.5K': 100500,
  '₦200.5K': 200500,
  '₦300.5K': 300500,
  '₦400.5K': 400500,
  '₦500.5K': 500500,
  '₦1M':     1000000,
  '₦2M':     2000000,
  '₦3M':     3000000,
  '₦4M':     4000000,
  '₦5M':     5000000,
};
