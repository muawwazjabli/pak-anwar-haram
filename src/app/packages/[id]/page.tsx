'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { formatPkr } from '@/lib/i18n/translations';
import { PackageGroup, PackageVariant } from '@/types';
import {
  Package,
  Plane,
  Building,
  Users,
  Check,
  Send,
  MessageCircle,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function PackageDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { language, t } = useLanguage();

  const [packageGroup, setPackageGroup] = useState<PackageGroup | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PackageVariant | null>(null);
  const [selectedOccupancy, setSelectedOccupancy] = useState<'Sharing' | 'Quad' | 'Triple' | 'Double'>('Sharing');
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paxCount, setPaxCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccessRef, setBookingSuccessRef] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/packages?public=true')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.packages) {
          const match = data.packages.find((p: PackageGroup) => p.id === id || p.groupCode === id);
          if (match) {
            setPackageGroup(match);
            if (match.variants && match.variants.length > 0) {
              setSelectedVariant(match.variants[0]);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedVariant) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          packageVariantId: selectedVariant.id,
          partySummary: `${paxCount} Pax - ${packageGroup?.groupCode} / ${selectedVariant.variantCode} (${selectedOccupancy})`
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccessRef(data.requestReference);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getOccupancyPrice = (v: PackageVariant, occ: 'Sharing' | 'Quad' | 'Triple' | 'Double') => {
    const effective = (v as any)[`effective${occ}`];
    const originalSelling = (v as any)[`selling${occ}`];
    const discount = v.activeDiscounts ? (v.activeDiscounts as any)[occ.toLowerCase()] : 0;
    return { effective, originalSelling, discount };
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading package details...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!packageGroup) {
    return (
      <>
        <Header />
        <main className="flex-1 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-900">Package not found</h2>
          <p className="text-xs text-gray-500 mt-2">The requested group package could not be located.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 space-y-4">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-400/40 text-xs font-bold font-mono" dir="ltr">
              {packageGroup.groupCode}
            </span>
            <span className="text-xs text-brand-200">
              {packageGroup.totalSeats} {language === 'ur' ? 'مختص سیٹیں' : 'Total Group Seats'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold">{packageGroup.flightSummary}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-300 pt-2 border-t border-emerald-900">
            <span>✈️ <strong>{packageGroup.airlineName}</strong></span>
            <span>🛫 <strong>{packageGroup.departureCity}</strong></span>
            <span>📅 <strong>{packageGroup.travelStartDate}</strong> to <strong>{packageGroup.travelEndDate}</strong></span>
            <span>🧳 <strong>{packageGroup.baggage || '25 Kg'}</strong></span>
            <span>🌙 <strong>{packageGroup.nightsTotal} Nights</strong></span>
          </div>
        </div>

        {/* Variant options selection */}
        {packageGroup.variants && packageGroup.variants.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-emerald-950">
              {language === 'ur' ? 'ہوٹل آپشن منتخب کریں (Package Options)' : 'Select Package Hotel Option'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packageGroup.variants.map(v => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-5 rounded-2xl border cursor-pointer transition space-y-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-emerald-950 font-mono" dir="ltr">
                        {v.variantCode}
                      </span>
                      <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                        Makkah {v.makkahNights}N • Madinah {v.madinahNights}N
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-medium text-gray-800">🕋 {v.makkahHotelName}</div>
                      <div className="text-gray-500 text-[11px]">{v.makkahDistance}</div>
                      <div className="font-medium text-gray-800 pt-1">🕌 {v.madinahHotelName}</div>
                      <div className="text-gray-500 text-[11px]">{v.madinahDistance}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Occupancy Pricing Grid for Selected Variant */}
        {selectedVariant && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-emerald-950">
              {language === 'ur' ? 'رہائش اور قیمت فی کس (Approved Selling Rates)' : 'Select Room Occupancy'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {(['Sharing', 'Quad', 'Triple', 'Double'] as const).map(occ => {
                const { effective, originalSelling, discount } = getOccupancyPrice(selectedVariant, occ);
                const isSelected = selectedOccupancy === occ;

                return (
                  <div
                    key={occ}
                    onClick={() => setSelectedOccupancy(occ)}
                    className={`p-4 rounded-xl border cursor-pointer transition text-center space-y-2 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-800 text-white shadow-md'
                        : 'border-gray-200 bg-gray-50/60 hover:border-brand-400 text-gray-900'
                    }`}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-brand-200' : 'text-gray-500'}`}>
                      {occ}
                    </div>

                    <div>
                      {discount > 0 && originalSelling && (
                        <div className={`text-xs line-through ${isSelected ? 'text-gray-300' : 'text-gray-400'} font-mono`} dir="ltr">
                          {formatPkr(originalSelling)}
                        </div>
                      )}
                      <div className="text-lg font-black font-mono" dir="ltr">
                        {formatPkr(effective)}
                      </div>
                    </div>

                    {discount > 0 && (
                      <span className="inline-block text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                        Save {discount.toLocaleString()} PKR
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Inclusions */}
            <div className="pt-4 border-t border-gray-100 text-xs space-y-2">
              <div className="font-bold text-gray-800">
                {language === 'ur' ? 'پیکج میں کیا شامل ہے:' : 'Package Inclusions:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Return Air Ticket</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Umrah Visa & Insurance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hotel Accommodation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Ground Transport</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {!bookingSuccessRef ? (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-emerald-950">
                  {language === 'ur' ? 'اس پیکج کی بکنگ کی درخواست بھیجیں' : 'Request Reservation for this Package'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'ur'
                    ? 'ہمارا عملہ آپ کی مختص سیٹوں اور ہوٹل واؤچرز کی تیاری شروع کرے گا۔'
                    : 'Submit your contact information. Staff will verify local seat inventory and issue a confirmation hold.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.fullName} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muawwaz Jabli"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phoneWhatsApp} *</label>
                  <input
                    type="text"
                    required
                    placeholder="0322-2188218"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Passengers</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={paxCount}
                    onChange={e => setPaxCount(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'درخواست بھیجی جا رہی ہے...' : t.submitBooking}</span>
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-emerald-950 text-lg">
                {language === 'ur' ? 'بکنگ کی درخواست موصول ہو گئی ہے!' : 'Booking Request Successfully Placed!'}
              </h4>
              <p className="text-sm text-emerald-900 font-mono font-bold" dir="ltr">
                Reference: {bookingSuccessRef}
              </p>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                {language === 'ur'
                  ? 'آپ کی بکنگ کا عملہ جائزہ لے کر آپ کو واٹس ایپ پر مطلع کرے گا۔'
                  : 'Your request is recorded under status New. Staff will hold seats and send you WhatsApp confirmation.'}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
