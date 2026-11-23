import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingStaffNote } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingRequestId = params.id;
    const { noteText, authorId, authorName } = await request.json();

    if (!noteText || !noteText.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    const newNote: BookingStaffNote = {
      id: `note-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      bookingRequestId,
      authorId: authorId || 'staff',
      authorName: authorName || 'Staff Member',
      noteText: noteText.trim(),
      isPrivate: true,
      createdAt: new Date().toISOString()
    };

    db.staffNotes.push(newNote);

    return NextResponse.json({
      success: true,
      note: newNote
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
