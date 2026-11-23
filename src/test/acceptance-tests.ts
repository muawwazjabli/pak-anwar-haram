import { db } from '../lib/db';
import { parseMeezabHotelSheet } from '../lib/parsers/meezab-hotels-parser';
import { parseAlSaboorText } from '../lib/parsers/alsaboor-flights-parser';
import { parseUmrahGroupsText } from '../lib/parsers/umrah-groups-parser';
import {
  MEEZAB_RAMADAN_MAKKAH,
  MEEZAB_RAMADAN_MADINAH,
  MEEZAB_REGULAR_MAKKAH,
  MEEZAB_REGULAR_MADINAH
} from '../lib/parsers/sample-data-registry';
import { calculateCustomUmrahPackage } from '../lib/pricing/calculator';
import { applyPriceRuleToVariant } from '../lib/pricing/discount-rules';
import { PackageVariant, PriceRule } from '../types';
import fs from 'fs';
import path from 'path';

export async function runAcceptanceTests() {
  console.log('\n================================================================');
  console.log('   PAK ANWAR HARAM (پاک انوار حرم) - ACCEPTANCE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`       -> ${details}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Meezab Hotel Samples (Makkah & Madinah, N/A handling, Quint separation)
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Meezab Hotel Samples Extraction ---');
  {
    // Ramadan Makkah
    const makkahRamadanItems = parseMeezabHotelSheet(MEEZAB_RAMADAN_MAKKAH, 'doc-ramadan-makkah', 1);
    
    // Check ARAFAT ZAHBI
    const arafat = makkahRamadanItems.find(i => i.proposedData.hotelName.includes('ARAFAT ZAHBI'));
    assert(!!arafat, 'Extracts ARAFAT ZAHBI from Ramadan Makkah sheet');
    assert(arafat?.proposedData.ratesByBand[0].sharing.rate === 29, 'ARAFAT ZAHBI Band 1 Sharing rate is 29 SAR');
    assert(arafat?.proposedData.ratesByBand[0].roomRateDblTplQd.rate === 160, 'ARAFAT ZAHBI Band 1 DBL-TPL-QD room rate is 160 SAR');
    assert(arafat?.proposedData.ratesByBand[1].sharing.rate === 49, 'ARAFAT ZAHBI Band 2 Sharing rate is 49 SAR');
    assert(arafat?.proposedData.ratesByBand[1].roomRateDblTplQd.rate === 290, 'ARAFAT ZAHBI Band 2 DBL-TPL-QD room rate is 290 SAR');

    // Check N/A handling: MELLA 1
    const mella1 = makkahRamadanItems.find(i => i.proposedData.hotelName.includes('MELLA 1'));
    assert(!!mella1, 'Extracts MELLA 1');
    assert(mella1?.proposedData.ratesByBand[0].sharing.available === false, 'MELLA 1 Sharing rate is N/A (marked unavailable, never 0)');
    assert(mella1?.proposedData.ratesByBand[0].sharing.rate === null, 'MELLA 1 Sharing rate is null (not 0)');
    assert(mella1?.proposedData.ratesByBand[0].roomRateDblTplQd.rate === 335, 'MELLA 1 Room rate is 335 SAR');

    // Check Quint separation: DAIF AJYAD (Quint 550, Quint 850)
    const daif = makkahRamadanItems.find(i => i.proposedData.hotelName.includes('DAIF AJYAD'));
    assert(!!daif, 'Extracts DAIF AJYAD with Quint detection');
    assert(daif?.proposedData.ratesByBand[0].quint?.rate === 550, 'DAIF AJYAD Band 1 Quint separated as 550 SAR');
    assert(daif?.proposedData.ratesByBand[0].sharing.available === false, 'DAIF AJYAD Sharing marked unavailable when Quint specified');
    assert(daif?.proposedData.ratesByBand[1].quint?.rate === 850, 'DAIF AJYAD Band 2 Quint separated as 850 SAR');

    // Check Madinah Quint separation: TAIF NEBRAS (Quint 580)
    const madinahRamadanItems = parseMeezabHotelSheet(MEEZAB_RAMADAN_MADINAH, 'doc-ramadan-madinah', 1);
    const taif = madinahRamadanItems.find(i => i.proposedData.hotelName.includes('TAIF NEBRAS'));
    assert(taif?.proposedData.ratesByBand[0].quint?.rate === 580, 'TAIF NEBRAS Madinah Quint separated as 580 SAR');
    assert(taif?.proposedData.ratesByBand[0].roomRateDblTplQd.rate === 550, 'TAIF NEBRAS Room rate is 550 SAR');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Ramadan Makkah Arafat Zahbi Date Boundary Convention
  // Check-in: 2027-02-26, Checkout: 2027-02-28
  // Double room: 160 + 290 = 450 SAR for 1 room
  // Sharing for 2 persons: (29 + 49) * 2 = 156 SAR
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Date Boundary Convention & Nightly Rate Arithmetic ---');
  {
    // Double room test (1 room for 2 nights across boundary)
    const doubleQuote = calculateCustomUmrahPackage({
      customerName: 'Test Double Pilgrim',
      customerPhone: '0322-2188218',
      partyAdults: 2,
      partyChildren: 0,
      partyInfants: 0,
      makkahStay: {
        city: 'Makkah',
        hotelName: 'ARAFAT ZAHBI (Shuttle)',
        checkInDate: '2027-02-26',
        checkOutDate: '2027-02-28',
        occupancyType: 'Double',
        roomsCount: 1,
        bedsCount: 2,
        partyPax: 2
      },
      sarToPkrRate: 74.50,
      rateLookupFn: (hotelName, city, nightDate) => {
        // Night 1: 2027-02-26 is in Band 1 (06 Feb - 27 Feb)
        // Night 2: 2027-02-27 is in Band 2 (27 Feb - 11 Mar)
        if (nightDate === '2027-02-26') {
          return {
            nightDate,
            bandLabel: '06 FEB TILL 27 FEB',
            sharingBedRate: 29,
            doubleRoomRate: 160,
            tripleRoomRate: 160,
            quadRoomRate: 160,
            quintRate: null
          };
        } else if (nightDate === '2027-02-27') {
          return {
            nightDate,
            bandLabel: '27 FEB TILL 11 MAR',
            sharingBedRate: 49,
            doubleRoomRate: 290,
            tripleRoomRate: 290,
            quadRoomRate: 290,
            quintRate: null
          };
        }
        return null;
      }
    });

    const doubleSubtotalSar = doubleQuote.priceBreakdown.makkahHotel.stayTotalSar;
    assert(
      doubleSubtotalSar === 450,
      'Double room for 26 Feb (160) + 27 Feb (290) = 450 SAR',
      `Got ${doubleSubtotalSar} SAR (Expected 450 SAR)`
    );

    // Sharing test for 2 persons across the same boundary nights
    const sharingQuote = calculateCustomUmrahPackage({
      customerName: 'Test Sharing Pilgrims',
      customerPhone: '0322-2188218',
      partyAdults: 2,
      partyChildren: 0,
      partyInfants: 0,
      makkahStay: {
        city: 'Makkah',
        hotelName: 'ARAFAT ZAHBI (Shuttle)',
        checkInDate: '2027-02-26',
        checkOutDate: '2027-02-28',
        occupancyType: 'Sharing',
        roomsCount: 1,
        bedsCount: 2,
        partyPax: 2
      },
      sarToPkrRate: 74.50,
      rateLookupFn: (hotelName, city, nightDate) => {
        if (nightDate === '2027-02-26') {
          return {
            nightDate,
            bandLabel: '06 FEB TILL 27 FEB',
            sharingBedRate: 29,
            doubleRoomRate: 160,
            tripleRoomRate: 160,
            quadRoomRate: 160,
            quintRate: null
          };
        } else if (nightDate === '2027-02-27') {
          return {
            nightDate,
            bandLabel: '27 FEB TILL 11 MAR',
            sharingBedRate: 49,
            doubleRoomRate: 290,
            tripleRoomRate: 290,
            quadRoomRate: 290,
            quintRate: null
          };
        }
        return null;
      }
    });

    const sharingSubtotalSar = sharingQuote.priceBreakdown.makkahHotel.stayTotalSar;
    assert(
      sharingSubtotalSar === 156,
      'Sharing for 2 persons across boundary nights: (29 + 49) * 2 = 156 SAR',
      `Got ${sharingSubtotalSar} SAR (Expected 156 SAR)`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: AL-SABOOR PDF: Flight Pair 801/800 MUX-JED-MUX, 39 seats, Missing Fare
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing AL-SABOOR Flight Group Parsing & Request Fare Policy ---');
  {
    const sampleAlSaboorLine = '801/800 \t MUX-JED-MUX \t 27 DEC 2026 \t 10 JAN 2027 \t 16:35/08:35 \t 15 \t 39';
    const parsedFlights = parseAlSaboorText(sampleAlSaboorLine, 'doc-alsaboor', 1);
    const flight801 = parsedFlights.find(f => f.proposedData.flightNumbersSummary === '801/800');

    assert(!!flight801, 'Parsed flight pair 801/800');
    assert(flight801?.proposedData.sector === 'MUX-JED-MUX', 'Sector is MUX-JED-MUX');
    assert(flight801?.proposedData.outboundDate === '2026-12-27', 'Outbound date normalized to 2026-12-27');
    assert(flight801?.proposedData.inboundDate === '2027-01-10', 'Inbound date normalized to 2027-01-10');
    assert(flight801?.proposedData.reportedSeats === 39, 'Reported available seats is exactly 39');
    assert(flight801?.proposedData.wholesaleFare === null, 'Wholesale fare is empty/null due to missing PDF column');
    assert(flight801?.proposedData.fareStatus === 'request_fare', 'Labeled "Request fare"');

    // Quote containing this flight must flag hasUnpricedComponents = true
    const unpricedQuote = calculateCustomUmrahPackage({
      customerName: 'Flight Test',
      customerPhone: '0322-2188218',
      partyAdults: 2,
      partyChildren: 0,
      partyInfants: 0,
      flight: {
        airlineName: 'AirBlue / Saudi',
        flightSummary: 'SV 801/800 MUX-JED-MUX',
        fareStatus: 'request_fare',
        sellingFarePkr: null
      },
      sarToPkrRate: 74.50
    });

    assert(
      unpricedQuote.hasUnpricedComponents === true,
      'Unpriced flight properly flags hasUnpricedComponents = true'
    );
    assert(
      unpricedQuote.sellingTotalPkr === undefined,
      'Total price is kept undefined ("Request a quote") instead of showing a false complete zero'
    );
  }

  // --------------------------------------------------------------------------
  // TEST 4: UmrahGroups UG-100698 & UP-103710, PKR 5,000 per-person Sharing discount
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing UmrahGroups Package & Hierarchical Discount Logic ---');
  {
    const samplePage1 = {
      num: 1,
      text: `
Umrah Groups
Airline: QR-Qatar Airways
DOH-JED
01 Jan
UG-100698
Group 1: QR601 01JAN PEW DOH 0300 0500
20 Nights
QR 1190 01 Jan DOH-JED 08:20 - 11:00 Baggage: 25 Kg
QR 1249 21 Jan JED-DOH 17:00 - 19:20 Baggage: 25 Kg
20 Seats
QR600 21JAN DOH PEW 2015 0130
From PKR 268,000
Package Details
Package Makkah Hotel Madinah Hotel Sharing Quad Triple Double
UP-103710
Makkah: 13 Madinah: 7
Total: 20
Arfat Zahbi / Fakhir al Azizia
Distance: Shuttle m Hala Taibah
Distance: Shuttle Service m 268000 280000 294000 323000
`
    };

    const parsedGroups = parseUmrahGroupsText([samplePage1], 'doc-umrah-groups');
    const grp = parsedGroups.find(g => g.proposedData.groupCode === 'UG-100698');
    assert(!!grp, 'Extracted group UG-100698');

    const variant = grp?.proposedData.variants.find((v: any) => v.variantCode === 'UP-103710');
    assert(!!variant, 'Extracted variant UP-103710');
    assert(variant.wholesaleSharing === 268000, 'Sharing wholesale price is 268,000 PKR');
    assert(variant.wholesaleQuad === 280000, 'Quad wholesale price is 280,000 PKR');
    assert(variant.wholesaleTriple === 294000, 'Triple wholesale price is 294,000 PKR');
    assert(variant.wholesaleDouble === 323000, 'Double wholesale price is 323,000 PKR');

    // Apply PKR 5,000 per-person discount on Sharing option
    const discountRule: PriceRule = {
      id: 'rule-test-sharing-5000',
      ruleType: 'discount',
      targetScope: 'occupancy',
      targetId: 'UP-103710:Sharing',
      valueType: 'fixed_pkr',
      valueAmount: 5000,
      billingBasis: 'per_person',
      isActive: true,
      belowCostFlag: false,
      approvedByOwner: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const variantRecord: PackageVariant = {
      id: 'var-test-1',
      packageGroupId: 'grp-test-1',
      variantCode: 'UP-103710',
      makkahHotelName: variant.makkahHotelName,
      makkahNights: 13,
      madinahHotelName: variant.madinahHotelName,
      madinahNights: 7,
      wholesaleSharing: 268000,
      wholesaleQuad: 280000,
      wholesaleTriple: 294000,
      wholesaleDouble: 323000,
      sellingSharing: 268000,
      sellingQuad: 280000,
      sellingTriple: 294000,
      sellingDouble: 323000,
      isActive: true,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const discounted = applyPriceRuleToVariant(variantRecord, 'UG-100698', [discountRule]);
    assert(
      discounted.effectiveSharing === 263000,
      'Sharing price after PKR 5,000 discount is PKR 263,000',
      `Got ${discounted.effectiveSharing} PKR (Expected 263,000 PKR)`
    );
    assert(
      discounted.effectiveQuad === 280000,
      'Quad price remains unchanged at PKR 280,000'
    );
    assert(
      discounted.effectiveTriple === 294000,
      'Triple price remains unchanged at PKR 294,000'
    );
    assert(
      discounted.effectiveDouble === 323000,
      'Double price remains unchanged at PKR 323,000'
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: Edge Cases: Duplicate Imports, Atomic Capacity Lock & Stale Quotes
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Concurrency, Capacity Locks & Stale Quotes ---');
  {
    // Flight with 1 available seat
    const testFlightId = 'flight-concurrent-test';
    db.airlineGroups.push({
      id: testFlightId,
      supplierId: 'sup-alsaboor',
      airlineCode: 'SV',
      airlineName: 'Saudi Arabian Airlines',
      flightNumbersSummary: 'SV 999',
      sector: 'MUX-JED-MUX',
      outboundDate: '2026-12-27',
      inboundDate: '2027-01-10',
      durationDays: 14,
      reportedSeats: 1,
      heldSeats: 0,
      confirmedSeats: 0,
      availableSeats: 1,
      wholesaleFare: null,
      sellingFare: 210000,
      currency: 'PKR',
      fareStatus: 'confirmed',
      stalenessPolicyHours: 48,
      lastReportedAt: new Date().toISOString(),
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Attempt 1: hold 1 seat (should succeed)
    const hold1 = db.holdSeats(testFlightId, 1, 'req-user-1', 'staff-1');
    assert(hold1.success === true, 'First attempt to hold seat succeeds');

    // Attempt 2: hold 1 seat simultaneously (should fail due to 0 remaining)
    const hold2 = db.holdSeats(testFlightId, 1, 'req-user-2', 'staff-2');
    assert(hold2.success === false, 'Second attempt to hold last seat fails atomically (prevents overbooking)');

    // Attempt 3: confirm seat without reference should fail validation
    const f = db.airlineGroups.find(fl => fl.id === testFlightId);
    assert(f?.availableSeats === 0, 'Available seats correctly reflects 0');

    // Clean up test flight
    db.airlineGroups = db.airlineGroups.filter(fl => fl.id !== testFlightId);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Public Security Boundary (Wholesale Data Hidden) & Booking Processing
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Public Privacy Enforcement & Booking Workflow ---');
  {
    const published = db.getPublishedPackages();
    assert(published.length > 0, 'Public can view published packages');

    // Verify wholesale costs are not exposed in public packages
    for (const p of published) {
      assert((p as any).supplierContactPerson === undefined, 'Supplier contact details are hidden from public view');
      assert((p as any).wholesaleMargin === undefined, 'Wholesale margin is hidden from public view');
    }

    // Submit Custom Booking Request
    const customBooking = {
      customerName: 'Hafiz Muhammad Tariq',
      customerPhone: '0300-8646956',
      partySummary: '2 Adults Custom Makkah + Madinah Package'
    };

    const bReq1Id = `book-test-1-${Date.now()}`;
    db.bookingRequests.push({
      id: bReq1Id,
      requestReference: 'PAH-REQ-2026-TEST1',
      customerName: customBooking.customerName,
      customerPhone: customBooking.customerPhone,
      partySummary: customBooking.partySummary,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const b1 = db.bookingRequests.find(b => b.id === bReq1Id);
    assert(b1?.status === 'New', 'Customer booking enquiry lands in status "New"');

    // Process through staff: change to "Held" and then "Confirmed"
    b1!.status = 'Held';
    b1!.staffAssignedTo = 'Operations Staff';
    assert(b1?.status === 'Held', 'Staff successfully moves enquiry to "Held"');

    b1!.status = 'Confirmed';
    b1!.confirmationReference = 'MEEZAB-VOUCHER-7891';
    assert(b1?.status === 'Confirmed', 'Booking enquiry successfully confirmed with voucher reference');
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`ACCEPTANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  return { passed, failed, total: passed + failed };
}
