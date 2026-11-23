'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function OpsPortalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('PakAnwar#786');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('pah_user', JSON.stringify(data.user));
        localStorage.setItem('pah_admin_role', data.user.role || 'owner');
        router.push('/ops-portal');
      } else {
        setError(data.error || 'صارف کا نام یا پاسورڈ درست نہیں ہے۔');
      }
    } catch (err: any) {
      setError(err.message || 'لاگ اِن میں مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-emerald-800/20 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 items-center justify-center text-white text-3xl font-black shadow-lg">
            ح
          </div>
          <h1 className="text-2xl font-black text-gray-900">پاک انوارِ حرم</h1>
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest">
            Operations Management Portal
          </p>
          <p className="text-xs text-gray-500">
            خصوصی ایڈمن پورٹل برائے عمرہ ریٹس، فلائٹس اور پیکیجز
          </p>
        </div>

        {/* Credentials Reminder Box */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1.5" dir="rtl">
          <div className="font-bold flex items-center gap-1.5 text-emerald-950">
            <Shield className="w-4 h-4 text-brand-600" />
            <span>ایڈمن لاگ اِن معلومات (Default Credentials):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px] pt-1">
            <div className="bg-white p-2 rounded-lg border border-emerald-100">
              <span className="text-gray-500 block text-[10px]">صارف کا نام / Email:</span>
              <span className="font-mono font-bold text-gray-900">admin</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-100">
              <span className="text-gray-500 block text-[10px]">پاسورڈ (Password):</span>
              <span className="font-mono font-bold text-gray-900">PakAnwar#786</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" />
              <span>صارف کا نام یا ای میل (Username / Email)</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin یا admin@pakanwarharam.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-600" />
              <span>پاسورڈ (Password)</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 focus:bg-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>لاگ اِن ہو رہا ہے...</span>
            ) : (
              <>
                <span>پورٹل میں داخل ہوں (Sign In)</span>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-gray-400 text-[11px]">
          پاک انوار حرم ٹریول اینڈ ٹورز &bull; محفوظ آپریشنز سسٹم
        </div>

      </div>
    </div>
  );
}
