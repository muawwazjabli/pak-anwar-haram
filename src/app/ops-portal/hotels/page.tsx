'use client';

import React, { useState, useEffect } from 'react';
import { Hotel } from '@/types';
import { formatSar } from '@/lib/i18n/translations';
import {
  Building,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  X,
  MapPin,
  Bus
} from 'lucide-react';

export default function OpsPortalHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<'all' | 'Makkah' | 'Madinah'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Hotel / Date Band modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHotelOption, setSelectedHotelOption] = useState<'existing' | 'new'>('existing');
  const [targetHotelId, setTargetHotelId] = useState('');
  
  // New hotel fields
  const [newHotelName, setNewHotelName] = useState('');
  const [newCity, setNewCity] = useState<'Makkah' | 'Madinah'>('Makkah');
  const [newLocation, setNewLocation] = useState('Ibrahim Khalil Road');
  const [newDistance, setNewDistance] = useState('450 MTR');
  const [newShuttle, setNewShuttle] = useState(false);

  // Date Band fields (کس تاریخ سے کس تاریخ تک)
  const [bandLabel, setBandLabel] = useState('Standard Season');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-20');

  // Rates in SAR
  const [rateDouble, setRateDouble] = useState('250');
  const [rateTriple, setRateTriple] = useState('250');
  const [rateQuad, setRateQuad] = useState('250');
  const [rateSharing, setRateSharing] = useState('65');
  const [rateQuint, setRateQuint] = useState('');

  useEffect(() => {
    loadHotels();
  }, [cityFilter]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter !== 'all') params.set('city', cityFilter);

      const res = await fetch(`/api/hotels?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.hotels) {
        setHotels(data.hotels);
        if (data.hotels.length > 0 && !targetHotelId) {
          setTargetHotelId(data.hotels[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHotelAndRates = async (e: React.FormEvent) => {
    e.preventDefault();

    const rates = [];
    if (rateDouble) rates.push({ occupancy: 'double', billingBasis: 'per_room_per_night', rateAmount: rateDouble });
    if (rateTriple) rates.push({ occupancy: 'triple', billingBasis: 'per_room_per_night', rateAmount: rateTriple });
    if (rateQuad) rates.push({ occupancy: 'quad', billingBasis: 'per_room_per_night', rateAmount: rateQuad });
    if (rateSharing) rates.push({ occupancy: 'sharing', billingBasis: 'per_bed_per_night', rateAmount: rateSharing });
    if (rateQuint) rates.push({ occupancy: 'quint', billingBasis: 'per_bed_per_night', rateAmount: rateQuint });

    const payload: any = {
      dateBands: [
        {
          label: bandLabel || `${startDate} to ${endDate}`,
          startDate,
          endDate,
          seasonContext: bandLabel,
          rates
        }
      ]
    };

    if (selectedHotelOption === 'existing' && targetHotelId) {
      payload.existingHotelId = targetHotelId;
    } else {
      payload.name = newHotelName;
      payload.city = newCity;
      payload.locationArea = newLocation;
      payload.distanceRaw = newDistance;
      payload.shuttleService = newShuttle;
      payload.starRating = 3;
    }

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setNewHotelName('');
        await loadHotels();
      } else {
        alert(data.error || 'ریٹ محفوظ کرنے میں مسئلہ پیش آیا۔');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredHotels = hotels.filter(h => {
    if (!searchQuery) return true;
    return (
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.locationArea && h.locationArea.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">مکہ اور مدینہ کے ہوٹلز اور تاریخ وار ریٹس</h1>
          <p className="text-xs text-gray-500">
            کس تاریخ سے کس تاریخ تک کیا ریٹ ہے (نائٹلی روم ریٹ اور شیئرنگ فی بیڈ ریٹ)، شٹل سروس اور فاصلہ۔
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-brand-300" />
          <span>+ ہوٹل ریٹ (تاریخ کے حساب سے) درج کریں</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
          {(['all', 'Makkah', 'Madinah'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-3 py-1.5 rounded-lg capitalize font-bold transition ${
                cityFilter === c ? 'bg-emerald-800 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {c === 'all' ? 'تمام شہر' : c === 'Makkah' ? 'مکہ مکرمہ' : 'مدینہ منورہ'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ہوٹل کا نام تلاش کریں..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Hotels List with Date Bands */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-sm text-gray-500">
          لوڈ ہو رہا ہے...
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <Building className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">کوئی ہوٹل دستیاب نہیں</h3>
          <p className="text-xs text-gray-500">اوپر دیے گئے بٹن سے ہوٹل اور تاریخ وار ریٹس درج کریں۔</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredHotels.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
              
              {/* Hotel Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">{hotel.name}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      hotel.city === 'Makkah' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {hotel.city === 'Makkah' ? 'مکہ مکرمہ' : 'مدینہ منورہ'}
                    </span>
                    {hotel.shuttleService && (
                      <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Bus className="w-3 h-3" />
                        <span>شٹل سروس</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                    <span>لوکیشن: {hotel.locationArea || 'مرکزی علاقہ'}</span>
                    <span>&bull;</span>
                    <span>فاصلہ: {hotel.distanceRaw || '500 MTR'}</span>
                    <span>&bull;</span>
                    <span>ستارے: {hotel.starRating ? '★'.repeat(hotel.starRating) : '3 ستارہ'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedHotelOption('existing');
                    setTargetHotelId(hotel.id);
                    setModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-emerald-800 text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>اس ہوٹل میں نیا تاریخ بینڈ شامل کریں</span>
                </button>
              </div>

              {/* Date Bands and Rates */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>تاریخ وار ریٹس (Date Bands & Nightly Rates):</span>
                </div>

                {(!hotel.dateBands || hotel.dateBands.length === 0) ? (
                  <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 text-xs text-center">
                    ابھی اس ہوٹل کے لیے کوئی تاریخ کا ریٹ بینڈ درج نہیں ہے۔
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hotel.dateBands.map((band: any) => {
                      const doubleRate = band.rates?.find((r: any) => r.occupancy === 'double');
                      const tripleRate = band.rates?.find((r: any) => r.occupancy === 'triple');
                      const quadRate = band.rates?.find((r: any) => r.occupancy === 'quad');
                      const sharingRate = band.rates?.find((r: any) => r.occupancy === 'sharing');
                      const quintRate = band.rates?.find((r: any) => r.occupancy === 'quint');

                      return (
                        <div key={band.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-bold text-gray-900">{band.bandLabelRaw || 'سیزن ریٹ'}</span>
                            <span className="font-mono text-[11px] text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                              {band.startDate} تا {band.endDate}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white p-2 rounded-xl border border-gray-100">
                              <span className="text-[10px] text-gray-400 block">روم ریٹ (D/T/Q)</span>
                              <span className="font-mono font-bold text-gray-900">
                                {doubleRate?.rateAmount ? `${formatSar(doubleRate.rateAmount)} /رات` : 'N/A'}
                              </span>
                            </div>

                            <div className="bg-white p-2 rounded-xl border border-gray-100">
                              <span className="text-[10px] text-gray-400 block">شیئرنگ (فی بیڈ)</span>
                              <span className="font-mono font-bold text-brand-800">
                                {sharingRate?.rateAmount ? `${formatSar(sharingRate.rateAmount)} /رات` : 'N/A'}
                              </span>
                            </div>

                            {quintRate?.rateAmount && (
                              <div className="col-span-2 bg-white p-2 rounded-xl border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">کوئنٹ (5 بیڈ فی شخص)</span>
                                <span className="font-mono font-bold text-gray-900">
                                  {formatSar(quintRate.rateAmount)} /رات
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Hotel or Date Band */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-gray-900 text-base">ہوٹل ریٹ تاریخ کے حساب سے شامل کریں</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotelAndRates} className="space-y-4 text-xs">
              
              {/* Hotel selection mode */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedHotelOption('existing')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    selectedHotelOption === 'existing' ? 'bg-white shadow text-emerald-900' : 'text-gray-500'
                  }`}
                >
                  موجودہ ہوٹل میں ریٹ بینڈ شامل کریں
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHotelOption('new')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    selectedHotelOption === 'new' ? 'bg-white shadow text-emerald-900' : 'text-gray-500'
                  }`}
                >
                  + نیا ہوٹل بنا کر ریٹ سیٹ کریں
                </button>
              </div>

              {selectedHotelOption === 'existing' ? (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ہوٹل منتخب کریں</label>
                  <select
                    value={targetHotelId}
                    onChange={e => setTargetHotelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city === 'Makkah' ? 'مکہ مکرمہ' : 'مدینہ منورہ'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="font-bold text-gray-800">نئے ہوٹل کی معلومات:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-600 block mb-0.5">ہوٹل کا نام</label>
                      <input
                        type="text"
                        required
                        value={newHotelName}
                        onChange={e => setNewHotelName(e.target.value)}
                        placeholder="مثلاً الرفاع السد"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-600 block mb-0.5">شہر</label>
                      <select
                        value={newCity}
                        onChange={e => setNewCity(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        <option value="Makkah">مکہ مکرمہ</option>
                        <option value="Madinah">مدینہ منورہ</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-600 block mb-0.5">فاصلہ (Distance)</label>
                      <input
                        type="text"
                        value={newDistance}
                        onChange={e => setNewDistance(e.target.value)}
                        placeholder="450 MTR"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="shuttleCheck"
                        checked={newShuttle}
                        onChange={e => setNewShuttle(e.target.checked)}
                        className="rounded text-emerald-800 focus:ring-emerald-700"
                      />
                      <label htmlFor="shuttleCheck" className="text-xs text-gray-700 font-semibold cursor-pointer">
                        شٹل سروس دستیاب ہے
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Band Section (کس تاریخ سے کس تاریخ تک) */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>تاریخ کی حد (کس تاریخ سے کس تاریخ تک):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-700 font-bold block mb-1">سیزن لیبل</label>
                    <input
                      type="text"
                      value={bandLabel}
                      onChange={e => setBandLabel(e.target.value)}
                      placeholder="رمضان المبارک پہلا عشرہ"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 font-bold block mb-1">کس تاریخ سے (From Date)</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 font-bold block mb-1">کس تاریخ تک (To Date)</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Nightly Rates in SAR */}
              <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-200 space-y-3">
                <div className="font-bold text-brand-950">ریٹس فی رات (سعودی ریال - SAR):</div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-700 block mb-0.5 font-semibold">ڈبل روم (SAR /رات)</label>
                    <input
                      type="number"
                      value={rateDouble}
                      onChange={e => setRateDouble(e.target.value)}
                      placeholder="160"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 block mb-0.5 font-semibold">ٹرپل روم (SAR /رات)</label>
                    <input
                      type="number"
                      value={rateTriple}
                      onChange={e => setRateTriple(e.target.value)}
                      placeholder="160"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 block mb-0.5 font-semibold">کواڈ روم (SAR /رات)</label>
                    <input
                      type="number"
                      value={rateQuad}
                      onChange={e => setRateQuad(e.target.value)}
                      placeholder="160"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 block mb-0.5 font-semibold">شیئرنگ بیڈ (SAR /رات)</label>
                    <input
                      type="number"
                      value={rateSharing}
                      onChange={e => setRateSharing(e.target.value)}
                      placeholder="29"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 block mb-0.5 font-semibold">کوئنٹ ۵-بیڈ (SAR /رات)</label>
                    <input
                      type="number"
                      value={rateQuint}
                      onChange={e => setRateQuint(e.target.value)}
                      placeholder="اختیاری"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow transition"
                >
                  ریٹس محفوظ کریں
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
