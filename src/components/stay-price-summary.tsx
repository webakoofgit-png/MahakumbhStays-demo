import type { Property, SearchCriteria } from "@/data/types";
import { quoteBooking, useDemoStore } from "@/lib/demo-store";
import { availableRooms, money } from "@/lib/stay-search";
import { useLang } from "@/lib/i18n";

export function StayPriceSummary({ property, criteria }: { property: Property; criteria: SearchCriteria }) {
  const { state } = useDemoStore();
  const { lang } = useLang();
  if (!criteria.checkIn || !criteria.checkOut || criteria.checkOut <= criteria.checkIn) return null;
  const room = availableRooms(property, criteria, state).sort((a, b) => a.pricePerNight - b.pricePerNight)[0];
  if (!room) return null;
  const quote = quoteBooking(property, [{ room, quantity: criteria.rooms }], criteria.checkIn, criteria.checkOut);
  const labels = lang === "mr" ? { total: "एकूण अंदाजित किंमत", rooms: "खोल्या", nights: "रात्री", base: "खोल्यांची किंमत", fees: "डेमो कर व शुल्क (8%)", note: "खोलीच्या निवडीनुसार अंतिम किंमत बदलेल." } : lang === "hi" ? { total: "कुल अनुमानित कीमत", rooms: "कमरे", nights: "रातें", base: "कमरों की कीमत", fees: "डेमो कर और शुल्क (8%)", note: "चुने गए कमरे के अनुसार अंतिम कीमत बदलेगी।" } : { total: "Estimated trip total", rooms: "rooms", nights: "nights", base: "Room subtotal", fees: "Demo taxes & fees (8%)", note: "Final price depends on your selected room." };
  return <details className="stay-price-summary">
    <summary><span>{labels.total}<small>{criteria.rooms} {labels.rooms} · {quote.nights} {labels.nights}</small></span><strong>{money(quote.total)}</strong></summary>
    <div><span>{labels.base}<strong>{money(quote.subtotal)}</strong></span><span>{labels.fees}<strong>{money(quote.fees)}</strong></span><small>{room.name} · {labels.note}</small></div>
  </details>;
}
