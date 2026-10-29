# Mahakumbhstays

Premium hospitality marketplace prototype with shared, browser-local demo data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mahakumbhstays.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9b7ad85e-c52d-460b-8413-4c0db539f6c6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm â€” [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Premium marketplace upgrade

The existing TanStack Start project, sample properties, owners, bookings and shared localStorage schema are retained. This checkout initially contained a blank homepage and the complete demo data layer; the marketplace views now expose that existing functionality.

- `/`: floating search, working quick filters, editorial destination grid, wishlist, Quick View, three-stay comparison and group enquiries.
- `/stays`, `/wishlist`: searchable accommodation and saved stays.
- `/property/:slug`: fullscreen gallery, room selection, live quote, sticky booking summary and mobile booking sheet.
- `/bookings`: the active demo customer's reservations and cancellation requests.
- `/owner`: owner selection, listing edits, room creation, pricing, inventory, blocked dates and applications.
- `/admin`: property and application approvals, refunds, enquiries, commissions and settlements.
- `/image-credits.html`: sources and licenses for locally optimized destination photographs.

Bookings use a three-step checkout and simulated payments. Shared actions reject unavailable inventory, blocked dates, insufficient room capacity and unapproved properties. State remains browser-local; this prototype has no production authentication or payment processing.

### Verification

```sh
npm run typecheck
npm test
npm run build
```

For the browser suite, first run `npm run dev` in another terminal, then `npm run test:browser`. It uses installed Microsoft Edge on Windows. Override `BROWSER_PATH` for another Chromium executable and `BASE_URL` for another preview address (default `http://127.0.0.1:8080`). It starts an isolated browser profile, never your personal profile.

Browser checks cover 1440px desktop, 768px tablet and 390px mobile layouts, real destination and amenity filtering, guest selectors, wishlist persistence, Quick View, comparison, gallery navigation, successful and failed payment simulations, cancellations, admin approvals, owner edits and room prices, group enquiries and reduced motion. Screenshots and machine-readable results are saved in `artifacts/`.

Animations use native CSS with reduced-motion overrides. Property and dashboard views load on demand. Images below the hero load lazily, destination images are optimized local assets, and route titles/descriptions are server rendered. Dashboard and booking pages request no indexing.

## Signature UI refinement

The homepage keeps the requested â€œFind Your Perfect Stay for Nashik Kumbh 2027â€ headline and adds â€œYour Stay for Every Sacred Journey.â€ Desktop uses an editorial split hero with a floating, functional destination card and prominent search. Mobile uses a compact hero, an immediate search entry, a validated search sheet and safe-area-aware Home/Explore/Saved/Bookings navigation. Bottom navigation is absent from property, checkout and workspace routes and hidden while modal dialogs are open.

The five-place explorer has active destination previews and indices on desktop, native swipe snapping and pagination on mobile, and working Explore Stays actions. Journey collections apply the existing Trimbakeshwar, family-room and Igatpuri filters. Homepage featured stays use one leading card and four complementary cards; mobile uses a native swipe rail. Regular search result layouts remain unchanged. Demo Listing labels, Quick View, wishlist and comparison remain available.

`src/signature.css` scopes editorial layouts to the homepage. No technology-stack or demo-schema changes were needed. Deferred property and dashboard views display reduced-motion-aware skeletons.

The browser regression suite now verifies 360, 390, 430, 768, 1024 and 1440px widths, above-the-fold search, functional destination and journey selections, mobile search validation, swipe rails, navigation, booking/payment simulation and responsive owner/admin workspaces. See `artifacts/browser-report.json` and `artifacts/signature-*.png` for results and screenshots.

## Hero video, welcome enquiry and footer

The hero now hosts a local 10-second, 1280Ã—720 H.264 Kumbh Mela aerial clip (791,969 bytes). Audio is removed, playback is always muted and inline, and a pause/play control is available. Playback pauses off screen and in background tabs. Reduced-motion visitors see the poster until they explicitly choose Play. The footage is archival Prayagraj footage by Gaurav Kushwaha, used under the Pexels License and credited in `/image-credits.html`.

A responsive image-and-form enquiry popup opens after 850ms on each full homepage entry, unless another dialog is already open. It does not automatically interrupt property, booking or dashboard pages. Users can dismiss it or reopen it from the footer. The compact form asks only for name, phone and destination, then saves through the existing `addEnquiry` action. Existing search guest counts and dates are retained; additional details can be collected later. Entries appear in Admin â†’ Group enquiries with the â€œStay enquiryâ€ prefix. There is no outbound email or calling integration.

The navy and warm-saffron footer includes working destination filters, existing marketplace/dashboard navigation, an enquiry shortcut, group booking access, media credits and back-to-top. The inquiry popup keeps its side photograph on desktop and shows a compact image header on mobile.

The latest browser report contains 104 passing checks, including popup layout at all six screen widths, actual video playback, pause/play, reduced motion, form submission, footer interactions and existing booking/dashboard regressions. Popup screenshots are in `artifacts/enquiry-popup-*.png`; footer screenshots are in `artifacts/premium-footer-*.png`.
