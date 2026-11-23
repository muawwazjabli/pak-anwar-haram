import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const entityType = searchParams.get('entityType');
    const status = searchParams.get('status');

    let items = db.reviewItems;
    if (documentId) items = items.filter(i => i.documentId === documentId);
    if (entityType) items = items.filter(i => i.entityType === entityType);
    if (status) items = items.filter(i => i.status === status);

    return NextResponse.json({
      success: true,
      reviewItems: items,
      totalCount: items.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, itemId, itemIds, correctedData, reviewerNotes, userId } = await request.json();

    const idsToProcess = itemIds || (itemId ? [itemId] : []);
    if (idsToProcess.length === 0) {
      return NextResponse.json({ error: 'No item IDs provided' }, { status: 400 });
    }

    const updated: any[] = [];
    for (const id of idsToProcess) {
      const item = db.reviewItems.find(i => i.id === id);
      if (!item) continue;

      if (action === 'approve') {
        item.status = 'approved';
        item.approvedBy = userId || 'owner@pakanwarharam.com';
        item.approvedAt = new Date().toISOString();
        if (reviewerNotes) item.reviewerNotes = reviewerNotes;
      } else if (action === 'reject') {
        item.status = 'rejected';
        if (reviewerNotes) item.reviewerNotes = reviewerNotes;
      } else if (action === 'correct') {
        if (correctedData) {
          item.proposedData = { ...item.proposedData, ...correctedData };
        }
        item.status = 'corrected';
        item.approvedBy = userId || 'owner@pakanwarharam.com';
        item.approvedAt = new Date().toISOString();
        if (reviewerNotes) item.reviewerNotes = reviewerNotes;
      }

      item.updatedAt = new Date().toISOString();
      updated.push(item);
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      items: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
