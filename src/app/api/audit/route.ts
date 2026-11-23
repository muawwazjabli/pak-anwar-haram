import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');

    let logs = db.auditLogs;
    if (entityType) logs = logs.filter(l => l.entityType === entityType);

    return NextResponse.json({
      success: true,
      auditLogs: logs.slice().reverse()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
