import { useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Property } from "@/data/types";
import { useLang } from "@/lib/i18n";
import { money, priceOf } from "@/lib/stay-search";

export function StayAreaMap({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState("");
  const { lang, t } = useLang();
  const areas = [...new Set(properties.map((property) => property.location))];
  const area = areas.includes(selected) ? selected : areas[0] ?? "Nashik City";
  const query = `${area}, Nashik, Maharashtra, India`;
  const matching = properties.filter((property) => property.location === area);
  return (
    <section className="stay-area-map" aria-label="Explore accommodation areas">
      <div className="area-map-sidebar">
        <h3><MapPin size={19} />{lang === "mr" ? "परिसर शोधा" : lang === "hi" ? "इलाके देखें" : "Find your neighbourhood"}</h3>
        <p>{lang === "mr" ? "नकाशा परिसर दाखवतो; नमुना हॉटेलचे अचूक स्थान नाही." : lang === "hi" ? "नक्शा इलाका दिखाता है; डेमो होटल का सटीक स्थान नहीं।" : "Explore the area. Demo listings do not have verified map pins."}</p>
        <label>{t("search.destination")}<select value={area} onChange={(event) => setSelected(event.target.value)}>{(areas.length ? areas : [area]).map((name) => <option key={name}>{name}</option>)}</select></label>
        <div className="area-map-list">
          {matching.map((property) => <a key={property.id} href={`/property/${property.slug}`}>
            <strong>{property.name}</strong><small>{money(priceOf(property))} / {t("common.perNight")}</small>
            {property.landmarks[0] && <small>{property.landmarks[0].name} · {property.landmarks[0].km} km (demo)</small>}
            <ArrowUpRight size={16} />
          </a>)}
          {!matching.length && <p>No stays match your current filters.</p>}
        </div>
      </div>
      <div className="area-map-canvas">
        <iframe title={`Map of ${area}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        <a className="area-map-external" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">{area} · Open map <ArrowUpRight size={14} /></a>
      </div>
    </section>
  );
}
