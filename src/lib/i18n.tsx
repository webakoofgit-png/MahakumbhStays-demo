import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi" | "mr";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.explore": "Explore Stays",
  "nav.kumbh": "Nashik Kumbh 2027",
  "nav.listProperty": "List Your Property",
  "nav.contact": "Contact / Support",
  "nav.login": "Login / Register",
  "nav.account": "My Account",
  "nav.bookings": "My Bookings",
  "nav.wishlist": "Wishlist",
  "nav.profile": "My Profile",
  "nav.logout": "Logout",
  "nav.role": "Demo role",
  "nav.roleNote": "Prototype only — not real authentication",
  "hero.title": "Find Your Perfect Stay for Nashik Kumbh 2027",
  "hero.subtitle":
    "Discover trusted hotels, homestays, dharamshalas and premium accommodation across Nashik and Trimbakeshwar.",
  "search.destination": "Destination",
  "search.anyDestination": "Anywhere in Nashik",
  "search.checkIn": "Check-in",
  "search.checkOut": "Check-out",
  "search.guests": "Guests",
  "search.rooms": "Rooms",
  "search.adults": "Adults",
  "search.children": "Children",
  "search.searchBtn": "Search Stays",
  "common.viewDetails": "View Details",
  "common.demoListing": "Demo Listing",
  "common.perNight": "per night",
  "common.explore": "Explore",
  "common.bookNow": "Book Now",
  "common.reset": "Reset Filters",
  "common.filters": "Filters",
  "common.sort": "Sort",
  "common.results": "stays found",
  "common.loading": "Loading…",
  "stays.title": "Explore Stays in Nashik",
  "stays.subtitle": "Sample inventory for the MahakumbhStays prototype.",
  "booking.continue": "Continue to Booking",
  "booking.guestDetails": "Guest Details",
  "booking.review": "Review Booking",
  "booking.payment": "Payment",
  "booking.confirmation": "Confirmation",
  "booking.selectRoom": "Select Room",
  "booking.checkout": "Checkout",
  "footer.tagline": "Your Stay for Every Sacred Journey.",
  "footer.about": "About Us",
  "footer.explore": "Explore Stays",
  "footer.kumbh": "Nashik Kumbh 2027",
  "footer.listProperty": "List Your Property",
  "footer.contact": "Contact Us",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms and Conditions",
  "footer.cancellation": "Cancellation Policy",
  "footer.faq": "FAQ",
  "footer.groupBooking": "Group Booking",
  "lang.label": "Language",
  "lang.note": "Interface language — core labels translated; full property content stays in English.",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.explore": "स्टे खोजें",
  "nav.kumbh": "नाशिक कुंभ 2027",
  "nav.listProperty": "अपनी प्रॉपर्टी सूची करें",
  "nav.contact": "संपर्क / सहायता",
  "nav.login": "लॉगिन / रजिस्टर",
  "nav.account": "मेरा खाता",
  "nav.bookings": "मेरी बुकिंग",
  "nav.wishlist": "पसंदीदा सूची",
  "nav.profile": "मेरी प्रोफ़ाइल",
  "nav.logout": "लॉगआउट",
  "nav.role": "डेमो भूमिका",
  "nav.roleNote": "केवल प्रोटोटाइप — असली प्रमाणीकरण नहीं",
  "hero.title": "नाशिक कुंभ 2027 के लिए अपना आदर्श ठहराव खोजें",
  "hero.subtitle":
    "नाशिक और त्र्यंबकेश्वर में विश्वसनीय होटल, होमस्टे, धर्मशाला और प्रीमियम आवास खोजें।",
  "search.destination": "गंतव्य",
  "search.anyDestination": "नाशिक में कहीं भी",
  "search.checkIn": "चेक-इन",
  "search.checkOut": "चेक-आउट",
  "search.guests": "मेहमान",
  "search.rooms": "कमरे",
  "search.adults": "वयस्क",
  "search.children": "बच्चे",
  "search.searchBtn": "स्टे खोजें",
  "common.viewDetails": "विवरण देखें",
  "common.demoListing": "डेमो लिस्टिंग",
  "common.perNight": "प्रति रात",
  "common.explore": "देखें",
  "common.bookNow": "बुक करें",
  "common.reset": "फ़िल्टर हटाएँ",
  "common.filters": "फ़िल्टर",
  "common.sort": "क्रम",
  "common.results": "स्टे मिले",
  "common.loading": "लोड हो रहा है…",
  "stays.title": "नाशिक में स्टे खोजें",
  "stays.subtitle": "महाकुंभस्टेज़ प्रोटोटाइप के लिए नमूना सूची।",
  "booking.continue": "बुकिंग जारी रखें",
  "booking.guestDetails": "मेहमान विवरण",
  "booking.review": "बुकिंग समीक्षा",
  "booking.payment": "भुगतान",
  "booking.confirmation": "पुष्टि",
  "booking.selectRoom": "कमरा चुनें",
  "booking.checkout": "चेकआउट",
  "footer.tagline": "हर पवित्र यात्रा के लिए आपका ठहराव।",
  "footer.about": "हमारे बारे में",
  "footer.explore": "स्टे खोजें",
  "footer.kumbh": "नाशिक कुंभ 2027",
  "footer.listProperty": "अपनी प्रॉपर्टी सूची करें",
  "footer.contact": "संपर्क करें",
  "footer.privacy": "गोपनीयता नीति",
  "footer.terms": "नियम और शर्तें",
  "footer.cancellation": "रद्दीकरण नीति",
  "footer.faq": "सामान्य प्रश्न",
  "footer.groupBooking": "समूह बुकिंग",
  "lang.label": "भाषा",
  "lang.note": "इंटरफ़ेस भाषा — मुख्य लेबल अनुवादित; प्रॉपर्टी विवरण अंग्रेज़ी में रहेंगे।",
};

const mr: Dict = {
  "nav.home": "मुख्यपृष्ठ",
  "nav.explore": "निवास शोधा",
  "nav.kumbh": "नाशिक कुंभ 2027",
  "nav.listProperty": "तुमची प्रॉपर्टी सूची करा",
  "nav.contact": "संपर्क / मदत",
  "nav.login": "लॉगिन / नोंदणी",
  "nav.account": "माझे खाते",
  "nav.bookings": "माझ्या बुकिंग",
  "nav.wishlist": "आवडत्या यादी",
  "nav.profile": "माझे प्रोफाइल",
  "nav.logout": "लॉगआउट",
  "nav.role": "डेमो भूमिका",
  "nav.roleNote": "फक्त प्रोटोटाइप — खरी पडताळणी नाही",
  "hero.title": "नाशिक कुंभ 2027 साठी तुमचे आदर्श निवास शोधा",
  "hero.subtitle":
    "नाशिक आणि त्र्यंबकेश्वरमधील विश्वासार्ह हॉटेल्स, होमस्टे, धर्मशाळा आणि प्रीमियम निवास शोधा.",
  "search.destination": "ठिकाण",
  "search.anyDestination": "नाशिकमध्ये कुठेही",
  "search.checkIn": "चेक-इन",
  "search.checkOut": "चेक-आउट",
  "search.guests": "प्रवासी",
  "search.rooms": "खोल्या",
  "search.adults": "प्रौढ",
  "search.children": "मुले",
  "search.searchBtn": "निवास शोधा",
  "common.viewDetails": "तपशील पहा",
  "common.demoListing": "डेमो यादी",
  "common.perNight": "प्रति रात्री",
  "common.explore": "पहा",
  "common.bookNow": "बुक करा",
  "common.reset": "फिल्टर काढा",
  "common.filters": "फिल्टर",
  "common.sort": "क्रम",
  "common.results": "निवास सापडले",
  "common.loading": "लोड होत आहे…",
  "stays.title": "नाशिकमध्ये निवास शोधा",
  "stays.subtitle": "महाकुंभस्टेज्ज प्रोटोटाइपसाठी नमुना यादी.",
  "booking.continue": "बुकिंग सुरू ठेवा",
  "booking.guestDetails": "प्रवाशांचे तपशील",
  "booking.review": "बुकिंग तपासणी",
  "booking.payment": "देयक",
  "booking.confirmation": "पुष्टीकरण",
  "booking.selectRoom": "खोली निवडा",
  "booking.checkout": "चेकआउट",
  "footer.tagline": "प्रत्येक पवित्र यात्रेसाठी तुमचे निवास.",
  "footer.about": "आमच्याबद्दल",
  "footer.explore": "निवास शोधा",
  "footer.kumbh": "नाशिक कुंभ 2027",
  "footer.listProperty": "तुमची प्रॉपर्टी सूची करा",
  "footer.contact": "संपर्क करा",
  "footer.privacy": "गोपनीयता धोरण",
  "footer.terms": "अटी आणि शर्ती",
  "footer.cancellation": "रद्दीकरण धोरण",
  "footer.faq": "वारंवार विचारले प्रश्न",
  "footer.groupBooking": "ग्रुप बुकिंग",
  "lang.label": "भाषा",
  "lang.note": "इंटरफेस भाषा — मुख्य लेबल अनुवादित; प्रॉपर्टी मजकूर इंग्रजीत राहील.",
};

const DICTS: Record<Lang, Dict> = { en, hi, mr };

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({ lang: "en", setLang: () => {}, t: (k) => k });

const LANG_KEY = "mahakumbhstays-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY) as Lang | null;
    if (stored && DICTS[stored]) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => DICTS[lang][key] ?? en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
