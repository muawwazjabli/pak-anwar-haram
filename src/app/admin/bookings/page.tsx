'use client';

import React, { useState, useEffect } from 'react';
import { BookingRequest, BookingStatus } from '@/types';
import { formatPkr } from '@/lib/i18n/translations';
import {
  Inbox,
  CheckCircle,
  Clock,
  MessageCircle,
  FileText,
  User,
  Phone,
  Edit2,
  Lock,
  Send
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);

  // Note text input
  const [newNote, setNewNote] = useState('');
  const [statusInput, setStatusInput] = useState<BookingStatus>('New');
  const [confirmationRef, setConfirmationRef] = useState('');

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.bookingRequests) {
        setRequests(data.bookingRequests);
        if (data.bookingRequests.length > 0 && !selectedBooking) {
          setSelectedBooking(data.bookingRequests[0]);
          setStatusInput(data.bookingRequests[0].status);
          setConfirmationRef(data.bookingRequests[0].confirmationReference || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: statusInput,
          confirmationReference: confirmationRef || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newNote.trim()) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteText: newNote,
          authorName: 'Operations Staff'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewNote('');
        await loadBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<BookingStatus, string> = {
    'New': 'bg-amber-100 text-amber-800',
    'Reviewing': 'bg-blue-100 text-blue-800',
    'Awaiting Customer': 'bg-purple-100 text-purple-800',
    'Held': 'bg-indigo-100 text-indigo-800',
    'Confirmed': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Expired': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h1 className="text-xl font-bold text-gray-900">Quotes & Booking Enquiries</h1>
        <p className="text-xs text-gray-500">
          Process customer quote requests, manage reservation states, record private staff notes, and link airline PNR references.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {(['all', 'New', 'Reviewing', 'Awaiting Customer', 'Held', 'Confirmed', 'Cancelled', 'Expired'] as const).map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
              statusFilter === st ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requests List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">No requests found.</div>
          ) : (
            requests.map(req => {
              const isSelected = selectedBooking?.id === req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedBooking(req);
                    setStatusInput(req.status);
                    setConfirmationRef(req.confirmationReference || '');
                  }}
                  className={`p-4 cursor-pointer transition space-y-2 ${
                    isSelected ? 'bg-brand-50/70 border-l-4 border-l-brand-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-xs text-gray-900">{req.customerName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[req.status] || 'bg-gray-100'}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 font-mono" dir="ltr">
                    {req.requestReference} • {req.customerPhone}
                  </div>

                  <div className="text-[11px] text-gray-500 line-clamp-1">
                    {req.partySummary}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Request Details & Action Pane */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-6">
          {selectedBooking ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-gray-400 uppercase font-semibold">
                    Request Reference: {selectedBooking.requestReference}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedBooking.customerName}</h3>
                  <div className="text-xs text-gray-500 font-mono mt-0.5" dir="ltr">
                    Phone / WhatsApp: <strong>{selectedBooking.customerPhone}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[selectedBooking.status]}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Status Update & Confirmation Controls */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-3">
                <div className="font-bold text-gray-800">Update Request Workflow State:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Status</label>
                    <select
                      value={statusInput}
                      onChange={e => setStatusInput(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value="New">New</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Awaiting Customer">Awaiting Customer</option>
                      <option value="Held">Held (Seats Locked)</option>
                      <option value="Confirmed">Confirmed (Vouchers Ready)</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Confirmation / Voucher Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. MEEZAB-VOUCHER-981"
                      value={confirmationRef}
                      onChange={e => setConfirmationRef(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white font-bold"
                >
                  Update Workflow Status
                </button>
              </div>

              {/* Quote Snapshot Details if available */}
              {selectedBooking.quoteSnapshot && (
                <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-200 text-xs space-y-2">
                  <div className="font-bold text-brand-950">Linked Quote Snapshot ({selectedBooking.quoteSnapshot.quoteReference}):</div>
                  <div className="flex justify-between font-mono">
                    <span>Quoted Selling Total:</span>
                    <strong className="text-emerald-950 font-bold">
                      {formatPkr(selectedBooking.quoteSnapshot.sellingTotalPkr)}
                    </strong>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Calculated using SAR rate: <strong>{selectedBooking.quoteSnapshot.sarToPkrRate} PKR</strong>
                  </div>
                </div>
              )}

              {/* Private Staff Notes */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-600" />
                  <span>Private Staff Notes (Hidden from Customer):</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedBooking.notes && selectedBooking.notes.length > 0 ? (
                    selectedBooking.notes.map(n => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                          <span>{n.authorName}</span>
                          <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-800">{n.noteText}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No staff notes added yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add private staff note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-gray-300 text-xs"
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-gray-900 text-white font-bold text-xs">
                    Add Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-gray-400">
              Select an enquiry to review details and workflow actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
