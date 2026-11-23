import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { itemIds, publishedBy, role } = await request.json();

    // Permissions check: only owner can publish
    if (role && role !== 'owner') {
      return NextResponse.json({
        error: 'Unauthorized: Only owner role is permitted to publish approved rates to active catalog.'
      }, { status: 403 });
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'No item IDs provided for publication' }, { status: 400 });
    }

    const result = db.publishReviewItems(itemIds, publishedBy || 'owner@pakanwarharam.com');

    return NextResponse.json({
      success: result.errors.length === 0,
      publishedCount: result.publishedCount,
      errors: result.errors
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
