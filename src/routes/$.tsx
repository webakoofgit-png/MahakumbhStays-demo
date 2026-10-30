import { createFileRoute, notFound } from "@tanstack/react-router";
import { Marketplace } from "@/components/marketplace";
import { findProperty, getDemoState } from "@/lib/demo-store";
export const Route = createFileRoute("/$")({
  beforeLoad: ({ location }) => {
    if (
      !/^\/(about|contact|faq|privacy|terms|cancellation|stays|wishlist|bookings|booking|owner(?:\/.*)?|admin(?:\/.*)?|property\/[^/]+)\/?$/.test(
        location.pathname,
      )
    )
      throw notFound();
  },
  head: ({ params }) => {
    const path = params._splat ?? "";
    const property = path.startsWith("property/")
      ? findProperty(getDemoState(), decodeURIComponent(path.slice(9)))
      : undefined;
    const titles: Record<string, string> = {
      stays: "Explore stays",
      wishlist: "Your favourites",
      bookings: "My bookings",
      owner: "Owner dashboard",
      admin: "Admin dashboard",
      booking: "Plan your booking",
      about: "About us",
      contact: "Contact & support",
      faq: "Frequently asked questions",
      privacy: "Privacy policy",
      terms: "Terms & conditions",
      cancellation: "Cancellation & refunds",
    };
    return {
      meta: [
        { title: `${property?.name ?? titles[path] ?? "Explore Nashik"} | MahakumbhStays` },
        ...(property ? [{ name: "description", content: property.description.slice(0, 160) }] : []),
        ...(/^(owner|admin|booking)/.test(path)
          ? [{ name: "robots", content: "noindex, nofollow" }]
          : []),
      ],
    };
  },
  component: Marketplace,
});
