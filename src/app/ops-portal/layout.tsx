'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { getRolePermissions } from '@/lib/auth/permissions';
import {
  FileText,
  Building,
  Plane,
  Package,
  Layers,
  Settings,
  Shield,
  Compass,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export default function OpsPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('owner');
  const [userEmail, setUserEmail] = useState('admin@pakanwarharam.com');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // If on login page, render children directly without sidebar
  const isLoginPage = pathname === '/ops-portal/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    const savedUser = localStorage.getItem('pah_user');
    const savedRole = localStorage.getItem('pah_admin_role') as UserRole;

    if (!savedUser) {
      router.push('/ops-portal/login');
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      setUserEmail(parsed.email || 'admin@pakanwarharam.com');
      if (parsed.role) setRole(parsed.role);
    } catch (e) {
      // fallback
    }

    if (savedRole) setRole(savedRole);
    setAuthChecked(true);
  }, [pathname, isLoginPage, router]);

  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('pah_admin_role', newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('pah_user');
    localStorage.removeItem('pah_admin_role');
    router.push('/ops-portal/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500">لوڈ ہو رہا ہے...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/ops-portal', label: 'ڈیش بورڈ (Overview)', icon: Compass },
    { href: '/ops-portal/packages', label: 'عمرہ پیکیجز اور پی ڈی ایف', icon: Package },
    { href: '/ops-portal/hotels', label: 'ہوٹل ریٹس (تاریخ کے حساب سے)', icon: Building },
    { href: '/ops-portal/flights', label: 'فلائٹ شیڈول اور سیٹیں', icon: Plane },
    { href: '/ops-portal/documents', label: 'دستاویزات اور اِنوائسز', icon: FileText },
    { href: '/ops-portal/visa-transport', label: 'ویزا اور ٹرانسپورٹ رولز', icon: Layers },
    { href: '/ops-portal/bookings', label: 'بکنگ درخواستیں اور انکوائریز', icon: Inbox },
    { href: '/ops-portal/settings', label: 'سیٹنگز اور ریال ریٹ', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col md:flex-row text-gray-900" dir="ltr">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-950 text-white p-4 flex justify-between items-center">
        <div className="font-bold flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center text-xs font-bold">ح</span>
          <span>پاک انوار حرم آپریشنز</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 rounded text-gray-300">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 bg-emerald-950 text-brand-100 flex-col justify-between p-4 shrink-0 ${mobileOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-2 py-2 border-b border-emerald-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-xl shadow">
              ح
            </div>
            <div>
              <div className="font-bold text-white text-sm">پاک انوارِ حرم</div>
              <div className="text-[11px] text-brand-300 font-mono">Operations Portal</div>
            </div>
          </div>

          {/* User & Role Badge */}
          <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-brand-300">
              <span className="flex items-center gap-1 font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Signed In:</span>
              </span>
              <span className="font-mono text-white text-[10px] truncate max-w-[100px]">{userEmail}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-brand-300 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 text-brand-400" />
              <span>Role Permissions:</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold">
              {(['owner', 'staff', 'read_only'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => changeRole(r)}
                  className={`py-1 px-1 rounded transition capitalize text-center ${
                    role === r
                      ? 'bg-brand-500 text-white shadow-sm font-bold'
                      : 'bg-emerald-950/60 text-gray-300 hover:text-white'
                  }`}
                >
                  {r === 'read_only' ? 'Read' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="space-y-2 pt-4 border-t border-emerald-900 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-brand-300 hover:text-white hover:bg-emerald-900/40 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>پبلک ویب سائٹ دیکھیں</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-red-300 hover:text-white hover:bg-red-950/60 transition"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>لاگ آؤٹ (Sign Out)</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
