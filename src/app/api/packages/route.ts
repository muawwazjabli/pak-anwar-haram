import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    const departureCity = searchParams.get('departureCity');
    const airline = searchParams.get('airline');
    const maxBudget = searchParams.get('maxBudget');

    if (isPublic) {
      let packages = db.getPublishedPackages();

      if (departureCity) {
        packages = packages.filter(p => p.departureCity.toLowerCase().includes(departureCity.toLowerCase()));
      }
      if (airline) {
        packages = packages.filter(p => p.airlineName.toLowerCase().includes(airline.toLowerCase()));
      }
      if (maxBudget) {
        const budget = parseInt(maxBudget, 10);
        packages = packages.filter(p => p.summaryFromPricePkr && p.summaryFromPricePkr <= budget);
      }

      // Hide wholesale prices completely from public response
      const sanitized = packages.map(g => ({
        id: g.id,
        groupCode: g.groupCode,
        airlineName: g.airlineName,
        flightSummary: g.flightSummary,
        baggage: g.baggage,
        totalSeats: g.totalSeats,
        nightsTotal: g.nightsTotal,
        departureCity: g.departureCity,
        travelStartDate: g.travelStartDate,
        travelEndDate: g.travelEndDate,
        summaryFromPricePkr: g.summaryFromPricePkr,
        status: g.status,
        variants: (g.variants || []).map(v => ({
          id: v.id,
          variantCode: v.variantCode,
          makkahHotelName: v.makkahHotelName,
          makkahNights: v.makkahNights,
          makkahDistance: v.makkahDistance,
          madinahHotelName: v.madinahHotelName,
          madinahNights: v.madinahNights,
          madinahDistance: v.madinahDistance,
          sellingSharing: v.sellingSharing,
          sellingQuad: v.sellingQuad,
          sellingTriple: v.sellingTriple,
          sellingDouble: v.sellingDouble,
          effectiveSharing: v.effectiveSharing,
          effectiveQuad: v.effectiveQuad,
          effectiveTriple: v.effectiveTriple,
          effectiveDouble: v.effectiveDouble,
          activeDiscounts: v.activeDiscounts,
          isActive: v.isActive
        }))
      }));

      return NextResponse.json({ success: true, packages: sanitized });
    }

    // Admin view
    const groups = db.packageGroups.map(g => ({
      ...g,
      variants: db.packageVariants.filter(v => v.packageGroupId === g.id)
    }));

    return NextResponse.json({ success: true, packages: groups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, packageGroupId, status, variantId, sellingPrices, userId } = body;

    // Toggle sold-out or publish status
    if (action === 'update_group_status' && packageGroupId && status) {
      const grp = db.packageGroups.find(g => g.id === packageGroupId);
      if (!grp) return NextResponse.json({ error: 'Package group not found' }, { status: 404 });
      grp.status = status;
      grp.updatedAt = new Date().toISOString();

      db.auditLogs.push({
        id: `audit-${Date.now()}`,
        userId: userId || 'admin',
        action: 'UPDATE_PACKAGE_GROUP_STATUS',
        entityType: 'package_groups',
        entityId: grp.id,
        afterSnapshot: { status },
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, group: grp });
    }

    // Update selling prices for a variant
    if (action === 'update_variant_prices' && variantId && sellingPrices) {
      const v = db.packageVariants.find(varItem => varItem.id === variantId);
      if (!v) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });

      if (sellingPrices.sellingSharing != null) v.sellingSharing = sellingPrices.sellingSharing;
      if (sellingPrices.sellingQuad != null) v.sellingQuad = sellingPrices.sellingQuad;
      if (sellingPrices.sellingTriple != null) v.sellingTriple = sellingPrices.sellingTriple;
      if (sellingPrices.sellingDouble != null) v.sellingDouble = sellingPrices.sellingDouble;
      v.updatedAt = new Date().toISOString();

      db.auditLogs.push({
        id: `audit-${Date.now()}`,
        userId: userId || 'admin',
        action: 'UPDATE_VARIANT_PRICES',
        entityType: 'package_variants',
        entityId: v.id,
        afterSnapshot: sellingPrices,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, variant: v });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
