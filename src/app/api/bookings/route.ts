import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingRequest } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let requests = db.bookingRequests;
    if (status) requests = requests.filter(r => r.status === status);

    const enriched = requests.map(r => {
      const quote = r.quoteId ? db.quotes.find(q => q.id === r.quoteId) : undefined;
      const notes = db.staffNotes.filter(n => n.bookingRequestId === r.id);
      return {
        ...r,
        quoteSnapshot: quote,
        notes
      };
    });

    return NextResponse.json({
      success: true,
      bookingRequests: enriched
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      quoteId,
      packageVariantId,
      partySummary
    } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Customer name and phone/WhatsApp number are required' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const requestReference = `PAH-REQ-${year}-${rand}`;

    const newBooking: BookingRequest = {
      id: `booking-${Date.now()}-${rand}`,
      requestReference,
      quoteId,
      packageVariantId,
      customerName,
      customerPhone,
      customerEmail,
      partySummary: partySummary || 'Umrah Group',
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.bookingRequests.push(newBooking);

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      action: 'SUBMIT_BOOKING_ENQUIRY',
      entityType: 'booking_requests',
      entityId: newBooking.id,
      afterSnapshot: { requestReference, customerName, customerPhone },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      requestReference: newBooking.requestReference,
      bookingRequest: newBooking
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, staffAssignedTo, confirmationReference, userId } = body;

    const booking = db.bookingRequests.find(b => b.id === id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
    }

    if (status) booking.status = status;
    if (staffAssignedTo !== undefined) booking.staffAssignedTo = staffAssignedTo;
    if (confirmationReference !== undefined) booking.confirmationReference = confirmationReference;
    booking.updatedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: userId || 'staff',
      action: 'UPDATE_BOOKING_STATUS',
      entityType: 'booking_requests',
      entityId: booking.id,
      afterSnapshot: { status, staffAssignedTo, confirmationReference },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      bookingRequest: booking
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
