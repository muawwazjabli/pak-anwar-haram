export type UserRole = 'owner' | 'staff' | 'read_only' | 'anon';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'auto_detect' | 'hotel_rates' | 'airline_groups' | 'ready_made_packages';
export type DocumentStatus = 'uploaded' | 'processing' | 'needs_review' | 'partially_approved' | 'published' | 'rejected';

export interface SupplierDocument {
  id: string;
  supplierId: string;
  supplierName?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  docType: DocumentType;
  status: DocumentStatus;
  totalPages: number;
  processedPages: number;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'corrected';
export type EntityType = 'hotel_rate' | 'flight_group' | 'package' | 'visa_transport';

export interface ImportReviewItem {
  id: string;
  documentId: string;
  pageNumber: number;
  entityType: EntityType;
  rawData: Record<string, any>;
  proposedData: Record<string, any>;
  currentActiveData?: Record<string, any> | null;
  diffSummary?: {
    isNew: boolean;
    hasChanges: boolean;
    fieldChanges: Array<{ field: string; oldVal: any; newVal: any }>;
  };
  validationFlags: string[];
  status: ReviewStatus;
  reviewerNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

export type OccupancyType = 'Sharing' | 'Double' | 'Triple' | 'Quad' | 'Quint';
export type BillingBasis = 'per_bed_per_night' | 'per_room_per_night';
export type EntityStatus = 'draft' | 'published' | 'superseded';

export interface Hotel {
  id: string;
  supplierId: string;
  supplierName?: string;
  name: string;
  aliases: string[];
  city: 'Makkah' | 'Madinah';
  locationArea?: string;
  distanceRaw?: string;
  distanceMeters?: number | null;
  shuttleService: boolean;
  starRating?: number | null;
  sourceDocumentId?: string;
  sourcePage?: number;
  status: EntityStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface HotelDateBand {
  id: string;
  hotelId: string;
  supplierId: string;
  bandLabelRaw: string;
  startDate: string; // YYYY-MM-DD (check-in inclusive)
  endDate: string;   // YYYY-MM-DD (checkout exclusive)
  currency: string;  // e.g. 'SAR'
  seasonContext?: string;
  confirmedByReviewer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HotelRate {
  id: string;
  dateBandId: string;
  hotelId: string;
  occupancy: OccupancyType;
  billingBasis: BillingBasis;
  rateAmount: number | null; // null if N/A or missing
  isAvailable: boolean;
  rawLabel?: string;
  requiresVerification: boolean;
  verificationNotes?: string;
  version: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export type VisaTransportCategory = 
  | 'visa' 
  | 'partial_visa' 
  | 'visa_with_bus' 
  | 'private_transport' 
  | 'ziyarat' 
  | 'infant_fee';

export interface VisaTransportRate {
  id: string;
  supplierId: string;
  supplierName?: string;
  category: VisaTransportCategory;
  title: string;
  route?: string;
  vehicleType?: string;
  partyMinPax: number;
  partyMaxPax?: number | null;
  billingUnit: 'per_person' | 'per_vehicle' | 'per_group';
  rateAmount: number;
  currency: string; // 'SAR'
  inclusions: string[];
  termsRestrictions?: string;
  isBundle: boolean;
  preventsDuplicateCharging: boolean;
  sourceDocumentId?: string;
  sourcePage?: number;
  status: EntityStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AirlineGroup {
  id: string;
  supplierId: string;
  supplierName?: string;
  airlineCode: string;
  airlineName: string;
  groupCode?: string;
  flightNumbersSummary: string;
  sector: string; // e.g. 'MUX-JED-MUX'
  outboundDate: string; // YYYY-MM-DD
  inboundDate: string;  // YYYY-MM-DD
  outboundDeptTime?: string;
  inboundDeptTime?: string;
  durationDays: number;
  baggage?: string;
  reportedSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number; // reported - held - confirmed
  wholesaleFare: number | null;
  sellingFare: number | null;
  currency: string; // 'PKR'
  fareStatus: 'confirmed' | 'request_fare';
  bookingDeadline?: string;
  stalenessPolicyHours: number;
  lastReportedAt: string;
  sourceDocumentId?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PackageGroup {
  id: string;
  supplierId: string;
  supplierName?: string;
  groupCode: string; // e.g. 'UG-100698'
  airlineGroupId?: string;
  airlineName: string;
  flightSummary: string;
  baggage?: string;
  totalSeats: number;
  nightsTotal: number;
  departureCity: string;
  travelStartDate: string;
  travelEndDate: string;
  summaryFromPricePkr?: number | null;
  status: EntityStatus | 'sold_out';
  sourceDocumentId?: string;
  sourcePage?: number;
  createdAt: string;
  updatedAt: string;
  variants?: PackageVariant[];
}

export interface PackageVariant {
  id: string;
  packageGroupId: string;
  variantCode: string; // e.g. 'UP-103710'
  makkahHotelName: string;
  makkahNights: number;
  makkahDistance?: string;
  madinahHotelName: string;
  madinahNights: number;
  madinahDistance?: string;
  wholesaleSharing?: number | null;
  wholesaleQuad?: number | null;
  wholesaleTriple?: number | null;
  wholesaleDouble?: number | null;
  sellingSharing?: number | null;
  sellingQuad?: number | null;
  sellingTriple?: number | null;
  sellingDouble?: number | null;
  effectiveSharing?: number | null;
  effectiveQuad?: number | null;
  effectiveTriple?: number | null;
  effectiveDouble?: number | null;
  activeDiscounts?: {
    sharing?: number;
    quad?: number;
    triple?: number;
    double?: number;
  };
  isActive: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRule {
  id: string;
  ruleType: 'markup' | 'discount';
  targetScope: 'global' | 'group' | 'package' | 'occupancy';
  targetId?: string;
  valueType: 'fixed_pkr' | 'percentage';
  valueAmount: number;
  billingBasis: 'per_person' | 'per_booking';
  startDate?: string;
  endDate?: string;
  bookingDeadline?: string;
  isActive: boolean;
  belowCostFlag: boolean;
  approvedByOwner: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  version: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface AgencySettings {
  id: string;
  brandNameUrdu: string;
  brandNameEn: string;
  phonePrimary: string;
  phoneWhatsapp: string;
  email: string;
  address: string;
  logoUrl?: string;
  stalenessPolicyHours: number;
  allowPartialQuotes: boolean;
  defaultMarkupPercent: number;
  ocrProvider: 'builtin_rule_parser' | 'gemini_vision' | 'manual';
  updatedBy?: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  quoteReference: string;
  customerName: string;
  customerPhone: string;
  partyAdults: number;
  partyChildren: number;
  partyInfants: number;
  totalPax: number;
  packageType: 'custom' | 'ready_made';
  packageVariantId?: string;
  flightChoice?: any;
  makkahStay?: any;
  madinahStay?: any;
  visaTransportChoices?: any;
  sarToPkrRate: number;
  wholesaleTotalSar?: number;
  wholesaleTotalPkr?: number;
  sellingTotalPkr?: number;
  sellingPerPersonPkr?: number;
  hasUnpricedComponents: boolean;
  unpricedDetails: string[];
  priceBreakdown: Record<string, any>;
  snapshotVersion: number;
  expiresAt: string;
  createdAt: string;
}

export type BookingStatus = 'New' | 'Reviewing' | 'Awaiting Customer' | 'Held' | 'Confirmed' | 'Cancelled' | 'Expired';

export interface BookingRequest {
  id: string;
  requestReference: string;
  quoteId?: string;
  packageVariantId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySummary: string;
  status: BookingStatus;
  staffAssignedTo?: string;
  confirmationReference?: string;
  createdAt: string;
  updatedAt: string;
  quoteSnapshot?: Quote;
  notes?: BookingStaffNote[];
}

export interface BookingStaffNote {
  id: string;
  bookingRequestId: string;
  authorId: string;
  authorName: string;
  noteText: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeSnapshot?: any;
  afterSnapshot?: any;
  ipAddress?: string;
  createdAt: string;
}
