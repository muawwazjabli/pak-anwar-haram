'use client';

import React, { useState, useEffect } from 'react';
import { Hotel, OccupancyType } from '@/types';
import { formatSar } from '@/lib/i18n/translations';
import {
  Building,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<'all' | 'Makkah' | 'Madinah'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New hotel form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newCity, setNewCity] = useState<'Makkah' | 'Madinah'>('Makkah');
  const [newLocation, setNewLocation] = useState('');
  const [newDistance, setNewDistance] = useState('');
  const [newShuttle, setNewShuttle] = useState(false);
  const [newStarRating, setNewStarRating] = useState('3');

  useEffect(() => {
    loadHotels();
  }, [cityFilter, statusFilter]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter !== 'all') params.set('city', cityFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/hotels?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.hotels) {
        setHotels(data.hotels);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName) return;

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHotelName,
          city: newCity,
          locationArea: newLocation,
          distanceRaw: newDistance || (newShuttle ? 'SHUTTLE SERVICE' : '500 MTR'),
          shuttleService: newShuttle,
          starRating: parseInt(newStarRating) || 3
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setNewHotelName('');
        await loadHotels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHotels = hotels.filter(h => {
    if (!searchQuery) return true;
    return h.name.toLowerCase().includes(searchQuery.toLowerCase()) || (h.locationArea && h.locationArea.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Makkah & Madinah Hotels and Date Bands</h1>
          <p className="text-xs text-gray-500">
            Check-in inclusive and checkout exclusive nightly rate configuration. DBL-TPL-QD room rates vs Sharing per-bed rates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hotel Manually</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
            {(['all', 'Makkah', 'Madinah'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCityFilter(c)}
                className={`px-3 py-1.5 rounded-lg capitalize font-bold transition ${
                  cityFilter === c ? 'bg-emerald-800 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {c === 'all' ? 'All Cities' : c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
            {(['all', 'published', 'draft'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-bold transition ${
                  statusFilter === st ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search hotel name or area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs"
          />
        </div>
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading hotels...</div>
        ) : filteredHotels.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">No hotels found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredHotels.map(hotel => (
              <div key={hotel.id} className="p-6 space-y-4 hover:bg-gray-50/50 transition">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-gray-900">{hotel.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        hotel.city === 'Makkah' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {hotel.city}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                        v{hotel.version || 1} ({hotel.status})
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4">
                      <span>Area: <strong>{hotel.locationArea || 'City Center'}</strong></span>
                      <span>Distance: <strong>{hotel.distanceRaw}</strong></span>
                      {hotel.shuttleService && <span className="text-emerald-700 font-semibold">🚌 Free Shuttle Included</span>}
                      {hotel.starRating && <span>⭐ {hotel.starRating} Stars</span>}
                    </div>
                  </div>
                </div>

                {/* Date Bands and Rates Grid */}
                {hotel.dateBands && hotel.dateBands.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {hotel.dateBands.map((band: any) => {
                      const sharingRate = band.rates?.find((r: any) => r.occupancy === 'Sharing');
                      const doubleRate = band.rates?.find((r: any) => r.occupancy === 'Double');
                      const tripleRate = band.rates?.find((r: any) => r.occupancy === 'Triple');
                      const quadRate = band.rates?.find((r: any) => r.occupancy === 'Quad');
                      const quintRate = band.rates?.find((r: any) => r.occupancy === 'Quint');

                      return (
                        <div key={band.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-900 text-xs">{band.bandLabelRaw}</span>
                            <span className="text-[10px] text-gray-500 font-mono" dir="ltr">
                              {band.startDate} → {band.endDate}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono" dir="ltr">
                            <div className="p-1.5 rounded bg-white border border-gray-200">
                              <span className="text-gray-500 block text-[10px]">Sharing (Bed):</span>
                              <strong className={sharingRate?.isAvailable ? 'text-emerald-800' : 'text-gray-400'}>
                                {sharingRate?.isAvailable ? formatSar(sharingRate.rateAmount) : 'N/A'}
                              </strong>
                            </div>

                            <div className="p-1.5 rounded bg-white border border-gray-200">
                              <span className="text-gray-500 block text-[10px]">DBL-TPL-QD (Room):</span>
                              <strong className="text-emerald-800">
                                {formatSar(doubleRate?.rateAmount)}
                              </strong>
                            </div>

                            {quintRate && quintRate.isAvailable && (
                              <div className="p-1.5 rounded bg-amber-50 border border-amber-200 col-span-2">
                                <span className="text-amber-800 block text-[10px] font-sans font-semibold">
                                  Quint Detected (5-Pax Occupancy):
                                </span>
                                <strong className="text-amber-900 font-mono">
                                  {formatSar(quintRate.rateAmount)} (Separated from Sharing)
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Hotel Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-base">Add New Hotel</h3>

            <form onSubmit={handleCreateHotel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Kiswah Towers"
                  value={newHotelName}
                  onChange={e => setNewHotelName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">City *</label>
                <select
                  value={newCity}
                  onChange={e => setNewCity(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                >
                  <option value="Makkah">Makkah</option>
                  <option value="Madinah">Madinah</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Location / Road</label>
                <input
                  type="text"
                  placeholder="e.g. Ibrahim Khalil Road"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Distance (as printed)</label>
                <input
                  type="text"
                  placeholder="e.g. 500-600 M or SHUTTLE SERVICE"
                  value={newDistance}
                  onChange={e => setNewDistance(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="shuttleChk"
                  checked={newShuttle}
                  onChange={e => setNewShuttle(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="shuttleChk" className="font-medium text-gray-700">
                  Has Shuttle Service (Do not infer distance)
                </label>
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
                  Save Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
