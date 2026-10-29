import type { ReactNode } from "react";
import { Wifi, Car, Users, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Property, SearchCriteria } from "@/data/types";
export const initialCriteria: SearchCriteria = {
  destination: "",
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  rooms: 1,
};
export function Modal({
  title,
  description,
  open,
  close,
  children,
  wide = false,
  className = "",
}: {
  title: string;
  description?: string;
  open: boolean;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className={`stay-modal ${wide ? "wide" : ""} ${className}`}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description ?? "Plan your stay with confidence."}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function AmenityRow({ property }: { property: Property }) {
  return (
    <div className="amenity-row">
      {property.amenities.includes("wifi") && (
        <span>
          <Wifi size={14} /> Wi-Fi
        </span>
      )}
      {property.amenities.includes("parking") && (
        <span>
          <Car size={14} /> Parking
        </span>
      )}
      {property.amenities.includes("familyRooms") && (
        <span>
          <Users size={14} /> Family rooms
        </span>
      )}
      {property.amenities.includes("ac") && (
        <span>
          <Sun size={14} /> AC
        </span>
      )}
    </div>
  );
}
export function GuestPicker({
  value,
  onChange,
}: {
  value: SearchCriteria;
  onChange: (c: SearchCriteria) => void;
}) {
  return (
    <div className="guest-picker">
      {(["adults", "children", "rooms"] as const).map((key) => (
        <div className="guest-row" key={key}>
          <div>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>
            <small>
              {key === "adults"
                ? "Ages 13 and above"
                : key === "children"
                  ? "Ages 0–12"
                  : "Your own space"}
            </small>
          </div>
          <div className="counter">
            <button
              type="button"
              aria-label={`Remove ${key}`}
              disabled={value[key] <= (key === "children" ? 0 : 1)}
              onClick={() => onChange({ ...value, [key]: value[key] - 1 })}
            >
              −
            </button>
            <span>{value[key]}</span>
            <button
              type="button"
              aria-label={`Add ${key}`}
              disabled={value[key] >= 20}
              onClick={() => onChange({ ...value, [key]: value[key] + 1 })}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
