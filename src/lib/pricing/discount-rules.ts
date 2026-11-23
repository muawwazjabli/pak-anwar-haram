import { PackageVariant, PriceRule } from '@/types';

export interface DiscountCalculationResult {
  originalSelling: number;
  discountAmount: number;
  effectiveSelling: number;
  belowCost: boolean;
  costWarning?: string;
  appliedRule?: PriceRule;
}

export function applyPriceRuleToVariant(
  variant: PackageVariant,
  groupCode: string,
  rules: PriceRule[]
): PackageVariant {
  const activeRules = rules.filter(r => {
    if (!r.isActive) return false;
    const now = new Date().toISOString().split('T')[0];
    if (r.startDate && r.startDate > now) return false;
    if (r.endDate && r.endDate < now) return false;
    return true;
  });

  const calculateOccupancyPrice = (
    occupancy: 'Sharing' | 'Quad' | 'Triple' | 'Double',
    wholesalePrice: number | null | undefined,
    baseSellingPrice: number | null | undefined
  ): { effective: number | null; discountApplied: number } => {
    if (baseSellingPrice == null) {
      return { effective: null, discountApplied: 0 };
    }

    // Specificity order:
    // 1. Occupancy specific rule matching targetId = variant.variantCode + ':' + occupancy or occupancy
    // 2. Package specific rule matching targetId = variant.variantCode
    // 3. Group specific rule matching targetId = groupCode
    // 4. Global rule
    let matchedRule: PriceRule | undefined = activeRules.find(
      r => r.ruleType === 'discount' && r.targetScope === 'occupancy' && (r.targetId === `${variant.variantCode}:${occupancy}` || r.targetId === occupancy)
    );

    if (!matchedRule) {
      matchedRule = activeRules.find(
        r => r.ruleType === 'discount' && r.targetScope === 'package' && r.targetId === variant.variantCode
      );
    }

    if (!matchedRule) {
      matchedRule = activeRules.find(
        r => r.ruleType === 'discount' && r.targetScope === 'group' && r.targetId === groupCode
      );
    }

    if (!matchedRule) {
      matchedRule = activeRules.find(
        r => r.ruleType === 'discount' && r.targetScope === 'global'
      );
    }

    if (!matchedRule) {
      return { effective: baseSellingPrice, discountApplied: 0 };
    }

    let discountPkr = 0;
    if (matchedRule.valueType === 'fixed_pkr') {
      discountPkr = matchedRule.valueAmount;
    } else {
      discountPkr = Math.round(baseSellingPrice * (matchedRule.valueAmount / 100));
    }

    const effective = Math.max(0, baseSellingPrice - discountPkr);
    return { effective, discountApplied: discountPkr };
  };

  const sharingRes = calculateOccupancyPrice('Sharing', variant.wholesaleSharing, variant.sellingSharing ?? variant.wholesaleSharing);
  const quadRes = calculateOccupancyPrice('Quad', variant.wholesaleQuad, variant.sellingQuad ?? variant.wholesaleQuad);
  const tripleRes = calculateOccupancyPrice('Triple', variant.wholesaleTriple, variant.sellingTriple ?? variant.wholesaleTriple);
  const doubleRes = calculateOccupancyPrice('Double', variant.wholesaleDouble, variant.sellingDouble ?? variant.wholesaleDouble);

  return {
    ...variant,
    effectiveSharing: sharingRes.effective,
    effectiveQuad: quadRes.effective,
    effectiveTriple: tripleRes.effective,
    effectiveDouble: doubleRes.effective,
    activeDiscounts: {
      sharing: sharingRes.discountApplied,
      quad: quadRes.discountApplied,
      triple: tripleRes.discountApplied,
      double: doubleRes.discountApplied
    }
  };
}

export function validateBelowCost(
  wholesale: number | null | undefined,
  effective: number | null | undefined
): { isBelowCost: boolean; warning?: string } {
  if (wholesale != null && effective != null && effective < wholesale) {
    return {
      isBelowCost: true,
      warning: `Discount brings selling price (${effective.toLocaleString()} PKR) below supplier cost (${wholesale.toLocaleString()} PKR)! Requires explicit owner approval.`
    };
  }
  return { isBelowCost: false };
}
