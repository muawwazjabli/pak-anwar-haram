'use client';

import React, { useState, useEffect } from 'react';
import { AirlineGroup } from '@/types';
import { formatPkr } from '@/lib/i18n/translations';
import {
  Plane,
  Plus,
  Lock,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit2,
  DollarSign,
  Calendar,
  X,
  Users
} from 'lucide-react';

export default function OpsPortalFlightsPage() {
  const [flights, setFlights] = useState<AirlineGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // New flight modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newAirline, setNewAirline] = useState('AirBlue');
  const [newAirlineCode, setNewAirlineCode] = useState('PA');
  const [newFlightNumbers, setNewFlightNumbers] = useState('PA 801 / 800');
  const [newSector, setNewSector] = useState('MUX - JED - MUX');
  const [newOutboundDate, setNewOutboundDate] = useState('2026-12-27');
  const [newInboundDate, setNewInboundDate] = useState('2027-01-10');
  const [newOutboundTime, setNewOutboundTime] = useState('09:15');
  const [newInboundTime, setNewInboundTime] = useState('18:30');
  const [newDurationDays, setNewDurationDays] = useState('15');
  const [newSeats, setNewSeats] = useState('39');
  const [newSellingFare, setNewSellingFare] = useState('195000');
  const [newWholesaleFare, setNewWholesaleFare] = useState('182000');
  const [newBaggage, setNewBaggage] = useState('20 Kg + 7 Kg Hand Carry');

  // Seat hold modal
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<AirlineGroup | null>(null);
  const [holdCount, setHoldCount] = useState(2);

  // Confirm seat modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmCount, setConfirmCount] = useState(2);
  const [supplierRef, setSupplierRef] = useState('');

  // Fare update modal
  const [fareModalOpen, setFareModalOpen] = useState(false);
  const [sellingFareInput, setSellingFareInput] = useState('');
  const [wholesaleFareInput, setWholesaleFareInput] = useState('');

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      if (data.success && data.flights) {
        setFlights(data.flights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airlineName: newAirline,
          airlineCode: newAirlineCode,
          flightNumbersSummary: newFlightNumbers,
          sector: newSector,
          outboundDate: newOutboundDate,
          inboundDate: newInboundDate,
          outboundDeptTime: newOutboundTime,
          inboundDeptTime: newInboundTime,
          durationDays: parseInt(newDurationDays, 10),
          reportedSeats: parseInt(newSeats, 10),
          sellingFare: newSellingFare ? parseFloat(newSellingFare) : undefined,
          wholesaleFare: newWholesaleFare ? parseFloat(newWholesaleFare) : undefined,
          baggage: newBaggage,
          fareStatus: newSellingFare ? 'confirmed' : 'request_fare'
        })
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        await loadFlights();
      } else {
        alert(data.error || 'فلائٹ درج کرنے میں مسئلہ پیش آیا۔');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    try {
      const res = await fetch(`/api/flights/${selectedFlight.id}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatsCount: holdCount, bookingRequestId: 'manual-admin-hold' })
      });
      const data = await res.json();
      if (data.success) {
        setHoldModalOpen(false);
        await loadFlights();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight || !supplierRef) return;
    try {
      const res = await fetch(`/api/flights/${selectedFlight.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatsCount: confirmCount, supplierRef, bookingRequestId: 'manual-admin-confirm' })
      });
      const data = await res.json();
      if (data.success) {
        setConfirmModalOpen(false);
        setSupplierRef('');
        await loadFlights();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateFare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFlight.id,
          sellingFare: parseFloat(sellingFareInput),
          wholesaleFare: wholesaleFareInput ? parseFloat(wholesaleFareInput) : undefined,
          fareStatus: 'confirmed'
        })
      });
      const data = await res.json();
      if (data.success) {
        setFareModalOpen(false);
        await loadFlights();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ایئرلائن گروپس اور سیٹ اِنوینٹری</h1>
          <p className="text-xs text-gray-500">
            دستیاب پروازوں کا شیڈول، کرایہ (Selling Fare)، نشستوں کی تعداد اور ہولڈ و کنفرمیشن۔
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-brand-300" />
          <span>+ نیا فلائٹ شیڈول اور ریٹ شامل کریں</span>
        </button>
      </div>

      {/* Flight Cards List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-sm text-gray-500">
          لوڈ ہو رہا ہے...
        </div>
      ) : flights.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <Plane className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">کوئی فلائٹ شیڈول دستیاب نہیں</h3>
          <p className="text-xs text-gray-500">اوپر دیے گئے بٹن سے نئی پرواز اور سیٹیں درج کریں۔</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {flights.map(flight => {
            const isUnpriced = flight.fareStatus === 'request_fare' || !flight.sellingFare;
            return (
              <div key={flight.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
                
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-gray-900">{flight.airlineName}</span>
                      <span className="font-mono text-xs bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-md font-bold">
                        {flight.flightNumbersSummary}
                      </span>
                      <span className="font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md">
                        {flight.sector}
                      </span>
                      <span className="text-xs text-gray-500">
                        سامان: {flight.baggage} &bull; دورانیہ: {flight.durationDays} دن
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-4">
                      <span><strong>روانگی:</strong> {flight.outboundDate} ({flight.outboundDeptTime})</span>
                      <span>&bull;</span>
                      <span><strong>واپسی:</strong> {flight.inboundDate} ({flight.inboundDeptTime})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setSellingFareInput(flight.sellingFare ? String(flight.sellingFare) : '');
                        setWholesaleFareInput(flight.wholesaleFare ? String(flight.wholesaleFare) : '');
                        setFareModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>کرایہ ایڈٹ کریں</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setHoldModalOpen(true);
                      }}
                      disabled={flight.availableSeats <= 0}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>سیٹ ہولڈ کریں</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setConfirmModalOpen(true);
                      }}
                      disabled={flight.availableSeats <= 0}
                      className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>کنفرم ٹکٹ لاک</span>
                    </button>
                  </div>
                </div>

                {/* Seat Metrics & Pricing Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-semibold">کل موصولہ سیٹیں</span>
                    <span className="font-mono font-bold text-base text-gray-900">{flight.reportedSeats}</span>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 block font-semibold">عارضی ہولڈ (Held)</span>
                    <span className="font-mono font-bold text-base text-amber-900">{flight.heldSeats}</span>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block font-semibold">کنفرم ٹکٹیں</span>
                    <span className="font-mono font-bold text-base text-emerald-900">{flight.confirmedSeats}</span>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
                    <span className="text-[10px] text-blue-800 block font-semibold">باقی دستیاب (Available)</span>
                    <span className="font-mono font-bold text-base text-blue-900">{flight.availableSeats}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-brand-50 p-3 rounded-2xl border border-brand-200">
                    <span className="text-[10px] text-brand-800 block font-semibold">فروخت کا ریٹ (PKR)</span>
                    <span className="font-mono font-bold text-base text-brand-950">
                      {isUnpriced ? (
                        <span className="text-amber-800 text-xs font-semibold">Request Fare</span>
                      ) : (
                        formatPkr(flight.sellingFare!)
                      )}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Flight Schedule & Rate */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-800" />
                <h3 className="font-bold text-gray-900 text-base">نیا فلائٹ شیڈول اور ریٹ شامل کریں</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewFlight} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ایئرلائن</label>
                  <input
                    type="text"
                    required
                    value={newAirline}
                    onChange={e => setNewAirline(e.target.value)}
                    placeholder="PIA / AirBlue / Saudi"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">پرواز نمبرز</label>
                  <input
                    type="text"
                    required
                    value={newFlightNumbers}
                    onChange={e => setNewFlightNumbers(e.target.value)}
                    placeholder="PA 801 / 800"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">سیکٹر (Sector)</label>
                  <input
                    type="text"
                    required
                    value={newSector}
                    onChange={e => setNewSector(e.target.value)}
                    placeholder="MUX - JED - MUX"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  <span>روانگی اور واپسی کی تواریخ و وقت:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">روانگی کی تاریخ (Outbound Date)</label>
                    <input
                      type="date"
                      required
                      value={newOutboundDate}
                      onChange={e => setNewOutboundDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">روانگی کا وقت (Departure Time)</label>
                    <input
                      type="text"
                      value={newOutboundTime}
                      onChange={e => setNewOutboundTime(e.target.value)}
                      placeholder="09:15"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">واپسی کی تاریخ (Inbound Date)</label>
                    <input
                      type="date"
                      required
                      value={newInboundDate}
                      onChange={e => setNewInboundDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">واپسی کا وقت (Return Time)</label>
                    <input
                      type="text"
                      value={newInboundTime}
                      onChange={e => setNewInboundTime(e.target.value)}
                      placeholder="18:30"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">دستیاب سیٹیں</label>
                  <input
                    type="number"
                    required
                    value={newSeats}
                    onChange={e => setNewSeats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">سامان کی گنجائش</label>
                  <input
                    type="text"
                    value={newBaggage}
                    onChange={e => setNewBaggage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">دورانیہ (دن)</label>
                  <input
                    type="number"
                    value={newDurationDays}
                    onChange={e => setNewDurationDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100 space-y-2">
                <div className="font-bold text-brand-950">پرواز کے کرائے (Fare - PKR):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-700 font-bold block mb-0.5">فروخت کی قیمت (Selling Fare PKR)</label>
                    <input
                      type="number"
                      required
                      value={newSellingFare}
                      onChange={e => setNewSellingFare(e.target.value)}
                      placeholder="195000"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold text-brand-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-700 block mb-0.5">ہول سیل لاگت (Wholesale Cost PKR)</label>
                    <input
                      type="number"
                      value={newWholesaleFare}
                      onChange={e => setNewWholesaleFare(e.target.value)}
                      placeholder="182000"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow transition"
                >
                  فلائٹ شیڈول محفوظ کریں
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Hold Seats */}
      {holdModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">عارضی سیٹ ہولڈ لاک لگائیں</h3>
            <p className="text-xs text-gray-500">
              پرواز {selectedFlight.flightNumbersSummary} کے لیے کتنی سیٹیں ہولڈ کرنی ہیں؟
            </p>
            <form onSubmit={handleHold} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">سیٹوں کی تعداد</label>
                <input
                  type="number"
                  min="1"
                  max={selectedFlight.availableSeats}
                  value={holdCount}
                  onChange={e => setHoldCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHoldModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow"
                >
                  ہولڈ محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Seats */}
      {confirmModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">کنفرم ٹکٹ لاک لگائیں</h3>
            <form onSubmit={handleConfirm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">سیٹوں کی تعداد</label>
                <input
                  type="number"
                  min="1"
                  max={selectedFlight.availableSeats}
                  value={confirmCount}
                  onChange={e => setConfirmCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">سپلائر بکنگ ریفرنس (PNR / Ref)</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً AS-99410"
                  value={supplierRef}
                  onChange={e => setSupplierRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white font-bold shadow"
                >
                  کنفرم کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Fare */}
      {fareModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">پرواز کا کرایہ اپ ڈیٹ کریں</h3>
            <form onSubmit={handleUpdateFare} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">فروخت کی قیمت (Selling Fare PKR)</label>
                <input
                  type="number"
                  required
                  value={sellingFareInput}
                  onChange={e => setSellingFareInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-brand-900"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ہول سیل لاگت (Wholesale Cost PKR)</label>
                <input
                  type="number"
                  value={wholesaleFareInput}
                  onChange={e => setWholesaleFareInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFareModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-800 text-white font-bold shadow"
                >
                  کرایہ محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
