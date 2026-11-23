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
  DollarSign
} from 'lucide-react';

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<AirlineGroup[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Airline Groups & Seat Inventory</h1>
          <p className="text-xs text-gray-500">
            Fixed outbound/return flight pairs, local seat holds, confirmed capacity, and fare sheet reconciliation.
          </p>
        </div>
      </div>

      {/* Flights Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Flight / Airline</th>
                <th className="p-4">Sector</th>
                <th className="p-4">Outbound / Inbound</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Seats (Reported / Held / Available)</th>
                <th className="p-4">Fare Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {flights.map(fl => {
                const available = fl.reportedSeats - fl.heldSeats - fl.confirmedSeats;

                return (
                  <tr key={fl.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{fl.flightNumbersSummary}</div>
                      <div className="text-[11px] text-gray-500">{fl.airlineName}</div>
                    </td>

                    <td className="p-4 font-mono font-semibold text-gray-800" dir="ltr">
                      {fl.sector}
                    </td>

                    <td className="p-4 font-mono text-[11px]" dir="ltr">
                      <div>OB: <strong>{fl.outboundDate} {fl.outboundDeptTime}</strong></div>
                      <div>IB: <strong>{fl.inboundDate} {fl.inboundDeptTime}</strong></div>
                    </td>

                    <td className="p-4">
                      <span>{fl.durationDays} Days</span>
                      <div className="text-[10px] text-gray-400">{fl.baggage || '23 Kg'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-emerald-800 text-sm">{available} Available</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-amber-700">{fl.heldSeats} Held</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{fl.reportedSeats} Rep</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {fl.fareStatus === 'request_fare' || !fl.sellingFare ? (
                        <button
                          onClick={() => {
                            setSelectedFlight(fl);
                            setSellingFareInput('');
                            setFareModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[11px] font-bold hover:bg-amber-200 transition"
                        >
                          Request fare (Enter Fare Sheet)
                        </button>
                      ) : (
                        <div>
                          <div className="font-extrabold text-emerald-950 font-mono" dir="ltr">
                            {formatPkr(fl.sellingFare)}
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold">Confirmed</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedFlight(fl);
                          setHoldCount(1);
                          setHoldModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-semibold"
                      >
                        Hold Seats
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFlight(fl);
                          setConfirmCount(1);
                          setConfirmModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold"
                      >
                        Confirm Seats
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hold Modal */}
      {holdModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-sm">Hold Seats on {selectedFlight.flightNumbersSummary}</h3>
            <p className="text-xs text-gray-500">Atomic reservation lock prevents overbooking locally.</p>
            <form onSubmit={handleHold} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Seats Count</label>
                <input
                  type="number"
                  min="1"
                  max={selectedFlight.reportedSeats - selectedFlight.heldSeats - selectedFlight.confirmedSeats}
                  value={holdCount}
                  onChange={e => setHoldCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setHoldModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-bold">Hold Seats</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-sm">Confirm Seats ({selectedFlight.flightNumbersSummary})</h3>
            <form onSubmit={handleConfirm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Supplier Booking Reference (PNR) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SV-GDS-98219"
                  value={supplierRef}
                  onChange={e => setSupplierRef(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Seats to Confirm</label>
                <input
                  type="number"
                  min="1"
                  value={confirmCount}
                  onChange={e => setConfirmCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setConfirmModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fare Sheet Editor Modal */}
      {fareModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-sm">Enter Confirmed Selling Fare</h3>
            <p className="text-xs text-gray-500">Enter authorized fare to remove "Request fare" state.</p>
            <form onSubmit={handleUpdateFare} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Selling Fare (PKR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 195000"
                  value={sellingFareInput}
                  onChange={e => setSellingFareInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setFareModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white font-bold">Save Fare</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
