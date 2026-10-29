import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Expand,
  MapPin,
  Star,
  BedDouble,
} from "lucide-react";
import { useDemoStore, demoActions, findProperty, quoteBooking } from "@/lib/demo-store";
import { availableRooms, money } from "@/lib/stay-search";
import { Modal, AmenityRow, GuestPicker, initialCriteria } from "./stay-ui";
import type { Booking, SearchCriteria } from "@/data/types";
export function PropertyExperience({ slug }: { slug: string }) {
  const { state } = useDemoStore();
  const p = findProperty(state, slug || state.bookingDraft?.propertyId || "");
  const [roomId, setRoomId] = useState(state.bookingDraft?.roomId ?? p?.rooms[0]?.id ?? "");
  const [criteria, setCriteria] = useState<SearchCriteria>(state.searchCriteria ?? initialCriteria);
  const [image, setImage] = useState<number | null>(null);
  const [bookingSheet, setBookingSheet] = useState(false);
  const [guestSheet, setGuestSheet] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [step, setStep] = useState(0);
  const [guest, setGuest] = useState({ ...state.demoProfile, specialRequests: "" });
  const [method, setMethod] = useState("UPI");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  if (!p)
    return (
      <section className="container section">
        <h1>This stay is unavailable.</h1>
        <a href="/stays" className="primary-button">
          Explore stays
        </a>
      </section>
    );
  const room = p.rooms.find((r) => r.id === roomId) ?? p.rooms[0];
  if (!room)
    return (
      <section className="container section">
        <h1>No rooms are listed for this stay yet.</h1>
        <a href="/stays">Explore available stays</a>
      </section>
    );
  const quote = quoteBooking(
    p,
    [{ room, quantity: criteria.rooms }],
    criteria.checkIn,
    criteria.checkOut,
  );
  const beginBooking = () => {
    if (p!.status !== "approved") {
      setError("This property is not available for booking.");
      return;
    }
    if (
      !criteria.checkIn ||
      criteria.checkIn < new Date().toLocaleDateString("en-CA") ||
      quote.nights <= 0
    ) {
      setError("Choose a future check-in and a later check-out date.");
      return;
    }
    if (!availableRooms(p!, criteria, state).some((r) => r.id === room.id)) {
      setError(
        "This room is unavailable for these dates or guest numbers. Try another room or more rooms.",
      );
      return;
    }
    demoActions.setSearchCriteria(criteria);
    demoActions.setBookingDraft({
      propertyId: p!.id,
      roomId: room.id,
      roomQuantity: criteria.rooms,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      adults: criteria.adults,
      children: criteria.children,
    });
    setError("");
    setBookingSheet(false);
    setCheckout(true);
    setStep(0);
  };
  const summary = (
    <>
      <div className="summary-price">
        <strong>{money(room.pricePerNight)}</strong>
        <span> / room / night</span>
      </div>
      <span className="summary-rating">
        <Star size={14} /> {p.rating} · {p.reviewCount} reviews
      </span>
      <div className="form-columns">
        <label>
          Check-in
          <input
            aria-label="Booking check-in"
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
            value={criteria.checkIn}
            onChange={(e) => setCriteria({ ...criteria, checkIn: e.target.value })}
          />
        </label>
        <label>
          Check-out
          <input
            aria-label="Booking check-out"
            type="date"
            min={criteria.checkIn}
            value={criteria.checkOut}
            onChange={(e) => setCriteria({ ...criteria, checkOut: e.target.value })}
          />
        </label>
      </div>
      <button className="outline-button full" onClick={() => setGuestSheet(true)}>
        {criteria.adults + criteria.children} guests · {criteria.rooms} rooms
      </button>
      <div className="quote-lines" aria-live="polite">
        <span>
          {room.name}
          <strong>{money(room.pricePerNight)}</strong>
        </span>
        <span>
          {quote.nights} nights × {criteria.rooms} rooms<strong>{money(quote.subtotal)}</strong>
        </span>
        <span>
          Demo taxes & service fees (8%)<strong>{money(quote.fees)}</strong>
        </span>
        <span className="total">
          Total
          <strong key={quote.total} className="price-update">
            {money(quote.total)}
          </strong>
        </span>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <button className="primary-button full" onClick={beginBooking}>
        Reserve your stay <ArrowRight size={16} />
      </button>
      <small className="muted center">No real charges. Demo booking only.</small>
      <div className="summary-trust">
        <ShieldCheck size={19} />
        <span>
          A little peace of mind.<small>Review the cancellation policy before you book.</small>
        </span>
      </div>
    </>
  );
  return (
    <section className="container section property-detail">
      <a href="/stays" className="text-link">
        <ArrowLeft size={15} /> Back to stays
      </a>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <p>
            <MapPin size={15} /> {p.location} <span>·</span> ★ {p.rating} ({p.reviewCount} reviews)
          </p>
        </div>
        <button className="outline-button" onClick={() => demoActions.toggleWishlist(p.id)}>
          {state.wishlist.includes(p.id) ? "♥ Saved to favourites" : "♡ Save this stay"}
        </button>
      </div>
      <div className="detail-gallery">
        {p.images.slice(0, 5).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setImage(i)}
            aria-label={`Open photo ${i + 1} of ${p.name}`}
          >
            <img src={src} alt={`${p.name}, photo ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} />
            {i === 0 && (
              <span className="gallery-label">
                <Expand size={15} /> View all {p.images.length} photos
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="detail-layout">
        <div>
          <div className="detail-intro">
            <h2>A place to settle in. A journey to remember.</h2>
            <p>{p.description}</p>
            <AmenityRow property={p} />
            <div className="detail-facts">
              <span>
                <BedDouble /> {p.rooms.length} room types
              </span>
              <span>
                <ShieldCheck /> {p.category}
              </span>
              <span>Check-in {p.checkInTime}</span>
            </div>
          </div>
          <section className="room-section">
            <span className="eyebrow">YOUR OWN LITTLE RETREAT</span>
            <h2>Choose your room.</h2>
            <p className="muted">Select a room, then choose your dates to check availability.</p>
            {p.rooms.map((r) => (
              <button
                className={`room-option ${room.id === r.id ? "selected" : ""}`}
                key={r.id}
                onClick={() => {
                  setRoomId(r.id);
                  setError("");
                }}
                aria-pressed={room.id === r.id}
              >
                <img src={r.image} alt={r.name} loading="lazy" />
                <span className="room-copy">
                  <strong>{r.name}</strong>
                  <small>{r.description}</small>
                  <span>
                    Up to {r.maxOccupancy} guests · {r.inventory} rooms in inventory
                  </span>
                  <b>
                    {money(r.pricePerNight)} <small>/ night</small>
                  </b>
                </span>
                <span className="selection-circle">{room.id === r.id && <Check size={15} />}</span>
              </button>
            ))}
          </section>
          <section className="detail-policies">
            <h2>Good to know before you go.</h2>
            <h3>Cancellation policy</h3>
            <p>{p.cancellationPolicy}</p>
            <h3>House rules</h3>
            <ul>
              {p.houseRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <h3>Nearby places</h3>
            <div className="landmarks">
              {p.landmarks.map((l) => (
                <span key={l.name}>
                  <MapPin size={15} />
                  {l.name}
                  <strong>{l.km} km</strong>
                </span>
              ))}
            </div>
            <h3>From fellow travellers</h3>
            {p.reviews.map((r, i) => (
              <article className="review" key={i}>
                <strong>
                  {r.guestName} · ★ {r.rating}
                </strong>
                <p>{r.comment}</p>
              </article>
            ))}
          </section>
        </div>
        <aside className="booking-summary panel">{summary}</aside>
      </div>
      <div className="mobile-booking-bar">
        <div>
          <strong>{money(room.pricePerNight)}</strong>
          <small>/ night · + 8% fees</small>
        </div>
        <button className="primary-button" onClick={() => setBookingSheet(true)}>
          Check availability <ArrowRight size={16} />
        </button>
      </div>
      <Modal
        wide
        title={`${p.name} · Photo gallery`}
        description={`${image !== null ? image + 1 : 1} of ${p.images.length} photos`}
        open={image !== null}
        close={() => setImage(null)}
      >
        <div className="lightbox">
          <img key={image} src={p.images[image ?? 0]} alt={`${p.name} photo ${(image ?? 0) + 1}`} />
          <button
            aria-label="Previous photo"
            className="gallery-prev icon-button"
            onClick={() => setImage(((image ?? 0) - 1 + p.images.length) % p.images.length)}
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Next photo"
            className="gallery-next icon-button"
            onClick={() => setImage(((image ?? 0) + 1) % p.images.length)}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="gallery-thumbs">
          {p.images.map((src, i) => (
            <button
              key={i}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={image === i}
              onClick={() => setImage(i)}
            >
              <img src={src.replace("w=1200", "w=160")} alt="" />
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        title="Your stay, at a glance"
        open={bookingSheet}
        close={() => setBookingSheet(false)}
      >
        {summary}
      </Modal>
      <Modal title="Make room for everyone" open={guestSheet} close={() => setGuestSheet(false)}>
        <GuestPicker value={criteria} onChange={setCriteria} />
        <button className="primary-button" onClick={() => setGuestSheet(false)}>
          Save guests
        </button>
      </Modal>
      <Modal
        title={confirmed ? "Your next chapter is booked." : "Let’s make it official."}
        description="Secure demo checkout · No real money is collected."
        open={checkout}
        close={() => {
          setCheckout(false);
          setConfirmed(null);
        }}
      >
        {confirmed ? (
          <div className="confirmation">
            <span className="success-circle">
              <Check />
            </span>
            <h2>See you at {p.name}.</h2>
            <p>
              {confirmed.checkIn} → {confirmed.checkOut}
            </p>
            <p>Booking reference: {confirmed.id}</p>
            <strong>{money(confirmed.total)} · Simulated payment successful</strong>
            <a className="primary-button" href="/bookings">
              View my bookings <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <>
            <ol className="booking-stepper">
              {["Your details", "Review stay", "Demo payment"].map((s, i) => (
                <li
                  key={s}
                  className={step >= i ? "active" : ""}
                  aria-current={step === i ? "step" : undefined}
                >
                  <span>{step > i ? <Check size={14} /> : i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            {step === 0 ? (
              <form
                className="stack-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(1);
                }}
              >
                <label>
                  Full name
                  <input
                    required
                    autoComplete="name"
                    value={guest.name}
                    onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                  />
                </label>
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={guest.email}
                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  />
                </label>
                <label>
                  Phone number
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    value={guest.phone}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  />
                </label>
                <label>
                  Special requests
                  <textarea
                    value={guest.specialRequests}
                    onChange={(e) => setGuest({ ...guest, specialRequests: e.target.value })}
                    placeholder="Tell us about accessibility or other needs"
                  />
                </label>
                <button className="primary-button">
                  Continue <ArrowRight size={16} />
                </button>
              </form>
            ) : step === 1 ? (
              <>
                <h3>{p.name}</h3>
                <p>
                  {room.name} · {criteria.rooms} rooms · {criteria.adults + criteria.children}{" "}
                  guests
                </p>
                <p>
                  {criteria.checkIn} → {criteria.checkOut} ({quote.nights} nights)
                </p>
                <p>{p.cancellationPolicy}</p>
                <div className="quote-lines">
                  <span>
                    Room total<strong>{money(quote.subtotal)}</strong>
                  </span>
                  <span>
                    Demo taxes & fees<strong>{money(quote.fees)}</strong>
                  </span>
                  <span className="total">
                    Total<strong>{money(quote.total)}</strong>
                  </span>
                </div>
                <button className="primary-button" onClick={() => setStep(2)}>
                  Continue to demo payment <ArrowRight size={16} />
                </button>
                <button className="text-link" onClick={() => setStep(0)}>
                  Back to details
                </button>
              </>
            ) : (
              <>
                <h3>Simulate your payment</h3>
                <p className="muted">Choose a method. No payment credentials are requested.</p>
                <div className="payment-methods">
                  {["UPI", "Card", "Net banking"].map((m) => (
                    <button
                      key={m}
                      className={method === m ? "selected" : ""}
                      aria-pressed={method === m}
                      onClick={() => setMethod(m)}
                    >
                      {m}
                      {method === m && <Check size={16} />}
                    </button>
                  ))}
                </div>
                {error && (
                  <p role="alert" className="error-text">
                    {error}
                  </p>
                )}
                <button
                  className="primary-button"
                  onClick={() => {
                    if (!availableRooms(p, criteria, state).some((r) => r.id === room.id)) {
                      setError("Availability has changed. Please select another room.");
                      return;
                    }
                    const b = demoActions.createBooking(
                      {
                        propertyId: p.id,
                        roomId: room.id,
                        roomQuantity: criteria.rooms,
                        checkIn: criteria.checkIn,
                        checkOut: criteria.checkOut,
                        adults: criteria.adults,
                        children: criteria.children,
                      },
                      guest,
                      `Demo ${method}`,
                    );
                    if (b) {
                      demoActions.updateProfile({
                        name: guest.name,
                        email: guest.email,
                        phone: guest.phone,
                      });
                      setConfirmed(b);
                    } else setError("Please review your dates and try again.");
                  }}
                >
                  Simulate payment · {money(quote.total)}
                </button>
                <button
                  className="outline-button"
                  onClick={() =>
                    setError("Payment simulation failed. No charge was made. You can try again.")
                  }
                >
                  Test failed payment
                </button>
                <button className="text-link" onClick={() => setStep(1)}>
                  Back to review
                </button>
              </>
            )}
          </>
        )}
      </Modal>
    </section>
  );
}
