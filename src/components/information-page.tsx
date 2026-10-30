import { ArrowRight, ArrowLeft, HelpCircle, ShieldCheck } from "lucide-react";

type Section = { title: string; text: string };
export const informationPages: Record<string, { title: string; intro: string; sections: Section[] }> = {
  "/about": {
    title: "A thoughtful stay. A meaningful journey.",
    intro: "MahakumbhStays is an accommodation marketplace prototype for exploring Nashik and Trimbakeshwar ahead of Nashik Kumbh 2027.",
    sections: [
      { title: "Stay your way", text: "Browse sample hotels, homestays, dharamshalas and tent accommodation. Compare locations, amenities, rooms and prices to find a stay that suits your journey." },
      { title: "Plan together", text: "Use the group enquiry form for family or group requirements. Enquiries are stored in this browser and can be viewed in the demo admin dashboard." },
      { title: "An interactive demo", text: "Properties, ratings, availability and bookings are sample data. No real accommodation is reserved, no money is collected and enquiries do not send emails or phone calls." },
    ],
  },
  "/contact": {
    title: "A little help planning your stay.",
    intro: "Choose a quick stay enquiry or share your group requirements. This prototype saves your request on this device so you can try the complete experience.",
    sections: [
      { title: "Individual and family stays", text: "Use Make an enquiry below to share a name, phone number and destination. Demo requests are saved locally; they are not sent to a live support team." },
      { title: "Groups and pilgrim parties", text: "Use Group bookings to share dates, group size, budget and accommodation requirements. View the saved request in Admin dashboard → Group enquiries." },
      { title: "Existing demo bookings", text: "Open My bookings using the same demo profile email used at checkout. Confirmed bookings include a cancellation request action." },
      { title: "Property owners", text: "The owner dashboard lets you explore sample property and room management. This prototype does not verify or onboard real accommodation providers." },
    ],
  },
  "/faq": {
    title: "Questions before your journey?",
    intro: "Find answers about searching, demo bookings, payments and managing your stay.",
    sections: [
      { title: "Can I book a real room here?", text: "No. This is a prototype with sample accommodation. A confirmation records a demo booking on this device; it is not a real reservation." },
      { title: "How do I find suitable accommodation?", text: "Choose a destination, check-in and check-out dates, guests and rooms. Use accommodation categories, budget and amenity filters to narrow your results." },
      { title: "What does the price include?", text: "Nightly prices are per room. With dates selected, the estimated trip total includes the requested rooms and nights plus 8% demo taxes and service fees. The selected room determines the final checkout total." },
      { title: "Are payments real?", text: "No. Checkout offers simulated success and failure outcomes. Do not enter real payment credentials." },
      { title: "How can I cancel?", text: "Go to My bookings and request cancellation of a confirmed booking. The demo admin can review the request and update cancellation and refund status." },
      { title: "Why did my booking disappear on another device?", text: "Demo data is stored in your browser. A different device, browser, cleared storage or a reset will not retain the same bookings." },
      { title: "Does the map show exact property locations?", text: "The map shows destination areas. Sample listings do not have verified property pins; landmark distances are demo information." },
      { title: "Can I change the language?", text: "Use the language selector in the header for English, Hindi or Marathi. Core navigation and search labels are translated; property descriptions and some supporting content remain in English." },
    ],
  },
  "/privacy": {
    title: "Privacy in this demo.",
    intro: "This page describes the current prototype's data handling. A live booking service would require its own reviewed privacy policy before launch.",
    sections: [
      { title: "What is saved", text: "Demo profile details, bookings, enquiries, search preferences, wishlist and language choices are stored in this browser's local storage. Use sample personal details when exploring the prototype." },
      { title: "How it is used", text: "This information powers the demo booking journey, saved stays and shared owner/admin views on the same browser. Enquiry forms do not send messages or contact a live support team." },
      { title: "External services", text: "Destination maps load Google Maps. Fonts and some photographs load from external providers. These providers receive network requests and handle data according to their own policies." },
      { title: "Clearing your data", text: "Clear this site's storage through your browser settings to remove locally saved demo information. This also removes demo bookings, enquiries and preferences. Avoid using the prototype for sensitive information." },
    ],
  },
  "/terms": {
    title: "Terms for exploring the prototype.",
    intro: "MahakumbhStays currently provides a demonstration of an accommodation booking experience. These notes describe the prototype, not a live accommodation contract.",
    sections: [
      { title: "Sample listings", text: "Names, prices, ratings, availability, amenities and policies are demo content. Photography may illustrate an accommodation type rather than the named sample property." },
      { title: "No real transaction", text: "Simulated bookings and payments do not reserve accommodation or transfer money. A demo confirmation is not a travel voucher or a guarantee of a room." },
      { title: "Responsible use", text: "Use sample details, avoid entering sensitive information and do not rely on demo listings or landmark distances to make real travel arrangements." },
      { title: "Before a live launch", text: "Real inventory verification, customer support channels, payment processing and reviewed commercial terms must be established before accepting live bookings." },
    ],
  },
  "/cancellation": {
    title: "Cancellation & demo refunds.",
    intro: "Try the cancellation journey without moving real money. All cancellation and refund statuses in this prototype are simulations.",
    sections: [
      { title: "Request a cancellation", text: "Open My bookings with the same demo profile email used for the reservation. On a confirmed booking, choose Request cancellation. The booking changes to refund requested." },
      { title: "Review the request", text: "Open the admin dashboard and review the booking. The demo admin can mark the booking cancelled and the payment refunded. This only updates the local demo record." },
      { title: "Property-specific conditions", text: "Read the cancellation policy shown on each property page before completing the demo checkout. Policies are sample descriptions, not enforceable real booking terms." },
      { title: "No bank refund is issued", text: "No real payment was collected, so no bank, card or UPI refund is initiated. For a real accommodation booking made elsewhere, contact that provider directly." },
    ],
  },
};

export function InformationPage({ path, onEnquiry, onGroup }: { path: string; onEnquiry: () => void; onGroup: () => void }) {
  const page = informationPages[path];
  if (!page) return null;
  return <section className="container section information-page">
    <a className="information-back" href="/"><ArrowLeft size={16} /> Back to home</a>
    <div className="information-intro"><span className="eyebrow">MAHAKUMBHSTAYS · HERE TO HELP</span><h1>{page.title}</h1><p>{page.intro}</p></div>
    <div className="information-layout">
      <div className="information-content">{page.sections.map((section) => path === "/faq" ? <details key={section.title} className="information-card"><summary>{section.title}</summary><p>{section.text}</p></details> : <article key={section.title} className="information-card"><h2>{section.title}</h2><p>{section.text}</p></article>)}</div>
      <aside className="information-help"><HelpCircle size={28} /><h2>Plan your next step.</h2><p>Explore stays or try an enquiry with your travel preferences.</p><button className="primary-button" onClick={onEnquiry}>Make an enquiry <ArrowRight size={16} /></button><button className="outline-button" onClick={onGroup}>Group bookings</button><a href="/stays">Explore all stays <ArrowRight size={14} /></a><a href="/bookings">My bookings</a><a href="/contact">Contact & support</a><small><ShieldCheck size={14} /> Demo experience · no real payments</small></aside>
    </div>
  </section>;
}
