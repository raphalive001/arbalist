// ─── Paystack Payment Gateway ─────────────────────────────────────────────────
// Single global declaration — no duplicate

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
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

// Single authoritative global declaration
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => { openIframe: () => void };
    };
  }
}

// Use import.meta.env — vite-env.d.ts provides the type
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? 'pk_test_placeholder';

export interface PaymentOptions {
  email: string;
  amount: number; // Naira
  fullName: string;
  phone: string;
  planLabel: string;
  userId: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export function generateReference(userId: string): string {
  return `ARB-${userId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    const existing = document.getElementById('paystack-script');
    if (existing) {
      // Script tag exists but PaystackPop not ready yet — wait for load
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.head.appendChild(script);
  });
}

export async function initiatePayment(options: PaymentOptions): Promise<void> {
  await loadPaystackScript();

  if (!window.PaystackPop) {
    throw new Error('Paystack failed to initialise');
  }

  const ref = generateReference(options.userId);

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: options.email,
    amount: Math.round(options.amount * 100), // kobo
    currency: 'NGN',
    ref,
    metadata: {
      custom_fields: [
        { display_name: 'Full Name',  variable_name: 'full_name',  value: options.fullName },
        { display_name: 'Phone',      variable_name: 'phone',      value: options.phone },
        { display_name: 'Plan',       variable_name: 'plan',       value: options.planLabel },
        { display_name: 'User ID',    variable_name: 'user_id',    value: options.userId },
      ],
    },
    callback: (response: PaystackResponse) => {
      if (response.status === 'success') options.onSuccess(response.reference);
      else options.onCancel();
    },
    onClose: options.onCancel,
  });

  handler.openIframe();
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
