import { UserRole } from '@/types';

export interface PermissionCheck {
  canUploadDocuments: boolean;
  canEditReviewQueue: boolean;
  canApproveReviewItems: boolean;
  canPublishRates: boolean;
  canManagePricesAndDiscounts: boolean;
  canManageExchangeRates: boolean;
  canHoldSeats: boolean;
  canConfirmSeats: boolean;
  canProcessBookings: boolean;
  canViewWholesaleData: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
}

export function getRolePermissions(role: UserRole): PermissionCheck {
  switch (role) {
    case 'owner':
      return {
        canUploadDocuments: true,
        canEditReviewQueue: true,
        canApproveReviewItems: true,
        canPublishRates: true,
        canManagePricesAndDiscounts: true,
        canManageExchangeRates: true,
        canHoldSeats: true,
        canConfirmSeats: true,
        canProcessBookings: true,
        canViewWholesaleData: true,
        canViewAuditLogs: true,
        canManageUsers: true
      };

    case 'staff':
      return {
        canUploadDocuments: true,
        canEditReviewQueue: true,
        canApproveReviewItems: true,
        canPublishRates: false, // Only owner publishes
        canManagePricesAndDiscounts: false,
        canManageExchangeRates: false,
        canHoldSeats: true,
        canConfirmSeats: true,
        canProcessBookings: true,
        canViewWholesaleData: false, // Staff sees selling prices, not wholesale margins
        canViewAuditLogs: false,
        canManageUsers: false
      };

    case 'read_only':
      return {
        canUploadDocuments: false,
        canEditReviewQueue: false,
        canApproveReviewItems: false,
        canPublishRates: false,
        canManagePricesAndDiscounts: false,
        canManageExchangeRates: false,
        canHoldSeats: false,
        canConfirmSeats: false,
        canProcessBookings: false,
        canViewWholesaleData: false,
        canViewAuditLogs: true,
        canManageUsers: false
      };

    case 'anon':
    default:
      return {
        canUploadDocuments: false,
        canEditReviewQueue: false,
        canApproveReviewItems: false,
        canPublishRates: false,
        canManagePricesAndDiscounts: false,
        canManageExchangeRates: false,
        canHoldSeats: false,
        canConfirmSeats: false,
        canProcessBookings: false,
        canViewWholesaleData: false,
        canViewAuditLogs: false,
        canManageUsers: false
      };
  }
}
