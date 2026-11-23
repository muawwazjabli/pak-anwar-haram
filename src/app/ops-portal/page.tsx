'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Building,
  Plane,
  FileText,
  DollarSign,
  Inbox,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatPkr } from '@/lib/i18n/translations';

export default function OpsPortalDashboard() {
  const [stats, setStats] = useState({
    packagesCount: 0,
    hotelsCount: 0,
    flightsCount: 0,
    documentsCount: 0,
    bookingsCount: 0,
    sarRate: 74.50
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [pkgRes, hotRes, fltRes, docRes, bkgRes, setRes] = await Promise.all([
          fetch('/api/packages').then(r => r.json()),
          fetch('/api/hotels').then(r => r.json()),
          fetch('/api/flights').then(r => r.json()),
          fetch('/api/documents').then(r => r.json()),
          fetch('/api/bookings').then(r => r.json()),
          fetch('/api/settings').then(r => r.json())
        ]);

        setStats({
          packagesCount: pkgRes.packages ? pkgRes.packages.length : 0,
          hotelsCount: hotRes.hotels ? hotRes.hotels.length : 0,
          flightsCount: fltRes.flights ? fltRes.flights.length : 0,
          documentsCount: docRes.documents ? docRes.documents.length : 0,
          bookingsCount: bkgRes.bookings ? bkgRes.bookings.length : 0,
          sarRate: setRes.settings && setRes.settings.exchangeRateSarToPkr ? setRes.settings.exchangeRateSarToPkr : 74.50
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-brand-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>پاک انوار حرم — مینجمنٹ کنسول</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">آپریشنز اور ریٹس ڈیش بورڈ</h1>
          <p className="text-sm text-emerald-100/80 max-w-2xl">
            یہاں سے آپ نئے عمرہ پیکیجز پی ڈی ایف یا مینوئل شامل کر سکتے ہیں، ہوٹلوں کے ریٹ تواریخ کے حساب سے اپ ڈیٹ کر سکتے ہیں، اور پروازوں کے شیڈول اور سیٹیں مینیج کر سکتے ہیں۔
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/ops-portal/packages"
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>نیا پیکیج ایڈ کریں (PDF یا مینوئل)</span>
            </Link>

            <Link
              href="/ops-portal/hotels"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur border border-white/20 transition"
            >
              <Plus className="w-4 h-4 text-brand-400" />
              <span>ہوٹل ریٹ تاریخ کے حساب سے شامل کریں</span>
            </Link>

            <Link
              href="/ops-portal/flights"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur border border-white/20 transition"
            >
              <Plus className="w-4 h-4 text-brand-400" />
              <span>فلائٹ شیڈول اور سیٹیں درج کریں</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>دستیاب پیکیجز</span>
            <Package className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {loading ? '...' : stats.packagesCount}
          </div>
          <Link href="/ops-portal/packages" className="text-xs text-brand-700 hover:underline flex items-center gap-1 font-semibold">
            <span>تفصیلات دیکھیں</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>رجسٹرڈ ہوٹلز</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {loading ? '...' : stats.hotelsCount}
          </div>
          <Link href="/ops-portal/hotels" className="text-xs text-emerald-800 hover:underline flex items-center gap-1 font-semibold">
            <span>تاریخ وار ریٹس دیکھیں</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>ایئرلائن فلائٹ شیڈولز</span>
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {loading ? '...' : stats.flightsCount}
          </div>
          <Link href="/ops-portal/flights" className="text-xs text-blue-800 hover:underline flex items-center gap-1 font-semibold">
            <span>سیٹیں اور شیڈول دیکھیں</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>سعودی ریال ریٹ (SAR)</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            {loading ? '...' : `${stats.sarRate} PKR`}
          </div>
          <Link href="/ops-portal/settings" className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-semibold">
            <span>ریٹ تبدیل کریں</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Packages */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">عمرہ پیکیجز مینیجر</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              ہول سیل سپلائر سے موصول ہونے والی پی ڈی ایف اپلوڈ کر کے خودکار طریقہ سے پیکیج بنائیں یا خود نئے ریٹس، ہوٹل اور قیمتیں درج کریں۔
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/ops-portal/packages"
              className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-brand-50 hover:text-brand-700 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>پیکیجز کھولیں</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Hotels */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">ہوٹل اور نائٹلی ریٹ بینڈز</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              مکہ و مدینہ کے ہوٹلوں کے لیے مخصوص تاریخوں (مثلاً یکم دسمبر تا ۲۰ دسمبر یا رمضان المبارک) کے حساب سے ڈبل، ٹرپل، کواڈ اور شیئرنگ بیڈ ریٹس سیٹ کریں۔
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/ops-portal/hotels"
              className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>ہوٹل ریٹس کھولیں</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 3: Flights */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">فلائٹ شیڈول اور سیٹ اِنوینٹری</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              دستیاب ایئرلائن گروپس (پی آئی اے، سعودی، ایئربلیو، سیرین) کے روٹس، روانگی و واپسی کا وقت، کرایہ اور سیٹوں کی ہولڈ و کنفرمیشن مینیج کریں۔
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/ops-portal/flights"
              className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-800 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>فلائٹ شیڈول کھولیں</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
