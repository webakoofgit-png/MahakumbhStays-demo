import type { Property, SearchCriteria, DemoState } from "@/data/types";
import { DESTINATION_MATCH } from "@/data/seed";
import { nightsBetween } from "./demo-store";
export const priceOf = (p: Property) => Math.min(...p.rooms.map((r) => r.pricePerNight));
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export function availableRooms(p: Property, c: SearchCriteria, state: DemoState) {
  return p.rooms.filter((r) => {
    if (r.blockedDates.some((d) => d >= c.checkIn && d < c.checkOut)) return false;
    const used = state.bookings
      .filter(
        (b) =>
          b.propertyId === p.id &&
          b.status !== "cancelled" &&
          b.checkIn < c.checkOut &&
          b.checkOut > c.checkIn,
      )
      .reduce(
        (n, b) => n + b.rooms.filter((x) => x.roomId === r.id).reduce((a, x) => a + x.quantity, 0),
        0,
      );
    return r.inventory - used >= c.rooms && r.maxOccupancy * c.rooms >= c.adults + c.children;
  });
}
export function filterStays(
  state: DemoState,
  criteria: SearchCriteria,
  chips: string[],
  maxPrice = 20000,
) {
  return state.properties
    .filter((p) => p.status === "approved")
    .filter(
      (p) =>
        !criteria.destination ||
        (DESTINATION_MATCH[criteria.destination] ?? [criteria.destination]).includes(p.location),
    )
    .filter((p) => priceOf(p) <= maxPrice)
    .filter(
      (p) => !chips.includes("Premium Comfort") || ["Premium Hotel", "Resort"].includes(p.category),
    )
    .filter((p) => !chips.includes("Group Accommodation") || p.maxGuests >= 6)
    .filter((p) => !chips.includes("Budget Stays") || priceOf(p) <= 2000)
    .filter((p) => !chips.includes("Family Friendly") || p.amenities.includes("familyRooms"))
    .filter(
      (p) =>
        !chips.includes("Near Trimbakeshwar") ||
        p.location === "Trimbakeshwar" ||
        p.landmarks.some((l) => l.name.includes("Trimbakeshwar") && l.km <= 5),
    )
    .filter((p) => !chips.includes("Parking Available") || p.amenities.includes("parking"))
    .filter(
      (p) =>
        !criteria.checkIn ||
        !criteria.checkOut ||
        (nightsBetween(criteria.checkIn, criteria.checkOut) > 0 &&
          availableRooms(p, criteria, state).length > 0),
    );
}
