# MahakumbhStays.com — Build Roadmap

Full booking-marketplace prototype per uploaded master brief (Nashik Kumbh 2027).

## Phase 1 — Foundation
- [ ] Design tokens (navy #172B4D / saffron #E89136) in src/styles.css; fonts via __root link
- [ ] i18n (EN/हिंदी/मराठी) for core customer-facing labels
- [ ] Shared demo data store (versioned seed + localStorage, subscribe API)
- [ ] 10 seeded properties with rooms, amenities, distances, images, ratings
- [ ] Header (sticky nav, language selector, demo role switcher, mobile menu) + Footer

## Phase 2 — Public site
- [ ] Homepage: hero + search widget, trust strip, category cards, featured stays, locations, why-us, how-it-works, partner CTA, FAQ, footer
- [ ] /stays with filters, sorting, empty state, reset
- [ ] /stays/:slug detail: gallery + modal, rooms, sticky summary, amenities, reviews, similar
- [ ] Content pages: about, contact, nashik-kumbh-2027, faq, privacy-policy, terms, cancellation-policy, group-booking

## Phase 3 — Booking flow
- [ ] /booking/guest-details (validated form + summary + progress)
- [ ] /booking/review (editable summary, terms checkbox)
- [ ] /booking/payment (demo UPI/card/netbanking, success/fail simulation)
- [ ] /booking/confirmation/:id (voucher download, refresh-safe)

## Phase 4 — Customer account
- [ ] /account, /account/bookings, /account/bookings/:id, /account/wishlist, demo cancellation request

## Phase 5 — Partner
- [ ] /partner/register (+ saved applications → admin queue)
- [ ] /partner/dashboard, properties, properties/new, rooms, availability, reservations, earnings, profile

## Phase 6 — Admin
- [ ] /admin/dashboard, approvals, properties, owners, bookings, customers, inventory, commissions, payments, refunds, reports, settings (incl. Reset Demo Data)
- [ ] Approvals drive public visibility; commission rate drives new bookings only

## Phase 7 — QA
- [ ] Playwright: customer journey, owner journey, admin journey
- [ ] head() metadata per route, noindex for booking/property pages
- [ ] Build errors check, responsive spot-check
