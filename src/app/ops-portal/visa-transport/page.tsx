'use client';

import React, { useState, useEffect } from 'react';
import { VisaTransportRate } from '@/types';
import { formatSar } from '@/lib/i18n/translations';
import {
  Layers,
  Plus,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Bus,
  Car,
  Compass
} from 'lucide-react';

export default function AdminVisaTransportPage() {
  const [rates, setRates] = useState<VisaTransportRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<any>('visa_with_bus');
  const [title, setTitle] = useState('');
  const [route, setRoute] = useState('');
  const [rateAmount, setRateAmount] = useState('550');
  const [billingUnit, setBillingUnit] = useState<any>('per_person');

  useEffect(() => {
    loadRates();
  }, [categoryFilter]);

  const loadRates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const res = await fetch(`/api/visa-transport?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.rates) {
        setRates(data.rates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/visa-transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title || `${category} Rate`,
          route,
          rateAmount,
          billingUnit,
          currency: 'SAR',
          isBundle: category === 'visa_with_bus',
          preventsDuplicateCharging: category === 'visa_with_bus'
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setTitle('');
        await loadRates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visa, Transport & Ziyarat Rate Rules</h1>
          <p className="text-xs text-gray-500">
            Configure visa bundles, round-trip bus inclusions, private vehicle rates, infant fees, and holy tour add-ons.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Service Rate</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {(['all', 'visa_with_bus', 'visa', 'partial_visa', 'private_transport', 'ziyarat', 'infant_fee'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
              categoryFilter === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map(rate => (
          <div key={rate.id} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-100 text-brand-900">
                  {rate.category.replace(/_/g, ' ')}
                </span>
                <span className="text-base font-extrabold text-emerald-900 font-mono" dir="ltr">
                  {formatSar(rate.rateAmount)}
                </span>
              </div>

              <h3 className="font-bold text-sm text-gray-900">{rate.title}</h3>
              {rate.route && <div className="text-xs text-gray-500">Route: {rate.route}</div>}

              <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
                <div>Billing: <strong className="capitalize">{rate.billingUnit.replace(/_/g, ' ')}</strong></div>
                {rate.partyMaxPax && <div>Max Capacity: <strong>{rate.partyMaxPax} Pax</strong></div>}
                {rate.isBundle && (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Bundle with round-trip bus (no double billing)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 flex justify-between">
              <span>Status: <strong className="text-emerald-800">{rate.status}</strong></span>
              <span>v{rate.version}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-base">Add Rate Item</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                >
                  <option value="visa_with_bus">Visa with round-trip bus</option>
                  <option value="visa">Visa only</option>
                  <option value="partial_visa">Partial visa</option>
                  <option value="private_transport">Private transport</option>
                  <option value="ziyarat">Ziyarat</option>
                  <option value="infant_fee">Infant fee</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Sedan Makkah Transfer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rate Amount (SAR) *</label>
                <input
                  type="number"
                  required
                  value={rateAmount}
                  onChange={e => setRateAmount(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Billing Unit</label>
                <select
                  value={billingUnit}
                  onChange={e => setBillingUnit(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                >
                  <option value="per_person">Per Person</option>
                  <option value="per_vehicle">Per Vehicle</option>
                  <option value="per_group">Per Group</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 text-white font-bold"
                >
                  Save Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
