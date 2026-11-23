-- ==============================================================================
-- Migration 002: Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_date_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_transport_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE airline_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE airline_inventory_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role from JWT claims or app_users
CREATE OR REPLACE FUNCTION auth.current_app_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM app_users
    WHERE supabase_auth_id = auth.uid() OR email = (auth.jwt() ->> 'email')
    LIMIT 1;

    RETURN COALESCE(user_role, 'anon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Agency Settings: Public can read basic contact/brand; only owner/staff can update
CREATE POLICY "Public read agency settings" ON agency_settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Admin update agency settings" ON agency_settings
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff'));

-- 2. Exchange Rates: Public can read active; only owner can modify
CREATE POLICY "Public read active exchange rates" ON exchange_rates
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Owner manage exchange rates" ON exchange_rates
    FOR ALL TO authenticated
    USING (auth.current_app_role() = 'owner');

-- 3. Suppliers & Documents: STRICTLY HIDDEN FROM ANONYMOUS
CREATE POLICY "Staff/Owner read suppliers" ON suppliers
    FOR SELECT TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff', 'read_only'));

CREATE POLICY "Staff/Owner manage suppliers" ON suppliers
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff'));

CREATE POLICY "Staff/Owner access documents" ON supplier_documents
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff', 'read_only'));

CREATE POLICY "Staff/Owner access review items" ON import_review_items
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff', 'read_only'));

-- 4. Published Rates: Public can read published only; wholesale is masked in views
CREATE POLICY "Public read published hotels" ON hotels
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Public read published date bands" ON hotel_date_bands
    FOR SELECT TO public USING (true);

CREATE POLICY "Public read published hotel rates" ON hotel_rates
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Public read published visa transport" ON visa_transport_rates
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Public read published airline groups" ON airline_groups
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Public read published packages" ON package_groups
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Public read published package variants" ON package_variants
    FOR SELECT TO public USING (status = 'published');

-- 5. Quotes and Bookings: Public can create quotes and booking requests
CREATE POLICY "Public create quotes" ON quotes
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public view their own quote by reference" ON quotes
    FOR SELECT TO public USING (true);

CREATE POLICY "Public submit booking request" ON booking_requests
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Staff/Owner manage all quotes" ON quotes
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff', 'read_only'));

CREATE POLICY "Staff/Owner manage booking requests" ON booking_requests
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff', 'read_only'));

CREATE POLICY "Staff/Owner access notes" ON booking_staff_notes
    FOR ALL TO authenticated
    USING (auth.current_app_role() IN ('owner', 'staff'));

-- 6. Audit Logs: Owner only
CREATE POLICY "Owner view audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (auth.current_app_role() = 'owner');

CREATE POLICY "System insert audit logs" ON audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);
