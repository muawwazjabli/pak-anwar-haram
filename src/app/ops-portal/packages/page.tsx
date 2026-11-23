'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PackageGroup, PackageVariant, PriceRule } from '@/types';
import { formatPkr } from '@/lib/i18n/translations';
import {
  Package,
  Plus,
  FileUp,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Building,
  Plane,
  X,
  Upload
} from 'lucide-react';

export default function OpsPortalPackagesPage() {
  const [packages, setPackages] = useState<PackageGroup[]>([]);
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual package modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formGroupCode, setFormGroupCode] = useState('');
  const [formAirline, setFormAirline] = useState('Saudi Arabian Airlines');
  const [formCity, setFormCity] = useState('Lahore');
  const [formStartDate, setFormStartDate] = useState('2026-12-25');
  const [formEndDate, setFormEndDate] = useState('2027-01-10');
  const [formSeats, setFormSeats] = useState('40');
  const [formBaggage, setFormBaggage] = useState('30 Kg');
  const [formMakkahHotel, setFormMakkahHotel] = useState('Al Fakhama Hotel Makkah');
  const [formMakkahNights, setFormMakkahNights] = useState('10');
  const [formMakkahDistance, setFormMakkahDistance] = useState('500 MTR');
  const [formMadinahHotel, setFormMadinahHotel] = useState('Taif Nebras Madinah');
  const [formMadinahNights, setFormMadinahNights] = useState('5');
  const [formMadinahDistance, setFormMadinahDistance] = useState('400 MTR');
  
  // Prices (Selling PKR)
  const [formSellSharing, setFormSellSharing] = useState('268000');
  const [formSellQuad, setFormSellQuad] = useState('280000');
  const [formSellTriple, setFormSellTriple] = useState('294000');
  const [formSellDouble, setFormSellDouble] = useState('323000');

  // PDF upload modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Discount rule modal
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [targetScope, setTargetScope] = useState<'global' | 'group' | 'package' | 'occupancy'>('occupancy');
  const [targetId, setTargetId] = useState('UP-103710:Sharing');
  const [valueType, setValueType] = useState<'fixed_pkr' | 'percentage'>('fixed_pkr');
  const [valueAmount, setValueAmount] = useState('5000');
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

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_package',
          groupCode: formGroupCode || `UG-${Math.floor(100000 + Math.random() * 900000)}`,
          airlineName: formAirline,
          departureCity: formCity,
          travelStartDate: formStartDate,
          travelEndDate: formEndDate,
          totalSeats: parseInt(formSeats),
          baggage: formBaggage,
          makkahHotelName: formMakkahHotel,
          makkahNights: parseInt(formMakkahNights),
          makkahDistance: formMakkahDistance,
          madinahHotelName: formMadinahHotel,
          madinahNights: parseInt(formMadinahNights),
          madinahDistance: formMadinahDistance,
          sellingSharing: parseFloat(formSellSharing),
          sellingQuad: parseFloat(formSellQuad),
          sellingTriple: parseFloat(formSellTriple),
          sellingDouble: parseFloat(formSellDouble),
          costSharing: parseFloat(formSellSharing) * 0.95,
          costQuad: parseFloat(formSellQuad) * 0.95,
          costTriple: parseFloat(formSellTriple) * 0.95,
          costDouble: parseFloat(formSellDouble) * 0.95
        })
      });

      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        await loadData();
      } else {
        alert(data.error || 'پیکج شامل کرنے میں مسئلہ پیش آیا۔');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploading(true);
    setPdfUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('supplierId', 'sup-umrahgroups');
      formData.append('docType', 'packages');

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setPdfUploadSuccess(`فائل "${file.name}" کامیابی سے اپلوڈ ہو گئی۔ بیک گراؤنڈ ورکر نے پیکیج اور ریٹس پروسیس کر لیے ہیں۔`);
        setTimeout(async () => {
          await loadData();
          setPdfModalOpen(false);
          setPdfUploadSuccess(null);
        }, 1500);
      } else {
        alert(data.error || 'پی ڈی ایف اپلوڈ نہیں ہو سکی۔');
      }
    } catch (err: any) {
      alert(err.message || 'فائل اپلوڈ کرنے میں مسئلہ پیش آیا۔');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleImportSamplePdf = async () => {
    setPdfUploading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: 'sup-umrahgroups',
          docType: 'packages',
          fileName: 'UmrahGroups (3).pdf'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPdfUploadSuccess('سیمپل UmrahGroups پی ڈی ایف کامیابی سے امپورٹ ہو گئی۔');
        setTimeout(async () => {
          await loadData();
          setPdfModalOpen(false);
          setPdfUploadSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPdfUploading(false);
    }
  };

  const handleToggleStatus = async (pkgId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'sold_out' : 'published';
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_group_status',
          packageGroupId: pkgId,
          status: newStatus
        })
      });
      if (res.ok) await loadData();
    } catch (err) {
      console.error(err);
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
          billingBasis: 'per_person',
          approvedByOwner: true,
          role: 'owner'
        })
      });
      const data = await res.json();
      if (data.success) {
        setRuleModalOpen(false);
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
      
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">عمرہ پیکیجز اور ریٹس مینجمنٹ</h1>
          <p className="text-xs text-gray-500">
            یہاں نئے پیکیجز پی ڈی ایف سے امپورٹ کریں یا خود درج کریں۔ فروخت کے ریٹس اور ڈسکاؤنٹ رولز سیٹ کریں۔
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPdfModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
          >
            <FileUp className="w-4 h-4" />
            <span>+ PDF سے نیا پیکج امپورٹ کریں</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ مینوئل نیا پیکج بنائیں</span>
          </button>
        </div>
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-sm text-gray-500">
          لوڈ ہو رہا ہے...
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">کوئی پیکج دستیاب نہیں</h3>
          <p className="text-xs text-gray-500">اوپر دیے گئے بٹن سے نیا پیکج شامل کریں یا پی ڈی ایف اپلوڈ کریں۔</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-gray-100 px-2.5 py-0.5 rounded-lg text-gray-800">
                      {pkg.groupCode}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      {pkg.airlineName}
                    </span>
                    <span className="text-xs text-gray-500">
                      روانگی: {pkg.departureCity} &bull; سیٹیں: {pkg.totalSeats} &bull; سامان: {pkg.baggage}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    سفر کی تاریخ: {pkg.travelStartDate} تا {pkg.travelEndDate} ({pkg.nightsTotal} راتیں)
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    pkg.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pkg.status === 'published' ? 'پبلش (Active)' : 'ختم (Sold Out)'}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(pkg.id, pkg.status)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
                  >
                    {pkg.status === 'published' ? 'مارک Sold Out' : 'دوبارہ پبلش کریں'}
                  </button>
                </div>
              </div>

              {/* Package Variants and Pricing Table */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-700">پیکج ہوٹل اور قیمتوں کی تفصیل:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(pkg.variants || []).map((v) => (
                    <div key={v.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                      <div className="flex justify-between items-center font-bold text-gray-800">
                        <span className="font-mono text-brand-800">{v.variantCode}</span>
                        <span className="text-gray-500">کل {v.makkahNights + v.madinahNights} راتیں</span>
                      </div>

                      <div className="space-y-1.5 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span><strong>مکہ:</strong> {v.makkahHotelName} ({v.makkahNights} راتیں, {v.makkahDistance})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span><strong>مدینہ:</strong> {v.madinahHotelName} ({v.madinahNights} راتیں, {v.madinahDistance})</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200 text-center">
                        <div className="bg-white p-2 rounded-xl border border-gray-100">
                          <div className="text-[10px] text-gray-400">شیئرنگ</div>
                          <div className="font-mono font-bold text-gray-900">{formatPkr(v.sellingSharing)}</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-gray-100">
                          <div className="text-[10px] text-gray-400">کواڈ (4 بیڈ)</div>
                          <div className="font-mono font-bold text-gray-900">{formatPkr(v.sellingQuad)}</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-gray-100">
                          <div className="text-[10px] text-gray-400">ٹرپل (3 بیڈ)</div>
                          <div className="font-mono font-bold text-gray-900">{formatPkr(v.sellingTriple)}</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-gray-100">
                          <div className="text-[10px] text-gray-400">ڈبل (2 بیڈ)</div>
                          <div className="font-mono font-bold text-gray-900">{formatPkr(v.sellingDouble)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: PDF Package Upload */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-gray-900 text-base">پی ڈی ایف سے پیکیج امپورٹ کریں</h3>
              </div>
              <button onClick={() => setPdfModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              سپلائر کی عمرہ پیکیج شیٹ (جیسے UmrahGroups پی ڈی ایف) اپلوڈ کریں۔ ہمارا سسٹم ہوٹلوں کے نام، راتیں، ایئرلائن، اور چاروں کیٹیگریز (شیئرنگ، کواڈ، ٹرپل، ڈبل) کے ریٹس خودکار طور پر الگ کر کے پیکیج بنا دے گا۔
            </p>

            {pdfUploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pdfUploadSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* File Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer transition bg-gray-50 hover:bg-brand-50/20 space-y-3"
              >
                <Upload className="w-10 h-10 text-brand-500 mx-auto" />
                <div>
                  <div className="font-bold text-xs text-gray-800">اپنے کمپیوٹر سے PDF فائل منتخب کریں</div>
                  <div className="text-[11px] text-gray-400">PDF فائل (حجم 20MB تک)</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>

              {/* Sample PDF Import Button */}
              <div className="text-center">
                <span className="text-[11px] text-gray-400 block mb-2">یا ٹیسٹ کے لیے سیمپل شیٹ امپورٹ کریں:</span>
                <button
                  type="button"
                  disabled={pdfUploading}
                  onClick={handleImportSamplePdf}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
                >
                  {pdfUploading ? 'پروسیس ہو رہا ہے...' : 'سیمپل UmrahGroups (3).pdf امپورٹ کریں'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Package Creation */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-gray-900 text-base">نیا عمرہ پیکیج مینوئل درج کریں</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCreate} className="space-y-4 text-xs">
              
              {/* Row 1: Airline & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">گروپ کوڈ (اختیاری)</label>
                  <input
                    type="text"
                    value={formGroupCode}
                    onChange={e => setFormGroupCode(e.target.value)}
                    placeholder="UG-2027"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ایئرلائن</label>
                  <input
                    type="text"
                    required
                    value={formAirline}
                    onChange={e => setFormAirline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">روانگی کا شہر</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Dates & Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">روانگی کی تاریخ</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">واپسی کی تاریخ</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">کل نشستیں (Seats)</label>
                  <input
                    type="number"
                    required
                    value={formSeats}
                    onChange={e => setFormSeats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">سامان (Baggage)</label>
                  <input
                    type="text"
                    value={formBaggage}
                    onChange={e => setFormBaggage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Makkah Hotel */}
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  <span>مکہ مکرمہ ہوٹل تفصیلات:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">ہوٹل کا نام</label>
                    <input
                      type="text"
                      required
                      value={formMakkahHotel}
                      onChange={e => setFormMakkahHotel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">راتیں (Nights)</label>
                    <input
                      type="number"
                      required
                      value={formMakkahNights}
                      onChange={e => setFormMakkahNights(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">فاصلہ (Distance)</label>
                    <input
                      type="text"
                      value={formMakkahDistance}
                      onChange={e => setFormMakkahDistance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Madinah Hotel */}
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  <span>مدینہ منورہ ہوٹل تفصیلات:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">ہوٹل کا نام</label>
                    <input
                      type="text"
                      required
                      value={formMadinahHotel}
                      onChange={e => setFormMadinahHotel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">راتیں (Nights)</label>
                    <input
                      type="number"
                      required
                      value={formMadinahNights}
                      onChange={e => setFormMadinahNights(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">فاصلہ (Distance)</label>
                    <input
                      type="text"
                      value={formMadinahDistance}
                      onChange={e => setFormMadinahDistance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Selling Prices */}
              <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100 space-y-2">
                <div className="font-bold text-brand-950">فروخت کی قیمتیں (Selling Rates - PKR):</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">شیئرنگ (فی بیڈ)</label>
                    <input
                      type="number"
                      required
                      value={formSellSharing}
                      onChange={e => setFormSellSharing(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">کواڈ روم (فی شخص)</label>
                    <input
                      type="number"
                      required
                      value={formSellQuad}
                      onChange={e => setFormSellQuad(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">ٹرپل روم (فی شخص)</label>
                    <input
                      type="number"
                      required
                      value={formSellTriple}
                      onChange={e => setFormSellTriple(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">ڈبل روم (فی شخص)</label>
                    <input
                      type="number"
                      required
                      value={formSellDouble}
                      onChange={e => setFormSellDouble(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow transition"
                >
                  پیکج محفوظ اور پبلش کریں
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
