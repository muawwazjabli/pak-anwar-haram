'use client';

import React, { useState, useEffect } from 'react';
import { PackageGroup, PackageVariant, PriceRule } from '@/types';
import { formatPkr } from '@/lib/i18n/translations';
import { applyPriceRuleToVariant, validateBelowCost } from '@/lib/pricing/discount-rules';
import {
  Package,
  Plus,
  Percent,
  Tag,
  AlertTriangle,
  CheckCircle,
  Eye,
  DollarSign
} from 'lucide-react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageGroup[]>([]);
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Discount rule creator modal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetScope, setTargetScope] = useState<'global' | 'group' | 'package' | 'occupancy'>('occupancy');
  const [targetId, setTargetId] = useState('UP-103710:Sharing');
  const [valueType, setValueType] = useState<'fixed_pkr' | 'percentage'>('fixed_pkr');
  const [valueAmount, setValueAmount] = useState('5000');
  const [billingBasis, setBillingBasis] = useState<'per_person' | 'per_booking'>('per_person');
  const [approvedByOwner, setApprovedByOwner] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pkgRes, rulesRes] = await Promise.all([
        fetch('/api/packages').then(r => r.json()),
        fetch('/api/packages/rules').then(r => r.json())
      ]);
      if (pkgRes.success && pkgRes.packages) setPackages(pkgRes.packages);
      if (rulesRes.success && rulesRes.rules) setRules(rulesRes.rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMessage(null);
    try {
      const res = await fetch('/api/packages/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleType: 'discount',
          targetScope,
          targetId,
          valueType,
          valueAmount: parseFloat(valueAmount),
          billingBasis,
          approvedByOwner,
          role: 'owner'
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setValueAmount('5000');
        await loadData();
      } else {
        setWarningMessage(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ready-Made Packages & Dynamic Discounts</h1>
          <p className="text-xs text-gray-500">
            Wholesale costs preserved separately from authorized public selling rates. Hierarchical discount precedence (Occupancy &gt; Package &gt; Group &gt; Global).
          </p>
        </div>

        <button
          onClick={() => {
            setWarningMessage(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Tag className="w-4 h-4 text-brand-300" />
          <span>Create Discount / Markup Rule</span>
        </button>
      </div>

      {/* Active Rules Pill List */}
      {rules.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs space-y-2">
          <div className="font-bold text-gray-800 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-brand-600" />
            <span>Active Price Rules ({rules.length}):</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {rules.map(r => (
              <div key={r.id} className="p-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                <span className="font-bold text-emerald-900">{r.ruleType.toUpperCase()}:</span>
                <span>{r.targetScope} {r.targetId ? `(${r.targetId})` : ''}</span>
                <span className="font-mono font-bold text-brand-800">
                  {r.valueType === 'fixed_pkr' ? `-${r.valueAmount.toLocaleString()} PKR` : `-${r.valueAmount}%`}
                </span>
                <span className="text-[10px] text-gray-500">({r.billingBasis})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages & Variants List with Before/After Discount Preview */}
      <div className="space-y-6">
        {packages.map(grp => (
          <div key={grp.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="p-5 bg-gray-50/70 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">{grp.groupCode}</span>
                  <span className="text-xs font-semibold text-gray-600">{grp.airlineName} ({grp.departureCity})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    grp.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {grp.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Dates: <strong>{grp.travelStartDate}</strong> to <strong>{grp.travelEndDate}</strong> • Seats: <strong>{grp.totalSeats}</strong>
                </div>
              </div>

              <div className="text-xs font-mono" dir="ltr">
                Summary From: <strong className="text-emerald-900 font-bold">{formatPkr(grp.summaryFromPricePkr)}</strong>
              </div>
            </div>

            <div className="p-5 divide-y divide-gray-100 text-xs">
              {(grp.variants || []).map(v => {
                const computed = applyPriceRuleToVariant(v, grp.groupCode, rules);

                return (
                  <div key={v.id} className="py-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-emerald-950 font-mono text-sm" dir="ltr">{v.variantCode}</span>
                        <div className="text-gray-600 mt-0.5">
                          🕋 {v.makkahHotelName} ({v.makkahNights}N, {v.makkahDistance}) • 🕌 {v.madinahHotelName} ({v.madinahNights}N, {v.madinahDistance})
                        </div>
                      </div>
                    </div>

                    {/* 4 Occupancies Pricing Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['Sharing', 'Quad', 'Triple', 'Double'] as const).map(occ => {
                        const wholesale = (v as any)[`wholesale${occ}`];
                        const baseSelling = (v as any)[`selling${occ}`] ?? wholesale;
                        const effective = (computed as any)[`effective${occ}`];
                        const discount = computed.activeDiscounts ? (computed.activeDiscounts as any)[occ.toLowerCase()] : 0;

                        return (
                          <div key={occ} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
                              <span>{occ}</span>
                              <span className="font-mono text-gray-400">Cost: {wholesale?.toLocaleString()}</span>
                            </div>

                            {discount > 0 ? (
                              <div className="font-mono">
                                <div className="text-[10px] line-through text-gray-400">
                                  {baseSelling?.toLocaleString()} PKR
                                </div>
                                <div className="text-sm font-black text-emerald-900">
                                  {effective?.toLocaleString()} PKR
                                </div>
                                <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                                  -{discount.toLocaleString()} PKR
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm font-black text-gray-900 font-mono">
                                {effective?.toLocaleString()} PKR
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-base">Create Discount Rule</h3>
            <p className="text-xs text-gray-500">Apply discounts with automatic precedence and below-cost warning.</p>

            {warningMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{warningMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Scope</label>
                <select
                  value={targetScope}
                  onChange={e => setTargetScope(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                >
                  <option value="occupancy">Occupancy Specific (Highest Precedence)</option>
                  <option value="package">Package Specific (UP-...)</option>
                  <option value="group">Group Wide (UG-...)</option>
                  <option value="global">Global (All Packages)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. UP-103710:Sharing or UP-103710 or UG-100698"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={valueType}
                    onChange={e => setValueType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                  >
                    <option value="fixed_pkr">Fixed PKR Amount</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Value Amount</label>
                  <input
                    type="number"
                    required
                    value={valueAmount}
                    onChange={e => setValueAmount(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Billing Basis</label>
                <select
                  value={billingBasis}
                  onChange={e => setBillingBasis(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                >
                  <option value="per_person">Per Person</option>
                  <option value="per_booking">Per Booking</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ownerApproveChk"
                  checked={approvedByOwner}
                  onChange={e => setApprovedByOwner(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="ownerApproveChk" className="text-gray-700 font-medium">
                  Allow discount below supplier wholesale cost (Owner override)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 text-white font-bold"
                >
                  Save & Apply Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
