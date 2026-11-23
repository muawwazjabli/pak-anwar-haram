import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateCustomUmrahPackage, NightlyRateLookup } from '@/lib/pricing/calculator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      partyAdults,
      partyChildren,
      partyInfants,
      flight,
      makkahStay,
      madinahStay,
      visaTransport
    } = body;

    // Get active exchange rate
    const activeFx = db.exchangeRates.find(r => r.isActive);
    const sarToPkrRate = activeFx ? activeFx.rate : 74.50;

    // Hotel rate lookup function across published hotel date bands
    const rateLookupFn = (hotelName: string, city: 'Makkah' | 'Madinah', nightDate: string): NightlyRateLookup | null => {
      // Find published hotel by name or alias
      const hotel = db.hotels.find(
        h => h.status === 'published' && h.city === city &&
        (h.name.toLowerCase() === hotelName.toLowerCase() || h.aliases.some(a => a.toLowerCase() === hotelName.toLowerCase()) || h.name.includes(hotelName) || hotelName.includes(h.name))
      );
      if (!hotel) return null;

      // Find band covering nightDate (startDate <= nightDate < endDate)
      const band = db.hotelDateBands.find(
        b => b.hotelId === hotel.id && b.startDate <= nightDate && nightDate < b.endDate
      );
      if (!band) return null;

      const rates = db.hotelRates.filter(r => r.dateBandId === band.id && r.status === 'published' && r.isAvailable);
      const sharing = rates.find(r => r.occupancy === 'Sharing');
      const doubleR = rates.find(r => r.occupancy === 'Double');
      const tripleR = rates.find(r => r.occupancy === 'Triple');
      const quadR = rates.find(r => r.occupancy === 'Quad');
      const quint = rates.find(r => r.occupancy === 'Quint');

      return {
        nightDate,
        bandLabel: band.bandLabelRaw,
        sharingBedRate: sharing ? sharing.rateAmount : null,
        doubleRoomRate: doubleR ? doubleR.rateAmount : null,
        tripleRoomRate: tripleR ? tripleR.rateAmount : null,
        quadRoomRate: quadR ? quadR.rateAmount : null,
        quintRate: quint ? quint.rateAmount : null
      };
    };

    const quote = calculateCustomUmrahPackage({
      customerName: customerName || 'Valued Guest',
      customerPhone: customerPhone || '',
      partyAdults: parseInt(partyAdults, 10) || 1,
      partyChildren: parseInt(partyChildren, 10) || 0,
      partyInfants: parseInt(partyInfants, 10) || 0,
      flight,
      makkahStay,
      madinahStay,
      visaTransport,
      sarToPkrRate,
      markupPercentage: db.settings.defaultMarkupPercent,
      rateLookupFn
    });

    // Save snapshot in database
    db.quotes.push(quote);

    return NextResponse.json({
      success: true,
      quote
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
