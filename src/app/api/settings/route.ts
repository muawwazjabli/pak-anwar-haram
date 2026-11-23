import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ExchangeRate } from '@/types';

export async function GET() {
  try {
    const activeFx = db.exchangeRates.find(r => r.isActive);
    return NextResponse.json({
      success: true,
      settings: db.settings,
      activeExchangeRate: activeFx,
      allExchangeRates: db.exchangeRates
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, newExchangeRate, userId, role } = body;

    if (role && role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized: Only owner can modify settings and exchange rates' }, { status: 403 });
    }

    if (settings) {
      db.settings = {
        ...db.settings,
        ...settings,
        updatedBy: userId || 'owner',
        updatedAt: new Date().toISOString()
      };
    }

    if (newExchangeRate) {
      const rateNum = parseFloat(newExchangeRate);
      if (!isNaN(rateNum) && rateNum > 0) {
        // Deactivate previous active rates
        db.exchangeRates.forEach(r => { r.isActive = false; });

        const nextVersion = db.exchangeRates.length + 1;
        const newFx: ExchangeRate = {
          id: `fx-${nextVersion}`,
          baseCurrency: 'SAR',
          quoteCurrency: 'PKR',
          rate: rateNum,
          version: nextVersion,
          isActive: true,
          effectiveFrom: new Date().toISOString(),
          approvedBy: userId || 'owner',
          createdAt: new Date().toISOString()
        };

        db.exchangeRates.push(newFx);

        db.auditLogs.push({
          id: `audit-${Date.now()}`,
          userId: userId || 'owner',
          action: 'UPDATE_EXCHANGE_RATE',
          entityType: 'exchange_rates',
          entityId: newFx.id,
          afterSnapshot: newFx,
          createdAt: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      settings: db.settings,
      activeExchangeRate: db.exchangeRates.find(r => r.isActive)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
