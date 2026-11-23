import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    const outboundDate = searchParams.get('outboundDate');
    const isPublic = searchParams.get('public') === 'true';

    let flights = db.airlineGroups;
    if (sector) flights = flights.filter(f => f.sector.toLowerCase().includes(sector.toLowerCase()));
    if (outboundDate) flights = flights.filter(f => f.outboundDate === outboundDate);

    if (isPublic) {
      // Public only sees published flights
      flights = flights.filter(f => f.status === 'published');
      // Hide wholesale fare from public view
      return NextResponse.json({
        success: true,
        flights: flights.map(f => ({
          id: f.id,
          airlineCode: f.airlineCode,
          airlineName: f.airlineName,
          flightNumbersSummary: f.flightNumbersSummary,
          sector: f.sector,
          outboundDate: f.outboundDate,
          inboundDate: f.inboundDate,
          outboundDeptTime: f.outboundDeptTime,
          inboundDeptTime: f.inboundDeptTime,
          durationDays: f.durationDays,
          baggage: f.baggage,
          availableSeats: f.reportedSeats - f.heldSeats - f.confirmedSeats,
          sellingFare: f.sellingFare,
          currency: f.currency,
          fareStatus: f.fareStatus,
          lastReportedAt: f.lastReportedAt
        }))
      });
    }

    // Admin view
    return NextResponse.json({
      success: true,
      flights: flights.map(f => ({
        ...f,
        availableSeats: f.reportedSeats - f.heldSeats - f.confirmedSeats
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      airlineCode,
      airlineName,
      flightNumbersSummary,
      sector,
      outboundDate,
      inboundDate,
      outboundDeptTime,
      inboundDeptTime,
      durationDays,
      baggage,
      reportedSeats,
      wholesaleFare,
      sellingFare,
      currency,
      fareStatus,
      userId
    } = body;

    // Check if updating existing (e.g. entering confirmed fare sheet)
    if (id) {
      const flight = db.airlineGroups.find(f => f.id === id);
      if (!flight) return NextResponse.json({ error: 'Flight group not found' }, { status: 404 });

      if (wholesaleFare != null) flight.wholesaleFare = parseFloat(wholesaleFare);
      if (sellingFare != null) {
        flight.sellingFare = parseFloat(sellingFare);
        flight.fareStatus = 'confirmed';
      }
      if (reportedSeats != null) {
        flight.reportedSeats = parseInt(reportedSeats, 10);
        flight.availableSeats = flight.reportedSeats - flight.heldSeats - flight.confirmedSeats;
      }
      if (fareStatus) flight.fareStatus = fareStatus;
      flight.updatedAt = new Date().toISOString();

      db.auditLogs.push({
        id: `audit-${Date.now()}`,
        userId: userId || 'admin',
        action: 'UPDATE_AIRLINE_GROUP',
        entityType: 'airline_groups',
        entityId: flight.id,
        afterSnapshot: flight,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, flight });
    }

    const newFlight = {
      id: `flight-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      supplierId: body.supplierId || 'sup-alsaboor',
      airlineCode: airlineCode || 'SV',
      airlineName: airlineName || 'Saudi Arabian Airlines',
      flightNumbersSummary: flightNumbersSummary || '',
      sector: sector || '',
      outboundDate: outboundDate || '',
      inboundDate: inboundDate || '',
      outboundDeptTime: outboundDeptTime || '',
      inboundDeptTime: inboundDeptTime || '',
      durationDays: parseInt(durationDays, 10) || 14,
      baggage: baggage || '23 Kg',
      reportedSeats: parseInt(reportedSeats, 10) || 0,
      heldSeats: 0,
      confirmedSeats: 0,
      availableSeats: parseInt(reportedSeats, 10) || 0,
      wholesaleFare: wholesaleFare != null ? parseFloat(wholesaleFare) : null,
      sellingFare: sellingFare != null ? parseFloat(sellingFare) : null,
      currency: currency || 'PKR',
      fareStatus: (sellingFare ? 'confirmed' : (fareStatus || 'request_fare')) as any,
      stalenessPolicyHours: 48,
      lastReportedAt: new Date().toISOString(),
      status: 'published' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.airlineGroups.push(newFlight);

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: userId || 'admin',
      action: 'CREATE_AIRLINE_GROUP',
      entityType: 'airline_groups',
      entityId: newFlight.id,
      afterSnapshot: newFlight,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, flight: newFlight });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
