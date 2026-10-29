import { useSyncExternalStore } from "react";
import { useEffect, useState } from "react";
import { createSeedState, DEMO_FEES_RATE, SEED_VERSION } from "@/data/seed";
import type {
  Booking,
  BookingDraft,
  DemoState,
  PartnerApplication,
  Property,
  PropertyStatus,
  RoomType,
  SearchCriteria,
  SupportTicket,
  GroupEnquiry,
} from "@/data/types";

const STORAGE_KEY = "mahakumbhstays-demo-state";

const seed = createSeedState();
let state: DemoState = seed;
const listeners = new Set<() => void>();
let hydrated = false;

// NOTE: LocalStorage demo persistence does not provide real multi-user
// inventory locking, transaction safety or server-side authorisation. All
// writes here are client-side demo state only.
function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — demo keeps working in memory */
  }
}

function set(updater: (s: DemoState) => DemoState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getDemoState() {
  return state;
}

/** Loads persisted demo state. Call once on the client (from an effect). */
export function hydrateDemoState() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed && parsed.version === SEED_VERSION) {
      state = parsed;
      listeners.forEach((listener) => listener());
    }
  } catch {
    /* corrupted storage — fall back to seed */
  }
}

export function resetDemoData() {
  state = createSeedState();
  persist();
  listeners.forEach((l) => l());
}

/** Snapshot for getServerSnapshot must be the stable seed object. */
export function useDemoStore() {
  const live = useSyncExternalStore(subscribe, getDemoState, () => seed);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    hydrateDemoState();
    setIsHydrated(true);
  }, []);
  // Before hydration, return the seed snapshot so SSR and first client render match.
  return { state: isHydrated ? live : seed, hydrated: isHydrated };
}

// ---------- derived helpers (pure functions over a state object) ----------

export function findProperty(s: DemoState, slugOrId: string) {
  return (
    s.properties.find((p) => p.slug === slugOrId) ?? s.properties.find((p) => p.id === slugOrId)
  );
}

export function publicProperties(s: DemoState) {
  return s.properties.filter((p) => p.status === "approved");
}

export function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn + "T00:00:00").getTime();
  const b = new Date(checkOut + "T00:00:00").getTime();
  const n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 0;
}

export function quoteBooking(
  property: Property,
  rooms: { room: RoomType; quantity: number }[],
  checkIn: string,
  checkOut: string,
) {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = rooms.reduce((sum, r) => sum + r.room.pricePerNight * r.quantity * nights, 0);
  const fees = Math.round(subtotal * DEMO_FEES_RATE);
  const total = subtotal + fees;
  const commissionAmount = Math.round(subtotal * property.commissionRate);
  return {
    nights,
    subtotal,
    fees,
    total,
    commissionAmount,
    propertyShare: subtotal - commissionAmount,
  };
}

// ---------- actions ----------

export const demoActions = {
  setSearchCriteria(criteria: SearchCriteria | null) {
    set((s) => ({ ...s, searchCriteria: criteria }));
  },
  setBookingDraft(draft: BookingDraft | null) {
    set((s) => ({ ...s, bookingDraft: draft }));
  },
  toggleWishlist(propertyId: string) {
    set((s) => ({
      ...s,
      wishlist: s.wishlist.includes(propertyId)
        ? s.wishlist.filter((id) => id !== propertyId)
        : [...s.wishlist, propertyId],
    }));
  },
  updateProfile(patch: Partial<DemoState["demoProfile"]>) {
    set((s) => ({ ...s, demoProfile: { ...s.demoProfile, ...patch } }));
  },

  createBooking(
    draft: BookingDraft,
    guest: { name: string; email: string; phone: string; specialRequests?: string },
    paymentMethod: string,
  ): Booking | null {
    const s0 = state;
    const property = s0.properties.find((p) => p.id === draft.propertyId);
    if (!property || property.status !== "approved") return null;
    const room = property.rooms.find((r) => r.id === draft.roomId);
    if (!room) return null;
    const nights = nightsBetween(draft.checkIn, draft.checkOut);
    if (nights <= 0) return null;
    if (!Number.isInteger(draft.roomQuantity) || draft.roomQuantity < 1) return null;
    if (
      !Number.isInteger(draft.adults) ||
      draft.adults < 1 ||
      !Number.isInteger(draft.children) ||
      draft.children < 0
    )
      return null;
    if (draft.adults + draft.children > room.maxOccupancy * draft.roomQuantity) return null;
    if (room.blockedDates.some((date) => date >= draft.checkIn && date < draft.checkOut))
      return null;
    const reserved = s0.bookings
      .filter(
        (booking) =>
          booking.propertyId === property.id &&
          booking.status !== "cancelled" &&
          booking.checkIn < draft.checkOut &&
          booking.checkOut > draft.checkIn,
      )
      .reduce(
        (sum, booking) =>
          sum +
          booking.rooms
            .filter((item) => item.roomId === room.id)
            .reduce((count, item) => count + item.quantity, 0),
        0,
      );
    if (reserved + draft.roomQuantity > room.inventory) return null;
    const subtotal = room.pricePerNight * draft.roomQuantity * nights;
    const fees = Math.round(subtotal * DEMO_FEES_RATE);
    const total = subtotal + fees;
    const commissionAmount = Math.round(subtotal * property.commissionRate);
    const count = s0.bookings.length + 1;
    const booking: Booking = {
      id: `bk-${Date.now().toString(36)}-${count}`,
      propertyId: property.id,
      propertySlug: property.slug,
      propertyName: property.name,
      propertyLocation: property.location,
      ownerId: property.ownerId,
      guestName: guest.name,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      nights,
      rooms: [
        {
          roomId: room.id,
          roomName: room.name,
          quantity: draft.roomQuantity,
          pricePerNight: room.pricePerNight,
        },
      ],
      subtotal,
      fees,
      total,
      commissionRate: property.commissionRate,
      commissionAmount,
      propertyShare: subtotal - commissionAmount,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod,
      settlementStatus: "pending",
      specialRequests: guest.specialRequests,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    set((s) => ({ ...s, bookings: [...s.bookings, booking], bookingDraft: null }));
    return booking;
  },

  requestCancellation(bookingId: string) {
    set((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === bookingId && b.status === "confirmed" ? { ...b, status: "refund_requested" } : b,
      ),
    }));
  },

  setBookingStatus(
    bookingId: string,
    status: Booking["status"],
    paymentStatus?: Booking["paymentStatus"],
  ) {
    set((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status,
              paymentStatus: paymentStatus ?? b.paymentStatus,
            }
          : b,
      ),
    }));
  },

  setSettlementStatus(bookingId: string, settlementStatus: Booking["settlementStatus"]) {
    set((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, settlementStatus } : b)),
    }));
  },

  // ----- partner -----

  addApplication(app: Omit<PartnerApplication, "id" | "status" | "submittedAt">) {
    const application: PartnerApplication = {
      ...app,
      id: `app-${Date.now().toString(36)}`,
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    set((s) => ({ ...s, applications: [...s.applications, application] }));
    return application;
  },

  updateOwnedProperty(propertyId: string, patch: Partial<Property>) {
    set((s) => ({
      ...s,
      properties: s.properties.map((p) => (p.id === propertyId ? { ...p, ...patch } : p)),
    }));
  },

  addOwnedRoom(propertyId: string, room: Omit<RoomType, "id" | "blockedDates">) {
    set((s) => ({
      ...s,
      properties: s.properties.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: [
                ...p.rooms,
                { ...room, id: `room-${Date.now().toString(36)}`, blockedDates: [] },
              ],
            }
          : p,
      ),
    }));
  },

  updateRoom(propertyId: string, roomId: string, patch: Partial<RoomType>) {
    set((s) => ({
      ...s,
      properties: s.properties.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
            }
          : p,
      ),
    }));
  },

  toggleRoomBlockedDate(propertyId: string, roomId: string, date: string) {
    set((s) => ({
      ...s,
      properties: s.properties.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      blockedDates: r.blockedDates.includes(date)
                        ? r.blockedDates.filter((d) => d !== date)
                        : [...r.blockedDates, date],
                    }
                  : r,
              ),
            }
          : p,
      ),
    }));
  },

  // ----- admin -----

  setPropertyStatus(propertyId: string, status: PropertyStatus, rejectionReason?: string) {
    set((s) => ({
      ...s,
      properties: s.properties.map((p) =>
        p.id === propertyId
          ? { ...p, status, rejectionReason: status === "rejected" ? rejectionReason : undefined }
          : p,
      ),
    }));
  },

  setCommissionRate(propertyId: string, rate: number) {
    set((s) => ({
      ...s,
      properties: s.properties.map((p) =>
        p.id === propertyId ? { ...p, commissionRate: rate } : p,
      ),
    }));
  },

  approveApplication(applicationId: string) {
    const s0 = state;
    const app = s0.applications.find((a) => a.id === applicationId);
    if (!app || app.status !== "pending") return;
    // Approved partner applications become a visible, bookable demo property.
    const newProperty: Property = {
      id: `prp-${Date.now().toString(36)}`,
      slug:
        app.propertyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `property-${Date.now().toString(36)}`,
      name: app.propertyName,
      category: (app.propertyType as Property["category"]) || "Homestay",
      location: app.location,
      address: app.address,
      description: app.description || "Property description pending from the owner.",
      images: [
        seed.properties[0]!.images[0]!,
        seed.properties[0]!.images[1]!,
        seed.properties[0]!.images[2]!,
      ],
      landmarks: [{ name: "Nashik City Centre", km: 5 }],
      amenities: ["wifi", "attachedBathroom", "hotWater"],
      rating: 0,
      reviewCount: 0,
      maxGuests: Math.max(2, app.roomCount * 2),
      rooms: [
        {
          id: `room-${Date.now().toString(36)}`,
          name: "Standard Room",
          image: seed.properties[0]!.images[0]!,
          maxOccupancy: 2,
          amenities: ["wifi", "attachedBathroom", "hotWater"],
          pricePerNight: 1500,
          inventory: Math.max(1, app.roomCount),
          description: "Standard room — rates and inventory to be updated by the owner.",
          blockedDates: [],
        },
      ],
      checkInTime: "12:00 PM",
      checkOutTime: "10:00 AM",
      houseRules: ["To be updated by the property owner."],
      cancellationPolicy: "To be updated by the property owner.",
      status: "approved",
      ownerId: s0.owners.find((owner) => owner.email === app.email)?.id ?? "own-3",
      commissionRate: s0.settings.defaultCommissionRate,
      reviews: [],
    };
    set((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === applicationId ? { ...a, status: "approved" } : a,
      ),
      properties: [...s.properties, newProperty],
    }));
  },

  rejectApplication(applicationId: string, reason: string) {
    set((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === applicationId ? { ...a, status: "rejected", rejectionReason: reason } : a,
      ),
    }));
  },

  addEnquiry(enquiry: Omit<GroupEnquiry, "id" | "status" | "createdAt">) {
    const entry: GroupEnquiry = {
      ...enquiry,
      id: `enq-${Date.now().toString(36)}`,
      status: "new",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    set((s) => ({ ...s, enquiries: [...s.enquiries, entry] }));
    return entry;
  },

  addTicket(ticket: Omit<SupportTicket, "id" | "createdAt">) {
    const entry: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    set((s) => ({ ...s, tickets: [...s.tickets, entry] }));
    return entry;
  },

  markEnquiryContacted(id: string) {
    set((s) => ({
      ...s,
      enquiries: s.enquiries.map((e) => (e.id === id ? { ...e, status: "contacted" } : e)),
    }));
  },
};
