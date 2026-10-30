import { useEffect, useState } from "react";
import { ArrowRight, Check, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DESTINATIONS } from "@/data/seed";
import type { Destination, SearchCriteria } from "@/data/types";
import { demoActions } from "@/lib/demo-store";

export function EnquiryPopup({
  open,
  onOpenChange,
  criteria,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  criteria: SearchCriteria;
}) {
  const [receipt, setReceipt] = useState<{
    id: string;
    destination: Destination;
    guests: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setReceipt(null);
      setError("");
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="stay-modal enquiry-popup" aria-describedby="enquiry-description">
        <aside className="enquiry-visual">
          <img
            src="/images/trimbak-enquiry.jpg"
            alt="Stone architecture of Trimbakeshwar Shiva Temple near Nashik"
            decoding="async"
          />
          <div className="enquiry-image-shade" />
          <span className="enquiry-visual-label">
            <Sparkles size={13} /> THE NASHIK KUMBH EDIT / 2027
          </span>
          <div className="enquiry-visual-copy">
            <span>MORE THAN A DESTINATION.</span>
            <h2>
              A journey worth
              <br />
              feeling at home in.
            </h2>
            <p>
              Local warmth. Thoughtful stays.
              <br />A little help planning it all.
            </p>
            <small>
              <MapPin size={12} /> Trimbakeshwar, Nashik
            </small>
          </div>
        </aside>
        <div className="enquiry-form-side">
          <span className="eyebrow">YOUR JOURNEY, THOUGHTFULLY PLANNED</span>
          <DialogTitle>
            {receipt ? "Your enquiry is saved." : "Let’s find your kind of stay."}
          </DialogTitle>
          <DialogDescription id="enquiry-description">
            {receipt
              ? "Your travel preferences are now part of this demo."
              : "Share your details. Find your perfect stay."}
          </DialogDescription>
          {receipt ? (
            <div className="enquiry-success" role="status">
              <span className="enquiry-success-icon">
                <Check size={28} />
              </span>
              <h3>One step closer to your journey.</h3>
              <p>
                {receipt.destination} · {receipt.guests} {receipt.guests === 1 ? "guest" : "guests"}
              </p>
              <small>Reference: {receipt.id}</small>
              <p className="enquiry-demo-note">
                Saved on this device. No email or phone call is sent by this demo.
              </p>
              <a
                className="primary-button full"
                href="/stays"
                onClick={() => {
                  demoActions.setSearchCriteria({ ...criteria, destination: receipt.destination });
                  onOpenChange(false);
                }}
              >
                Explore matching stays <ArrowRight size={16} />
              </a>
              <button className="text-link" type="button" onClick={() => onOpenChange(false)}>
                Continue exploring
              </button>
            </div>
          ) : (
            <form
              className="stack-form enquiry-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const phone = String(f.get("phone")).trim();
                const digits = phone.replace(/\D/g, "");
                if (digits.length < 10 || digits.length > 15) {
                  setError("Enter a valid phone number with 10–15 digits.");
                  return;
                }
                const destination = String(f.get("destination")) as Destination;
                const guests = criteria.adults + criteria.children;
                const entry = demoActions.addEnquiry({
                  groupName: `Stay enquiry — ${String(f.get("name")).trim()}`,
                  contactPerson: String(f.get("name")).trim(),
                  phone,
                  email: "",
                  guests,
                  preferredLocation: destination,
                  checkIn: criteria.checkIn,
                  checkOut: "",
                  budget: "To be discussed",
                  requirements: "Quick website stay enquiry",
                });
                setError("");
                setReceipt({ id: entry.id, destination, guests });
              }}
            >
              <div className="form-columns">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Your mobile number"
                    minLength={10}
                    maxLength={22}
                  />
                </label>
              </div>
              <label>
                Where would you like to stay?
                <select
                  name="destination"
                  defaultValue={criteria.destination || "Nashik City"}
                  required
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <p className="quick-enquiry-consent">
                By submitting, you agree to be contacted about this enquiry.
              </p>
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="primary-button full">
                Enquire about my stay <ArrowRight size={17} />
              </button>
              <div className="enquiry-form-footnote">
                <ShieldCheck size={13} />
                <span>Demo enquiry · saved on this device. No email is sent.</span>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
