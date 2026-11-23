import { AirlineGroup, ImportReviewItem } from '@/types';

function parseAlSaboorDate(dateStr: string): string {
  // e.g. "27 DEC 2026" or "10 JAN 2027"
  const months: Record<string, string> = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
    'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].toUpperCase()] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

export interface AlSaboorFlightRow {
  airlinePrefix?: string;
  flightNumbers: string;
  sector: string;
  outboundDate: string;
  inboundDate: string;
  deptTime: string;
  days: number;
  seats: number;
}

export function parseAlSaboorText(rawText: string, documentId: string, pageNumber: number = 1): ImportReviewItem[] {
  const items: ImportReviewItem[] = [];
  const lines = rawText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('Airline') || trimmed.includes('Message us') || trimmed.startsWith('--')) {
      continue;
    }

    // Split on tabs or multi-space delimiters
    const cols = trimmed.split(/\t+|\s{2,}/).map(c => c.trim()).filter(Boolean);
    if (cols.length < 6) continue;

    // Pattern matching:
    // Columns: [Airline?] Flights, Sector, OB, IB, Dept. time, Days, Seats
    let flightNumbers = '';
    let sector = '';
    let obStr = '';
    let ibStr = '';
    let deptTime = '';
    let days = 0;
    let seats = 0;
    let airlineName = 'Saudi Arabian Airlines';
    let airlineCode = 'SV';

    // Find the sector column (e.g. "MUX-JED-MUX" or "LHE-JED-LHE")
    const sectorIdx = cols.findIndex(c => /^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/.test(c));
    if (sectorIdx === -1) continue;

    sector = cols[sectorIdx];
    
    // Flight column is before sector
    if (sectorIdx === 1) {
      flightNumbers = cols[0];
    } else if (sectorIdx === 2) {
      const p = cols[0];
      if (p.includes('SV')) {
        airlineCode = 'SV';
        airlineName = 'Saudi Arabian Airlines';
      }
      flightNumbers = cols[1];
    } else {
      flightNumbers = cols[0];
    }

    // After sector comes OB, IB, Dept Time, Days, Seats
    let colPtr = sectorIdx + 1;
    if (colPtr < cols.length) obStr = cols[colPtr++];
    if (colPtr < cols.length) ibStr = cols[colPtr++];
    if (colPtr < cols.length) deptTime = cols[colPtr++];
    if (colPtr < cols.length) days = parseInt(cols[colPtr++], 10) || 0;
    if (colPtr < cols.length) seats = parseInt(cols[colPtr++], 10) || 0;

    if (!obStr || !ibStr) continue;

    const normalizedOb = parseAlSaboorDate(obStr);
    const normalizedIb = parseAlSaboorDate(ibStr);

    let [obTime, ibTime] = deptTime.split('/');
    obTime = (obTime || '').trim();
    ibTime = (ibTime || '').trim();

    // Check airline code
    if (flightNumbers.startsWith('SV')) {
      airlineCode = 'SV';
      airlineName = 'Saudi Arabian Airlines';
    } else if (flightNumbers.startsWith('PF')) {
      airlineCode = 'PF';
      airlineName = 'AirSial';
    } else if (flightNumbers.startsWith('PA') || flightNumbers.startsWith('PK')) {
      airlineCode = 'PK';
      airlineName = 'Pakistan International Airlines';
    }

    const flags: string[] = [
      'Missing fare column in supplier PDF - labeled "Request fare" and excluded from automatic quotes until fare entered',
      'Supplier group flight preserved as fixed outbound/return pair',
      'Tracked seats subject to staff hold and atomic capacity validation'
    ];

    const proposed: Partial<AirlineGroup> = {
      airlineCode,
      airlineName,
      flightNumbersSummary: flightNumbers,
      sector,
      outboundDate: normalizedOb,
      inboundDate: normalizedIb,
      outboundDeptTime: obTime,
      inboundDeptTime: ibTime,
      durationDays: days,
      reportedSeats: seats,
      heldSeats: 0,
      confirmedSeats: 0,
      availableSeats: seats,
      wholesaleFare: null,
      sellingFare: null,
      currency: 'PKR',
      fareStatus: 'request_fare',
      stalenessPolicyHours: 48,
      status: 'draft'
    };

    items.push({
      id: `rev-flight-${flightNumbers.replace(/[^a-zA-Z0-9]/g, '_')}-${normalizedOb}-${Math.floor(Math.random()*10000)}`,
      documentId,
      pageNumber,
      entityType: 'flight_group',
      rawData: {
        rawLine: line,
        flightNumbers,
        sector,
        obStr,
        ibStr,
        deptTime,
        days,
        seats
      },
      proposedData: proposed,
      currentActiveData: null,
      diffSummary: {
        isNew: true,
        hasChanges: true,
        fieldChanges: []
      },
      validationFlags: flags,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return items;
}
