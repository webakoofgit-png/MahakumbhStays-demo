const nf = new Intl.NumberFormat("en-IN");

export function inr(n: number) {
  return `₹${nf.format(Math.round(n))}`;
}

/** yyyy-mm-dd for a date N days from today (browser-local). */
export function isoFromToday(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return isoFromToday(0);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "12 Oct 2026" — parses yyyy-mm-dd without timezone shifting. */
export function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "";
  return `${formatDate(checkIn)} → ${formatDate(checkOut)}`;
}
