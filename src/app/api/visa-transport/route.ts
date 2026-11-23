import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public') === 'true';

    let rates = db.visaTransportRates;
    if (category) rates = rates.filter(r => r.category === category);
    if (isPublic) rates = rates.filter(r => r.status === 'published');

    return NextResponse.json({
      success: true,
      rates
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      category,
      title,
      route,
      vehicleType,
      partyMinPax,
      partyMaxPax,
      billingUnit,
      rateAmount,
      currency,
      inclusions,
      termsRestrictions,
      isBundle,
      preventsDuplicateCharging,
      supplierId,
      userId
    } = body;

    const newRate = {
      id: `vt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      supplierId: supplierId || 'sup-meezab',
      category,
      title,
      route,
      vehicleType,
      partyMinPax: partyMinPax || 1,
      partyMaxPax: partyMaxPax || null,
      billingUnit: billingUnit || 'per_person',
      rateAmount: parseFloat(rateAmount),
      currency: currency || 'SAR',
      inclusions: inclusions || [],
      termsRestrictions,
      isBundle: Boolean(isBundle),
      preventsDuplicateCharging: Boolean(preventsDuplicateCharging),
      status: 'published' as const,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.visaTransportRates.push(newRate);

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: userId || 'admin',
      action: 'CREATE_VISA_TRANSPORT_RATE',
      entityType: 'visa_transport_rates',
      entityId: newRate.id,
      afterSnapshot: newRate,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      rate: newRate
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
