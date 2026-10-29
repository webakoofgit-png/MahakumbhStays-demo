export type Category =
  "Budget Hotel" | "Premium Hotel" | "Resort" | "Homestay" | "Dharamshala" | "Tent City" | "Lodge";

export type Destination =
  | "Nashik City"
  | "Trimbakeshwar"
  | "Panchavati"
  | "Ramkund"
  | "Nashik Road"
  | "Igatpuri"
  | "Surrounding Areas";

export type Amenity =
  | "wifi"
  | "parking"
  | "ac"
  | "attachedBathroom"
  | "hotWater"
  | "breakfast"
  | "familyRooms"
  | "reception"
  | "roomService";

export type PropertyStatus = "approved" | "pending" | "rejected" | "disabled";
export type BookingStatus = "confirmed" | "refund_requested" | "cancelled" | "completed";
export type PaymentStatus = "paid" | "refunded" | "failed";
export type SettlementStatus = "pending" | "settled";

export interface RoomType {
  id: string;
  name: string;
  image: string;
  maxOccupancy: number;
  amenities: Amenity[];
  pricePerNight: number;
  inventory: number;
  description: string;
  blockedDates: string[]; // ISO yyyy-mm-dd dates the demo owner has marked unavailable
}

export interface LandmarkDistance {
  name: string;
  km: number;
}

export interface Review {
  guestName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  category: Category;
  location: string;
  address: string;
  description: string;
  images: string[];
  landmarks: LandmarkDistance[];
  amenities: Amenity[];
  rating: number;
  reviewCount: number;
  maxGuests: number;
  rooms: RoomType[];
  checkInTime: string;
  checkOutTime: string;
  houseRules: string[];
  cancellationPolicy: string;
  status: PropertyStatus;
  rejectionReason?: string | undefined;
  ownerId: string;
  commissionRate: number; // 0.12 = 12%, applied to new demo bookings only
  featured?: boolean;
  reviews: Review[];
}

export interface Owner {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  joinedAt: string;
}

export interface BookingRoom {
  roomId: string;
  roomName: string;
  quantity: number;
  pricePerNight: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertySlug: string;
  propertyName: string;
  propertyLocation: string;
  ownerId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: BookingRoom[];
  subtotal: number;
  fees: number;
  total: number;
  commissionRate: number;
  commissionAmount: number;
  propertyShare: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  settlementStatus: SettlementStatus;
  specialRequests?: string | undefined;
  createdAt: string;
}

export interface PartnerApplication {
  id: string;
  ownerName: string;
  businessName: string;
  phone: string;
  email: string;
  propertyName: string;
  propertyType: string;
  address: string;
  location: string;
  roomCount: number;
  description: string;
  amenities: string[];
  photoNames: string[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  rejectionReason?: string | undefined;
}

export interface GroupEnquiry {
  id: string;
  groupName: string;
  contactPerson: string;
  phone: string;
  email: string;
  guests: number;
  preferredLocation: string;
  checkIn: string;
  checkOut: string;
  budget: string;
  requirements: string;
  status: "new" | "contacted";
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SearchCriteria {
  destination: Destination | "";
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface BookingDraft {
  propertyId: string;
  roomId: string;
  roomQuantity: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export interface DemoSettings {
  defaultCommissionRate: number;
}

export interface DemoState {
  version: number;
  properties: Property[];
  owners: Owner[];
  bookings: Booking[];
  applications: PartnerApplication[];
  enquiries: GroupEnquiry[];
  tickets: SupportTicket[];
  wishlist: string[];
  searchCriteria: SearchCriteria | null;
  bookingDraft: BookingDraft | null;
  settings: DemoSettings;
  demoProfile: { name: string; email: string; phone: string };
}
