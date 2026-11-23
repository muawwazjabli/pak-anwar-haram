import { Hotel, HotelDateBand, HotelRate, ImportReviewItem } from '@/types';

export interface MeezabHotelRawRow {
  hotelName: string;
  locationArea: string;
  distanceRaw: string;
  starRating?: number;
  notes?: string;
  ratesByBand: Array<{
    bandLabel: string;
    sharingRaw: string;
    roomRateRaw: string;
  }>;
}

export interface MeezabHotelSheetData {
  city: 'Makkah' | 'Madinah';
  seasonContext: string;
  publicationDate?: string;
  voucherStartDate?: string;
  visaRateBus?: number;
  visaRateOnly?: number;
  visaRatePartial?: number;
  makkahZiyarat?: number;
  madinahZiyarat?: number;
  dateBands: Array<{
    label: string;
    suggestedStartDate: string;
    suggestedEndDate: string;
    yearRollover: boolean;
  }>;
  hotels: MeezabHotelRawRow[];
}

export function parseMeezabHotelSheet(sheet: MeezabHotelSheetData, documentId: string, pageNumber: number): ImportReviewItem[] {
  const reviewItems: ImportReviewItem[] = [];

  for (const rawHotel of sheet.hotels) {
    const isCombinedOffer = rawHotel.hotelName.includes('/') || rawHotel.hotelName.toLowerCase().includes('old');
    const isShuttle = rawHotel.distanceRaw.toLowerCase().includes('shuttle');
    
    // Parse distance in meters if not shuttle
    let distanceMeters: number | null = null;
    if (!isShuttle) {
      const match = rawHotel.distanceRaw.match(/(\d+)(?:-(\d+))?\s*(?:mtr|m)/i);
      if (match) {
        distanceMeters = match[2] ? Math.round((parseInt(match[1]) + parseInt(match[2])) / 2) : parseInt(match[1]);
      }
    }

    const hotelValidationFlags: string[] = [];
    if (isCombinedOffer) {
      hotelValidationFlags.push('Combined hotel offer - confirm split or keep unified');
    }
    if (isShuttle) {
      hotelValidationFlags.push('Shuttle service - do not infer distance');
    }

    // Process rates for each band
    const bandRatesProposed: any[] = [];
    
    for (let i = 0; i < sheet.dateBands.length; i++) {
      const bandDef = sheet.dateBands[i];
      const bandRate = rawHotel.ratesByBand[i];
      if (!bandRate) continue;

      const bandFlags: string[] = [];
      if (bandDef.yearRollover) {
        bandFlags.push('Year rollover detected (Dec-Feb) - requires reviewer confirmation of Gregorian year');
      }
      bandFlags.push('Check-in inclusive and checkout exclusive nightly rate boundary');

      const sharingText = (bandRate.sharingRaw || '').trim();
      const roomRateText = (bandRate.roomRateRaw || '').trim();

      // Check for Quint in sharing cell (e.g. "Quint 580", "Quint 640")
      const quintMatch = sharingText.match(/Quint\s*(\d+)/i);
      let quintRate: number | null = null;
      let sharingRate: number | null = null;
      let sharingAvailable = true;

      if (quintMatch) {
        quintRate = parseFloat(quintMatch[1]);
        sharingRate = null;
        sharingAvailable = false;
        bandFlags.push('Sharing cell specified Quint occupancy - Quint rate separated, Sharing marked unavailable');
      } else if (sharingText.toUpperCase() === 'N/A' || !sharingText || sharingText === '0') {
        sharingRate = null;
        sharingAvailable = false;
        bandFlags.push('Sharing rate is N/A or unavailable');
      } else {
        const num = parseFloat(sharingText.replace(/,/g, ''));
        sharingRate = isNaN(num) ? null : num;
        if (sharingRate === null) sharingAvailable = false;
      }

      // Parse room rate (DBL-TPL-QD ROOM RATE)
      let roomRate: number | null = null;
      let roomRateAvailable = true;
      if (roomRateText.toUpperCase() === 'N/A' || !roomRateText || roomRateText === '0') {
        roomRate = null;
        roomRateAvailable = false;
        bandFlags.push('Room rate is N/A or unavailable');
      } else {
        const num = parseFloat(roomRateText.replace(/,/g, ''));
        roomRate = isNaN(num) ? null : num;
        if (roomRate === null) roomRateAvailable = false;
      }

      bandFlags.push('DBL-TPL-QD ROOM RATE applies to Double, Triple and Quad subject to approval');

      bandRatesProposed.push({
        bandLabel: bandDef.label,
        startDate: bandDef.suggestedStartDate,
        endDate: bandDef.suggestedEndDate,
        yearRollover: bandDef.yearRollover,
        currency: 'SAR',
        sharing: {
          rate: sharingRate,
          available: sharingAvailable,
          billingBasis: 'per_bed_per_night',
          raw: sharingText
        },
        quint: quintRate ? {
          rate: quintRate,
          available: true,
          billingBasis: 'per_room_per_night', // Flagged for review
          raw: sharingText,
          flag: 'Quint detected from sharing cell - verify billing basis'
        } : null,
        roomRateDblTplQd: {
          rate: roomRate,
          available: roomRateAvailable,
          billingBasis: 'per_room_per_night',
          raw: roomRateText,
          appliesTo: ['Double', 'Triple', 'Quad']
        },
        flags: bandFlags
      });
    }

    const allFlags = [...hotelValidationFlags];
    for (const b of bandRatesProposed) {
      for (const f of b.flags) {
        if (!allFlags.includes(f)) allFlags.push(f);
      }
    }

    const reviewItem: ImportReviewItem = {
      id: `rev-hotel-${sheet.city.toLowerCase()}-${rawHotel.hotelName.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      documentId,
      pageNumber,
      entityType: 'hotel_rate',
      rawData: rawHotel,
      proposedData: {
        hotelName: rawHotel.hotelName,
        city: sheet.city,
        locationArea: rawHotel.locationArea,
        distanceRaw: rawHotel.distanceRaw,
        distanceMeters,
        shuttleService: isShuttle,
        starRating: rawHotel.starRating || null,
        seasonContext: sheet.seasonContext,
        ratesByBand: bandRatesProposed
      },
      currentActiveData: null,
      diffSummary: {
        isNew: true,
        hasChanges: true,
        fieldChanges: []
      },
      validationFlags: allFlags,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reviewItems.push(reviewItem);
  }

  return reviewItems;
}
