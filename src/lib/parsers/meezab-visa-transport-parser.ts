import { ImportReviewItem, VisaTransportRate } from '@/types';

export function parseMeezabVisaTransport(documentId: string, pageNumber: number): ImportReviewItem[] {
  const items: ImportReviewItem[] = [];

  const rawEntries = [
    {
      category: 'visa_with_bus',
      title: 'Umrah Visa with Round-Trip Bus Transport',
      route: 'Jeddah / Madinah / Makkah (Round trip by bus)',
      vehicleType: 'Bus',
      partyMinPax: 1,
      partyMaxPax: 47,
      billingUnit: 'per_person',
      rateAmount: 550,
      currency: 'SAR',
      inclusions: ['umrah_visa', 'round_trip_bus_transport'],
      termsRestrictions: '01 to 47 pax group. Round trip by bus included. Payment in advance.',
      isBundle: true,
      preventsDuplicateCharging: true,
      flags: [
        'Visa bundled with round-trip bus: deduplicate any additional bus transport charges',
        'Group size 01 to 47 pax'
      ]
    },
    {
      category: 'visa',
      title: 'Umrah Visa Only',
      route: 'Full Visa',
      partyMinPax: 1,
      partyMaxPax: null,
      billingUnit: 'per_person',
      rateAmount: 600,
      currency: 'SAR',
      inclusions: ['umrah_visa'],
      termsRestrictions: 'Full Umrah visa without transport.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Standalone visa: transport must be booked separately']
    },
    {
      category: 'partial_visa',
      title: 'Umrah Partial Visa',
      route: 'Partial / Approval Visa',
      partyMinPax: 1,
      partyMaxPax: null,
      billingUnit: 'per_person',
      rateAmount: 575,
      currency: 'SAR',
      inclusions: ['partial_umrah_visa'],
      termsRestrictions: 'Partial visa processing as per KSA rules.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Partial visa: verify embassy requirements and extra charges if applicable']
    },
    {
      category: 'infant_fee',
      title: 'Infant Visa / Processing Fee',
      route: 'Infant Umrah Fee',
      partyMinPax: 1,
      partyMaxPax: 1,
      billingUnit: 'per_person',
      rateAmount: 475,
      currency: 'SAR',
      inclusions: ['infant_visa_fee'],
      termsRestrictions: 'Infant rate up to 2 years old.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Infant fee applies specifically to under 2 years old']
    },
    {
      category: 'private_transport',
      title: 'Private Transport: Jeddah to Makkah (4 Pax)',
      route: 'Jeddah Airport to Makkah Hotel',
      vehicleType: 'Private Sedan / SUV (Max 4 Pax)',
      partyMinPax: 4,
      partyMaxPax: 4,
      billingUnit: 'per_vehicle',
      rateAmount: 620,
      currency: 'SAR',
      inclusions: ['jeddah_makkah_private_vehicle'],
      termsRestrictions: 'Direct transfer for 4 passengers.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Private vehicle billing unit is per vehicle (not per person)']
    },
    {
      category: 'private_transport',
      title: 'Private Transport: Jeddah to Makkah (3 Pax)',
      route: 'Jeddah Airport to Makkah Hotel',
      vehicleType: 'Private Sedan (Max 3 Pax)',
      partyMinPax: 3,
      partyMaxPax: 3,
      billingUnit: 'per_vehicle',
      rateAmount: 640,
      currency: 'SAR',
      inclusions: ['jeddah_makkah_private_vehicle'],
      termsRestrictions: 'Direct transfer for 3 passengers.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Private vehicle billing unit is per vehicle']
    },
    {
      category: 'private_transport',
      title: 'Private Transport: Jeddah to Makkah (2 Pax)',
      route: 'Jeddah Airport to Makkah Hotel',
      vehicleType: 'Private Sedan (Max 2 Pax)',
      partyMinPax: 2,
      partyMaxPax: 2,
      billingUnit: 'per_vehicle',
      rateAmount: 680,
      currency: 'SAR',
      inclusions: ['jeddah_makkah_private_vehicle'],
      termsRestrictions: 'Direct transfer for 2 passengers.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Private vehicle billing unit is per vehicle']
    },
    {
      category: 'private_transport',
      title: 'Private Transport: Jeddah to Makkah (1 Pax)',
      route: 'Jeddah Airport to Makkah Hotel',
      vehicleType: 'Private Sedan (1 Pax)',
      partyMinPax: 1,
      partyMaxPax: 1,
      billingUnit: 'per_vehicle',
      rateAmount: 815,
      currency: 'SAR',
      inclusions: ['jeddah_makkah_private_vehicle'],
      termsRestrictions: 'Direct transfer for single passenger.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Solo passenger private transfer']
    },
    {
      category: 'ziyarat',
      title: 'Makkah Ziyarat',
      route: 'Historical places in Makkah',
      partyMinPax: 1,
      partyMaxPax: null,
      billingUnit: 'per_person',
      rateAmount: 10,
      currency: 'SAR',
      inclusions: ['makkah_ziyarat'],
      termsRestrictions: 'Makkah holy sites visit in group bus.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Per-person group ziyarat rate in Makkah']
    },
    {
      category: 'ziyarat',
      title: 'Madinah Ziyarat',
      route: 'Historical places in Madinah',
      partyMinPax: 1,
      partyMaxPax: null,
      billingUnit: 'per_person',
      rateAmount: 10,
      currency: 'SAR',
      inclusions: ['madinah_ziyarat'],
      termsRestrictions: 'Madinah holy sites visit in group bus.',
      isBundle: false,
      preventsDuplicateCharging: false,
      flags: ['Per-person group ziyarat rate in Madinah']
    }
  ];

  for (const entry of rawEntries) {
    items.push({
      id: `rev-vt-${entry.category}-${entry.rateAmount}-${Math.floor(Math.random()*10000)}`,
      documentId,
      pageNumber,
      entityType: 'visa_transport',
      rawData: entry,
      proposedData: {
        category: entry.category,
        title: entry.title,
        route: entry.route,
        vehicleType: entry.vehicleType,
        partyMinPax: entry.partyMinPax,
        partyMaxPax: entry.partyMaxPax,
        billingUnit: entry.billingUnit,
        rateAmount: entry.rateAmount,
        currency: entry.currency,
        inclusions: entry.inclusions,
        termsRestrictions: entry.termsRestrictions,
        isBundle: entry.isBundle,
        preventsDuplicateCharging: entry.preventsDuplicateCharging
      },
      currentActiveData: null,
      diffSummary: {
        isNew: true,
        hasChanges: true,
        fieldChanges: []
      },
      validationFlags: entry.flags,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return items;
}
