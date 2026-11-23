-- ==============================================================================
-- Migration 001: Initial Schema for Pak Anwar Haram (پاک انوار حرم)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agency Settings & Configurations
CREATE TABLE IF NOT EXISTS agency_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name_urdu TEXT NOT NULL DEFAULT 'پاک انوار حرم',
    brand_name_en TEXT NOT NULL DEFAULT 'Pak Anwar Haram',
    phone_primary TEXT NOT NULL DEFAULT '+92-40-4222634',
    phone_whatsapp TEXT NOT NULL DEFAULT '+92-322-2188218',
    email TEXT NOT NULL DEFAULT 'info@pakanwarharam.com',
    address TEXT NOT NULL DEFAULT 'Multan / Sahiwal, Pakistan',
    logo_url TEXT,
    staleness_policy_hours INT NOT NULL DEFAULT 48,
    allow_partial_quotes BOOLEAN NOT NULL DEFAULT TRUE,
    default_markup_percent NUMERIC(5,2) NOT NULL DEFAULT 8.00,
    ocr_provider TEXT NOT NULL DEFAULT 'builtin_rule_parser',
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Exchange Rates (SAR to PKR, versioned)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency TEXT NOT NULL DEFAULT 'SAR',
    quote_currency TEXT NOT NULL DEFAULT 'PKR',
    rate NUMERIC(12,4) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users and Roles
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_auth_id UUID UNIQUE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'staff', 'read_only')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Supplier Uploaded Documents
CREATE TABLE IF NOT EXISTS supplier_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('auto_detect', 'hotel_rates', 'airline_groups', 'ready_made_packages')),
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'needs_review', 'partially_approved', 'published', 'rejected')),
    total_pages INT NOT NULL DEFAULT 1,
    processed_pages INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Document Pages
CREATE TABLE IF NOT EXISTS document_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES supplier_documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    raw_text TEXT,
    image_path TEXT,
    page_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, page_number)
);

-- 7. Import Review Queue
CREATE TABLE IF NOT EXISTS import_review_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES supplier_documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL DEFAULT 1,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('hotel_rate', 'flight_group', 'package', 'visa_transport')),
    raw_data JSONB NOT NULL,
    proposed_data JSONB NOT NULL,
    current_active_data JSONB,
    diff_summary JSONB,
    validation_flags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'corrected')),
    reviewer_notes TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Hotels
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    city TEXT NOT NULL CHECK (city IN ('Makkah', 'Madinah')),
    location_area TEXT,
    distance_raw TEXT,
    distance_meters INT,
    shuttle_service BOOLEAN NOT NULL DEFAULT FALSE,
    star_rating INT,
    source_document_id UUID REFERENCES supplier_documents(id) ON DELETE SET NULL,
    source_page INT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'superseded')),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, name, city)
);

-- 9. Hotel Date Bands
CREATE TABLE IF NOT EXISTS hotel_date_bands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    band_label_raw TEXT NOT NULL,
    start_date DATE NOT NULL, -- Check-in inclusive
    end_date DATE NOT NULL,   -- Checkout exclusive
    currency TEXT NOT NULL DEFAULT 'SAR',
    season_context TEXT,
    confirmed_by_reviewer BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Hotel Nightly Rates
CREATE TABLE IF NOT EXISTS hotel_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_band_id UUID REFERENCES hotel_date_bands(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    occupancy TEXT NOT NULL CHECK (occupancy IN ('Sharing', 'Double', 'Triple', 'Quad', 'Quint')),
    billing_basis TEXT NOT NULL CHECK (billing_basis IN ('per_bed_per_night', 'per_room_per_night')),
    rate_amount NUMERIC(10,2),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    raw_label TEXT,
    requires_verification BOOLEAN NOT NULL DEFAULT FALSE,
    verification_notes TEXT,
    version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'superseded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date_band_id, occupancy)
);

-- 11. Visa, Transport and Ziyarat
CREATE TABLE IF NOT EXISTS visa_transport_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('visa', 'partial_visa', 'visa_with_bus', 'private_transport', 'ziyarat', 'infant_fee')),
    title TEXT NOT NULL,
    route TEXT,
    vehicle_type TEXT,
    party_min_pax INT DEFAULT 1,
    party_max_pax INT,
    billing_unit TEXT NOT NULL CHECK (billing_unit IN ('per_person', 'per_vehicle', 'per_group')),
    rate_amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'SAR',
    inclusions TEXT[] DEFAULT '{}',
    terms_restrictions TEXT,
    is_bundle BOOLEAN NOT NULL DEFAULT FALSE,
    prevents_duplicate_charging BOOLEAN NOT NULL DEFAULT TRUE,
    source_document_id UUID REFERENCES supplier_documents(id) ON DELETE SET NULL,
    source_page INT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'superseded')),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Airline Groups and Inventory
CREATE TABLE IF NOT EXISTS airline_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    airline_code TEXT NOT NULL,
    airline_name TEXT NOT NULL,
    group_code TEXT,
    flight_numbers_summary TEXT NOT NULL,
    sector TEXT NOT NULL,
    outbound_date DATE NOT NULL,
    inbound_date DATE NOT NULL,
    outbound_dept_time TEXT,
    inbound_dept_time TEXT,
    duration_days INT NOT NULL,
    baggage TEXT,
    reported_seats INT NOT NULL DEFAULT 0,
    held_seats INT NOT NULL DEFAULT 0,
    confirmed_seats INT NOT NULL DEFAULT 0,
    wholesale_fare NUMERIC(12,2),
    selling_fare NUMERIC(12,2),
    currency TEXT NOT NULL DEFAULT 'PKR',
    fare_status TEXT NOT NULL DEFAULT 'request_fare' CHECK (fare_status IN ('confirmed', 'request_fare')),
    booking_deadline DATE,
    staleness_policy_hours INT NOT NULL DEFAULT 48,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_document_id UUID REFERENCES supplier_documents(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'superseded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Airline Flight Legs
CREATE TABLE IF NOT EXISTS flight_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_group_id UUID REFERENCES airline_groups(id) ON DELETE CASCADE,
    leg_type TEXT NOT NULL CHECK (leg_type IN ('outbound', 'inbound', 'connection')),
    flight_number TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TEXT,
    arrival_time TEXT,
    departure_date DATE,
    arrival_date DATE,
    baggage_allowance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Airline Inventory Holds
CREATE TABLE IF NOT EXISTS airline_inventory_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_group_id UUID REFERENCES airline_groups(id) ON DELETE CASCADE,
    booking_request_id UUID,
    seats_held INT NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'converted_to_confirmed')),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Ready-Made Package Groups & Variants
CREATE TABLE IF NOT EXISTS package_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    group_code TEXT NOT NULL UNIQUE,
    airline_group_id UUID REFERENCES airline_groups(id) ON DELETE SET NULL,
    airline_name TEXT NOT NULL,
    flight_summary TEXT NOT NULL,
    baggage TEXT,
    total_seats INT NOT NULL DEFAULT 0,
    nights_total INT NOT NULL,
    departure_city TEXT NOT NULL,
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    summary_from_price_pkr NUMERIC(12,2),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'superseded', 'sold_out')),
    source_document_id UUID REFERENCES supplier_documents(id) ON DELETE SET NULL,
    source_page INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_group_id UUID REFERENCES package_groups(id) ON DELETE CASCADE,
    variant_code TEXT NOT NULL UNIQUE,
    makkah_hotel_name TEXT NOT NULL,
    makkah_nights INT NOT NULL,
    makkah_distance TEXT,
    madinah_hotel_name TEXT NOT NULL,
    madinah_nights INT NOT NULL,
    madinah_distance TEXT,
    wholesale_sharing NUMERIC(12,2),
    wholesale_quad NUMERIC(12,2),
    wholesale_triple NUMERIC(12,2),
    wholesale_double NUMERIC(12,2),
    selling_sharing NUMERIC(12,2),
    selling_quad NUMERIC(12,2),
    selling_triple NUMERIC(12,2),
    selling_double NUMERIC(12,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'superseded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Price Rules (Markups & Discounts)
CREATE TABLE IF NOT EXISTS price_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type TEXT NOT NULL CHECK (rule_type IN ('markup', 'discount')),
    target_scope TEXT NOT NULL CHECK (target_scope IN ('global', 'group', 'package', 'occupancy')),
    target_id TEXT, -- e.g. UG-100698 or UP-103710 or Sharing
    value_type TEXT NOT NULL CHECK (value_type IN ('fixed_pkr', 'percentage')),
    value_amount NUMERIC(12,2) NOT NULL,
    billing_basis TEXT NOT NULL DEFAULT 'per_person' CHECK (billing_basis IN ('per_person', 'per_booking')),
    start_date DATE,
    end_date DATE,
    booking_deadline DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    below_cost_flag BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by_owner BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Quotes Snapshot
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    party_adults INT NOT NULL DEFAULT 1,
    party_children INT NOT NULL DEFAULT 0,
    party_infants INT NOT NULL DEFAULT 0,
    total_pax INT NOT NULL DEFAULT 1,
    package_type TEXT NOT NULL CHECK (package_type IN ('custom', 'ready_made')),
    package_variant_id UUID REFERENCES package_variants(id) ON DELETE SET NULL,
    flight_choice JSONB,
    makkah_stay JSONB,
    madinah_stay JSONB,
    visa_transport_choices JSONB,
    sar_to_pkr_rate NUMERIC(12,4) NOT NULL,
    wholesale_total_sar NUMERIC(12,2),
    wholesale_total_pkr NUMERIC(12,2),
    selling_total_pkr NUMERIC(12,2),
    selling_per_person_pkr NUMERIC(12,2),
    has_unpriced_components BOOLEAN NOT NULL DEFAULT FALSE,
    unpriced_details TEXT[] DEFAULT '{}',
    price_breakdown JSONB NOT NULL,
    snapshot_version INT NOT NULL DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Booking Enquiries & Requests
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_reference TEXT UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    package_variant_id UUID REFERENCES package_variants(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    party_summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewing', 'Awaiting Customer', 'Held', 'Confirmed', 'Cancelled', 'Expired')),
    staff_assigned_to TEXT,
    confirmation_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Booking Staff Notes
CREATE TABLE IF NOT EXISTS booking_staff_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_request_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    note_text TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    before_snapshot JSONB,
    after_snapshot JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_band ON hotel_rates(date_band_id);
CREATE INDEX IF NOT EXISTS idx_airline_groups_sector ON airline_groups(sector);
CREATE INDEX IF NOT EXISTS idx_airline_groups_dates ON airline_groups(outbound_date, inbound_date);
CREATE INDEX IF NOT EXISTS idx_package_groups_dates ON package_groups(travel_start_date);
CREATE INDEX IF NOT EXISTS idx_quotes_ref ON quotes(quote_reference);
CREATE INDEX IF NOT EXISTS idx_booking_req_ref ON booking_requests(request_reference);
CREATE INDEX IF NOT EXISTS idx_import_items_doc ON import_review_items(document_id);
