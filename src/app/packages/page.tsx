'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { formatPkr } from '@/lib/i18n/translations';
import { PackageGroup } from '@/types';
import {
  Package,
  Plane,
  Building,
  Users,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  CheckCircle
} from 'lucide-react';

export default function PackagesPage() {
  const { language, t, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [packages, setPackages] = useState<PackageGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('');
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'Sharing' | 'Quad' | 'Triple' | 'Double'>('all');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
    fetchPackages();
  }, [cityFilter, airlineFilter, maxBudget]);

  const fetchPackages = () => {
    setLoading(true);
    const params = new URLSearchParams({ public: 'true' });
    if (cityFilter) params.set('departureCity', cityFilter);
    if (airlineFilter) params.set('airline', airlineFilter);
    if (maxBudget) params.set('maxBudget', maxBudget);

    fetch(`/api/packages?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.packages) {
          setPackages(data.packages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Header />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ur' ? 'گروپ عمرہ پیکجز' : 'Ready-Made Packages'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950">
            {language === 'ur' ? 'تیار عمرہ پیکجز اور مصدقہ ریٹس' : 'Ready-Made Umrah Packages & Group Departures'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {language === 'ur'
              ? 'مستند ہول سیل ریٹس کے ساتھ تیار کردہ پیکجز۔ سیٹیں، ہوٹل کی دوری، اور تمام سہولیات واضح دیکھیں۔'
              : 'Browse pre-configured airline group departures with verified hotels, baggage, and transparent selling pricing.'}
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-brand-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{language === 'ur' ? 'روانگی کا شہر' : 'Departure City'}</label>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
            >
              <option value="">{language === 'ur' ? 'تمام شہر' : 'All Cities'}</option>
              <option value="PEW">Peshawar (PEW)</option>
              <option value="LHE">Lahore (LHE)</option>
              <option value="ISB">Islamabad (ISB)</option>
              <option value="MUX">Multan (MUX)</option>
              <option value="SKT">Sialkot (SKT)</option>
              <option value="LYP">Faisalabad (LYP)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{language === 'ur' ? 'ائیرلائن' : 'Airline'}</label>
            <select
              value={airlineFilter}
              onChange={e => setAirlineFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
            >
              <option value="">{language === 'ur' ? 'تمام ائیرلائنز' : 'All Airlines'}</option>
              <option value="Qatar Airways">Qatar Airways (QR)</option>
              <option value="Saudi Arabian Airlines">Saudi Arabian Airlines (SV)</option>
              <option value="Salam Airline">Salam Airline (OV)</option>
              <option value="Airsial">AirSial (PF)</option>
              <option value="flydubai">flydubai (FZ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{language === 'ur' ? 'رہائش' : 'Occupancy'}</label>
            <select
              value={occupancyFilter}
              onChange={e => setOccupancyFilter(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
            >
              <option value="all">{language === 'ur' ? 'تمام آپشنز' : 'All Occupancies'}</option>
              <option value="Sharing">Sharing (شیئرنگ)</option>
              <option value="Quad">Quad (کواڈ - ۴ افراد)</option>
              <option value="Triple">Triple (ٹرپل - ۳ افراد)</option>
              <option value="Double">Double (ڈبل - ۲ افراد)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{language === 'ur' ? 'زیادہ سے زیادہ بجٹ (PKR)' : 'Max Budget (PKR)'}</label>
            <input
              type="number"
              placeholder="e.g. 300000"
              value={maxBudget}
              onChange={e => setMaxBudget(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300 bg-white text-xs font-mono"
            />
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">{language === 'ur' ? 'پیکجز لوڈ ہو رہے ہیں...' : 'Loading packages...'}</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
            <p className="text-gray-600">{language === 'ur' ? 'کوئی پیکج نہیں ملا۔' : 'No packages matched the selected filters.'}</p>
            <button
              onClick={() => { setCityFilter(''); setAirlineFilter(''); setMaxBudget(''); }}
              className="px-4 py-2 rounded-lg bg-brand-100 text-brand-900 text-xs font-bold"
            >
              {language === 'ur' ? 'فلٹرز ختم کریں' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-brand-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                      {pkg.groupCode}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-600" />
                      <span>{pkg.totalSeats} {language === 'ur' ? 'سیٹیں' : 'Seats'}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{pkg.flightSummary}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-gray-400" />
                      <span>{pkg.airlineName} • {pkg.departureCity}</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === 'ur' ? 'مدت:' : 'Total Nights:'}</span>
                      <strong className="text-gray-900">{pkg.nightsTotal} {language === 'ur' ? 'راتیں' : 'Nights'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === 'ur' ? 'سامان:' : 'Baggage:'}</span>
                      <strong className="text-gray-900">{pkg.baggage || '25 Kg'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === 'ur' ? 'تاریخ:' : 'Travel Date:'}</span>
                      <strong className="text-gray-900 font-mono" dir="ltr">{pkg.travelStartDate}</strong>
                    </div>
                  </div>

                  {/* Variants and Hotel Breakdown */}
                  {pkg.variants && pkg.variants.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'ہوٹل اور رہائش کے ریٹس:' : 'Approved Rates per Variant:'}
                      </div>

                      {pkg.variants.map(v => (
                        <div key={v.id} className="p-2.5 rounded-lg bg-brand-50/40 border border-brand-100/80 text-xs space-y-1.5">
                          <div className="font-bold text-emerald-950 flex justify-between">
                            <span>{v.variantCode}</span>
                            <span className="text-[11px] text-gray-500">Makkah {v.makkahNights}N + Madinah {v.madinahNights}N</span>
                          </div>
                          <div className="text-[11px] text-gray-600 line-clamp-1">
                            🕋 {v.makkahHotelName} ({v.makkahDistance})
                          </div>
                          <div className="text-[11px] text-gray-600 line-clamp-1">
                            🕌 {v.madinahHotelName} ({v.madinahDistance})
                          </div>

                          <div className="pt-1.5 grid grid-cols-2 gap-1 text-[11px] font-mono" dir="ltr">
                            <div className="bg-white p-1 rounded border border-gray-200">
                              <span className="text-gray-500">Sharing: </span>
                              <strong className="text-emerald-900">{formatPkr(v.effectiveSharing)}</strong>
                            </div>
                            <div className="bg-white p-1 rounded border border-gray-200">
                              <span className="text-gray-500">Quad: </span>
                              <strong className="text-emerald-900">{formatPkr(v.effectiveQuad)}</strong>
                            </div>
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
                    <span>{language === 'ur' ? 'بکنگ کروائیں' : 'View & Book'}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
