import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/data/seed";
import { availableRooms, filterStays } from "@/lib/stay-search";
import { demoActions, getDemoState, quoteBooking, resetDemoData } from "@/lib/demo-store";
import type { SearchCriteria, BookingDraft } from "@/data/types";
const criteria: SearchCriteria = {
  destination: "",
  checkIn: "2027-06-05",
  checkOut: "2027-06-07",
  adults: 2,
  children: 0,
  rooms: 1,
};
beforeEach(() => resetDemoData());
describe("Marketplace search", () => {
  it("applies each quick filter to approved demo properties", () => {
    const s = createSeedState();
    expect(filterStays(s, criteria, []).every((p) => p.status === "approved")).toBe(true);
    expect(
      filterStays(s, criteria, ["Budget Stays"]).every(
        (p) => Math.min(...p.rooms.map((r) => r.pricePerNight)) <= 2000,
      ),
    ).toBe(true);
    expect(
      filterStays(s, criteria, ["Family Friendly"]).every((p) =>
        p.amenities.includes("familyRooms"),
      ),
    ).toBe(true);
    expect(
      filterStays(s, criteria, ["Parking Available"]).every((p) => p.amenities.includes("parking")),
    ).toBe(true);
    expect(
      filterStays(s, { ...criteria, destination: "Trimbakeshwar" }, []).every(
        (p) => p.location === "Trimbakeshwar",
      ),
    ).toBe(true);
  });
  it("excludes blocked dates and insufficient guest capacity", () => {
    const s = createSeedState();
    const p = s.properties[0]!;
    p.rooms.forEach((r) => r.blockedDates.push("2027-06-06"));
    expect(availableRooms(p, criteria, s)).toHaveLength(0);
    expect(availableRooms(s.properties[1]!, { ...criteria, adults: 999 }, s)).toHaveLength(0);
  });
});
describe("Shared booking and administration journey", () => {
  it("quotes, books, requests a refund, and updates the same booking", () => {
    const p = getDemoState().properties.find((p) => p.status === "approved")!;
    const r = p.rooms[0]!;
    const draft: BookingDraft = {
      propertyId: p.id,
      roomId: r.id,
      roomQuantity: 1,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      adults: 2,
      children: 0,
    };
    const q = quoteBooking(p, [{ room: r, quantity: 1 }], draft.checkIn, draft.checkOut);
    const b = demoActions.createBooking(
      draft,
      { name: "Test Traveller", email: "test@example.com", phone: "9999999999" },
      "Demo UPI",
    )!;
    expect(b.total).toBe(q.total);
    expect(b.paymentStatus).toBe("paid");
    expect(getDemoState().bookings.find((x) => x.id === b.id)?.ownerId).toBe(p.ownerId);
    demoActions.requestCancellation(b.id);
    expect(getDemoState().bookings.find((x) => x.id === b.id)?.status).toBe("refund_requested");
    demoActions.setBookingStatus(b.id, "cancelled", "refunded");
    expect(getDemoState().bookings.find((x) => x.id === b.id)?.paymentStatus).toBe("refunded");
  });
  it("prevents unavailable, blocked, oversized and unapproved reservations", () => {
    const p = getDemoState().properties[0]!;
    const r = p.rooms[0]!;
    const d: BookingDraft = {
      propertyId: p.id,
      roomId: r.id,
      roomQuantity: 1,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      adults: 2,
      children: 0,
    };
    const guest = { name: "Test", email: "test@example.com", phone: "9999999999" };
    expect(demoActions.createBooking({ ...d, roomQuantity: 0 }, guest, "Demo")).toBeNull();
    expect(demoActions.createBooking({ ...d, adults: 999 }, guest, "Demo")).toBeNull();
    demoActions.toggleRoomBlockedDate(p.id, r.id, "2027-06-06");
    expect(demoActions.createBooking(d, guest, "Demo")).toBeNull();
    demoActions.toggleRoomBlockedDate(p.id, r.id, "2027-06-06");
    demoActions.updateRoom(p.id, r.id, { inventory: 0 });
    expect(demoActions.createBooking(d, guest, "Demo")).toBeNull();
    demoActions.setPropertyStatus(p.id, "disabled");
    expect(demoActions.createBooking(d, guest, "Demo")).toBeNull();
  });
  it("publishes an approved application into searchable properties", () => {
    const application = getDemoState().applications.find((a) => a.status === "pending")!;
    expect(application).toBeTruthy();
    demoActions.approveApplication(application.id);
    expect(
      filterStays(getDemoState(), { ...criteria, checkIn: "", checkOut: "" }, []).some(
        (p) => p.name === application.propertyName,
      ),
    ).toBe(true);
  });
  it("shares wishlist, enquiry, room and settlement updates", () => {
    const p = getDemoState().properties[0]!;
    demoActions.toggleWishlist(p.id);
    expect(getDemoState().wishlist).toContain(p.id);
    demoActions.toggleWishlist(p.id);
    expect(getDemoState().wishlist).not.toContain(p.id);
    demoActions.updateRoom(p.id, p.rooms[0]!.id, { pricePerNight: 2345 });
    expect(getDemoState().properties[0]!.rooms[0]!.pricePerNight).toBe(2345);
    const e = demoActions.addEnquiry({
      groupName: "Family",
      contactPerson: "Test",
      phone: "123",
      email: "test@example.com",
      guests: 10,
      preferredLocation: "Nashik City",
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      budget: "2000",
      requirements: "Accessible rooms",
    });
    demoActions.markEnquiryContacted(e.id);
    expect(getDemoState().enquiries.find((x) => x.id === e.id)?.status).toBe("contacted");
    const b = getDemoState().bookings[0]!;
    demoActions.setSettlementStatus(b.id, "settled");
    expect(getDemoState().bookings[0]!.settlementStatus).toBe("settled");
  });
});
