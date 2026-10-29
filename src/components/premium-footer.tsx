import { ArrowRight, ArrowUpRight, ArrowUp, MapPin, Sparkles, Sun } from "lucide-react";
import { demoActions, getDemoState } from "@/lib/demo-store";
import { initialCriteria } from "./stay-ui";
import type { Destination } from "@/data/types";
export function PremiumFooter({
  onEnquiry,
  onGroup,
}: {
  onEnquiry: () => void;
  onGroup: () => void;
}) {
  const destinations: Destination[] = [
    "Nashik City",
    "Trimbakeshwar",
    "Panchavati",
    "Nashik Road",
    "Igatpuri",
  ];
  return (
    <footer className="premium-footer">
      <div className="container">
        <div className="footer-invitation">
          <div>
            <span>
              <Sparkles size={14} /> YOUR STAY FOR EVERY SACRED JOURNEY
            </span>
            <h2>
              Come for the journey.
              <br />
              Leave with a <em>feeling.</em>
            </h2>
            <p>Good places. Warm welcomes. Memories that stay with you.</p>
          </div>
          <div className="footer-invitation-actions">
            <button className="footer-enquire-button" onClick={onEnquiry}>
              Let’s plan your stay <ArrowUpRight size={18} />
            </button>
            <a href="/stays">
              Explore the stay collection <ArrowRight size={15} />
            </a>
          </div>
        </div>
        <div className="footer-main">
          <div className="footer-about">
            <a className="footer-brand" href="/">
              <span>
                <Sun size={29} />
              </span>
              <div>
                Mahakumbh<em>Stays</em>
                <small>STAY CLOSE TO WHAT MATTERS</small>
              </div>
            </a>
            <p>
              A thoughtful home for your Nashik Kumbh journey. Discover stays that bring you closer
              to the places — and people — that matter.
            </p>
            <span className="footer-location">
              <MapPin size={14} /> Rooted in Nashik. Made for your journey.
            </span>
          </div>
          <nav aria-label="Footer explore">
            <h3>Your next chapter</h3>
            <a href="/stays">Explore all stays</a>
            <a href="/wishlist">Your saved stays</a>
            <a href="/bookings">My bookings</a>
            <button onClick={onGroup}>
              Group bookings <ArrowUpRight size={12} />
            </button>
          </nav>
          <nav aria-label="Footer destinations">
            <h3>A place for you</h3>
            {destinations.map((d) => (
              <a
                key={d}
                href="/stays"
                onClick={() =>
                  demoActions.setSearchCriteria({
                    ...(getDemoState().searchCriteria ?? initialCriteria),
                    destination: d,
                  })
                }
              >
                {d}
              </a>
            ))}
          </nav>
          <nav aria-label="Footer assistance">
            <h3>A little help, anytime</h3>
            <button onClick={onEnquiry}>
              Make an enquiry <ArrowUpRight size={12} />
            </button>
            <a href="/owner">Partner with us</a>
            <a href="/owner">Owner dashboard</a>
            <a href="/admin">Admin dashboard</a>
            <a href="/image-credits.html">Photo & video credits</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MahakumbhStays. Made for meaningful journeys.</span>
          <span className="footer-demo-label">
            <i /> Demo marketplace · no real payments
          </span>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
