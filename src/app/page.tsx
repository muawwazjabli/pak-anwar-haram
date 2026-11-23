'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { formatPkr } from '@/lib/i18n/translations';
import { PackageGroup } from '@/types';
import {
  Calendar,
  Package,
  Plane,
  Building,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Compass,
  MessageCircle
} from 'lucide-react';

export default function HomePage() {
  const { language, t, dir } = useLanguage();
  const [featuredPackages, setFeaturedPackages] = useState<PackageGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages?public=true')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.packages) {
          setFeaturedPackages(data.packages.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-500/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d5a85e_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-300 text-xs sm:text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>{language === 'ur' ? 'عمرہ سیزن 1448ھ - رمضان المبارک اور عمومی بکنگز دستیاب' : 'Umrah Season 1448H - Ramadan & Regular Group Seats Open'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-xl text-gray-300 font-normal leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calculator"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-base shadow-lg shadow-brand-900/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5 text-brand-200" />
                <span>{t.ctaBuildPackage}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>

              <Link
                href="/packages"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2.5 transition"
              >
                <Package className="w-5 h-5 text-brand-300" />
                <span>{t.ctaBrowsePackages}</span>
              </Link>
            </div>

            {/* Micro value props */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-brand-200/90 max-w-4xl mx-auto border-t border-emerald-800/80">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ur' ? 'مصدقہ ہوٹل واؤچرز' : 'Direct Hotel Vouchers'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ur' ? 'محفوظ ائیرلائن سیٹیں' : 'Guaranteed Flight Seats'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ur' ? 'شفاف قیمت کا حساب' : 'Transparent Nightly Rates'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ur' ? 'فوری واٹس ایپ کوٹ' : 'Instant WhatsApp Quotes'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* READY-MADE PACKAGES SPOTLIGHT */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <div className="text-brand-600 font-bold text-sm tracking-wide uppercase mb-1 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>{language === 'ur' ? 'مقبول ترین گروپس' : 'Featured Group Departures'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                {language === 'ur' ? 'تیار عمرہ پیکجز اور تصدیق شدہ سیٹیں' : 'Ready-Made Packages & Approved Rates'}
              </h2>
            </div>

            <Link
              href="/packages"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group"
            >
              <span>{language === 'ur' ? 'تمام پیکجز دیکھیں' : 'View All Packages'}</span>
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>{language === 'ur' ? 'پیکجز لوڈ ہو رہے ہیں...' : 'Loading packages...'}</p>
            </div>
          ) : featuredPackages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <p className="text-gray-600 mb-4">{language === 'ur' ? 'کوئی پیکج دستیاب نہیں ہے۔' : 'No public packages published yet.'}</p>
              <Link href="/calculator" className="text-brand-600 font-semibold hover:underline">
                {language === 'ur' ? 'اپنا مرضی کا پیکج بنائیں' : 'Build a custom package instead'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-brand-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                        {pkg.groupCode}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-brand-600" />
                        <span>{pkg.totalSeats} {language === 'ur' ? 'سیٹیں' : 'Seats'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {pkg.flightSummary}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-gray-400" />
                        <span>{pkg.airlineName} • {pkg.departureCity}</span>
                      </p>
                    </div>

                    <div className="bg-brand-50/60 p-3 rounded-xl border border-brand-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'ur' ? 'کل مدت:' : 'Duration:'}</span>
                        <span className="font-semibold text-gray-900">{pkg.nightsTotal} {language === 'ur' ? 'راتیں' : 'Nights'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'ur' ? 'سامان (Baggage):' : 'Baggage:'}</span>
                        <span className="font-semibold text-gray-900">{pkg.baggage || '25 Kg'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'ur' ? 'سفر کی تاریخ:' : 'Travel Date:'}</span>
                        <span className="font-semibold text-gray-900 font-mono" dir="ltr">{pkg.travelStartDate}</span>
                      </div>
                    </div>

                    {/* Variant options preview */}
                    {pkg.variants && pkg.variants.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-500 font-medium">
                          {language === 'ur' ? 'ہوٹل آپشنز:' : 'Hotel Options:'}
                        </div>
                        {pkg.variants.slice(0, 2).map(v => (
                          <div key={v.id} className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                            <div className="font-semibold text-emerald-900">{v.makkahHotelName}</div>
                            <div className="text-[11px] text-gray-500">
                              Makkah {v.makkahNights}N ({v.makkahDistance}) + Madinah {v.madinahNights}N ({v.madinahDistance})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold">
                        {language === 'ur' ? 'شروعات از' : 'Starting From'}
                      </div>
                      <div className="text-xl font-extrabold text-emerald-900 font-mono" dir="ltr">
                        {formatPkr(pkg.summaryFromPricePkr)}
                      </div>
                    </div>

                    <Link
                      href={`/packages/${pkg.id}`}
                      className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center gap-1"
                    >
                      <span>{language === 'ur' ? 'تفصیل و بکنگ' : 'Details & Book'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CUSTOM PACKAGE BUILDER CALLOUT */}
        <section className="bg-brand-50/80 border-y border-brand-200/80 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-4 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-brand-200 text-brand-900 text-xs font-bold uppercase tracking-wider">
                {language === 'ur' ? 'خود کار ریٹ انجن' : '5-Step Smart Engine'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-950">
                {language === 'ur'
                  ? 'اپنی پسند کا ہوٹل، تاریخیں اور ویزا ٹرانسپورٹ منتخب کریں'
                  : 'Customize Every Detail of Your Sacred Trip'}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {language === 'ur'
                  ? 'مکہ اور مدینہ کے ہوٹلوں کے الگ الگ تاریخ بینڈز، ڈبل، ٹرپل، کواڈ یا کوئنٹ کمرے، راؤنڈ ٹرپ بس یا پرائیویٹ کار، اور مصدقہ سعودی ریال تا پاکستانی روپے کا شفاف حساب۔'
                  : 'Flexible night-by-night pricing across date bands, Double, Triple, Quad, Quint room options, inclusive check-in & exclusive checkout math, and instant quote snapshot generation.'}
              </p>
            </div>

            <Link
              href="/calculator"
              className="shrink-0 px-8 py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base shadow-lg transition flex items-center gap-2"
            >
              <Compass className="w-5 h-5 text-brand-300" />
              <span>{t.ctaBuildPackage}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
