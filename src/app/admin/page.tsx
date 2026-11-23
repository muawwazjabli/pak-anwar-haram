'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPkr } from '@/lib/i18n/translations';
import {
  FileText,
  Building,
  Plane,
  Package,
  Inbox,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    reviewPending: 0,
    activeHotels: 0,
    airlineGroups: 0,
    packagesCount: 0,
    newBookings: 0,
    sarRate: 74.50
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    // Load counts
    Promise.all([
      fetch('/api/documents/review').then(r => r.json()),
      fetch('/api/hotels').then(r => r.json()),
      fetch('/api/flights').then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([rev, hot, fli, pkg, bok, set]) => {
      setStats({
        reviewPending: rev.reviewItems ? rev.reviewItems.filter((i: any) => i.status === 'pending').length : 0,
        activeHotels: hot.hotels ? hot.hotels.length : 0,
        airlineGroups: fli.flights ? fli.flights.length : 0,
        packagesCount: pkg.packages ? pkg.packages.length : 0,
        newBookings: bok.bookingRequests ? bok.bookingRequests.filter((b: any) => b.status === 'New').length : 0,
        sarRate: set.activeExchangeRate ? set.activeExchangeRate.rate : 74.50
      });
      if (bok.bookingRequests) {
        setRecentBookings(bok.bookingRequests.slice(0, 5));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Pak Anwar Haram Wholesale & Retail Manager</h1>
          <p className="text-xs text-gray-300">
            Current Approved SAR to PKR Exchange Rate: <strong className="text-brand-300 font-mono" dir="ltr">{stats.sarRate} PKR</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/documents"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Supplier Sheet</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-medium">Review Queue</span>
            <AlertCircle className={`w-4 h-4 ${stats.reviewPending > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.reviewPending}</div>
          <div className="text-[11px] text-gray-500">Pending approval</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-medium">Hotels</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.activeHotels}</div>
          <div className="text-[11px] text-gray-500">Makkah & Madinah</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-medium">Airline Groups</span>
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.airlineGroups}</div>
          <div className="text-[11px] text-gray-500">Flight pair allotments</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-medium">Packages</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.packagesCount}</div>
          <div className="text-[11px] text-gray-500">Ready-made groups</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2 col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-medium">New Enquiries</span>
            <Inbox className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">{stats.newBookings}</div>
          <div className="text-[11px] text-gray-500">Awaiting staff action</div>
        </div>
      </div>

      {/* Quick Launch & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-sm">Recent Customer Enquiries</h3>
            <Link href="/admin/bookings" className="text-xs text-brand-700 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No enquiries recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {recentBookings.map((b: any) => (
                <div key={b.id} className="py-3 flex justify-between items-center gap-3">
                  <div>
                    <div className="font-bold text-gray-900">{b.customerName}</div>
                    <div className="text-gray-500 font-mono" dir="ltr">{b.customerPhone} • {b.requestReference}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{b.partySummary}</div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    b.status === 'New' ? 'bg-amber-100 text-amber-800' :
                    b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-3">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Operational Shortcuts</h3>

          <Link
            href="/admin/documents"
            className="p-3 rounded-xl border border-gray-200 hover:border-brand-400 bg-gray-50/50 flex items-center justify-between transition group"
          >
            <div>
              <div className="font-semibold text-xs text-gray-900 group-hover:text-brand-700">Import Supplier Images / PDFs</div>
              <div className="text-[11px] text-gray-500">Parse Meezab, Al-Saboor or UmrahGroups</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/admin/hotels"
            className="p-3 rounded-xl border border-gray-200 hover:border-brand-400 bg-gray-50/50 flex items-center justify-between transition group"
          >
            <div>
              <div className="font-semibold text-xs text-gray-900 group-hover:text-brand-700">Manage Hotel Date Bands</div>
              <div className="text-[11px] text-gray-500">Checkout till 30 Nov, Ramadan bands</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/admin/flights"
            className="p-3 rounded-xl border border-gray-200 hover:border-brand-400 bg-gray-50/50 flex items-center justify-between transition group"
          >
            <div>
              <div className="font-semibold text-xs text-gray-900 group-hover:text-brand-700">Airline Seat Holds & Confirms</div>
              <div className="text-[11px] text-gray-500">Atomic capacity check & booking ref</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/admin/packages"
            className="p-3 rounded-xl border border-gray-200 hover:border-brand-400 bg-gray-50/50 flex items-center justify-between transition group"
          >
            <div>
              <div className="font-semibold text-xs text-gray-900 group-hover:text-brand-700">Discount & Price Rules</div>
              <div className="text-[11px] text-gray-500">Occupancy discounts & below-cost safety</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
