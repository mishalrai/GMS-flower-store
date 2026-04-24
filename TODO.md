# GMN Flower Store — TODO

## 🔴 Critical (Production Blockers)

- [x] **Database Migration** — Migrated all JSON data to PostgreSQL via Docker + Prisma ORM
- [x] **Cart & Wishlist Persistence** — Add `localStorage` middleware to Zustand stores so cart/wishlist survives page refresh
- [ ] **API Input Validation** — Add Zod schemas to all POST/PUT API routes to prevent malformed data
- [ ] **Admin Password Security** — Replace plaintext `.env` password with bcrypt-hashed passwords and a proper users table

---

## 🟡 High Priority (UX & Business Impact)

- [ ] **SEO Metadata** — Add `generateMetadata()` to product, shop, and category pages (title, description, OG image)
- [ ] **Order Notifications** — Send WhatsApp/SMS to store owner on new order; send confirmation to customer
- [ ] **Shareable Filters** — Sync category/price/search filters to URL query params so pages are linkable
- [ ] **Out-of-Stock Enforcement** — Block adding out-of-stock items to cart and prevent checkout
- [ ] **Image Alt Text** — Allow custom alt text per image in the media library for SEO and accessibility

---

## 🟠 Medium Priority (Admin & Operations)

- [ ] **Pagination** — Add offset/limit pagination to all admin list pages (products, orders, messages, reviews)
- [ ] **Analytics Cleanup** — Implement TTL/archival for analytics records to prevent unbounded file/DB growth
- [ ] **Media Library** — Add duplicate detection, folder/tag organization, and bulk delete
- [ ] **JWT Auto-Refresh** — Implement sliding session or refresh token so admin sessions don't expire mid-work
- [ ] **CSRF Protection** — Add CSRF tokens or enforce same-site cookie policy on all mutation endpoints

---

## 🟢 Nice to Have (Polish)

- [ ] **Mobile Menu Auto-Close** — Automatically close mobile nav menu after clicking a link
- [ ] **Error Boundaries** — Add React error boundaries around key sections for graceful failure UI
- [ ] **Loading Skeletons** — Add skeleton loaders on shop/product page initial load and admin mutations
- [ ] **Customer Review Submission** — Allow customers to submit reviews directly from their order confirmation page
- [ ] **Wishlist Sharing** — Generate shareable wishlist links (useful for gift suggestions)
- [ ] **PWA / Offline Support** — Implement service worker for offline browsing of cached products

---

## 🔐 Security Improvements

### 🚨 Critical Security

- [ ] **Rotate Secrets Immediately** — Remove `.env.local` from git history; rotate `ADMIN_PASSWORD` and `ADMIN_SECRET` to strong values
- [ ] **Auth on All Mutating APIs** — Add JWT verification to every POST/PUT/DELETE route (products, categories, banners, FAQs, settings, media, reviews, messages)
- [ ] **File Upload Validation** — Enforce allowed MIME types (`image/jpeg`, `image/png`, `image/webp`) and max file size (5MB) before processing
- [ ] **Path Traversal Fix** — Sanitize file paths in media deletion; validate resolved path stays within `public/uploads/` directory
- [ ] **Enforce Secure Cookie** — Set `secure: true` always (not only in production) and change `sameSite` to `strict`
- [ ] **Rate Limiting** — Add rate limits on `/api/auth/login` (5/hr), `/api/orders` (10/min), `/api/upload` (20/hr), and `/api/analytics/track`

### 🔴 High Security

- [ ] **Order Price Validation** — Recalculate order total server-side; never trust client-supplied `total` field
- [ ] **Protect Orders by Phone** — Require authentication to query orders by phone number (currently exposes all customer data publicly)
- [ ] **Security Headers** — Add HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` in `next.config.ts`
- [ ] **Sanitize Analytics Input** — Validate all analytics tracking fields with Zod; prevent XSS via stored page/referrer values
- [ ] **Fix External Geo API** — Use HTTPS for `ip-api.com` calls; validate IP format before sending; handle failures gracefully
- [ ] **Shorten JWT Expiry** — Reduce from 24h to 1h; implement refresh token for persistent admin sessions
- [ ] **Sanitize Error Responses** — Never expose stack traces or internal errors to clients; log server-side only

### 🟠 Medium Security

- [ ] **Upgrade JWT Algorithm** — Migrate from `HS256` to `RS256` (asymmetric) for stronger token security
- [ ] **Secure Random IDs** — Replace `Math.random()` for file naming with `crypto.randomBytes(16).toString('hex')`
- [ ] **Validate Env Variables at Startup** — Throw on missing `ADMIN_SECRET` / `ADMIN_PASSWORD` rather than silently falling back
- [ ] **Add Audit Logging** — Log all admin actions (login, product edits, order status changes, deletions) with IP and timestamp
- [ ] **Input Length Limits** — Cap all string inputs (message body, product name, etc.) to prevent memory exhaustion

### 🟢 Low Security

- [ ] **Configurable Store Location** — Move hardcoded Gauradaha coordinates in `LocationPicker.tsx` to settings to avoid leaking exact business location
- [ ] **Virus Scan on Uploads** — Integrate ClamAV or a cloud scan API to check uploaded files for malware

---

## ✅ Completed

- [x] Next.js App Router with server/client component separation
- [x] JWT-based admin authentication with edge middleware
- [x] Image optimization pipeline (Sharp + crop tool + media library)
- [x] Visitor analytics with geolocation heatmap
- [x] Dual payment support (Cash on Delivery + QR code with screenshot upload)
- [x] Mobile-responsive layout (cart sidebar, mobile menu, responsive grids)
- [x] Rich text editor for product descriptions (React Quill)
- [x] Delivery location picker with Leaflet maps
