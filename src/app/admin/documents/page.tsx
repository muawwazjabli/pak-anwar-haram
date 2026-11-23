'use client';

import React, { useState, useEffect } from 'react';
import { ImportReviewItem, SupplierDocument, DocumentType } from '@/types';
import {
  FileText,
  Upload,
  Check,
  X,
  Edit2,
  AlertTriangle,
  Send,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
  FileCheck,
  Clock,
  Filter
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [reviewItems, setReviewItems] = useState<ImportReviewItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ImportReviewItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  // Edit / Correction modal state
  const [editingItem, setEditingItem] = useState<ImportReviewItem | null>(null);
  const [correctedText, setCorrectedText] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, revRes] = await Promise.all([
        fetch('/api/documents').then(r => r.json()),
        fetch('/api/documents/review').then(r => r.json())
      ]);
      if (docsRes.success && docsRes.documents) setDocuments(docsRes.documents);
      if (revRes.success && revRes.reviewItems) {
        setReviewItems(revRes.reviewItems);
        if (revRes.reviewItems.length > 0 && !selectedItem) {
          setSelectedItem(revRes.reviewItems[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick import trigger for sample files
  const importSampleFile = async (fileName: string, supplierId: string, docType: DocumentType) => {
    setImporting(true);
    setPublishMessage(null);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          supplierId,
          docType
        })
      });
      const data = await res.json();
      if (data.success) {
        // Poll or wait for background import worker
        setTimeout(async () => {
          await loadData();
          setImporting(false);
        }, 1200);
      } else {
        alert(data.error);
        setImporting(false);
      }
    } catch (err) {
      console.error(err);
      setImporting(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      const res = await fetch('/api/documents/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', itemId })
      });
      const data = await res.json();
      if (data.success) {
        setReviewItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'approved' } : item));
        if (selectedItem?.id === itemId) {
          setSelectedItem(prev => prev ? { ...prev, status: 'approved' } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      const res = await fetch('/api/documents/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', itemId })
      });
      const data = await res.json();
      if (data.success) {
        setReviewItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'rejected' } : item));
        if (selectedItem?.id === itemId) {
          setSelectedItem(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishAllApproved = async () => {
    const approvedIds = reviewItems.filter(i => i.status === 'approved' || i.status === 'corrected').map(i => i.id);
    if (approvedIds.length === 0) {
      alert('No approved items found in review queue. Please approve items first.');
      return;
    }

    try {
      const res = await fetch('/api/documents/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: approvedIds, publishedBy: 'owner@pakanwarharam.com', role: 'owner' })
      });
      const data = await res.json();
      if (data.success) {
        setPublishMessage(`Successfully published ${data.publishedCount} items to active rate tables!`);
        await loadData();
      } else {
        alert(data.error || 'Failed to publish');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = reviewItems.filter(item => {
    if (selectedDocId && item.documentId !== selectedDocId) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Sample Fixture Loaders */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Supplier Document Ingestion & Review Queue</h1>
            <p className="text-xs text-gray-500">
              Extract embedded PDF text or images via vision OCR, review proposed normalized rows side-by-side, and publish valid rates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishAllApproved}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-emerald-300" />
              <span>Publish Approved Changes ({reviewItems.filter(i => i.status === 'approved' || i.status === 'corrected').length})</span>
            </button>
          </div>
        </div>

        {publishMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{publishMessage}</span>
          </div>
        )}

        {/* Quick Sample Document Ingestion Buttons */}
        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>One-Click Import Attached Supplier Fixtures:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              disabled={importing}
              onClick={() => importSampleFile('WhatsApp Image 2026-11-16 at 12.33.04 PM.jpeg', 'sup-meezab', 'hotel_rates')}
              className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 font-medium transition"
            >
              🕋 Meezab Ramadan Makkah (JPEG)
            </button>

            <button
              disabled={importing}
              onClick={() => importSampleFile('WhatsApp Image 2026-11-16 at 12.33.05 PM.jpeg', 'sup-meezab', 'hotel_rates')}
              className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 font-medium transition"
            >
              🕌 Meezab Ramadan Madinah (JPEG)
            </button>

            <button
              disabled={importing}
              onClick={() => importSampleFile('WhatsApp Image 2026-11-21 at 10.36.21 AM.jpeg', 'sup-meezab', 'hotel_rates')}
              className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 font-medium transition"
            >
              📋 Meezab Regular Makkah + Visa (JPEG)
            </button>

            <button
              disabled={importing}
              onClick={() => importSampleFile('WhatsApp Image 2026-11-21 at 10.36.21 AM (1).jpeg', 'sup-meezab', 'hotel_rates')}
              className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 font-medium transition"
            >
              📋 Meezab Regular Madinah + Visa (JPEG)
            </button>

            <button
              disabled={importing}
              onClick={() => importSampleFile('Airline Groups - AL-SABOOR GROUP.pdf', 'sup-alsaboor', 'airline_groups')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium transition"
            >
              ✈️ Al-Saboor Flight Groups (PDF)
            </button>

            <button
              disabled={importing}
              onClick={() => importSampleFile('UmrahGroups (3).pdf', 'sup-meezab', 'ready_made_packages')}
              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-medium transition"
            >
              📦 UmrahGroups Ready-Made (PDF)
            </button>
          </div>

          {importing && (
            <div className="mt-3 text-xs text-brand-700 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Background durable worker is processing pages and extracting structured records...</span>
            </div>
          )}
        </div>
      </div>

      {/* FILTER & QUEUE STATS */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span>Status Filter:</span>
          {(['all', 'pending', 'approved', 'rejected', 'corrected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md capitalize font-semibold transition ${
                filterStatus === st ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          Showing <strong>{filteredItems.length}</strong> items in queue
        </div>
      </div>

      {/* MAIN REVIEW INTERFACE: SIDE-BY-SIDE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review Items List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100 max-h-[750px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No items in review queue matching this filter.
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = selectedItem?.id === item.id;
              const hasFlags = item.validationFlags && item.validationFlags.length > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 cursor-pointer transition space-y-2 ${
                    isSelected ? 'bg-brand-50/70 border-l-4 border-l-brand-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-xs text-gray-900">
                      {item.entityType === 'hotel_rate' && `🏨 ${item.proposedData.hotelName} (${item.proposedData.city})`}
                      {item.entityType === 'flight_group' && `✈️ ${item.proposedData.airlineCode} ${item.proposedData.flightNumbersSummary} (${item.proposedData.sector})`}
                      {item.entityType === 'package' && `📦 Group ${item.proposedData.groupCode}`}
                      {item.entityType === 'visa_transport' && `🛡️ ${item.proposedData.title}`}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      item.status === 'corrected' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Summary line */}
                  <div className="text-[11px] text-gray-600 line-clamp-1">
                    {item.entityType === 'hotel_rate' && `Distance: ${item.proposedData.distanceRaw} • ${item.proposedData.ratesByBand?.length || 0} date bands`}
                    {item.entityType === 'flight_group' && `Dates: ${item.proposedData.outboundDate} to ${item.proposedData.inboundDate} • Seats: ${item.proposedData.reportedSeats}`}
                    {item.entityType === 'package' && `${item.proposedData.variants?.length || 0} variants • Total nights: ${item.proposedData.nightsTotal}`}
                    {item.entityType === 'visa_transport' && `Rate: ${item.proposedData.rateAmount} ${item.proposedData.currency} (${item.proposedData.billingUnit})`}
                  </div>

                  {/* Validation Flags Alert Pill */}
                  {hasFlags && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="line-clamp-1">{item.validationFlags[0]}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Side-by-Side Preview & Editable Record */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-6">
          {selectedItem ? (
            <div className="space-y-6">
              {/* Review Item Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold font-mono">
                    Review Item: {selectedItem.id}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">
                    {selectedItem.entityType === 'hotel_rate' && `${selectedItem.proposedData.hotelName} (${selectedItem.proposedData.city})`}
                    {selectedItem.entityType === 'flight_group' && `${selectedItem.proposedData.airlineName} - ${selectedItem.proposedData.flightNumbersSummary}`}
                    {selectedItem.entityType === 'package' && `Package Group ${selectedItem.proposedData.groupCode}`}
                    {selectedItem.entityType === 'visa_transport' && selectedItem.proposedData.title}
                  </h3>
                </div>

                {/* Approve / Reject Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Validation Flags Warning Box */}
              {selectedItem.validationFlags && selectedItem.validationFlags.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Extraction Audit Flags:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                    {selectedItem.validationFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SIDE-BY-SIDE VIEW: Source Raw Data vs Proposed Normalized Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Source Raw Data Pane */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>Raw Supplier Text / Document Excerpt:</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[11px] text-gray-800 overflow-x-auto whitespace-pre-wrap max-h-80">
                    {JSON.stringify(selectedItem.rawData, null, 2)}
                  </pre>
                </div>

                {/* Proposed Normalized Data Pane */}
                <div className="space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Proposed Normalized Schema Rows:</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 font-mono text-[11px] text-emerald-950 overflow-x-auto whitespace-pre-wrap max-h-80">
                    {JSON.stringify(selectedItem.proposedData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Diff summary against active database records */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="font-bold text-gray-800">Diff Against Active Live Records:</div>
                <p className="text-gray-600 text-[11px]">
                  {selectedItem.diffSummary?.isNew
                    ? '✨ Brand new record. Will be inserted into live catalog upon explicit publication.'
                    : 'Changes detected against active record. Previous version will be superseded and kept for rollback.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 text-xs">
              Select an item from the left queue to review source data and approve or reject.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
