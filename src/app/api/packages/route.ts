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

    // Manual creation of package group and variant
    if (action === 'create_package') {
      const {
        groupCode,
        airlineName,
        departureCity,
        travelStartDate,
        travelEndDate,
        totalSeats,
        baggage,
        makkahHotelName,
        makkahNights,
        makkahDistance,
        madinahHotelName,
        madinahNights,
        madinahDistance,
        sellingSharing,
        sellingQuad,
        sellingTriple,
        sellingDouble,
        costSharing,
        costQuad,
        costTriple,
        costDouble
      } = body;

      const newGroupId = `grp-${Date.now()}`;
      const code = groupCode || `UG-${Math.floor(100000 + Math.random() * 900000)}`;
      const nightsMakkah = parseInt(makkahNights || '10', 10);
      const nightsMadinah = parseInt(madinahNights || '5', 10);
      const minFromPrice = Math.min(
        sellingSharing || 250000,
        sellingQuad || 260000,
        sellingTriple || 280000,
        sellingDouble || 300000
      );

      const newGroup = {
        id: newGroupId,
        supplierId: 'sup-umrahgroups',
        groupCode: code,
        airlineName: airlineName || 'Saudi Arabian Airlines',
        flightSummary: `${airlineName || 'Saudi Airlines'} (${departureCity || 'Lahore'} - Jeddah - ${departureCity || 'Lahore'})`,
        baggage: baggage || '30 Kg',
        totalSeats: parseInt(totalSeats || '40', 10),
        nightsTotal: nightsMakkah + nightsMadinah,
        departureCity: departureCity || 'Lahore',
        travelStartDate: travelStartDate || '2026-12-25',
        travelEndDate: travelEndDate || '2027-01-10',
        summaryFromPricePkr: minFromPrice,
        status: 'published' as const,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newVariantId = `var-${Date.now()}`;
      const newVariant = {
        id: newVariantId,
        packageGroupId: newGroupId,
        variantCode: `UP-${Math.floor(100000 + Math.random() * 900000)}`,
        makkahHotelName: makkahHotelName || 'Al Fakhama Hotel Makkah',
        makkahNights: nightsMakkah,
        makkahDistance: makkahDistance || '500 MTR',
        madinahHotelName: madinahHotelName || 'Taif Nebras Madinah',
        madinahNights: nightsMadinah,
        madinahDistance: madinahDistance || '400 MTR',
        wholesaleSharing: parseFloat(costSharing || sellingSharing || '240000'),
        wholesaleQuad: parseFloat(costQuad || sellingQuad || '250000'),
        wholesaleTriple: parseFloat(costTriple || sellingTriple || '270000'),
        wholesaleDouble: parseFloat(costDouble || sellingDouble || '290000'),
        sellingSharing: parseFloat(sellingSharing || '250000'),
        sellingQuad: parseFloat(sellingQuad || '260000'),
        sellingTriple: parseFloat(sellingTriple || '280000'),
        sellingDouble: parseFloat(sellingDouble || '300000'),
        effectiveSharing: parseFloat(sellingSharing || '250000'),
        effectiveQuad: parseFloat(sellingQuad || '260000'),
        effectiveTriple: parseFloat(sellingTriple || '280000'),
        effectiveDouble: parseFloat(sellingDouble || '300000'),
        isActive: true,
        status: 'published' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.packageGroups.unshift(newGroup);
      db.packageVariants.unshift(newVariant);

      db.auditLogs.push({
        id: `audit-${Date.now()}`,
        userId: userId || 'admin',
        action: 'MANUAL_CREATE_PACKAGE',
        entityType: 'package_groups',
        entityId: newGroupId,
        afterSnapshot: { group: newGroup, variant: newVariant },
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, group: newGroup, variant: newVariant });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
