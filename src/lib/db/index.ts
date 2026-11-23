import {
  AppUser,
  Supplier,
  SupplierDocument,
  ImportReviewItem,
  Hotel,
  HotelDateBand,
  HotelRate,
  VisaTransportRate,
  AirlineGroup,
  PackageGroup,
  PackageVariant,
  PriceRule,
  ExchangeRate,
  AgencySettings,
  Quote,
  BookingRequest,
  BookingStaffNote,
  AuditLog
} from '@/types';
import { applyPriceRuleToVariant } from '../pricing/discount-rules';

// In-memory durable store with file persistence fallback
class DataStore {
  private static instance: DataStore;

  users: AppUser[] = [
    {
      id: 'usr-owner-1',
      email: 'owner@pakanwarharam.com',
      fullName: 'Muawwaz Jabli (Owner)',
      role: 'owner',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-staff-1',
      email: 'staff@pakanwarharam.com',
      fullName: 'Operations Staff',
      role: 'staff',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-readonly-1',
      email: 'viewer@pakanwarharam.com',
      fullName: 'Audit Viewer',
      role: 'read_only',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  suppliers: Supplier[] = [
    {
      id: 'sup-meezab',
      name: 'Meezab Group',
      code: 'MEEZAB',
      contactPerson: 'Walid Sohail',
      phone: '0337-9605787',
      email: 'booking@meezabgroup.com',
      notes: 'Makkah and Madinah hotel rates, Umrah visas and transport',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sup-alsaboor',
      name: 'Al-Saboor Group',
      code: 'ALSABOOR',
      contactPerson: 'Reservation Desk',
      phone: '+92-42-35800000',
      email: 'groups@alsaboorgroup.com',
      notes: 'Group flights inventory: SV, PF, PK',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  settings: AgencySettings = {
    id: 'settings-global',
    brandNameUrdu: 'پاک انوار حرم',
    brandNameEn: 'Pak Anwar Haram',
    phonePrimary: '+92-40-4222634',
    phoneWhatsapp: '+92-322-2188218',
    email: 'info@pakanwarharam.com',
    address: 'Pak Anwar Haram Travel & Tours, Multan / Sahiwal, Pakistan',
    logoUrl: '/logo.png',
    stalenessPolicyHours: 48,
    allowPartialQuotes: true,
    defaultMarkupPercent: 8,
    ocrProvider: 'builtin_rule_parser',
    updatedAt: new Date().toISOString()
  };

  exchangeRates: ExchangeRate[] = [
    {
      id: 'fx-1',
      baseCurrency: 'SAR',
      quoteCurrency: 'PKR',
      rate: 74.50,
      version: 1,
      isActive: true,
      effectiveFrom: '2026-11-01T00:00:00Z',
      approvedBy: 'owner@pakanwarharam.com',
      createdAt: '2026-11-01T00:00:00Z'
    }
  ];

  documents: SupplierDocument[] = [];
  reviewItems: ImportReviewItem[] = [];

  hotels: Hotel[] = [];
  hotelDateBands: HotelDateBand[] = [];
  hotelRates: HotelRate[] = [];

  visaTransportRates: VisaTransportRate[] = [];
  airlineGroups: AirlineGroup[] = [];
  packageGroups: PackageGroup[] = [];
  packageVariants: PackageVariant[] = [];
  priceRules: PriceRule[] = [];

  quotes: Quote[] = [];
  bookingRequests: BookingRequest[] = [];
  staffNotes: BookingStaffNote[] = [];
  auditLogs: AuditLog[] = [];

  private constructor() {
    this.seedInitialPublishedRecords();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  // Initial active published rates so the public calculator and packages page work immediately
  private seedInitialPublishedRecords() {
    // 1. Ramadan Makkah Hotel: ARAFAT ZAHBI (Shuttle)
    const hotelArafatId = 'hotel-makkah-arafat-zahbi';
    this.hotels.push({
      id: hotelArafatId,
      supplierId: 'sup-meezab',
      supplierName: 'Meezab Group',
      name: 'ARAFAT ZAHBI (Shuttle)',
      aliases: ['Arafat Zahbi', 'Fakhir Al Azizia'],
      city: 'Makkah',
      locationArea: 'UMM AL-MOUMIN STREET KUDAI',
      distanceRaw: 'SHUTTLE SERVICE',
      distanceMeters: null,
      shuttleService: true,
      starRating: 3,
      status: 'published',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const band1Id = 'band-ramadan-makkah-1';
    const band2Id = 'band-ramadan-makkah-2';

    this.hotelDateBands.push(
      {
        id: band1Id,
        hotelId: hotelArafatId,
        supplierId: 'sup-meezab',
        bandLabelRaw: '06 FEB TILL 27 FEB',
        startDate: '2027-02-06',
        endDate: '2027-02-27',
        currency: 'SAR',
        seasonContext: 'Ramadan 1448H',
        confirmedByReviewer: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: band2Id,
        hotelId: hotelArafatId,
        supplierId: 'sup-meezab',
        bandLabelRaw: '27 FEB TILL 11 MAR',
        startDate: '2027-02-27',
        endDate: '2027-03-11',
        currency: 'SAR',
        seasonContext: 'Ramadan 1448H',
        confirmedByReviewer: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // Band 1 rates: Sharing 29, Room 160
    this.hotelRates.push(
      {
        id: 'rate-arafat-b1-sharing',
        dateBandId: band1Id,
        hotelId: hotelArafatId,
        occupancy: 'Sharing',
        billingBasis: 'per_bed_per_night',
        rateAmount: 29,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-arafat-b1-double',
        dateBandId: band1Id,
        hotelId: hotelArafatId,
        occupancy: 'Double',
        billingBasis: 'per_room_per_night',
        rateAmount: 160,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-arafat-b1-triple',
        dateBandId: band1Id,
        hotelId: hotelArafatId,
        occupancy: 'Triple',
        billingBasis: 'per_room_per_night',
        rateAmount: 160,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-arafat-b1-quad',
        dateBandId: band1Id,
        hotelId: hotelArafatId,
        occupancy: 'Quad',
        billingBasis: 'per_room_per_night',
        rateAmount: 160,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // Band 2 rates: Sharing 49, Room 290
    this.hotelRates.push(
      {
        id: 'rate-arafat-b2-sharing',
        dateBandId: band2Id,
        hotelId: hotelArafatId,
        occupancy: 'Sharing',
        billingBasis: 'per_bed_per_night',
        rateAmount: 49,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-arafat-b2-double',
        dateBandId: band2Id,
        hotelId: hotelArafatId,
        occupancy: 'Double',
        billingBasis: 'per_room_per_night',
        rateAmount: 290,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-arafat-b2-triple',
        dateBandId: band2Id,
        hotelId: hotelArafatId,
        occupancy: 'Triple',
        billingBasis: 'per_room_per_night',
        rateAmount: 290,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-arafat-b2-quad',
        dateBandId: band2Id,
        hotelId: hotelArafatId,
        occupancy: 'Quad',
        billingBasis: 'per_room_per_night',
        rateAmount: 290,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // 2. Ramadan Madinah Hotel: HALA TAIBAH
    const hotelHalaId = 'hotel-madinah-hala-taibah';
    this.hotels.push({
      id: hotelHalaId,
      supplierId: 'sup-meezab',
      supplierName: 'Meezab Group',
      name: 'HALA TAIBAH',
      aliases: ['Hala Taiba'],
      city: 'Madinah',
      locationArea: 'ABDUL AZIZ ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      distanceMeters: null,
      shuttleService: true,
      starRating: 3,
      status: 'published',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const bandMadinahId = 'band-ramadan-madinah-1';
    this.hotelDateBands.push({
      id: bandMadinahId,
      hotelId: hotelHalaId,
      supplierId: 'sup-meezab',
      bandLabelRaw: '06 FEB TILL 11 MAR',
      startDate: '2027-02-06',
      endDate: '2027-03-11',
      currency: 'SAR',
      seasonContext: 'Ramadan 1448H',
      confirmedByReviewer: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.hotelRates.push(
      {
        id: 'rate-hala-b1-sharing',
        dateBandId: bandMadinahId,
        hotelId: hotelHalaId,
        occupancy: 'Sharing',
        billingBasis: 'per_bed_per_night',
        rateAmount: 35,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-hala-b1-double',
        dateBandId: bandMadinahId,
        hotelId: hotelHalaId,
        occupancy: 'Double',
        billingBasis: 'per_room_per_night',
        rateAmount: 175,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-hala-b1-triple',
        dateBandId: bandMadinahId,
        hotelId: hotelHalaId,
        occupancy: 'Triple',
        billingBasis: 'per_room_per_night',
        rateAmount: 175,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rate-hala-b1-quad',
        dateBandId: bandMadinahId,
        hotelId: hotelHalaId,
        occupancy: 'Quad',
        billingBasis: 'per_room_per_night',
        rateAmount: 175,
        isAvailable: true,
        requiresVerification: false,
        version: 1,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // 3. Visa & Transport
    this.visaTransportRates.push(
      {
        id: 'vt-visa-bus',
        supplierId: 'sup-meezab',
        supplierName: 'Meezab Group',
        category: 'visa_with_bus',
        title: 'Umrah Visa with Round-Trip Bus Transport',
        route: 'Jeddah / Madinah / Makkah',
        vehicleType: 'Bus',
        partyMinPax: 1,
        partyMaxPax: 47,
        billingUnit: 'per_person',
        rateAmount: 550,
        currency: 'SAR',
        inclusions: ['umrah_visa', 'round_trip_bus_transport'],
        isBundle: true,
        preventsDuplicateCharging: true,
        status: 'published',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vt-ziyarat-makkah',
        supplierId: 'sup-meezab',
        supplierName: 'Meezab Group',
        category: 'ziyarat',
        title: 'Makkah Ziyarat',
        route: 'Holy Places in Makkah',
        partyMinPax: 1,
        billingUnit: 'per_person',
        rateAmount: 10,
        currency: 'SAR',
        inclusions: ['makkah_ziyarat'],
        isBundle: false,
        preventsDuplicateCharging: false,
        status: 'published',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vt-ziyarat-madinah',
        supplierId: 'sup-meezab',
        supplierName: 'Meezab Group',
        category: 'ziyarat',
        title: 'Madinah Ziyarat',
        route: 'Holy Places in Madinah',
        partyMinPax: 1,
        billingUnit: 'per_person',
        rateAmount: 10,
        currency: 'SAR',
        inclusions: ['madinah_ziyarat'],
        isBundle: false,
        preventsDuplicateCharging: false,
        status: 'published',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // 4. Sample Ready-Made Package UG-100698 & UP-103710
    const pkgGrpId = 'pkg-grp-100698';
    this.packageGroups.push({
      id: pkgGrpId,
      supplierId: 'sup-meezab',
      supplierName: 'Meezab Group',
      groupCode: 'UG-100698',
      airlineName: 'Qatar Airways',
      flightSummary: 'QR 601 / 1190 / 1249 / 600 (PEW-DOH-JED-DOH-PEW)',
      baggage: '25 Kg',
      totalSeats: 20,
      nightsTotal: 20,
      departureCity: 'Peshawar (PEW)',
      travelStartDate: '2027-01-01',
      travelEndDate: '2027-01-21',
      summaryFromPricePkr: 268000,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.packageVariants.push(
      {
        id: 'pkg-var-103710',
        packageGroupId: pkgGrpId,
        variantCode: 'UP-103710',
        makkahHotelName: 'Arfat Zahbi / Fakhir al Azizia',
        makkahNights: 13,
        makkahDistance: 'Shuttle Service',
        madinahHotelName: 'Hala Taibah',
        madinahNights: 7,
        madinahDistance: 'Shuttle Service',
        wholesaleSharing: 268000,
        wholesaleQuad: 280000,
        wholesaleTriple: 294000,
        wholesaleDouble: 323000,
        sellingSharing: 268000,
        sellingQuad: 280000,
        sellingTriple: 294000,
        sellingDouble: 323000,
        effectiveSharing: 268000,
        effectiveQuad: 280000,
        effectiveTriple: 294000,
        effectiveDouble: 323000,
        isActive: true,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pkg-var-103711',
        packageGroupId: pkgGrpId,
        variantCode: 'UP-103711',
        makkahHotelName: 'Taj Fiddi Hotel',
        makkahNights: 13,
        makkahDistance: '800-900 Mtr',
        madinahHotelName: 'Diyar Al Safa',
        madinahNights: 7,
        madinahDistance: '750 Mtr',
        wholesaleSharing: 276000,
        wholesaleQuad: 292500,
        wholesaleTriple: 311000,
        wholesaleDouble: 347500,
        sellingSharing: 276000,
        sellingQuad: 292500,
        sellingTriple: 311000,
        sellingDouble: 347500,
        effectiveSharing: 276000,
        effectiveQuad: 292500,
        effectiveTriple: 311000,
        effectiveDouble: 347500,
        isActive: true,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // 5. Airline Group Flight SV 801/800
    this.airlineGroups.push({
      id: 'flight-sv-801-800-mux',
      supplierId: 'sup-alsaboor',
      supplierName: 'Al-Saboor Group',
      airlineCode: 'SV',
      airlineName: 'Saudi Arabian Airlines',
      flightNumbersSummary: '801/800',
      sector: 'MUX-JED-MUX',
      outboundDate: '2026-12-27',
      inboundDate: '2027-01-10',
      outboundDeptTime: '16:35',
      inboundDeptTime: '08:35',
      durationDays: 15,
      baggage: '23 Kg / 46 Kg',
      reportedSeats: 39,
      heldSeats: 0,
      confirmedSeats: 0,
      availableSeats: 39,
      wholesaleFare: null,
      sellingFare: null,
      currency: 'PKR',
      fareStatus: 'request_fare',
      stalenessPolicyHours: 48,
      lastReportedAt: new Date().toISOString(),
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // ATOMIC SEAT CAPACITY MANAGEMENT
  public holdSeats(airlineGroupId: string, seatsCount: number, bookingRequestId: string, userId: string): { success: boolean; message: string } {
    const flight = this.airlineGroups.find(f => f.id === airlineGroupId);
    if (!flight) return { success: false, message: 'Airline group not found' };

    const available = flight.reportedSeats - flight.heldSeats - flight.confirmedSeats;
    if (available < seatsCount) {
      return {
        success: false,
        message: `Insufficient capacity: requested ${seatsCount} seats, but only ${available} available.`
      };
    }

    flight.heldSeats += seatsCount;
    flight.availableSeats = flight.reportedSeats - flight.heldSeats - flight.confirmedSeats;
    flight.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId,
      action: 'HOLD_SEATS',
      entityType: 'airline_groups',
      entityId: airlineGroupId,
      afterSnapshot: { seatsCount, bookingRequestId, remainingAvailable: flight.availableSeats },
      createdAt: new Date().toISOString()
    });

    return { success: true, message: `Successfully held ${seatsCount} seats.` };
  }

  public confirmSeats(airlineGroupId: string, seatsCount: number, bookingRequestId: string, supplierRef: string, userId: string): { success: boolean; message: string } {
    const flight = this.airlineGroups.find(f => f.id === airlineGroupId);
    if (!flight) return { success: false, message: 'Airline group not found' };

    // Release from held or check available
    if (flight.heldSeats >= seatsCount) {
      flight.heldSeats -= seatsCount;
    } else {
      const available = flight.reportedSeats - flight.heldSeats - flight.confirmedSeats;
      if (available < seatsCount) {
        return {
          success: false,
          message: `Cannot confirm: insufficient seats available (${available}).`
        };
      }
    }

    flight.confirmedSeats += seatsCount;
    flight.availableSeats = flight.reportedSeats - flight.heldSeats - flight.confirmedSeats;
    flight.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId,
      action: 'CONFIRM_SEATS',
      entityType: 'airline_groups',
      entityId: airlineGroupId,
      afterSnapshot: { seatsCount, bookingRequestId, supplierRef, remainingAvailable: flight.availableSeats },
      createdAt: new Date().toISOString()
    });

    return { success: true, message: `Successfully confirmed ${seatsCount} seats with reference ${supplierRef}.` };
  }

  // REVIEW QUEUE APPROVAL & EXPLICIT PUBLISH
  public approveReviewItem(itemId: string, approvedBy: string, correctedData?: Record<string, any>): ImportReviewItem | null {
    const item = this.reviewItems.find(i => i.id === itemId);
    if (!item) return null;

    if (correctedData) {
      item.proposedData = { ...item.proposedData, ...correctedData };
      item.status = 'corrected';
    } else {
      item.status = 'approved';
    }
    item.approvedBy = approvedBy;
    item.approvedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    return item;
  }

  public publishReviewItems(itemIds: string[], publishedBy: string): { publishedCount: number; errors: string[] } {
    let count = 0;
    const errors: string[] = [];

    for (const id of itemIds) {
      const item = this.reviewItems.find(i => i.id === id);
      if (!item) continue;
      if (item.status !== 'approved' && item.status !== 'corrected') {
        errors.push(`Item ${id} is not approved or corrected. Review required before publishing.`);
        continue;
      }

      try {
        if (item.entityType === 'hotel_rate') {
          const p = item.proposedData;
          // Check if hotel exists or create
          let hotel = this.hotels.find(h => h.name === p.hotelName && h.city === p.city);
          if (!hotel) {
            hotel = {
              id: `hotel-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              supplierId: 'sup-meezab',
              name: p.hotelName,
              aliases: [],
              city: p.city,
              locationArea: p.locationArea,
              distanceRaw: p.distanceRaw,
              distanceMeters: p.distanceMeters,
              shuttleService: p.shuttleService,
              starRating: p.starRating,
              status: 'published',
              version: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            this.hotels.push(hotel);
          } else {
            hotel.version += 1;
            hotel.status = 'published';
            hotel.updatedAt = new Date().toISOString();
          }

          // Bands & Rates
          if (p.ratesByBand) {
            for (const b of p.ratesByBand) {
              const bandId = `band-${Date.now()}-${Math.floor(Math.random()*1000)}`;
              this.hotelDateBands.push({
                id: bandId,
                hotelId: hotel.id,
                supplierId: hotel.supplierId,
                bandLabelRaw: b.bandLabel,
                startDate: b.startDate,
                endDate: b.endDate,
                currency: b.currency || 'SAR',
                seasonContext: p.seasonContext,
                confirmedByReviewer: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });

              if (b.sharing) {
                this.hotelRates.push({
                  id: `rate-${Date.now()}-${Math.floor(Math.random()*10000)}`,
                  dateBandId: bandId,
                  hotelId: hotel.id,
                  occupancy: 'Sharing',
                  billingBasis: b.sharing.billingBasis,
                  rateAmount: b.sharing.rate,
                  isAvailable: b.sharing.available,
                  requiresVerification: false,
                  version: 1,
                  status: 'published',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }

              if (b.roomRateDblTplQd) {
                for (const occ of ['Double', 'Triple', 'Quad'] as const) {
                  this.hotelRates.push({
                    id: `rate-${Date.now()}-${Math.floor(Math.random()*10000)}`,
                    dateBandId: bandId,
                    hotelId: hotel.id,
                    occupancy: occ,
                    billingBasis: b.roomRateDblTplQd.billingBasis,
                    rateAmount: b.roomRateDblTplQd.rate,
                    isAvailable: b.roomRateDblTplQd.available,
                    requiresVerification: false,
                    version: 1,
                    status: 'published',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                }
              }

              if (b.quint) {
                this.hotelRates.push({
                  id: `rate-${Date.now()}-${Math.floor(Math.random()*10000)}`,
                  dateBandId: bandId,
                  hotelId: hotel.id,
                  occupancy: 'Quint',
                  billingBasis: b.quint.billingBasis,
                  rateAmount: b.quint.rate,
                  isAvailable: b.quint.available,
                  requiresVerification: true,
                  version: 1,
                  status: 'published',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }
            }
          }

          item.publishedRecordId = hotel.id;
          count++;
        } else if (item.entityType === 'flight_group') {
          const p = item.proposedData;
          const newFlight: AirlineGroup = {
            id: `flight-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            supplierId: 'sup-alsaboor',
            airlineCode: p.airlineCode,
            airlineName: p.airlineName,
            groupCode: p.groupCode,
            flightNumbersSummary: p.flightNumbersSummary,
            sector: p.sector,
            outboundDate: p.outboundDate,
            inboundDate: p.inboundDate,
            outboundDeptTime: p.outboundDeptTime,
            inboundDeptTime: p.inboundDeptTime,
            durationDays: p.durationDays,
            baggage: p.baggage,
            reportedSeats: p.reportedSeats,
            heldSeats: 0,
            confirmedSeats: 0,
            availableSeats: p.reportedSeats,
            wholesaleFare: p.wholesaleFare,
            sellingFare: p.sellingFare,
            currency: p.currency || 'PKR',
            fareStatus: p.fareStatus,
            stalenessPolicyHours: p.stalenessPolicyHours || 48,
            lastReportedAt: new Date().toISOString(),
            status: 'published',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.airlineGroups.push(newFlight);
          item.publishedRecordId = newFlight.id;
          count++;
        } else if (item.entityType === 'package') {
          const p = item.proposedData;
          const pkgGroup: PackageGroup = {
            id: `pkg-grp-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            supplierId: 'sup-meezab',
            groupCode: p.groupCode,
            airlineName: p.airlineName,
            flightSummary: p.flightSummary,
            baggage: p.baggage,
            totalSeats: p.totalSeats,
            nightsTotal: p.nightsTotal,
            departureCity: p.departureCity,
            travelStartDate: p.travelStartDate,
            travelEndDate: p.travelEndDate,
            summaryFromPricePkr: p.summaryFromPricePkr,
            status: 'published',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.packageGroups.push(pkgGroup);

          if (p.variants) {
            for (const v of p.variants) {
              this.packageVariants.push({
                id: `pkg-var-${Date.now()}-${Math.floor(Math.random()*10000)}`,
                packageGroupId: pkgGroup.id,
                variantCode: v.variantCode,
                makkahHotelName: v.makkahHotelName,
                makkahNights: v.makkahNights,
                makkahDistance: v.makkahDistance,
                madinahHotelName: v.madinahHotelName,
                madinahNights: v.madinahNights,
                madinahDistance: v.madinahDistance,
                wholesaleSharing: v.wholesaleSharing,
                wholesaleQuad: v.wholesaleQuad,
                wholesaleTriple: v.wholesaleTriple,
                wholesaleDouble: v.wholesaleDouble,
                sellingSharing: v.sellingSharing,
                sellingQuad: v.sellingQuad,
                sellingTriple: v.sellingTriple,
                sellingDouble: v.sellingDouble,
                effectiveSharing: v.sellingSharing,
                effectiveQuad: v.sellingQuad,
                effectiveTriple: v.sellingTriple,
                effectiveDouble: v.sellingDouble,
                isActive: true,
                status: 'published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }

          item.publishedRecordId = pkgGroup.id;
          count++;
        } else if (item.entityType === 'visa_transport') {
          const p = item.proposedData;
          const vt: VisaTransportRate = {
            id: `vt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            supplierId: 'sup-meezab',
            category: p.category,
            title: p.title,
            route: p.route,
            vehicleType: p.vehicleType,
            partyMinPax: p.partyMinPax,
            partyMaxPax: p.partyMaxPax,
            billingUnit: p.billingUnit,
            rateAmount: p.rateAmount,
            currency: p.currency,
            inclusions: p.inclusions || [],
            termsRestrictions: p.termsRestrictions,
            isBundle: p.isBundle,
            preventsDuplicateCharging: p.preventsDuplicateCharging,
            status: 'published',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.visaTransportRates.push(vt);
          item.publishedRecordId = vt.id;
          count++;
        }

        this.auditLogs.push({
          id: `audit-${Date.now()}`,
          userId: publishedBy,
          action: 'PUBLISH_REVIEW_ITEM',
          entityType: item.entityType,
          entityId: item.publishedRecordId,
          afterSnapshot: item.proposedData,
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        errors.push(`Failed to publish item ${id}: ${err.message}`);
      }
    }

    return { publishedCount: count, errors };
  }

  // PUBLIC PACKAGES WITH DYNAMIC DISCOUNT/MARKUP RULES APPLIED
  public getPublishedPackages(): PackageGroup[] {
    const publishedGroups = this.packageGroups.filter(g => g.status === 'published');
    const result: PackageGroup[] = [];

    for (const group of publishedGroups) {
      const rawVariants = this.packageVariants.filter(v => v.packageGroupId === group.id && v.status === 'published' && v.isActive);
      const computedVariants = rawVariants.map(v => applyPriceRuleToVariant(v, group.groupCode, this.priceRules));

      // Calculate lowest effective sharing or quad price for "From PKR ..."
      let lowestFromPrice: number | null = null;
      for (const v of computedVariants) {
        const prices = [v.effectiveSharing, v.effectiveQuad, v.effectiveTriple, v.effectiveDouble].filter(Boolean) as number[];
        if (prices.length > 0) {
          const minP = Math.min(...prices);
          if (lowestFromPrice == null || minP < lowestFromPrice) {
            lowestFromPrice = minP;
          }
        }
      }

      result.push({
        ...group,
        summaryFromPricePkr: lowestFromPrice ?? group.summaryFromPricePkr,
        variants: computedVariants
      });
    }

    return result;
  }
}

export const db = DataStore.getInstance();
