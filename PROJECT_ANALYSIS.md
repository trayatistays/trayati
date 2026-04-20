# Trayati Stays - Comprehensive Codebase Reference

**Last Updated**: April 20, 2026  
**Purpose**: This document provides a complete overview of the Trayati Stays project for AI agents and developers. Read this before diving into the codebase to save time and context tokens.

---

## 🎯 Quick Overview

**Trayati Stays** is a production-grade, full-stack luxury property rental platform for premium Indian destinations (Dharamshala, Jaisalmer, Varkala, Kasar Devi). It's a **multi-vendor commission-based** marketplace with guest booking, host management, and admin operations.

**Core Business Model:**
- Guests book stays, pay via Razorpay
- Hosts list properties, receive commissions
- Admin manages platform, testimonials, blogs, promo codes
- GST-compliant invoicing

---

## 📊 Tech Stack at a Glance

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2.3 (App Router, Server Components) |
| **Language** | TypeScript 5 |
| **Frontend** | React 19.2.4, Tailwind CSS 4, Framer Motion 12.38.0 |
| **Database** | Supabase (PostgreSQL) |
| **Cache/Locks** | Upstash Redis |
| **Auth (Guest/Host)** | Clerk 7.0.12 |
| **Auth (Admin)** | Custom session-based (username/password) |
| **Payments** | Razorpay 2.9.6 |
| **Email** | Resend 6.10.0 |
| **Deployment** | Vercel |
| **Validation** | Zod 4.3.6 |
| **Linting** | ESLint 9 |
| **Storage** | Supabase Storage + Cloudinary + Instagram CDN |
| **Image Processing** | Sharp 0.34.5 |

---

## 🗂️ Project Structure

### Root-Level Files
```
next.config.ts          - Advanced Next.js config (image optimization, caching, CSP headers)
tsconfig.json           - TypeScript config with @ path alias
package.json            - Dependencies + scripts
env.example             - Environment variables template
eslint.config.mjs       - Linting rules
postcss.config.mjs      - Tailwind CSS processing
```

### Key Directories

```
src/
├── app/                 - Next.js App Router (pages + API routes)
│   ├── page.tsx         - Homepage
│   ├── layout.tsx       - Root layout (Clerk, Analytics, SEO)
│   ├── admin/           - Protected admin dashboard
│   ├── host/            - Host portal (authenticated)
│   ├── booking/         - Multi-step booking UI
│   ├── property/[id]/   - Single property detail + booking widget
│   ├── api/             - 25+ REST endpoints
│   └── [other-routes]/  - About, Contact, Solutions, etc.
│
├── lib/                 - Business logic & utilities
│   ├── types.ts         - Core domain types
│   ├── schemas.ts       - Zod validation schemas
│   ├── db.ts            - Database queries + case conversion
│   ├── pricing.ts       - Price calculation engine
│   ├── booking/         - Booking subsystem
│   ├── admin-auth.ts    - Admin session authentication
│   ├── redis.ts         - Upstash client + rate limiter
│   ├── email.ts         - Resend email templates
│   ├── invoice.ts       - GST-compliant invoicing
│   ├── review.ts        - Review system
│   ├── host.ts          - Host CRUD operations
│   ├── stays-api.ts     - Server-side stay fetching
│   └── [other-modules]/ - Instagram, Content, Promo Codes, etc.
│
├── components/          - Reusable React components
│   ├── booking-calendar.tsx
│   ├── booking-checkout-card.tsx
│   ├── property-photo-carousel.tsx
│   ├── hero-section.tsx
│   ├── navbar.tsx
│   └── [others]/
│
├── data/                - Static content
│   ├── featured-stays.ts
│   ├── testimonials-and-blogs.ts
│   ├── social-links.ts
│   └── experience-types.ts
│
└── hooks/               - Custom React hooks
    ├── use-stays.ts     - Fetches properties (with sessionStorage cache)
    └── use-cached-fetch.ts
```

---

## 🗄️ Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| **stays** | Property listings (JSONB for rooms, amenities, meals, cancellation policies, photos) |
| **bookings** | Guest reservations (dates, payment status, guest details) |
| **invoices** | Tax records (invoice number, GST breakdown, payment reference) |
| **reviews** | Guest feedback (5-star + category ratings) |
| **hosts** | Property owners (commission tracking, KYC: GST, PAN, bank) |
| **stay_hosts** | Host-to-property mappings (ownership percentage) |
| **reservations** | External calendar blocks from iCal sources |
| **blocked_dates** | Unavailable date ranges (per stay/room) |
| **bookings_sources** | External iCal feed configurations |
| **testimonials** | Platform reviews |
| **experiences** | Blog posts/travel stories |
| **contact_submissions** | Contact form entries |
| **promo_codes** | Discount codes (usage limits, validity) |
| **commissions** | Per-booking commission records |

**Key Patterns:**
- Database uses `snake_case` columns
- Code uses `camelCase` (conversion via `toCamelCase()`/`toSnakeCase()`)
- JSONB columns store complex data (photos array, amenities detail, etc.)

---

## 🔌 API Routes Reference (25+)

### Public Endpoints
- `GET /api/stays` - List/search properties
- `GET /api/stays/[id]` - Single property details
- `GET /api/check-availability` - Date availability lookup
- `GET /api/experiences` - Blog posts
- `GET /api/destinations` - Destination info
- `GET /api/testimonials` - Guest reviews
- `GET /api/instagram-feed` - Instagram carousel
- `GET /api/ical-export/[stayId]` - Export as iCal feed

### Booking Flow
- `POST /api/create-booking` - Initialize booking
- `POST /api/create-order` - Generate Razorpay order
- `POST /api/verify-payment` - Client-side payment verification
- `POST /api/payment-webhook` - Razorpay webhook (creates booking + invoice)
- `GET /api/bookings` - Guest's bookings
- `GET /api/bookings/[id]` - Single booking details

### Availability/Locking
- `POST /api/create-lock` - Acquire booking lock (Redis)
- `POST /api/release-lock` - Release booking lock
- `POST /api/reservations` - Sync external calendar (iCal)

### Host Portal
- `GET /api/host/stays` - Host's properties
- `GET /api/host/bookings` - Host's reservations
- `GET /api/host/earnings` - Commission tracking

### Admin Operations
- `/api/admin/stays` - Create/list/update stays
- `/api/admin/bookings` - Manage bookings
- `/api/admin/hosts` - Host management
- `/api/admin/submissions` - Property applications
- `/api/admin/promo-codes` - Discount management
- `/api/admin/destinations` - Platform config
- `/api/admin/upload` - Media upload/delete
- `/api/invoices/[invoiceNumber]` - Retrieve invoice

### Cron/Scheduled
- `POST /api/cron/ical-sync` - Sync external iCal sources (Vercel cron)

### Utilities
- `POST /api/contact` - Contact form submission
- `POST /api/promo-codes/validate` - Validate discount code
- `POST /api/reviews` - Submit guest review

---

## 🔐 Authentication & Authorization

### Guest/Host Authentication
- **Provider**: Clerk
- **Method**: OAuth (Google, etc.) or Email
- **Flow**: Sign up → Create Clerk user → Store in Supabase → Access booking/portal
- **Component**: [clerk-shell.tsx](src/components/clerk-shell.tsx)

### Admin Authentication
- **Provider**: Custom session-based
- **Method**: Username & password
- **Validation**: [admin-auth.ts](src/lib/admin-auth.ts)
  - Function: `validateAdminCredentials(username, password)`
  - Returns: `{ isValid: boolean }`
- **Session**: Cookie (`ADMIN_COOKIE_NAME = "trayati_admin_session"`)
- **Credentials**: Set via env vars `TRAYATI_ADMIN_USERNAME` & `TRAYATI_ADMIN_PASSWORD`

### Protected Routes Check
```typescript
// Example from API route
const isAdmin = await isAdminAuthenticated();
if (!isAdmin) return json({ error: "Unauthorized" }, { status: 401 });
```

---

## 💳 Payment Processing (Razorpay)

**Flow:**
1. Guest completes booking info → `POST /api/create-order`
2. Razorpay order created (unique `order_id`)
3. Client initiates payment via Razorpay Checkout
4. Payment success → Razorpay webhook hits `POST /api/payment-webhook`
5. Webhook verifies signature → Creates booking + invoice in database
6. Email confirmation sent

**Key Files:**
- [booking/razorpay.ts](src/lib/booking/razorpay.ts) - Order generation, webhook verification
- [booking/db.ts](src/lib/booking/db.ts) - Create booking, invoice, commission records

**Required Env Vars:**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

---

## 💰 Pricing Engine

**Located**: [src/lib/pricing.ts](src/lib/pricing.ts)

**Calculation:**
```
Base Price = nightly_rate × number_of_nights
+ Cleaning Fee (fixed or % of base)
+ Service Fee (% of base)
+ Extra Guest Fee (if applicable)
+ GST (18% of subtotal)
- Promo Code Discount (if valid)
= Final Price
```

**Code Snippet:**
```typescript
const pricing = calculatePricing(nightlyRate, nights, guests, {
  cleaningFee,
  cleaningFeeType,
  serviceFeePct,
  gstRate,
  promoCode
});
```

**Returns:**
- `subtotal`
- `cleaningFee`
- `serviceFee`
- `gstAmount`
- `extraGuestFee`
- `discountAmount`
- `totalPrice`

---

## 📧 Email Service (Resend)

**Triggered Events:**
- Booking confirmation email (to guest + host + admin)

**Implementation**: [src/lib/email.ts](src/lib/email.ts)
- HTML email templates
- Fallback to console logging if Resend unavailable

**Required Env Var:**
- `RESEND_API_KEY`
- `ADMIN_EMAIL`

---

## 🔄 Booking Availability & Concurrency Control

### Pessimistic Locking (Redis)
**Purpose**: Prevent double-booking when multiple guests book same dates simultaneously

**Flow:**
1. Guest selects dates → `POST /api/create-lock`
2. Redis key created: `booking_lock:{stayId}:{roomId}:{startDate}` (TTL: 10 min)
3. If lock exists, booking rejected
4. Guest pays → `POST /api/payment-webhook` → Lock released
5. If payment fails or timeout → Lock auto-expires, room available again

**Files**: [src/lib/booking/lock.ts](src/lib/booking/lock.ts)

### iCal Synchronization
**Purpose**: Sync availability from external sources (Airbnb, Booking.com, etc.) via iCal feeds

**Process:**
- Admin adds iCal feed URL in `/api/admin/reservations`
- Cron job (`/api/cron/ical-sync`) runs periodically
- Parses iCal events → Creates `blocked_dates` entries in database
- Next.js App Router caching ensures sub-second availability checks

**Files**: [src/lib/booking/ical.ts](src/lib/booking/ical.ts)

---

## 📱 Frontend State Management

### Server-Side (Primary)
- **Default approach**: Next.js Server Components
- **Queries**: Direct database via Supabase admin SDK
- **Rendering**: Components render on server → Send HTML to client

### Client-Side (Hybrid)
- **Interactive forms**: "use client" directive
- **Animations**: Framer Motion (state-driven)
- **Data fetching**: `useStays()` hook with sessionStorage cache (5-min stale time)

### Caching Strategy
```
stays:        stale: 300s, revalidate: 3600s, expire: 86400s (1 day)
testimonials: stale: 300s, revalidate: 3600s, expire: 86400s
experiences:  stale: 300s, revalidate: 3600s, expire: 86400s
instagram:    stale: 300s, revalidate: 1800s, expire: 43200s (12 hrs)
```
**Implementation**: [next.config.ts](next.config.ts) `cacheLife()` function

---

## 🖼️ Image Handling

### Processing Pipeline
1. **Upload**: Admin uploads image → `/api/admin/upload`
2. **Compression**: Sharp compresses to multiple formats (AVIF, WebP, JPEG)
3. **Storage**: Supabase Storage bucket (`trayati-media`)
4. **Delivery**: Next.js Image component with custom loader

### Supported Formats
- AVIF (newest, best compression)
- WebP (modern, good compression)
- JPEG (fallback)

### Remote Image Sources
- Unsplash (photography CDN)
- Cloudinary (image transformation)
- Supabase Storage
- Instagram CDN

**Files**:
- [src/lib/client-image-compress.ts](src/lib/client-image-compress.ts) - Client-side compression
- [src/lib/supabase-image.ts](src/lib/supabase-image.ts) - Supabase image URL handling
- [next.config.ts](next.config.ts) - Image optimization config

---

## 📊 Key Business Logic Modules

### Booking System [src/lib/booking/]
- **availability.ts** - Check date availability (bookings + blocked_dates)
- **lock.ts** - Redis pessimistic locking
- **ical.ts** - iCal feed parsing
- **razorpay.ts** - Payment order generation, webhook verification
- **db.ts** - Booking CRUD, invoice creation, commission calculation

### Pricing [src/lib/pricing.ts]
- Dynamic price calculation
- Promo code application
- GST computation

### Reviews [src/lib/review.ts]
- Create guest review (5-star + category ratings)
- Fetch reviews (with pagination)
- Admin response to reviews

### Invoicing [src/lib/invoice.ts]
- Auto-generate invoice number
- GST-compliant breakdown
- Invoice retrieval by number

### Promo Codes [src/lib/promo-code.ts]
- Validate discount codes (percentage/fixed)
- Check usage limits, validity periods
- Apply to booking

---

## 🔧 Important Configuration Files

### Environment Variables [env.example]
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Admin Auth
TRAYATI_ADMIN_USERNAME
TRAYATI_ADMIN_PASSWORD

# Supabase
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=trayati-media

# Upstash Redis
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Razorpay
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET

# Resend (Email)
RESEND_API_KEY
ADMIN_EMAIL

# Instagram
INSTAGRAM_ACCESS_TOKEN

# Security
CRON_SECRET (for Vercel cron validation)
```

### Next.js Configuration [next.config.ts]
- **Image Optimization**: 6 device sizes, 4 quality levels, AVIF/WebP/JPEG
- **cacheLife()**: Component-level incremental static regeneration
  - `stays`: 300s stale, 3600s revalidate, 86400s expire
  - `testimonials`: Same as stays
  - `experiences`: Same as stays
  - `instagram`: 300s stale, 1800s revalidate, 43200s expire
- **CSP Headers**: Restrict external scripts
- **Cache-Control**: max-age=31536000 for static assets
- **Remote Patterns**: Unsplash, Cloudinary, Supabase, Instagram

### TypeScript Configuration [tsconfig.json]
- **Path Alias**: `@/*` → `./src/*`
- **Strict Mode**: Enabled
- **Target**: ES2017
- **Module**: ESNext

---

## 🎨 UI Components Library

### Key Components
| Component | File | Purpose |
|-----------|------|---------|
| **Booking Calendar** | booking-calendar.tsx | Date range picker |
| **Checkout Card** | booking-checkout-card.tsx | Price breakdown + payment |
| **Property Carousel** | property-photo-carousel.tsx | Image gallery |
| **Hero Section** | hero-section.tsx | Landing page hero |
| **Featured Stays** | featured-stays-section.tsx | Property grid |
| **Navbar** | navbar.tsx | Top navigation |
| **Footer** | site-footer.tsx | Footer links + social |
| **Contact Form** | contact-form.tsx | Contact submission |
| **Testimonials** | testimonials-section.tsx | Guest reviews carousel |
| **Property Details** | property-room-details.tsx | Room/amenity info |

### Design System
- **Framework**: Tailwind CSS 4
- **Animations**: Framer Motion 12.38.0
- **Icons**: React Icons 5.6.0
- **Colors**: Custom Tailwind theme
- **Responsive**: Mobile-first approach

---

## 📈 Monitoring & Analytics

### Vercel Analytics
- Page views, user interactions
- Performance metrics

### Vercel Speed Insights
- Web Vitals (LCP, FID, CLS)
- Real user metrics

### Custom Tracking
- Booking source attribution (utm_source parameter)
- Host earnings dashboard (commission calculations)

---

## 🚀 Deployment & Performance

### Hosting
- **Platform**: Vercel
- **Region**: Auto-selected based on region
- **Cold Start**: ~500ms (typical Next.js)
- **Build Time**: ~2-3 min (incremental)

### Performance Optimizations
1. **Image Optimization**: AVIF/WebP + lazy loading
2. **Server Components**: Reduced client-side JavaScript
3. **ISR (cacheLife)**: Stale-while-revalidate pattern
4. **Redis Caching**: Availability cache (< 10ms lookup)
5. **Compression**: Enabled for responses
6. **CDN**: Vercel Edge Network

---

## 🔍 Development Workflow

### Scripts
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Database Scripts
```bash
ts-node scripts/seed.ts                      # Initial data seeding
ts-node scripts/seed-content.mjs             # Testimonials/blogs seeding
ts-node scripts/migrate-images.ts            # Image migration to Supabase
ts-node scripts/compress-and-reseed.ts       # Image compression
ts-node scripts/test-redis.ts                # Redis health check
ts-node scripts/verify-redis.ts              # Redis verification
```

---

## 📝 Coding Conventions

### Case Conversion
- **Database**: `snake_case` columns (e.g., `user_id`, `created_at`)
- **JavaScript**: `camelCase` variables (e.g., `userId`, `createdAt`)
- **Conversion**: Automatic via `toCamelCase()` and `toSnakeCase()` in [db.ts](src/lib/db.ts)

### Error Handling
```typescript
try {
  const result = await db.query(...);
  return result;
} catch (error) {
  console.error("Context:", error);
  throw new Error("Descriptive error message");
}
```

### Validation
- **Schema Definition**: Zod in [schemas.ts](src/lib/schemas.ts)
- **API Routes**: Parse + validate request body
- **Client-side**: Form validation before submission

### Type Safety
- **Strict Mode**: TypeScript strict mode enabled
- **Type Definitions**: [types.ts](src/lib/types.ts)
- **No `any`**: Avoid generic types; use specific types

### API Response Format
```typescript
// Success
return Response.json({ data: result }, { status: 200 });

// Error
return Response.json({ error: "Message" }, { status: 400 });
```

### Component Patterns
```typescript
// Server Component (default)
export default async function Page() { ... }

// Client Component
"use client";
export default function Component() { ... }

// With Suspense
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

---

## 🐛 Common Patterns & Debugging

### Checking Admin Access
```typescript
import { isAdminAuthenticated } from "@/lib/admin-auth";

const isAdmin = await isAdminAuthenticated();
if (!isAdmin) return new Response("Unauthorized", { status: 401 });
```

### Fetching Data
```typescript
// Server-side
import { getStayById } from "@/lib/stays-api";
const stay = await getStayById(id);

// Client-side with cache
import { useStays } from "@/hooks/use-stays";
const { stays, isLoading } = useStays();
```

### Database Operations
```typescript
import { db } from "@/lib/db";

// Query with automatic case conversion
const bookings = await db("bookings").where({ user_id: userId });
// Returns: [{ userId, stayId, createdAt, ... }]
```

### Redis Operations
```typescript
import { redis } from "@/lib/redis";

// Cache example
const cached = await redis.get(`stays:${id}`);
if (cached) return JSON.parse(cached);
```

---

## 📚 Key File Map

| Task | File |
|------|------|
| Add new API endpoint | `src/app/api/[feature]/route.ts` |
| Add new page/route | `src/app/[route]/page.tsx` |
| Add new component | `src/components/[component].tsx` |
| Add business logic | `src/lib/[module].ts` |
| Add validation schema | `src/lib/schemas.ts` |
| Add type definition | `src/lib/types.ts` |
| Add email template | `src/lib/email.ts` |
| Modify pricing | `src/lib/pricing.ts` |
| Manage bookings | `src/lib/booking/*.ts` |
| Admin authentication | `src/lib/admin-auth.ts` |
| Database schema | `supabase-schema.sql` |
| Next.js config | `next.config.ts` |
| Environment setup | `env.example` |

---

## ⚙️ Common Development Tasks

### Adding a New Feature (e.g., New API Endpoint)

1. **Create API route**: `src/app/api/[feature]/route.ts`
2. **Add validation schema**: Update `src/lib/schemas.ts` with Zod schema
3. **Add business logic**: Create `src/lib/[feature].ts` if needed
4. **Add database migration**: Create migration in `supabase/migrations/`
5. **Test locally**: `npm run dev` → Test endpoint at `http://localhost:3000/api/[feature]`
6. **Update types**: Add types to `src/lib/types.ts`
7. **Add API documentation**: Update this file if needed

### Adding a New UI Page

1. **Create page file**: `src/app/[route]/page.tsx`
2. **Create layout if needed**: `src/app/[route]/layout.tsx`
3. **Create components**: `src/components/[page-component].tsx`
4. **Add to navigation**: Update `navbar.tsx` if public route
5. **Test locally**: `npm run dev` → Navigate to route

### Deploying to Production

1. **Build locally**: `npm run build` (ensure no errors)
2. **Commit to Git**: Push to main branch
3. **Vercel auto-deploys**: From GitHub webhook
4. **Monitor**: Check Vercel Analytics for performance

---

## 🔒 Security Considerations

- **HTTPS Only**: All external APIs use HTTPS
- **Rate Limiting**: Upstash Ratelimit (5 requests/10s default)
- **Admin Auth**: Username/password via env vars (never hardcoded)
- **Payment Webhook**: Razorpay signature verification
- **CSP Headers**: Restrict inline scripts
- **Environment Variables**: Never commit `.env.local`
- **Clerk OAuth**: Secure OAuth flow for guest/host signup

---

## 📞 Quick Contacts & Resources

- **Database**: Supabase Dashboard (https://supabase.com)
- **Payment**: Razorpay Dashboard (https://razorpay.com)
- **Email**: Resend Dashboard (https://resend.com)
- **Cache**: Upstash Console (https://console.upstash.com)
- **Deployment**: Vercel Dashboard (https://vercel.com)
- **Clerk**: Clerk Dashboard (https://dashboard.clerk.com)

---

## 🎓 Before Starting Any Work

**Checklist:**
- ✅ Read this document to understand architecture
- ✅ Check `env.example` for required environment variables
- ✅ Review the specific feature/module in `src/lib/` if modifying business logic
- ✅ Check `next.config.ts` for caching behavior if adding new API/page
- ✅ Verify type definitions in `src/lib/types.ts` match your changes
- ✅ Run `npm run lint` before committing
- ✅ Test locally: `npm run dev`
- ✅ Check Supabase schema for database changes

---

**This document is your reference. Update it as the project evolves. Happy coding! 🚀**
