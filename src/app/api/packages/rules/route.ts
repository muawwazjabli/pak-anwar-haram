import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PriceRule } from '@/types';
import { validateBelowCost } from '@/lib/pricing/discount-rules';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      rules: db.priceRules
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ruleType,
      targetScope,
      targetId,
      valueType,
      valueAmount,
      billingBasis,
      startDate,
      endDate,
      bookingDeadline,
      approvedByOwner,
      userId,
      role
    } = body;

    const amount = parseFloat(valueAmount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: 'Valid valueAmount is required' }, { status: 400 });
    }

    // Check below-cost if discount
    let belowCostFlag = false;
    let warningMsg: string | undefined;

    if (ruleType === 'discount' && targetScope === 'occupancy' && targetId) {
      // Find variant if targetId has variantCode
      const [varCode, occ] = targetId.split(':');
      const v = db.packageVariants.find(variant => variant.variantCode === varCode);
      if (v) {
        const wholesale = (v as any)[`wholesale${occ || 'Sharing'}`];
        const baseSelling = (v as any)[`selling${occ || 'Sharing'}`] ?? wholesale;
        const discountPkr = valueType === 'fixed_pkr' ? amount : Math.round(baseSelling * (amount / 100));
        const effective = baseSelling - discountPkr;
        const check = validateBelowCost(wholesale, effective);
        belowCostFlag = check.isBelowCost;
        warningMsg = check.warning;
      }
    }

    if (belowCostFlag && role !== 'owner' && !approvedByOwner) {
      return NextResponse.json({
        error: warningMsg || 'Discount brings price below supplier cost and requires explicit owner approval.',
        requiresOwnerApproval: true
      }, { status: 400 });
    }

    const newRule: PriceRule = {
      id: `rule-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      ruleType: ruleType || 'discount',
      targetScope: targetScope || 'occupancy',
      targetId: targetId || undefined,
      valueType: valueType || 'fixed_pkr',
      valueAmount: amount,
      billingBasis: billingBasis || 'per_person',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      bookingDeadline: bookingDeadline || undefined,
      isActive: true,
      belowCostFlag,
      approvedByOwner: Boolean(approvedByOwner || role === 'owner'),
      createdBy: userId || 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.priceRules.push(newRule);

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: userId || 'admin',
      action: 'CREATE_PRICE_RULE',
      entityType: 'price_rules',
      entityId: newRule.id,
      afterSnapshot: newRule,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      rule: newRule,
      warning: warningMsg
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
