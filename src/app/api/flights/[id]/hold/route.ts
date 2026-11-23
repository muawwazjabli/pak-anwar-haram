import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = params.id;
    const { seatsCount, bookingRequestId, userId } = await request.json();

    const count = parseInt(seatsCount, 10);
    if (!count || count <= 0) {
      return NextResponse.json({ error: 'Valid seatsCount is required' }, { status: 400 });
    }

    const result = db.holdSeats(flightId, count, bookingRequestId || 'manual-hold', userId || 'staff');
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    const flight = db.airlineGroups.find(f => f.id === flightId);
    return NextResponse.json({
      success: true,
      message: result.message,
      flight
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
