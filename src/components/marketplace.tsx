import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Search,
  ShieldCheck,
  Heart,
  Star,
  Car,
  Users,
  SlidersHorizontal,
  Check,
  Menu,
  BedDouble,
  Sun,
  Sparkles,
  X,
  Scale,
  Headphones,
  House,
  Compass,
  Bookmark,
  CalendarDays,
  Hotel,
  HouseHeart,
  Landmark,
  TentTree,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { Modal, AmenityRow, GuestPicker, initialCriteria } from "./stay-ui";
import { DESTINATIONS } from "@/data/seed";
import { IMG } from "@/data/images";
import type { Property, SearchCriteria } from "@/data/types";
import { demoActions, useDemoStore } from "@/lib/demo-store";
import { filterStays, money, priceOf } from "@/lib/stay-search";
const PropertyExperience = lazy(() =>
  import("./property-experience").then((m) => ({ default: m.PropertyExperience })),
);
const Dashboard = lazy(() => import("./stay-dashboard").then((m) => ({ default: m.Dashboard })));
import { SearchExperience } from "./search-experience";
import { SignatureDestinations, JourneyCollections } from "./signature-destinations";
import { PageSkeleton } from "./signature-loading";
import { useLang, LANGUAGES, type Lang } from "@/lib/i18n";
import { StayAreaMap } from "./stay-area-map";
import { StayPriceSummary } from "./stay-price-summary";
import { HeroVideo } from "./hero-video";
import { HeroDestinationSlider } from "./hero-destination-slider";
import { EnquiryPopup } from "./enquiry-popup";
import { PremiumFooter } from "./premium-footer";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
const chips = ["Budget Stays", "Family Friendly", "Near Trimbakeshwar", "Parking Available"];
const accommodationTabs = [
  { name: "All Stays", icon: LayoutGrid, tone: "blue" },
  { name: "Hotels", icon: Hotel, tone: "cyan" },
  { name: "Homestays", icon: HouseHeart, tone: "orange" },
  { name: "Dharamshalas", icon: Landmark, tone: "blue" },
  { name: "Tent Cities", icon: TentTree, tone: "cyan" },
];
export function Marketplace() {
  const { state } = useDemoStore();
  const { lang, setLang, t } = useLang();
  const [mapView, setMapView] = useState(false);
  const path = useLocation().pathname;
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  const [active, setActive] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sort, setSort] = useState("recommended");
  const [guests, setGuests] = useState(false);
  const [filters, setFilters] = useState(false);
  const [quick, setQuick] = useState<Property | null>(null);
  const [compared, setCompared] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [group, setGroup] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [searched, setSearched] = useState(false);
  const [category, setCategory] = useState("All Stays");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("category");
    if (requested && accommodationTabs.some((tab) => tab.name === requested)) {
      setCategory(requested);
      setSearched(true);
    }
  }, [path]);
  useEffect(() => {
    if (state.searchCriteria) setCriteria(state.searchCriteria);
  }, [state.searchCriteria]);
  const results = filterStays(state, criteria, active, maxPrice)
    .filter(
      (p) =>
        category === "All Stays" ||
        (category === "Hotels"
          ? ["Budget Hotel", "Premium Hotel", "Resort", "Lodge"].includes(p.category)
          : category === "Premium Hotels & Resorts"
            ? ["Premium Hotel", "Resort"].includes(p.category)
            : p.category ===
              ((
                {
                  Homestays: "Homestay",
                  Dharamshalas: "Dharamshala",
                  "Tent Cities": "Tent City",
                  "Budget Hotels": "Budget Hotel",
                } as Record<string, string>
              )[category] ?? category)),
    )
    .filter((p) => path !== "/wishlist" || state.wishlist.includes(p.id))
    .sort((a, b) =>
      sort === "price"
        ? priceOf(a) - priceOf(b)
        : sort === "rating"
          ? b.rating - a.rating
          : Number(b.featured) - Number(a.featured),
    );
  const pageRef = useRef<HTMLDivElement>(null);
  const previousResults = useRef("");
  const resultsKey = JSON.stringify([path, results.map((property) => property.id), criteria, active, category, maxPrice, sort]);
  useEffect(() => {
    const root = pageRef.current;
    if (!root || !window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    root.querySelectorAll<HTMLElement>("[data-reveal], .accommodation-section, .cinema-section, .journey-section").forEach((element) => {
      if (element.dataset["motionReady"]) return;
      element.dataset["motionReady"] = "true";
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add("reveal-pending");
        observer.observe(element);
      }
    });
    const revealAll = () => {
      if (preference.matches) root.querySelectorAll(".reveal-pending").forEach((element) => element.classList.remove("reveal-pending"));
    };
    preference.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", revealAll);
      root.querySelectorAll<HTMLElement>(".reveal-pending").forEach((element) => {
        element.classList.remove("reveal-pending");
        delete element.dataset["motionReady"];
      });
    };
  }, [path, resultsKey]);
  useEffect(() => {
    const changed = previousResults.current && previousResults.current !== resultsKey;
    previousResults.current = resultsKey;
    if (!changed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations: Animation[] = [];
    pageRef.current?.querySelectorAll<HTMLElement>(".property-grid .property-card").forEach((card, index) => {
      if (!card.animate) return;
      animations.push(card.animate([{ opacity: 0.45, translate: "0 8px" }, { opacity: 1, translate: "0 0" }], {
        duration: 220, delay: Math.min(index, 5) * 20, easing: "ease-out", fill: "backwards",
      }));
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [resultsKey]);
  const home = path === "/";
  useEffect(() => {
    if (!home) return;
    const timer = window.setTimeout(() => {
      if (!document.querySelector("[role=dialog]")) setEnquiryOpen(true);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [home]);
  const mobileNav = ["/", "/stays", "/wishlist", "/bookings"].includes(path);
  function showResults() {
    requestAnimationFrame(() =>
      document.getElementById("stays")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    );
  }
  function applyCollection(destination: SearchCriteria["destination"], nextChips: string[] = []) {
    const next = { ...criteria, destination };
    setCriteria(next);
    setCategory("All Stays");
    setActive(nextChips);
    setMaxPrice(20000);
    setSearched(true);
    demoActions.setSearchCriteria(next);
    showResults();
  }
  function search() {
    if (
      (criteria.checkIn && !criteria.checkOut) ||
      (criteria.checkOut && !criteria.checkIn) ||
      (criteria.checkIn && criteria.checkOut <= criteria.checkIn)
    ) {
      setNotice("Please select a check-out date after check-in.");
      return false;
    }
    demoActions.setSearchCriteria(criteria);
    setSearched(true);
    showResults();
    return true;
  }
  function toggleCompare(id: string) {
    setCompared((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
    if (!compared.includes(id) && compared.length === 3)
      setNotice("You can compare up to 3 stays. Remove one to add another.");
  }
  return (
    <div
      ref={pageRef}
      className={`marketplace ${home ? "signature-home" : ""} ${mobileNav ? "with-bottom-nav" : ""}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        <span>NASHIK KUMBH 2027 · Start with a stay that feels right.</span>
        <a href="/stays">
          Discover Nashik & Trimbakeshwar <ArrowRight size={13} />
        </a>
      </div>
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-symbol">
            <Sun size={27} />
          </span>
          <span>
            Mahakumbh<span className="brand-accent">Stays</span>
            <small>STAY CLOSE TO WHAT MATTERS</small>
          </span>
        </a>
        <nav className={`header-primary-nav ${menu ? "open" : ""}`} aria-label="Main navigation">
          <a className={home ? "active" : ""} href="/" aria-current={home ? "page" : undefined}>
            <House className="nav-icon nav-icon-blue" size={17} /> {t("nav.home")}
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={path === "/stays" ? "active explore-trigger" : "explore-trigger"}>
                <Compass className="nav-icon nav-icon-cyan" size={17} /> {t("nav.explore")} <ChevronDown size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="header-stays-dropdown" align="start" sideOffset={10}>
              {accommodationTabs.map(({name, icon: Icon, tone}) => (
                <DropdownMenuItem key={name} onSelect={() => {
                  setMenu(false);
                  if (home || path === "/stays") {
                    setCategory(name);
                    setSearched(true);
                    showResults();
                  } else {
                    window.location.assign(`/stays?category=${encodeURIComponent(name)}`);
                  }
                }}>
                  <span className={`category-icon category-icon-${tone}`} aria-hidden="true"><Icon size={20} /></span>
                  <span>{name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => {setMenu(false); setGroup(true);}}>
            <Users className="nav-icon nav-icon-orange" size={17} /> Group bookings
          </button>
          <a className="list-property-link" href="/owner">
            <Hotel size={17} /> {t("nav.listProperty")} <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="header-actions">
          <select className="language-switch" aria-label="Interface language" title={t("lang.note")} value={lang} onChange={(event) => setLang(event.target.value as Lang)}>{LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select>
          <a className="icon-button" href="/wishlist" aria-label="Your wishlist">
            <Heart size={19} />
          </a>
          <button className="account-button outline-button" onClick={() => setAccountOpen(true)}>
            {t("nav.login")}
          </button>
          <a href="/bookings" className="outline-button">
            {t("nav.bookings")}
          </a>
          <button
            className="icon-button mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
        </div>
      </header>
      <main id="main">
        <Suspense fallback={<PageSkeleton />}>
          {path.startsWith("/owner") || path.startsWith("/admin") ? (
            <Dashboard admin={path.startsWith("/admin")} />
          ) : path.startsWith("/property/") || path === "/booking" ? (
            <PropertyExperience slug={decodeURIComponent(path.split("/")[2] ?? "")} />
          ) : path === "/bookings" ? (
            <section className="container section">
              <span className="eyebrow">YOUR JOURNEYS</span>
              <h1>Good memories start here.</h1>
              <p className="muted">Your bookings, all in one place. Demo payments only.</p>
              <div className="booking-list">
                {state.bookings
                  .filter((b) => b.guestEmail === state.demoProfile.email)
                  .map((b) => (
                    <article className="panel" key={b.id}>
                      <span className="pill">{b.status.replaceAll("_", " ")}</span>
                      <h3>{b.propertyName}</h3>
                      <p>
                        {b.checkIn} → {b.checkOut} · {b.nights} nights
                      </p>
                      <strong>{money(b.total)}</strong>
                      <p>
                        Payment: {b.paymentStatus} · Reference {b.id}
                      </p>
                      {b.status === "confirmed" && (
                        <button
                          className="outline-button"
                          onClick={() => demoActions.requestCancellation(b.id)}
                        >
                          Request cancellation
                        </button>
                      )}
                    </article>
                  ))}
                {!state.bookings.some((b) => b.guestEmail === state.demoProfile.email) && (
                  <div className="empty-state">
                    <BedDouble />
                    <h3>Your next journey is waiting</h3>
                    <a href="/stays" className="primary-button">
                      Find a stay <ArrowRight size={16} />
                    </a>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              {home && (
                <section className="hero">
                  <div className="hero-shade" />
                  <div className="hero-content container">
                    <span className="hero-label">
                      <span /> THE NASHIK KUMBH EDIT · 2027
                    </span>
                    <h1>
                      {lang !== "en" ? t("hero.title") : <>Find Your Perfect Stay{" "}
                      <span>
                        for Nashik Kumbh <em>2027</em>
                      </span></>}
                    </h1>
                    <p className="hero-signature">Your Stay for Every Sacred Journey.</p>
                    <p className="hero-support">
                      Discover comfortable hotels, homestays, dharamshalas and premium accommodation
                      across Nashik and Trimbakeshwar.
                    </p>
                    <div className="hero-proof">
                      <span>
                        <ShieldCheck size={16} /> 10 curated demo stays
                      </span>
                      <i />
                      <span>
                        <Heart size={16} /> Made for every generation
                      </span>
                    </div>
                  </div>
                  <HeroDestinationSlider />
                </section>
              )}
              <nav className="stay-category-nav container" aria-label="Accommodation categories">
                {accommodationTabs.map(({ name, icon: Icon, tone }) => (
                  <button
                    key={name}
                    aria-pressed={category === name}
                    onClick={() => {
                      setCategory(name);
                      setSearched(true);
                      showResults();
                    }}
                  >
                    <span className={`category-icon category-icon-${tone}`} aria-hidden="true">
                      <Icon size={30} strokeWidth={1.7} />
                      <span className="category-icon-spark" />
                    </span>
                    <span>{name}</span>
                  </button>
                ))}
              </nav>
              <section
                className={`search-area container ${home ? "floating" : ""}`}
                aria-label="Find accommodation"
              >
                <SearchExperience
                  criteria={criteria}
                  onChange={setCriteria}
                  onSearch={search}
                  onGuests={() => setGuests(true)}
                />
                <div className="quick-chips">
                  <span>A stay for you</span>
                  {chips.map((c, i) => (
                    <button
                      key={c}
                      aria-pressed={active.includes(c)}
                      className={active.includes(c) ? "selected" : ""}
                      onClick={() => {
                        setActive(
                          active.includes(c) ? active.filter((x) => x !== c) : [...active, c],
                        );
                        setSearched(true);
                      }}
                    >
                      {i === 0 ? (
                        <Sparkles size={13} />
                      ) : i === 1 ? (
                        <Users size={13} />
                      ) : i === 2 ? (
                        <MapPin size={13} />
                      ) : (
                        <Car size={13} />
                      )}{" "}
                      {c}
                    </button>
                  ))}
                </div>
              </section>
              {home && (
                <>
                  <div className="trust-strip container">
                    <span>
                      <ShieldCheck /> Sample accommodation listings
                      <small>Comfort you can count on</small>
                    </span>
                    <span>
                      <BedDouble /> A stay for every budget
                      <small>Simple rooms to special retreats</small>
                    </span>
                    <span>
                      <Headphones /> People, not just a platform<small>Here to help you plan</small>
                    </span>
                    <span>
                      <Users /> Travel together, stay together<small>Family & group friendly</small>
                    </span>
                  </div>
                  <section className="cinema-section container" aria-label="A glimpse of Kumbh">
                    <HeroVideo />
                    <div className="cinema-copy">
                      <span className="eyebrow">THE JOURNEY BEGINS WITH YOU</span>
                      <h2>
                        Your Journey.
                        <br />
                        Your Stay.
                        <br />
                        Your Experience.
                      </h2>
                      <p>Make room for discovery in Nashik and Trimbakeshwar.</p>
                      <button className="primary-button" onClick={() => applyCollection("")}>
                        Explore Stays <ArrowRight size={17} />
                      </button>
                      <small>Video: Prayagraj Kumbh · archival footage</small>
                    </div>
                  </section>
                  <section className="container section accommodation-section">
                    <div className="section-heading">
                      <div>
                        <span className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</span>
                        <h2>However you travel, find your stay.</h2>
                        <p>Five ways to settle in. One unforgettable journey.</p>
                      </div>
                      <a className="text-link" href="/stays">
                        Explore all stays <ArrowUpRight size={17} />
                      </a>
                    </div>
                    <div className="accommodation-grid">
                      {[
                        { name: "Budget Hotels", image: IMG.roomA, caption: "Easy on the budget" },
                        {
                          name: "Premium Hotels & Resorts",
                          image: IMG.resortB,
                          caption: "A little extra comfort",
                        },
                        { name: "Homestays", image: IMG.homeB, caption: "Feel at home, away" },
                        {
                          name: "Dharamshalas",
                          image: IMG.extB,
                          caption: "Stay close to your purpose",
                        },
                        {
                          name: "Tent Cities",
                          image: IMG.tentA,
                          caption: "A different kind of escape",
                        },
                      ].map((item) => (
                        <button
                          key={item.name}
                          className="accommodation-card"
                          onClick={() => {
                            setCategory(item.name);
                            setSearched(true);
                            showResults();
                          }}
                        >
                          <img
                            src={item.image}
                            alt={`Sample ${item.name.toLowerCase()} accommodation`}
                            loading="lazy"
                          />
                          <span>
                            <small>{item.caption}</small>
                            <strong>{item.name}</strong>
                          </span>
                          <ArrowUpRight size={21} />
                        </button>
                      ))}
                    </div>
                  </section>
                  <SignatureDestinations
                    properties={state.properties}
                    onExplore={(destination) => applyCollection(destination)}
                  />
                </>
              )}
              <section
                className={`container section ${home && !searched ? "featured-stays" : ""}`}
                id="stays"
                data-reveal
              >
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      {home && !searched
                        ? "THE STAY COLLECTION / 2027"
                        : "GOOD STAYS. GREAT MEMORIES."}
                    </span>
                    <h2>
                      {path === "/wishlist"
                        ? "Your little collection of favourites."
                        : searched
                          ? "Find your perfect place."
                          : "Stays you’ll love coming back to."}
                    </h2>
                    <p>
                      {searched
                        ? `${results.length} stays match your search. Prices shown per room, per night.`
                        : "Thoughtfully chosen stays for a journey that feels just right."}
                    </p>
                  </div>
                  <div className="results-controls">
                    <button className="outline-button map-view-toggle" aria-pressed={mapView} onClick={() => setMapView(!mapView)}><MapPin size={16} />{lang === "mr" ? (mapView ? "नकाशा लपवा" : "नकाशा पहा") : lang === "hi" ? (mapView ? "नक्शा छिपाएँ" : "नक्शा देखें") : (mapView ? "Hide map" : "Map view")}</button>
                    <select
                      aria-label="Sort stays"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price">Price: low to high</option>
                      <option value="rating">Top rated</option>
                    </select>
                    <button className="outline-button" onClick={() => setFilters(true)}>
                      <SlidersHorizontal size={16} /> Filters{maxPrice < 20000 ? " (1)" : ""}
                    </button>
                  </div>
                </div>
                {mapView && <StayAreaMap properties={results} />}
                <div
                  className={`property-grid ${home && !searched ? "featured-grid" : ""}`}
                  aria-label={
                    home && !searched ? "Featured demo stays — swipe to explore" : "Matching stays"
                  }
                >
                  {results.slice(0, searched || !home ? results.length : 5).map((p) => (
                    <article className="property-card" key={p.id}>
                      <div className="card-photo">
                        <a href={`/property/${p.slug}`}>
                          <img
                            loading="lazy"
                            decoding="async"
                            src={(p.images[0] ?? IMG.roomA).replace("w=1200", "w=680")}
                            alt={p.name}
                          />
                          {p.images[1] && (
                            <img
                              className="alternate-image"
                              loading="lazy"
                              src={p.images[1].replace("w=1200", "w=680")}
                              alt={`Another view of ${p.name}`}
                            />
                          )}
                        </a>
                        <span className="photo-tag">
                          {p.featured ? "Guest favourite" : p.category}
                        </span>
                        <button
                          aria-label={`Save ${p.name}`}
                          aria-pressed={state.wishlist.includes(p.id)}
                          className={`heart-button ${state.wishlist.includes(p.id) ? "saved" : ""}`}
                          onClick={(event) => {
                            if (!state.wishlist.includes(p.id) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                              event.currentTarget.querySelector("svg")?.animate?.([
                                { transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.45 }, { transform: "scale(1)" },
                              ], { duration: 280, easing: "ease-out" });
                            }
                            demoActions.toggleWishlist(p.id);
                          }}
                        >
                          <Heart
                            size={19}
                            fill={state.wishlist.includes(p.id) ? "currentColor" : "none"}
                          />
                        </button>
                        <button className="quick-view" onClick={() => setQuick(p)}>
                          Quick view <ArrowUpRight size={14} />
                        </button>
                        <span className="demo-listing-label">Demo Listing</span>
                      </div>
                      <div className="card-body">
                        <div className="card-location">
                          <span>
                            <MapPin size={12} />
                            {p.location}
                          </span>
                          <strong>
                            <Star size={12} fill="currentColor" /> {p.rating.toFixed(1)}{" "}
                            <small>({p.reviewCount})</small>
                          </strong>
                        </div>
                        <h3>
                          <a href={`/property/${p.slug}`}>{p.name}</a>
                        </h3>
                        <AmenityRow property={p} />
                        <a className="property-details-cta" href={`/property/${p.slug}`}>
                          {t("common.viewDetails")} <ArrowUpRight size={15} />
                        </a>
                        <StayPriceSummary property={p} criteria={criteria} />
                        <div className="card-price">
                          <div>
                            <strong>{money(priceOf(p))}</strong>
                            <span> / night</span>
                            <small>+ 8% demo taxes & fees</small>
                          </div>
                          <button
                            className={`compare-button ${compared.includes(p.id) ? "selected" : ""}`}
                            aria-pressed={compared.includes(p.id)}
                            onClick={() => toggleCompare(p.id)}
                          >
                            {compared.includes(p.id) ? <Check size={14} /> : <Scale size={14} />}{" "}
                            Compare
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {results.length === 0 && (
                  <div className="empty-state">
                    <Search />
                    <h3>A little change could find your perfect stay.</h3>
                    <p>Try another destination or fewer filters.</p>
                    <button
                      className="outline-button"
                      onClick={() => {
                        setCategory("All Stays");
                        setCriteria(initialCriteria);
                        setActive([]);
                        setMaxPrice(20000);
                      }}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
                {home && !searched && (
                  <div className="center">
                    <a href="/stays" className="outline-button">
                      Discover all stays <ArrowRight size={16} />
                    </a>
                  </div>
                )}
              </section>
              {home && <JourneyCollections onChoose={applyCollection} />}
              {home && (
                <section className="group-banner container" data-reveal>
                  <div className="group-illustration">
                    <Users size={48} />
                    <span>BETTER TOGETHER</span>
                  </div>
                  <div>
                    <span className="eyebrow">MORE PEOPLE. MORE MEMORIES.</span>
                    <h2>A journey shared is a journey made richer.</h2>
                    <p>
                      Family getaways, pilgrim groups, or a whole community.
                      <br />
                      Let us help you find a place for everyone.
                    </p>
                  </div>
                  <button className="primary-button" onClick={() => setGroup(true)}>
                    Plan a group stay <ArrowUpRight size={17} />
                  </button>
                </section>
              )}
            </>
          )}
        </Suspense>
      </main>
      <PremiumFooter onEnquiry={() => setEnquiryOpen(true)} onGroup={() => setGroup(true)} />
      <EnquiryPopup open={enquiryOpen} onOpenChange={setEnquiryOpen} criteria={criteria} />
      {mobileNav && (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {[
            { href: "/", label: "Home", icon: House },
            { href: "/stays", label: "Explore", icon: Compass },
            { href: "/wishlist", label: "Saved", icon: Bookmark },
            { href: "/bookings", label: "Bookings", icon: CalendarDays },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={path === item.href ? "page" : undefined}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      )}
      <Modal title="Your traveller profile" open={accountOpen} close={() => setAccountOpen(false)}>
        <p className="muted">
          Demo account · Your profile is saved only in this browser. No password or real sign-in
          required.
        </p>
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            demoActions.updateProfile({
              name: String(data.get("name")),
              email: String(data.get("email")),
              phone: String(data.get("phone")),
            });
            setAccountOpen(false);
          }}
        >
          <label>
            Name
            <input name="name" autoComplete="name" required defaultValue={state.demoProfile.name} />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={state.demoProfile.email}
            />
          </label>
          <label>
            Phone
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              defaultValue={state.demoProfile.phone}
            />
          </label>
          <button className="primary-button" type="submit">
            Continue with demo profile <ArrowRight size={16} />
          </button>
        </form>
      </Modal>
      <Modal title="Who's coming along?" open={guests} close={() => setGuests(false)}>
        <GuestPicker value={criteria} onChange={setCriteria} />
        <button className="primary-button" onClick={() => setGuests(false)}>
          Done <Check size={16} />
        </button>
      </Modal>
      <Modal title="Make it your kind of stay" open={filters} close={() => setFilters(false)}>
        <label className="form-label">
          Maximum price per night: {money(maxPrice)}
          <input
            type="range"
            min="500"
            max="20000"
            step="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </label>
        <div className="filter-options">
          {chips.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={active.includes(c)}
                onChange={() =>
                  setActive(active.includes(c) ? active.filter((x) => x !== c) : [...active, c])
                }
              />
              {c}
            </label>
          ))}
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setFilters(false);
            setSearched(true);
          }}
        >
          Show {results.length} stays <ArrowRight size={16} />
        </button>
        <button
          className="text-link"
          onClick={() => {
            setActive([]);
            setMaxPrice(20000);
          }}
        >
          Reset filters
        </button>
      </Modal>
      <Modal title={quick?.name ?? "Quick view"} open={!!quick} close={() => setQuick(null)}>
        {quick && (
          <>
            <img className="modal-photo" src={quick.images[0]} alt={quick.name} />
            <span className="muted">
              {quick.location} · ★ {quick.rating} · {quick.category}
            </span>
            <p>{quick.description}</p>
            <AmenityRow property={quick} />
            <strong>From {money(priceOf(quick))} / night</strong>
            <a className="primary-button" href={`/property/${quick.slug}`}>
              Explore this stay <ArrowRight size={16} />
            </a>
          </>
        )}
      </Modal>
      {compared.length > 0 && (
        <div className="compare-tray">
          <span>
            <Scale size={18} /> {compared.length} of 3 stays selected
          </span>
          <button className="primary-button" onClick={() => setCompareOpen(true)}>
            Compare stays
          </button>
          <button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setCompared([])}
          >
            <X size={18} />
          </button>
        </div>
      )}
      <Modal
        wide
        title="Find the stay that fits you"
        description="Compare nightly rates, comforts and location side by side."
        open={compareOpen}
        close={() => setCompareOpen(false)}
      >
        <div className="comparison-grid">
          {compared
            .map((id) => state.properties.find((p) => p.id === id))
            .filter((p): p is Property => !!p)
            .map((p) => (
              <article key={p.id}>
                <img className="modal-photo" src={p.images[0]} alt={p.name} />
                <h3>{p.name}</h3>
                <p>{p.location}</p>
                <p>
                  ★ {p.rating} · {p.reviewCount} reviews
                </p>
                <strong>{money(priceOf(p))} / night</strong>
                <p>
                  {p.category} · Up to {p.maxGuests} guests
                </p>
                <AmenityRow property={p} />
                <p>{p.cancellationPolicy}</p>
                <a className="primary-button" href={`/property/${p.slug}`}>
                  View stay
                </a>
                <button className="text-link" onClick={() => toggleCompare(p.id)}>
                  Remove
                </button>
              </article>
            ))}
        </div>
      </Modal>
      <Modal
        title="Make room for everyone."
        description="Send a demo enquiry. The admin dashboard receives it instantly."
        open={group}
        close={() => setGroup(false)}
      >
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (String(f.get("out")) <= String(f.get("in"))) {
              const out = e.currentTarget.elements.namedItem("out") as HTMLInputElement;
              out.setCustomValidity("Choose a check-out date after check-in.");
              out.reportValidity();
              return;
            }
            demoActions.addEnquiry({
              groupName: String(f.get("group")),
              contactPerson: String(f.get("name")),
              email: String(f.get("email")),
              phone: String(f.get("phone")),
              guests: Number(f.get("guests")),
              preferredLocation: String(f.get("location")),
              checkIn: String(f.get("in")),
              checkOut: String(f.get("out")),
              budget: String(f.get("budget")),
              requirements: String(f.get("requirements")),
            });
            setGroup(false);
            setNotice("Your group enquiry is saved. You can find it in the admin dashboard.");
          }}
        >
          <label>
            Group name
            <input required name="group" placeholder="Family, organisation or community" />
          </label>
          <div className="form-columns">
            <label>
              Contact name
              <input required name="name" />
            </label>
            <label>
              Guests
              <input type="number" min="4" max="1000" defaultValue="10" required name="guests" />
            </label>
          </div>
          <div className="form-columns">
            <label>
              Email
              <input type="email" required name="email" />
            </label>
            <label>
              Phone
              <input type="tel" required name="phone" />
            </label>
          </div>
          <label>
            Preferred location
            <select name="location">
              {DESTINATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <div className="form-columns">
            <label>
              Check-in
              <input
                type="date"
                name="in"
                required
                onChange={(e) => {
                  const out = e.currentTarget.form?.elements.namedItem("out") as HTMLInputElement;
                  if (out) out.min = e.target.value;
                }}
              />
            </label>
            <label>
              Check-out
              <input
                type="date"
                name="out"
                required
                onChange={(e) => e.currentTarget.setCustomValidity("")}
              />
            </label>
          </div>
          <label>
            Budget per night
            <input name="budget" required placeholder="e.g. ₹2,000 per room" />
          </label>
          <label>
            Anything else?
            <textarea name="requirements" placeholder="Accessibility needs, meals, rooms…" />
          </label>
          <button className="primary-button" type="submit">
            Send group enquiry <ArrowRight size={16} />
          </button>
        </form>
      </Modal>
      <Modal title="A quick update" open={!!notice} close={() => setNotice("")}>
        <p role="status">{notice}</p>
        <button className="primary-button" onClick={() => setNotice("")}>
          Got it
        </button>
      </Modal>
    </div>
  );
}
