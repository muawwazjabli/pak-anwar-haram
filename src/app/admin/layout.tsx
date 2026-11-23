'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users,
  Compass,
  DollarSign,
  Inbox,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>('owner');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pah_admin_role') as UserRole;
    if (saved) setRole(saved);
  }, []);

  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('pah_admin_role', newRole);
  };

  const perms = getRolePermissions(role);

  const navItems = [
    { href: '/admin', label: 'Overview', icon: Compass },
    { href: '/admin/documents', label: 'Documents & Review Queue', icon: FileText },
    { href: '/admin/hotels', label: 'Hotels & Date Bands', icon: Building },
    { href: '/admin/visa-transport', label: 'Visa, Transport & Ziyarat', icon: Layers },
    { href: '/admin/flights', label: 'Airlines & Seat Inventory', icon: Plane },
    { href: '/admin/packages', label: 'Ready-Made Packages', icon: Package },
    { href: '/admin/bookings', label: 'Enquiries & Booking Requests', icon: Inbox },
    { href: '/admin/settings', label: 'Exchange Rates & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col md:flex-row text-gray-900" dir="ltr">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-950 text-white p-4 flex justify-between items-center">
        <div className="font-bold flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center text-xs font-bold">ح</span>
          <span>Pak Anwar Haram Admin</span>
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

          {/* Active Role Selector Badge */}
          <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-800 text-xs space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-brand-300 font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Current Role (Permissions):</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
              {(['owner', 'staff', 'read_only'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => changeRole(r)}
                  className={`py-1 px-1.5 rounded transition capitalize ${
                    role === r
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-emerald-950/60 text-gray-300 hover:text-white'
                  }`}
                >
                  {r === 'read_only' ? 'Read' : r}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-gray-300 pt-1">
              {role === 'owner' ? 'Owner: Full publish & pricing permissions' : role === 'staff' ? 'Staff: Upload & edit drafts, hold seats' : 'Read-only: Audit & view only'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-brand-500 text-white font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-emerald-900/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-2 pt-4 border-t border-emerald-900">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-brand-200 hover:bg-emerald-900 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200/80 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sticky top-0 z-30 shadow-xs">
          <div>
            <span className="text-xs font-mono text-gray-500">PAH Operations Workspace</span>
            <h2 className="text-lg font-bold text-gray-900 capitalize">
              {pathname === '/admin' ? 'Dashboard Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Logged in as <strong>{role}</strong></span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
