import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const isPublic = searchParams.get('public') === 'true';

    let hotels = db.hotels;
    if (city) hotels = hotels.filter(h => h.city === city);
    if (supplierId) hotels = hotels.filter(h => h.supplierId === supplierId);
    
    if (isPublic) {
      // Public only sees published hotels
      hotels = hotels.filter(h => h.status === 'published');
    } else if (status) {
      hotels = hotels.filter(h => h.status === status);
    }

    const result = hotels.map(h => {
      const bands = db.hotelDateBands.filter(b => b.hotelId === h.id);
      const bandsWithRates = bands.map(b => {
        let rates = db.hotelRates.filter(r => r.dateBandId === b.id);
        if (isPublic) rates = rates.filter(r => r.status === 'published' && r.isAvailable);
        return {
          ...b,
          rates
        };
      });

      return {
        ...h,
        dateBands: bandsWithRates
      };
    });

    return NextResponse.json({
      success: true,
      hotels: result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      existingHotelId,
      name,
      city,
      locationArea,
      distanceRaw,
      shuttleService,
      starRating,
      supplierId,
      dateBands,
      userId
    } = body;

    let targetHotelId = existingHotelId || body.hotelId;
    let targetHotel = targetHotelId ? db.hotels.find(h => h.id === targetHotelId) : null;

    if (!targetHotel) {
      if (!name || !city) {
        return NextResponse.json({ error: 'Hotel name and city are required' }, { status: 400 });
      }

      targetHotelId = `hotel-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      targetHotel = {
        id: targetHotelId,
        supplierId: supplierId || 'sup-meezab',
        name,
        aliases: [],
        city: city as 'Makkah' | 'Madinah',
        locationArea: locationArea || '',
        distanceRaw: distanceRaw || '',
        distanceMeters: null,
        shuttleService: Boolean(shuttleService),
        starRating: starRating ? parseInt(starRating) : null,
        status: 'published' as const,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.hotels.push(targetHotel);
    }

    // If date bands supplied
    if (dateBands && Array.isArray(dateBands)) {
      for (const b of dateBands) {
        const bandId = `band-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        db.hotelDateBands.push({
          id: bandId,
          hotelId: targetHotelId,
          supplierId: targetHotel.supplierId,
          bandLabelRaw: b.label || `${b.startDate || ''} to ${b.endDate || ''}`,
          startDate: b.startDate,
          endDate: b.endDate,
          currency: 'SAR',
          seasonContext: b.seasonContext || 'Standard Season',
          confirmedByReviewer: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        if (b.rates && Array.isArray(b.rates)) {
          for (const r of b.rates) {
            db.hotelRates.push({
              id: `rate-${Date.now()}-${Math.floor(Math.random()*10000)}`,
              dateBandId: bandId,
              hotelId: targetHotelId,
              occupancy: r.occupancy,
              billingBasis: r.billingBasis,
              rateAmount: r.rateAmount != null ? parseFloat(r.rateAmount) : null,
              isAvailable: r.isAvailable !== false,
              requiresVerification: false,
              version: 1,
              status: 'published',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    }

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: userId || 'admin',
      action: 'MANUAL_CREATE_HOTEL_OR_BAND',
      entityType: 'hotels',
      entityId: targetHotelId,
      afterSnapshot: targetHotel,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      hotel: targetHotel
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
