// Verified stable Unsplash photo pool for demo property galleries.
// Every URL returns a real, relevant accommodation photo (checked 2026-10).
const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  roomA: u("photo-1611892440504-42a792e24d32"),
  roomB: u("photo-1590490360182-c33d57733427"),
  roomC: u("photo-1631049307264-da0ec9d70304"),
  roomD: u("photo-1618773928121-c32242e63f39"),
  roomF: u("photo-1595576508898-0ad5c879a061"),
  roomG: u("photo-1582719478250-c89cae4dc85b"),
  roomH: u("photo-1560448204-e02f11c3d0e2"),
  extB: u("photo-1549294413-26f195200c16"),
  extC: u("photo-1551882547-ff40c63fe5fa"),
  extD: u("photo-1520250497591-112f2f40a3f4"),
  resortB: u("photo-1584132967334-10e028bd69f7"),
  homeB: u("photo-1502672260266-1c1ef2d93688"),
  homeC: u("photo-1484154218962-a197022b5858"),
  homeD: u("photo-1512918728675-ed5a9ecdebfd"),
  tentA: u("photo-1504280390367-361c6d9f38f4"),
  tentB: u("photo-1537905569824-f89f14cceb68"),
  tentC: u("photo-1478131143081-80f7f84ca84d"),
  bathA: u("photo-1584622650111-993a426fbf0a"),
  bathB: u("photo-1552321554-5fefe8c9ef14"),
  foodA: u("photo-1414235077428-338989a2e8c0"),
  lobbyA: u("photo-1559599238-308793637427"),
  lobbyB: u("photo-1564501049412-61c2a3083791"),
  viewA: u("photo-1476514525535-07fb3b4ae5f1"),
  viewB: u("photo-1506929562872-bb421503ef21"),
  cityA: u("photo-1602216056096-3b40cc0c9944"),
} as const;

// Fallback gradient shown while an image loads or if it fails.
export function imageFallback(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#172B4D'/><stop offset='100%' stop-color='#E89136'/></linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><text x='400' y='300' font-family='sans-serif' font-size='28' fill='white' text-anchor='middle' dominant-baseline='middle' opacity='0.85'>${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
