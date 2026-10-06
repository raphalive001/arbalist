import { useState } from 'react';
import { Settings, User, Lock, Bell, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export default function SettingsPage() {
  const { profile, refetchProfile } = useAuth();
  const [fullName, setFullName]         = useState(profile?.full_name ?? '');
  const [phone,    setPhone]            = useState(profile?.phone ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setProfileLoading(true);
    const update: ProfileUpdate = { full_name: fullName, phone };
    const { error } = await supabase.from('profiles').update(update).eq('id', profile.id);
    setProfileLoading(false);
    if (error) toast.error(error.message);
    else { toast.success('Profile updated!'); refetchProfile?.(); }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8)   { toast.error('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); setNewPw(''); setConfirmPw(''); }
  }

  const inputCls  = 'w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all';
  const labelCls  = 'block text-sm font-medium text-gray-300 mb-2';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-lime-400" /> Settings
        </h1>
        <p className="mt-1 text-gray-400">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-lime-400" /> Profile Information
        </h2>
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="John Doe" />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="email" value={profile?.email ?? ''} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+234 800 000 0000" />
          </div>
          <button type="submit" disabled={profileLoading}
            className="bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold px-6 py-3 rounded-xl hover:bg-lime-400/20 transition-all disabled:opacity-50">
            {profileLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-lime-400" /> Change Password
        </h2>
        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className={labelCls}>New Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={newPw}
                onChange={(e) => setNewPw(e.target.value)} required
                className={`${inputCls} pr-11`} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              required className={inputCls} placeholder="Repeat new password" />
          </div>
          <button type="submit" disabled={pwLoading}
            className="bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold px-6 py-3 rounded-xl hover:bg-lime-400/20 transition-all disabled:opacity-50">
            {pwLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Bell className="w-4 h-4 text-lime-400" /> Notifications
        </h2>
        <div className="space-y-3">
          {[
            { label: 'ROI Credited',          desc: 'Get notified when daily ROI is added to your wallet' },
            { label: 'Deposit Confirmed',      desc: 'Alerts when your deposit is confirmed' },
            { label: 'Withdrawal Processed',   desc: 'Alerts when your withdrawal is completed' },
            { label: 'New Referral',           desc: 'Get notified when someone uses your referral link' },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-3 border-b border-dark-50/10 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{n.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-dark-500 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-400" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-6">
        <h2 className="font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button className="bg-red-400/10 border border-red-400/30 text-red-400 font-semibold px-6 py-3 rounded-xl hover:bg-red-400/20 transition-all text-sm">
          Delete Account
        </button>
      </div>
    </div>
  );
}
