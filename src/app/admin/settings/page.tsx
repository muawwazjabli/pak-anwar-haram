'use client';

import React, { useState, useEffect } from 'react';
import { AgencySettings, ExchangeRate, AuditLog } from '@/types';
import {
  Settings,
  DollarSign,
  History,
  Shield,
  Save,
  Check,
  Building,
  Phone,
  MessageCircle,
  Clock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [activeRate, setActiveRate] = useState<ExchangeRate | null>(null);
  const [allRates, setAllRates] = useState<ExchangeRate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New rate input
  const [newRateInput, setNewRateInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [setRes, audRes] = await Promise.all([
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/audit').then(r => r.json())
      ]);
      if (setRes.success) {
        setSettings(setRes.settings);
        setActiveRate(setRes.activeExchangeRate);
        setAllRates(setRes.allExchangeRates || []);
        if (setRes.activeExchangeRate) {
          setNewRateInput(setRes.activeExchangeRate.rate.toString());
        }
      }
      if (audRes.success && audRes.auditLogs) {
        setAuditLogs(audRes.auditLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newExchangeRate: parseFloat(newRateInput),
          role: 'owner',
          userId: 'owner@pakanwarharam.com'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Exchange rate updated and new version archived successfully!');
        await loadSettings();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          role: 'owner',
          userId: 'owner@pakanwarharam.com'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Agency profile settings saved successfully!');
        await loadSettings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h1 className="text-xl font-bold text-gray-900">Exchange Rates, Settings & Audit Logs</h1>
        <p className="text-xs text-gray-500">
          Manage SAR to PKR currency conversions, owner brand settings, and system audit history.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SAR to PKR Exchange Rate Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900 text-sm">SAR to PKR Exchange Rate</h2>
            </div>
            {activeRate && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                Version {activeRate.version} (Active)
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateExchangeRate} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Approved Rate (1 SAR = X PKR) *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newRateInput}
                  onChange={e => setNewRateInput(e.target.value)}
                  className="flex-1 p-2.5 rounded-lg border border-gray-300 font-mono text-sm font-bold text-emerald-950"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition"
                >
                  Save New Version
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              Updating the exchange rate archives the previous rate for historical quote accuracy.
            </p>
          </form>

          {/* Rate History */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-xs font-bold text-gray-700">Exchange Rate Version History:</span>
            <div className="divide-y divide-gray-100 text-xs">
              {allRates.map(r => (
                <div key={r.id} className="py-2 flex justify-between font-mono">
                  <span>Version {r.version}: <strong>{r.rate} PKR</strong></span>
                  <span className={r.isActive ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                    {r.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agency Brand Profile */}
        {settings && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-bold text-gray-900 text-sm">Agency Brand & Contact Settings</h2>
            </div>

            <form onSubmit={handleUpdateBrand} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Brand Name (Urdu)</label>
                <input
                  type="text"
                  value={settings.brandNameUrdu}
                  onChange={e => setSettings({ ...settings, brandNameUrdu: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Brand Name (English)</label>
                <input
                  type="text"
                  value={settings.brandNameEn}
                  onChange={e => setSettings({ ...settings, brandNameEn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.phoneWhatsapp}
                    onChange={e => setSettings({ ...settings, phoneWhatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Landline Desk</label>
                  <input
                    type="text"
                    value={settings.phonePrimary}
                    onChange={e => setSettings({ ...settings, phonePrimary: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Office Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-800 text-white font-bold text-xs"
              >
                Save Agency Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* System Audit Trail Log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <History className="w-5 h-5 text-gray-600" />
          <h2 className="font-bold text-gray-900 text-sm">System Audit History</h2>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No audit records logged yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 text-xs max-h-72 overflow-y-auto font-mono">
            {auditLogs.map(log => (
              <div key={log.id} className="py-2.5 flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-bold text-emerald-900">[{log.action}]</span>{' '}
                  <span className="text-gray-600">Entity: {log.entityType} ({log.entityId || 'N/A'})</span>
                </div>
                <div className="text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
