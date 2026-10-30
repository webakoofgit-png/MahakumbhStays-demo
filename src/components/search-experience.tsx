import { useLang } from "@/lib/i18n";
import { useState } from "react";
import {
  MapPin,
  Search,
  Users,
  CalendarDays,
  BedDouble,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { DESTINATIONS } from "@/data/seed";
import type { SearchCriteria } from "@/data/types";
import { DateField } from "./date-field";
import { GuestPicker, Modal } from "./stay-ui";

type Props = {
  criteria: SearchCriteria;
  onChange: (value: SearchCriteria) => void;
  onSearch: () => boolean;
  onGuests: () => void;
};
export function SearchExperience({ criteria, onChange, onSearch, onGuests }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const afterCheckIn = criteria.checkIn
    ? new Date(new Date(criteria.checkIn + "T00:00:00").getTime() + 86400000).toLocaleDateString(
        "en-CA",
      )
    : undefined;
  function updateCheckIn(value: string) {
    onChange({
      ...criteria,
      checkIn: value,
      checkOut: criteria.checkOut <= value ? "" : criteria.checkOut,
    });
  }
  const guestCount = criteria.adults + criteria.children;
  return (
    <>
      <div className="desktop-search-surface">
        <div className="search-surface-heading">
          <h2>Where will your journey begin?</h2>
          <span>
            <ShieldCheck size={13} /> A thoughtful stay, a little peace of mind.
          </span>
        </div>
        <div className="search-panel">
          <div className="search-field destination-field">
            <MapPin />
            <label>
              {t("search.destination")}
              <input
                list="destinations"
                placeholder="Nashik & beyond"
                aria-label="Destination"
                value={criteria.destination}
                onChange={(e) =>
                  onChange({
                    ...criteria,
                    destination: e.target.value as SearchCriteria["destination"],
                  })
                }
              />
              <datalist id="destinations">
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </label>
          </div>
          <DateField label={t("search.checkIn")} value={criteria.checkIn} onChange={updateCheckIn} />
          <DateField
            label={t("search.checkOut")}
            value={criteria.checkOut}
            min={afterCheckIn}
            onChange={(value) => onChange({ ...criteria, checkOut: value })}
          />
          <button className="search-field guest-button" onClick={onGuests}>
            <Users />
            <span>
              <strong>{t("search.guests")} & {t("search.rooms")}</strong>
              {guestCount} guests · {criteria.rooms} room{criteria.rooms > 1 ? "s" : ""}
            </span>
          </button>
          <button className="search-submit" onClick={onSearch}>
            <Search size={18} />
            <span>{t("search.searchBtn")}</span>
          </button>
        </div>
      </div>
      <button className="mobile-search-entry" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="mobile-search-icon">
          <Search size={21} />
        </span>
        <span>
          <strong>Where will your journey begin?</strong>
          <small>
            {criteria.destination || "Explore Nashik & beyond"} ·{" "}
            {criteria.checkIn
              ? `${criteria.checkIn} → ${criteria.checkOut || "Add dates"}`
              : "Add dates"}
            <br />
            {guestCount} guests · {criteria.rooms} room{criteria.rooms > 1 ? "s" : ""}
          </small>
        </span>
        <span className="mobile-search-arrow">
          <ArrowIcon />
        </span>
      </button>
      <Modal
        title="Where will your journey begin?"
        description="Choose your place, dates and people. Your journey starts here."
        open={open}
        close={() => setOpen(false)}
        className="search-sheet"
      >
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              (criteria.checkIn && !criteria.checkOut) ||
              (criteria.checkOut && !criteria.checkIn) ||
              (criteria.checkIn && criteria.checkOut <= criteria.checkIn)
            ) {
              setError("Choose a check-in date and a later check-out date.");
              return;
            }
            setError("");
            if (onSearch()) setOpen(false);
          }}
        >
          <label className="sheet-destination-label">
            <span>
              <MapPin size={16} /> Destination
            </span>
            <input
              list="sheet-destinations"
              placeholder="Nashik & beyond"
              value={criteria.destination}
              onChange={(e) =>
                onChange({
                  ...criteria,
                  destination: e.target.value as SearchCriteria["destination"],
                })
              }
            />
            <datalist id="sheet-destinations">
              {DESTINATIONS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </label>
          <div className="sheet-destination-suggestions">
            {DESTINATIONS.slice(0, 4).map((d) => (
              <button
                type="button"
                key={d}
                aria-pressed={criteria.destination === d}
                onClick={() => onChange({ ...criteria, destination: d })}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="form-columns">
            <label>
              <span>
                <CalendarDays size={16} /> Check-in
              </span>
              <input
                aria-label="Search check-in"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                value={criteria.checkIn}
                onChange={(e) => updateCheckIn(e.target.value)}
              />
            </label>
            <label>
              <span>
                <CalendarDays size={16} /> Check-out
              </span>
              <input
                aria-label="Search check-out"
                type="date"
                min={afterCheckIn}
                value={criteria.checkOut}
                onChange={(e) => onChange({ ...criteria, checkOut: e.target.value })}
              />
            </label>
          </div>
          <details className="guest-accordion" open>
            <summary>
              <span>
                <BedDouble size={18} /> Guests & rooms
              </span>
              <ChevronDown size={18} />
            </summary>
            <GuestPicker value={criteria} onChange={onChange} />
          </details>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <div className="sheet-search-footer">
            <span>
              <ShieldCheck size={15} /> Demo listings · Clear prices · No real charges
            </span>
            <button type="submit" className="primary-button full">
              <Search size={18} /> {t("search.searchBtn")}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
function ArrowIcon() {
  return <ChevronDown size={18} style={{ transform: "rotate(-90deg)" }} />;
}
