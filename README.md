# پاک انوار حرم (Pak Anwar Haram) — Travel & Tours Operations Platform & Public Portal

A complete, production-grade wholesale-to-retail Umrah travel platform and private back-office operations dashboard built for **پاک انوار حرم / Pak Anwar Haram**.

---

## 🕋 Brand & System Overview

**Pak Anwar Haram** aggregates wholesale hotel rate sheets, visa rules, transport matrices, airline group seat charts, and ready-made packages from major suppliers (e.g., Meezab Group, Al-Saboor Group, and partner wholesalers).

The platform provides:
1. **Private Operations Dashboard**: File ingestion pipeline, visual side-by-side review queue, hotel rate band resolver, airline inventory manager with atomic hold locks, package pricing & discount engine, booking enquiry CRM, and security audit logs.
2. **Public Umrah Portal**: 5-step interactive Custom Umrah Package Calculator, dynamic ready-made package listings, real-time PKR conversions, instant WhatsApp quotation generator, and enquiry snapshot submissions in both **Urdu RTL** and **English LTR**.
3. **Enterprise Security**: Row-Level Security (RLS) policies, strict role separation (Owner, Staff, Read-Only), and server-side wholesale price redaction ensuring supplier costs are never exposed publicly.

---

## 🚀 Key Modules & Architecture

### 1. Ingestion & Document Review Queue (`/admin/documents`)
- **Multi-Format Support**: Ingests JPG, PNG, WEBP, and multi-page PDFs simultaneously.
- **Durable Background Worker**: Offloads heavy OCR and document vision tasks to a resilient queue (`import-worker.ts`) with idempotent retries and partial-failure recovery.
- **Side-by-Side Review**: Visual preview of original source document alongside extracted, editable table rows.
- **Data Validation & Integrity**:
  - Automatically flags missing rates, unclear units, and unverified date boundaries.
  - **Zero-Value Protection**: Missing cells and `N/A` are kept as `null` and flagged for manual review—never silently coerced to zero.
  - **Explicit Approval & Publish**: Ingested files start in `draft` state. Changes require explicit review and approval before publishing to live inventory, with complete version history for rollback.

### 2. Hotel, Visa & Transport Domain Rules (`/admin/hotels`, `/admin/visa-transport`)
- **Nightly Stay Billing Engine**: Implements strict **check-in inclusive / checkout exclusive** calculation. Cross-band stays (e.g., crossing from Ramadan early band to late band) accurately split nights across applicable date bands.
- **Occupancy & Room Rate Logic**:
  - Handles `DBL-TPL-QD ROOM RATE` as a single quoted room rate applicable across Double, Triple, and Quad occupancies upon reviewer approval.
  - Distinguishes per-bed sharing from room-level rates.
  - Accurately detects `Quint 580` / `Quint 640` patterns and isolates 5-person occupancy into a distinct `quint` tier instead of contaminating standard sharing.
- **Visa & Transport Deduplication**:
  - Preserves visa-only, partial visa, and visa bundled with round-trip bus.
  - Detects bundled transport (e.g., 550 SAR visa w/ round-trip bus) and prevents double-charging when private or sector transport is configured.
  - Captures private transport routes (e.g., Jeddah to Makkah 01-04 PAX private vehicle) and per-city Ziyarat options (10 SAR).

### 3. Airline Group Inventory & Atomic Holds (`/admin/flights`)
- **Al-Saboor Multi-Page PDF Parser**: Extracts airline, flight numbers, sector pairs, outbound/inbound dates, departure times, and seat allotments across multiple pages.
  - Accurately pairs fixed return flights (e.g., PA 801/800 MUX–JED–MUX, 39 seats).
  - Handles PDFs lacking fares by marking them as `Request fare`, excluding unpriced seats from auto-checkout quotes until confirmed by staff.
- **Concurrency & Overbooking Prevention**:
  - Atomic seat allocation (`reported_seats`, `held_seats`, `confirmed_seats`).
  - Strict optimistic/atomic locking ensures staff holds cannot exceed available physical capacity (`held_seats + confirmed_seats <= reported_seats`).
  - Auto-expiring holds and staff confirmation requirements before issuance.

### 4. Ready-Made Packages & Hierarchical Discounts (`/admin/packages`, `/packages`)
- **UmrahGroups PDF Parser**: Imports parent group metadata (e.g., `UG-100698`) and child package variants (e.g., `UP-103710` with 13N Makkah, 7N Madinah, and occupancy rates: 268k Sharing, 280k Quad, 294k Triple, 323k Double).
- **Rule Precedence Engine**:
  - `occupancy` discount overrides `package` discount, which overrides `group` discount, which overrides `global` markup.
  - **Loss Prevention**: Warns and gates approval if applied discounts drop the final selling price below supplier wholesale cost.
  - Public packages dynamically compute live "From" prices based strictly on eligible, active published variants.

### 5. Public Umrah Calculator & WhatsApp Integration (`/calculator`)
- **5-Step Flow**:
  1. Travel Dates & Passenger Party Count (Adults, Children, Infants).
  2. Makkah Hotel Selection & Room Configuration.
  3. Madinah Hotel Selection & Room Configuration.
  4. Visa, Transport & Ziyarat Preferences.
  5. Flights & Summary Review.
- **WhatsApp Generator**: Formats a professional Urdu/English quotation summary with day-by-day itinerary breakdown, ready for one-click transmission to client WhatsApp or Pak Anwar Haram support (`+92-322-2188218`).
- **Quote Snapshots**: Locks exchange rates, hotel nightly rates, and visa fees into an immutable snapshot ID upon enquiry submission.

---

## 🛠️ Tech Stack & Database Architecture

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript.
- **Styling**: Tailwind CSS + Custom RTL Urdu font integration (`Noto Nastaliq Urdu`).
- **Icons**: Lucide React.
- **Database**: PostgreSQL (Supabase) with Row-Level Security (RLS).
- **Storage**: Private Supabase Storage buckets for supplier documents and customer enquiry attachments.

### Database Migrations (`/supabase/migrations/`)
- `001_initial_schema.sql`: 20 relational tables encompassing suppliers, documents, review rows, hotels, rate bands, flight groups, seat inventory, packages, rules, quotes, bookings, audit logs, and settings.
- `002_rls_policies.sql`: Production RLS policies enforcing:
  - **Owner**: Full read/write access across all financial, supplier, and settings records.
  - **Staff**: Operational read/write on bookings, holds, and draft uploads; read-only on sensitive margin settings.
  - **Read-Only**: Inspection-only permissions.
  - **Public / Anon**: Read-only access to published hotels, published flights, published packages, and public exchange rates. Wholesale rates (`cost_price_sar`, `cost_price_pkr`) are completely blocked.

---

## 🧪 Verified Acceptance Test Suite

An automated end-to-end verification test suite is included in `src/test/acceptance-tests.ts` and can be run via:

```bash
node scripts/run-tests.js
```

### Test Results Summary: **45 Passed / 0 Failed**
1. **Meezab Hotel Parsing**: Verified exact parsing of Ramadan sheets (06 Feb–27 Feb, 27 Feb–11 Mar) and Regular sheets (Till 30 Nov, 30 Nov–20 Dec, 20 Dec–06 Feb).
2. **Nightly Split Math**: Verified Double room crossing 26 Feb to 28 Feb calculates exact 160 SAR + 290 SAR = 450 SAR; Sharing per bed splits correctly.
3. **Quint Separation**: Verified Quint (580 / 640 SAR) isolates into 5-bed occupancy without contaminating standard sharing.
4. **Visa & Transport Deduplication**: Verified 550 SAR visa with bus does not double-charge for airport transfers.
5. **Al-Saboor Flight Groups**: Verified PA 801/800 MUX–JED–MUX 39 seats, fixed return pair, and "Request fare" exclusion.
6. **Package Pricing & Loss Prevention**: Verified UG-100698 variant discounts, rule precedence (occupancy > package > group), and below-cost safety triggers.
7. **Atomic Seat Holds**: Verified concurrent reservation holds block overbooking atomically.
8. **Security & Privacy**: Verified wholesale cost fields are completely redacted from public APIs.

---

## ⚙️ Environment Variables & Deployment Setup

Create a `.env.local` file in the project root:

```env
# Application
NEXT_PUBLIC_APP_URL=https://pakanwarharam.com
NEXT_PUBLIC_DEFAULT_CURRENCY=PKR
NEXT_PUBLIC_DEFAULT_SAR_RATE=74.50

# Supabase Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage Buckets (Private)
SUPABASE_SUPPLIER_DOCS_BUCKET=supplier-documents
SUPABASE_ENQUIRY_DOCS_BUCKET=enquiry-documents

# OCR / Document Vision Provider (Options: 'builtin_rule_parser' | 'gemini_vision' | 'google_document_ai')
DOCUMENT_PARSER_PROVIDER=builtin_rule_parser
GEMINI_API_KEY=your-gemini-api-key

# Initial Admin Credentials (Seed)
DEFAULT_OWNER_EMAIL=owner@pakanwarharam.com
DEFAULT_STAFF_EMAIL=staff@pakanwarharam.com
```

### Deploying to Vercel
1. Push repository to your Git provider (GitHub / GitLab / Bitbucket).
2. Link repository to Vercel.
3. In Project Settings > Environment Variables, supply the variables listed above.
4. Set Build Command: `next build`
5. Deploy.

---

## 📞 Business Contact Information

- **Brand**: پاک انوار حرم (Pak Anwar Haram Travel & Tours)
- **Head Office**: Sahiwal / Lahore, Pakistan
- **Landline**: +92-40-4222634
- **WhatsApp / Mobile**: +92-322-2188218 / +92-300-6922634
- **Email**: info@pakanwarharam.com
