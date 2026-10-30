import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

const places = [
  { image: "/images/trimbakeshwar-card.jpg", name: "Trimbakeshwar · Nashik", alt: "Trimbakeshwar Shiva Temple" },
  { image: "/images/godavari-card.jpg", name: "Godavari River · Nashik", alt: "The Godavari riverfront in Nashik" },
  { image: "/images/ramkund-card.jpg", name: "Ramkund · Panchavati", alt: "Gatherings at Ramkund in Panchavati" },
  { image: "/images/igatpuri-card.jpg", name: "Igatpuri · Nashik", alt: "Misty hills in Igatpuri" },
];

export function HeroDestinationSlider() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % places.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [hovered, focused, reducedMotion]);
  return (
    <section className="hero-destination-photo destination-slider" aria-label="Discover Nashik destinations" aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      {places.map((place, index) => (
        <img key={place.image} className={index === active ? "destination-slide is-active" : "destination-slide"}
          src={place.image} alt={place.alt} aria-hidden={index !== active}
          fetchPriority={index === 0 ? "high" : "low"} decoding="async" />
      ))}
      <div className="destination-slider-caption" aria-live={focused || reducedMotion ? "polite" : "off"}>
        <MapPin size={16} /><strong>{places[active]!.name}</strong>
        <div className="destination-slider-dots" aria-label="Choose destination photo">
          {places.map((place, index) => <button key={place.image} type="button" aria-label={`Show ${place.name}`} aria-pressed={active === index} onClick={() => setActive(index)} />)}
        </div>
      </div>
    </section>
  );
}
