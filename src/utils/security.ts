/* ─── Security Utilities ─── */

// CSRF Token Management
const CSRF_KEY = 'arbalist_csrf';

export function generateCSRFToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  const token = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem(CSRF_KEY, token);
  return token;
}

export function getCSRFToken(): string {
  let token = sessionStorage.getItem(CSRF_KEY);
  if (!token) token = generateCSRFToken();
  return token;
}

export function validateCSRFToken(token: string): boolean {
  return token === sessionStorage.getItem(CSRF_KEY);
}

// Rate Limiting (client-side signals — real enforcement on server)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(action: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(action);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(action, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count += 1;
  return true;
}

export function getRateLimitRemaining(action: string, maxAttempts = 5): number {
  const entry = rateLimitMap.get(action);
  if (!entry || Date.now() > entry.resetAt) return maxAttempts;
  return Math.max(0, maxAttempts - entry.count);
}

// Input Sanitization
export function sanitizeInput(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+\-() ]/g, '').trim();
}

// Password Strength
export interface PasswordStrength {
  score: number; // 0–4
  label: string;
  color: string;
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;
  else if (password.length >= 8) feedback.push('12+ characters is stronger');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add an uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Add a number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Add a special character (!@#$%)');

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
    feedback,
  };
}

// Email Validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Phone Validation (Nigerian format)
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+234|0)[789][01]\d{8}$/.test(cleaned);
}

// NIN Validation (11 digits)
export function validateNIN(nin: string): boolean {
  return /^\d{11}$/.test(nin.replace(/\s/g, ''));
}

// Account Number Validation (10 digits)
export function validateAccountNumber(acc: string): boolean {
  return /^\d{10}$/.test(acc.replace(/\s/g, ''));
}

// Session timeout
let sessionTimer: ReturnType<typeof setTimeout> | null = null;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function resetSessionTimer(onTimeout: () => void) {
  if (sessionTimer) clearTimeout(sessionTimer);
  sessionTimer = setTimeout(onTimeout, SESSION_TIMEOUT_MS);
}

export function clearSessionTimer() {
  if (sessionTimer) clearTimeout(sessionTimer);
  sessionTimer = null;
}

// Format currency
export function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Mask sensitive data
export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return acc;
  return '*'.repeat(acc.length - 4) + acc.slice(-4);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return local[0] + '*'.repeat(Math.max(1, local.length - 2)) + local.slice(-1) + '@' + domain;
}

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length < 4) return phone;
  return '*'.repeat(d.length - 4) + d.slice(-4);
}
