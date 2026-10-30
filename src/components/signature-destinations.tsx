import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, MapPin, Users, Leaf, Compass } from "lucide-react";
import type { Destination, Property } from "@/data/types";
import { IMG } from "@/data/images";
const places: {
  name: Destination;
  image: string;
  eyebrow: string;
  description: string;
  alt: string;
}[] = [
  {
    name: "Nashik City",
    image: "/images/godavari-card.jpg",
    eyebrow: "THE HEART OF YOUR JOURNEY",
    description:
      "Riverside rituals, neighbourhood discoveries and a warm welcome around every corner.",
    alt: "The Godavari River in Nashik",
  },
  {
    name: "Trimbakeshwar",
    image: "/images/trimbakeshwar-card.jpg",
    eyebrow: "SACRED MORNINGS, SLOW EVENINGS",
    description: "Stay near the temple town and make space for the moments that brought you here.",
    alt: "The stone architecture of Trimbakeshwar temple",
  },
  {
    name: "Panchavati",
    image: "/images/ramkund-card.jpg",
    eyebrow: "A LITTLE CLOSER TO YOUR ROOTS",
    description: "Find your place near the ghats, where an evening walk becomes a memory.",
    alt: "Evening gatherings by Ramkund in Panchavati",
  },
  {
    name: "Nashik Road",
    image: IMG.extC,
    eyebrow: "ARRIVE EASILY, SETTLE IN SOONER",
    description: "Convenient sample stays for easy arrivals, onward journeys and time together.",
    alt: "Hospitality inspiration for stays around Nashik Road",
  },
  {
    name: "Igatpuri",
    image: "/images/igatpuri-card.jpg",
    eyebrow: "TAKE THE SCENIC ROUTE",
    description: "Trade the rush for open skies, green hills and a little room to breathe.",
    alt: "Green hills and open skies in Igatpuri",
  },
];
export function SignatureDestinations({
  properties,
  onExplore,
}: {
  properties: Property[];
  onExplore: (destination: Destination) => void;
}) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const selected = places[active]!;
  function choose(index: number) {
    setActive(index);
    if (window.matchMedia("(max-width: 600px)").matches) {
      const card = track.current?.children[index] as HTMLElement | undefined;
      if (card && track.current)
        track.current.scrollTo({
          left: card.offsetLeft - track.current.offsetLeft,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
    }
  }
  const count = (name: Destination) =>
    properties.filter((p) => p.status === "approved" && p.location === name).length;
  return (
    <section
      className="container section signature-destinations"
      id="destination-explorer"
      aria-labelledby="destinations-heading"
      data-reveal
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIVE PLACES. YOUR OWN WAY TO EXPLORE.</span>
          <h2 id="destinations-heading">A place for every kind of journey.</h2>
          <p>Follow the river. Find the hills. Stay a little closer.</p>
        </div>
        <span className="destination-index" aria-live="polite">
          <strong>{String(active + 1).padStart(2, "0")}</strong>
          <span>/ 05</span>
          <i />
        </span>
      </div>
      <div className="destination-desktop-stage">
        <article className="showcase-primary">
          <img key={selected.name} src={selected.image} alt={selected.alt} loading="lazy" />
          <div className="showcase-gradient" />
          <span className="showcase-label">
            <MapPin size={13} /> THE NASHIK EDIT · 2027
          </span>
          <div className="showcase-copy" key={selected.description}>
            <span>{selected.eyebrow}</span>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <button className="showcase-cta" onClick={() => onExplore(selected.name)}>
              Explore Stays <ArrowUpRight size={17} />
            </button>
          </div>
          <span className="showcase-count">{count(selected.name)} demo stays</span>
        </article>
        <div className="destination-previews">
          {[1, 2].map((offset) => {
            const index = (active + offset) % places.length;
            const p = places[index]!;
            return (
              <button
                className="destination-preview"
                key={p.name}
                onClick={() => choose(index)}
                aria-label={`Preview ${p.name}`}
              >
                <img src={p.image} alt={p.alt} loading="lazy" />
                <span className="showcase-gradient" />
                <span>
                  <small>{String(index + 1).padStart(2, "0")} / DISCOVER</small>
                  <strong>{p.name}</strong>
                </span>
                <ArrowUpRight size={21} />
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="destination-snap-track"
        ref={track}
        aria-label="Swipe to explore five destinations"
        onScroll={() => {
          if (!track.current) return;
          const start = track.current.getBoundingClientRect().left;
          let closest = 0;
          let distance = Infinity;
          Array.from(track.current.children).forEach((child, i) => {
            const diff = Math.abs(child.getBoundingClientRect().left - start);
            if (diff < distance) {
              distance = diff;
              closest = i;
            }
          });
          setActive(closest);
        }}
      >
        {places.map((p, i) => (
          <article
            className="destination-snap-card"
            key={p.name}
            aria-label={`${i + 1} of 5: ${p.name}`}
          >
            <img loading="lazy" src={p.image} alt={p.alt} />
            <div className="showcase-gradient" />
            <span className="showcase-label">
              {String(i + 1).padStart(2, "0")} / 05 · {count(p.name)} demo stays
            </span>
            <div className="showcase-copy">
              <span>{p.eyebrow}</span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <button className="showcase-cta" onClick={() => onExplore(p.name)}>
                Explore Stays <ArrowUpRight size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="destination-selectors" aria-label="Choose destination">
        {places.map((p, i) => (
          <button
            key={p.name}
            aria-label={`Show ${p.name}`}
            aria-pressed={active === i}
            onClick={() => choose(i)}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {p.name}
            <i />
          </button>
        ))}
      </div>
      <div className="destination-pagination" aria-label="Destination pagination">
        {places.map((p, i) => (
          <button
            key={p.name}
            aria-label={`Go to ${p.name}`}
            aria-current={active === i ? "true" : undefined}
            onClick={() => choose(i)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}
export function JourneyCollections({
  onChoose,
}: {
  onChoose: (destination: Destination | "", chips: string[]) => void;
}) {
  return (
    <section className="journey-section" aria-labelledby="journey-heading">
      <div className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">STAY BY YOUR JOURNEY</span>
            <h2 id="journey-heading">Find the Right Stay for Your Journey</h2>
            <p>Find accommodation that fits the way you want to experience Nashik Kumbh 2027.</p>
          </div>
          <Compass size={31} strokeWidth={1} />
        </div>
        <div className="journey-grid">
          {[
            {
              title: "Budget-Friendly Stays",
              description: "Thoughtful comfort at a price that fits.",
              image: IMG.roomA,
              icon: Compass,
              destination: "" as const,
              chips: ["Budget Stays"],
              tag: "SMARTER STAYS",
            },
            {
              title: "Premium Comfort",
              description: "Spacious rooms and a little more indulgence.",
              image: IMG.resortB,
              icon: Compass,
              destination: "" as const,
              chips: ["Premium Comfort"],
              tag: "TIME TO UNWIND",
            },
            {
              title: "Near Trimbakeshwar",
              description: "Less travel. More time for the moments that matter.",
              image: "/images/trimbakeshwar-card.jpg",
              icon: MapPin,
              destination: "Trimbakeshwar" as const,
              chips: ["Near Trimbakeshwar"],
              tag: "01 / FIND YOUR CONNECTION",
            },
            {
              title: "Family Accommodation",
              description: "A little more room for every generation to feel at home.",
              image: IMG.roomH,
              icon: Users,
              destination: "" as const,
              chips: ["Family Friendly"],
              tag: "02 / BRING EVERYONE ALONG",
            },
            {
              title: "Group Accommodation",
              description: "Find room for your people and your shared memories.",
              image: "/images/igatpuri-card.jpg",
              icon: Leaf,
              destination: "" as const,
              chips: ["Group Accommodation"],
              tag: "03 / FIND YOUR QUIET",
            },
          ].map((j) => (
            <button
              className="journey-card"
              key={j.title}
              onClick={() => onChoose(j.destination, j.chips)}
            >
              <div className="journey-photo">
                <img
                  src={j.image}
                  alt={j.title === "Near Trimbakeshwar" ? "Trimbakeshwar temple" : j.title === "Group Accommodation" ? "Hills near Igatpuri" : `Sample accommodation for ${j.title.toLowerCase()}`}
                  loading="lazy"
                />
                <span>
                  <j.icon size={19} />
                </span>
              </div>
              <div className="journey-copy">
                <small>{j.tag}</small>
                <h3>{j.title}</h3>
                <p>{j.description}</p>
                <span>
                  Find your stay <ArrowRight size={16} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
