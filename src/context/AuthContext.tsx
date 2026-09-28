import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface KYCData {
  fullName: string;
  email: string;
  phone: string;
  nin: string; // National ID Number
  bankName: string;
  accountNumber: string;
  accountName: string;
  selfieUrl?: string;
  idDocUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'roi' | 'referral_bonus';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  reference?: string;
}

export interface Investment {
  id: string;
  planLabel: string;
  depositAmount: number;
  dailyRate: number;
  startDate: string;
  totalEarned: number;
  status: 'active' | 'completed';
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  referralEarnings: number;
  walletBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalROI: number;
  kyc: KYCData | null;
  investments: Investment[];
  transactions: Transaction[];
  twoFAEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateKYC: (data: KYCData) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  refreshROI: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'arbalist_user';
const USERS_KEY = 'arbalist_users_db';

function generateId() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateReferralCode(name: string) {
  return name.split(' ')[0].toUpperCase().slice(0, 4) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  // Auto ROI accumulation every minute (simulated)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setUser(prev => {
        if (!prev) return prev;
        const activeInvestments = prev.investments.filter(i => i.status === 'active');
        if (activeInvestments.length === 0) return prev;
        
        // Add ~1 minute worth of ROI (1.3% / day / 1440 minutes)
        const minuteROI = activeInvestments.reduce((sum, inv) => {
          return sum + (inv.depositAmount * 0.013) / 1440;
        }, 0);

        const updated = {
          ...prev,
          totalROI: prev.totalROI + minuteROI,
          walletBalance: prev.walletBalance + minuteROI,
          investments: prev.investments.map(inv =>
            inv.status === 'active'
              ? { ...inv, totalEarned: inv.totalEarned + (inv.depositAmount * 0.013) / 1440 }
              : inv
          ),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    // Also update in "db"
    try {
      const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      db[u.email] = { ...u, password: db[u.email]?.password };
      localStorage.setItem(USERS_KEY, JSON.stringify(db));
    } catch {}
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const entry = db[email.toLowerCase()];
      if (!entry) {
        setIsLoading(false);
        return { success: false, message: 'No account found with this email.' };
      }
      if (entry.password !== btoa(password)) {
        setIsLoading(false);
        return { success: false, message: 'Incorrect password.' };
      }
      const u: User = { ...entry, lastLogin: new Date().toISOString() };
      delete (u as any).password;
      saveUser(u);
      setIsLoading(false);
      return { success: true, message: 'Login successful!' };
    } catch {
      setIsLoading(false);
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    try {
      const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      if (db[data.email.toLowerCase()]) {
        setIsLoading(false);
        return { success: false, message: 'An account with this email already exists.' };
      }
      
      // Handle referral
      let referredBy: string | undefined;
      let referralBonusTx: Transaction | undefined;
      if (data.referralCode) {
        const referrer = Object.values(db).find((u: any) => u.referralCode === data.referralCode.toUpperCase()) as any;
        if (referrer) {
          referredBy = referrer.referralCode;
          // Give referrer a bonus
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          referrer.referralEarnings = (referrer.referralEarnings || 0) + 500;
          referrer.walletBalance = (referrer.walletBalance || 0) + 500;
          referrer.transactions = referrer.transactions || [];
          referrer.transactions.unshift({
            id: generateId(),
            type: 'referral_bonus',
            amount: 500,
            status: 'completed',
            description: `Referral bonus from ${data.fullName}`,
            createdAt: new Date().toISOString(),
          });
          db[referrer.email] = referrer;
          if (localStorage.getItem(STORAGE_KEY)) {
            const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            if (currentUser.email === referrer.email) {
              setUser(referrer);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(referrer));
            }
          }
        }
      }

      const newUser: User = {
        id: generateId(),
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        referralCode: generateReferralCode(data.fullName),
        referredBy,
        referralCount: 0,
        referralEarnings: 0,
        walletBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalROI: 0,
        kyc: null,
        investments: [],
        transactions: [],
        twoFAEnabled: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      db[data.email.toLowerCase()] = { ...newUser, password: btoa(data.password) };
      localStorage.setItem(USERS_KEY, JSON.stringify(db));
      saveUser(newUser);
      setIsLoading(false);
      return { success: true, message: 'Account created successfully!' };
    } catch {
      setIsLoading(false);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateKYC = (data: KYCData) => {
    if (!user) return;
    const updated = { ...user, kyc: data };
    saveUser(updated);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...tx,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...user,
      transactions: [newTx, ...user.transactions],
      walletBalance: tx.type === 'deposit' || tx.type === 'roi' || tx.type === 'referral_bonus'
        ? user.walletBalance + tx.amount
        : user.walletBalance - tx.amount,
      totalDeposited: tx.type === 'deposit' ? user.totalDeposited + tx.amount : user.totalDeposited,
      totalWithdrawn: tx.type === 'withdrawal' ? user.totalWithdrawn + tx.amount : user.totalWithdrawn,
    };
    saveUser(updated);
  };

  const refreshROI = () => {
    if (!user) return;
    const active = user.investments.filter(i => i.status === 'active');
    if (!active.length) return;
    const totalEarned = active.reduce((s, i) => {
      const days = (Date.now() - new Date(i.startDate).getTime()) / 86400000;
      return s + i.depositAmount * 0.013 * days;
    }, 0);
    const updated = { ...user, totalROI: totalEarned };
    saveUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, register, logout, updateKYC, addTransaction, refreshROI,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
