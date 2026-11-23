import { OccupancyType, Quote } from '@/types';

export interface NightlyRateLookup {
  nightDate: string; // YYYY-MM-DD
  bandLabel: string;
  sharingBedRate: number | null;
  doubleRoomRate: number | null;
  tripleRoomRate: number | null;
  quadRoomRate: number | null;
  quintRate: number | null;
}

export interface StayPricingRequest {
  city: 'Makkah' | 'Madinah';
  hotelName: string;
  checkInDate: string;  // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  occupancyType: OccupancyType;
  roomsCount: number;
  bedsCount: number; // For sharing
  partyPax: number;
}

export interface FlightPricingRequest {
  airlineGroupId?: string;
  airlineName: string;
  flightSummary: string;
  fareStatus: 'confirmed' | 'request_fare';
  sellingFarePkr?: number | null;
  wholesaleFarePkr?: number | null;
}

export interface VisaTransportPricingRequest {
  visaType: 'visa_with_bus' | 'visa_only' | 'partial_visa' | 'none';
  transportType: 'bus_included' | 'private_sedan_4pax' | 'private_sedan_3pax' | 'private_sedan_2pax' | 'none';
  makkahZiyarat: boolean;
  madinahZiyarat: boolean;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
}

export interface PackageCalculationInput {
  customerName: string;
  customerPhone: string;
  partyAdults: number;
  partyChildren: number;
  partyInfants: number;
  flight?: FlightPricingRequest;
  makkahStay?: StayPricingRequest;
  madinahStay?: StayPricingRequest;
  visaTransport?: VisaTransportPricingRequest;
  sarToPkrRate: number; // e.g. 74.50
  markupPercentage?: number;
  rateLookupFn?: (hotelName: string, city: 'Makkah' | 'Madinah', nightDate: string) => NightlyRateLookup | null;
}

export function calculateCustomUmrahPackage(input: PackageCalculationInput): Quote {
  const totalPax = input.partyAdults + input.partyChildren + input.partyInfants;
  const payingPax = input.partyAdults + input.partyChildren;
  const infants = input.partyInfants;

  let totalWholesaleSar = 0;
  let totalWholesalePkr = 0;
  let totalSellingPkr = 0;
  let hasUnpricedComponents = false;
  const unpricedDetails: string[] = [];

  const breakdown: Record<string, any> = {
    exchangeRateUsed: input.sarToPkrRate,
    flight: null,
    makkahHotel: null,
    madinahHotel: null,
    visaAndTransport: null
  };

  // 1. FLIGHT CALCULATION
  if (input.flight) {
    if (input.flight.fareStatus === 'request_fare' || input.flight.sellingFarePkr == null) {
      hasUnpricedComponents = true;
      unpricedDetails.push(`Flight fare for ${input.flight.flightSummary} requires confirmation`);
      breakdown.flight = {
        summary: input.flight.flightSummary,
        status: 'request_fare',
        costPkr: 0
      };
    } else {
      const flightTotalPkr = input.flight.sellingFarePkr * payingPax;
      totalSellingPkr += flightTotalPkr;
      totalWholesalePkr += (input.flight.wholesaleFarePkr || input.flight.sellingFarePkr) * payingPax;
      breakdown.flight = {
        summary: input.flight.flightSummary,
        status: 'confirmed',
        farePerPaxPkr: input.flight.sellingFarePkr,
        paxCount: payingPax,
        totalPkr: flightTotalPkr
      };
    }
  }

  // 2. HOTEL CALCULATOR HELPER (Check-in inclusive, Checkout exclusive)
  const calculateHotelStay = (stay: StayPricingRequest) => {
    const checkIn = new Date(stay.checkInDate);
    const checkOut = new Date(stay.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const totalNights = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      throw new Error(`Checkout date (${stay.checkOutDate}) must be after check-in date (${stay.checkInDate})`);
    }

    let stayTotalSar = 0;
    const nightlyBreakdown: Array<{
      date: string;
      band: string;
      rateSar: number | null;
      billingBasis: string;
      units: number;
      nightSubtotalSar: number;
    }> = [];

    for (let i = 0; i < totalNights; i++) {
      const curDate = new Date(checkIn);
      curDate.setDate(curDate.getDate() + i);
      const dateStr = curDate.toISOString().split('T')[0];

      let rateForNight: number | null = null;
      let billingBasis = 'per_room_per_night';
      let units = stay.roomsCount;
      let bandName = 'Standard';

      if (input.rateLookupFn) {
        const lookup = input.rateLookupFn(stay.hotelName, stay.city, dateStr);
        if (lookup) {
          bandName = lookup.bandLabel;
          if (stay.occupancyType === 'Sharing') {
            rateForNight = lookup.sharingBedRate;
            billingBasis = 'per_bed_per_night';
            units = stay.bedsCount || payingPax;
          } else if (stay.occupancyType === 'Double') {
            rateForNight = lookup.doubleRoomRate;
            billingBasis = 'per_room_per_night';
            units = stay.roomsCount;
          } else if (stay.occupancyType === 'Triple') {
            rateForNight = lookup.tripleRoomRate;
            billingBasis = 'per_room_per_night';
            units = stay.roomsCount;
          } else if (stay.occupancyType === 'Quad') {
            rateForNight = lookup.quadRoomRate;
            billingBasis = 'per_room_per_night';
            units = stay.roomsCount;
          } else if (stay.occupancyType === 'Quint') {
            rateForNight = lookup.quintRate;
            billingBasis = 'per_room_per_night';
            units = stay.roomsCount;
          }
        }
      }

      if (rateForNight == null) {
        hasUnpricedComponents = true;
        unpricedDetails.push(`Missing approved rate for ${stay.hotelName} (${stay.city}) on night of ${dateStr} for ${stay.occupancyType}`);
        nightlyBreakdown.push({
          date: dateStr,
          band: bandName,
          rateSar: null,
          billingBasis,
          units,
          nightSubtotalSar: 0
        });
      } else {
        const nightSubtotal = rateForNight * units;
        stayTotalSar += nightSubtotal;
        nightlyBreakdown.push({
          date: dateStr,
          band: bandName,
          rateSar: rateForNight,
          billingBasis,
          units,
          nightSubtotalSar: nightSubtotal
        });
      }
    }

    return {
      hotelName: stay.hotelName,
      city: stay.city,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      totalNights,
      occupancyType: stay.occupancyType,
      roomsCount: stay.roomsCount,
      bedsCount: stay.bedsCount,
      stayTotalSar,
      stayTotalPkr: Math.round(stayTotalSar * input.sarToPkrRate),
      nightlyBreakdown
    };
  };

  // 3. MAKKAH HOTEL
  if (input.makkahStay) {
    const makkahCalc = calculateHotelStay(input.makkahStay);
    totalWholesaleSar += makkahCalc.stayTotalSar;
    breakdown.makkahHotel = makkahCalc;
  }

  // 4. MADINAH HOTEL
  if (input.madinahStay) {
    const madinahCalc = calculateHotelStay(input.madinahStay);
    totalWholesaleSar += madinahCalc.stayTotalSar;
    breakdown.madinahHotel = madinahCalc;
  }

  // 5. VISA & TRANSPORT CALCULATION
  if (input.visaTransport) {
    const vt = input.visaTransport;
    let vtTotalSar = 0;
    const vtItems: Array<{ item: string; qty: number; rateSar: number; totalSar: number }> = [];

    // Visa
    if (vt.visaType === 'visa_with_bus') {
      const visaRate = 550; // SAR (Includes round trip bus!)
      const sub = visaRate * payingPax;
      vtTotalSar += sub;
      vtItems.push({
        item: 'Umrah Visa with Round-Trip Bus Transport',
        qty: payingPax,
        rateSar: visaRate,
        totalSar: sub
      });
    } else if (vt.visaType === 'visa_only') {
      const visaRate = 600; // SAR
      const sub = visaRate * payingPax;
      vtTotalSar += sub;
      vtItems.push({
        item: 'Umrah Visa Only',
        qty: payingPax,
        rateSar: visaRate,
        totalSar: sub
      });
    } else if (vt.visaType === 'partial_visa') {
      const visaRate = 575; // SAR
      const sub = visaRate * payingPax;
      vtTotalSar += sub;
      vtItems.push({
        item: 'Partial Umrah Visa',
        qty: payingPax,
        rateSar: visaRate,
        totalSar: sub
      });
    }

    // Infant fee
    if (infants > 0) {
      const infantFee = 475; // SAR
      const sub = infantFee * infants;
      vtTotalSar += sub;
      vtItems.push({
        item: 'Infant Visa / Processing Fee',
        qty: infants,
        rateSar: infantFee,
        totalSar: sub
      });
    }

    // Transport (Prevent duplicate charging if bus already included in visa bundle!)
    if (vt.transportType === 'bus_included') {
      if (vt.visaType === 'visa_with_bus') {
        // Included! 0 extra charge
        vtItems.push({
          item: 'Bus Transport (Included in Visa bundle - no duplicate charge)',
          qty: payingPax,
          rateSar: 0,
          totalSar: 0
        });
      } else {
        // Charged separately
        const busRate = 50; // SAR
        const sub = busRate * payingPax;
        vtTotalSar += sub;
        vtItems.push({
          item: 'Round-Trip Bus Transport',
          qty: payingPax,
          rateSar: busRate,
          totalSar: sub
        });
      }
    } else if (vt.transportType === 'private_sedan_4pax') {
      const vehicleRate = 620; // SAR
      vtTotalSar += vehicleRate;
      vtItems.push({
        item: 'Private Transport: Jeddah to Makkah (4 Pax Vehicle)',
        qty: 1,
        rateSar: vehicleRate,
        totalSar: vehicleRate
      });
    } else if (vt.transportType === 'private_sedan_3pax') {
      const vehicleRate = 640; // SAR
      vtTotalSar += vehicleRate;
      vtItems.push({
        item: 'Private Transport: Jeddah to Makkah (3 Pax Vehicle)',
        qty: 1,
        rateSar: vehicleRate,
        totalSar: vehicleRate
      });
    } else if (vt.transportType === 'private_sedan_2pax') {
      const vehicleRate = 680; // SAR
      vtTotalSar += vehicleRate;
      vtItems.push({
        item: 'Private Transport: Jeddah to Makkah (2 Pax Vehicle)',
        qty: 1,
        rateSar: vehicleRate,
        totalSar: vehicleRate
      });
    }

    // Ziyarat
    if (vt.makkahZiyarat) {
      const ziyaratRate = 10; // SAR
      const sub = ziyaratRate * payingPax;
      vtTotalSar += sub;
      vtItems.push({
        item: 'Makkah Ziyarat (Holy Places Tour)',
        qty: payingPax,
        rateSar: ziyaratRate,
        totalSar: sub
      });
    }

    if (vt.madinahZiyarat) {
      const ziyaratRate = 10; // SAR
      const sub = ziyaratRate * payingPax;
      vtTotalSar += sub;
      vtItems.push({
        item: 'Madinah Ziyarat (Holy Places Tour)',
        qty: payingPax,
        rateSar: ziyaratRate,
        totalSar: sub
      });
    }

    totalWholesaleSar += vtTotalSar;
    breakdown.visaAndTransport = {
      items: vtItems,
      totalSar: vtTotalSar,
      totalPkr: Math.round(vtTotalSar * input.sarToPkrRate)
    };
  }

  // SAR TO PKR CONVERSION FOR GROUND SERVICES
  const groundServicesPkr = Math.round(totalWholesaleSar * input.sarToPkrRate);
  totalWholesalePkr += groundServicesPkr;

  // MARKUP CALCULATION (e.g. 8% on ground services if selling price not explicitly set)
  const markupPercent = input.markupPercentage ?? 8;
  const markupAmountPkr = Math.round(groundServicesPkr * (markupPercent / 100));
  const groundSellingPkr = groundServicesPkr + markupAmountPkr;
  totalSellingPkr += groundSellingPkr;

  breakdown.totals = {
    wholesaleTotalSar: totalWholesaleSar,
    wholesaleTotalPkr: totalWholesalePkr,
    groundSellingPkr,
    totalSellingPkr: hasUnpricedComponents ? null : totalSellingPkr,
    perPersonSellingPkr: (hasUnpricedComponents || totalPax === 0) ? null : Math.round(totalSellingPkr / totalPax)
  };

  const quoteReference = `PAH-Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48-hour quote lock

  return {
    id: `quote-${Date.now()}`,
    quoteReference,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    partyAdults: input.partyAdults,
    partyChildren: input.partyChildren,
    partyInfants: input.partyInfants,
    totalPax,
    packageType: 'custom',
    flightChoice: breakdown.flight,
    makkahStay: breakdown.makkahHotel,
    madinahStay: breakdown.madinahHotel,
    visaTransportChoices: breakdown.visaAndTransport,
    sarToPkrRate: input.sarToPkrRate,
    wholesaleTotalSar: totalWholesaleSar,
    wholesaleTotalPkr: totalWholesalePkr,
    sellingTotalPkr: hasUnpricedComponents ? undefined : totalSellingPkr,
    sellingPerPersonPkr: (hasUnpricedComponents || totalPax === 0) ? undefined : Math.round(totalSellingPkr / totalPax),
    hasUnpricedComponents,
    unpricedDetails,
    priceBreakdown: breakdown,
    snapshotVersion: 1,
    expiresAt,
    createdAt: new Date().toISOString()
  };
}
