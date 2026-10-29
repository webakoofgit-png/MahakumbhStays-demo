import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  Wallet,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useDemoStore, demoActions } from "@/lib/demo-store";
import { money } from "@/lib/stay-search";
import { Modal } from "./stay-ui";
import type { Property, RoomType } from "@/data/types";
import { CATEGORIES, DESTINATIONS } from "@/data/seed";
export function Dashboard({ admin }: { admin: boolean }) {
  const { state } = useDemoStore();
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [owner, setOwner] = useState(state.owners[0]?.id ?? "own-1");
  const [period, setPeriod] = useState("All time");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Property | null>(null);
  const [roomEdit, setRoomEdit] = useState<{ property: Property; room?: RoomType } | null>(null);
  const [rejection, setRejection] = useState<{ id: string; application: boolean } | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [application, setApplication] = useState(false);
  const properties = state.properties.filter((p) => admin || p.ownerId === owner);
  const bookings = state.bookings.filter(
    (b) =>
      (admin || b.ownerId === owner) &&
      (period === "All time" || b.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7)),
  );
  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((n, b) => n + (admin ? b.commissionAmount : b.propertyShare), 0);
  const tabs = [
    "Overview",
    "Properties",
    "Bookings",
    ...(admin ? ["Applications", "Group enquiries"] : []),
    "Settlements",
    "Settings",
  ];
  const icons = [LayoutDashboard, Building2, CalendarDays, Users, Wallet, Settings];
  const chart = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 5 + i);
    const key = date.toISOString().slice(0, 7);
    return {
      label: date.toLocaleDateString("en", { month: "short" }),
      value: bookings
        .filter((b) => b.createdAt.startsWith(key) && b.paymentStatus === "paid")
        .reduce((n, b) => n + (admin ? b.commissionAmount : b.propertyShare), 0),
    };
  });
  const visibleProperties = properties.filter((p) =>
    `${p.name} ${p.location} ${p.status}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className={`dashboard-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-heading">
          <span>{admin ? "ADMIN WORKSPACE" : "PARTNER WORKSPACE"}</span>
          <button
            className="icon-button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
        </div>
        <nav aria-label="Dashboard">
          {tabs.map((t, i) => {
            const Icon = icons[i % icons.length] ?? LayoutDashboard;
            return (
              <button
                title={t}
                aria-current={tab === t ? "page" : undefined}
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => {
                  setTab(t);
                  setQuery("");
                }}
              >
                <Icon size={18} />
                <span>{t}</span>
                {t === "Applications" && (
                  <small>{state.applications.filter((a) => a.status === "pending").length}</small>
                )}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <ShieldIcon />
          <strong>Connected demo</strong>
          <p>Every change appears across this marketplace.</p>
          <a href="/stays">
            View marketplace <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-topline">
          <span>
            <span className="status-dot" /> DEMO WORKSPACE
          </span>
          <div>
            {!admin && (
              <select
                aria-label="Demo owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                {state.owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
            <span className="avatar">
              {admin
                ? "AD"
                : state.owners
                    .find((o) => o.id === owner)
                    ?.name.split(" ")
                    .map((n) => n[0])
                    .join("")}
            </span>
          </div>
        </div>
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {admin ? "A CLEARER VIEW OF YOUR MARKETPLACE" : "YOUR HOSPITALITY, AT A GLANCE"}
            </span>
            <h1>
              {tab === "Overview"
                ? admin
                  ? "Welcome back, Admin."
                  : `Welcome back, ${state.owners.find((o) => o.id === owner)?.name.split(" ")[0]}.`
                : tab}
            </h1>
            <p>
              {admin
                ? "Thoughtful decisions start with a clear picture."
                : "Less admin. More time for a warm welcome."}
            </p>
          </div>
          <select
            aria-label="Dashboard period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>All time</option>
            <option>This month</option>
          </select>
        </div>
        {tab === "Overview" && (
          <>
            <div className="kpi-grid">
              {[
                {
                  label: admin ? "Platform earnings" : "Your earnings",
                  value: money(revenue),
                  icon: Wallet,
                },
                { label: "Total bookings", value: bookings.length, icon: CalendarDays },
                {
                  label: "Active properties",
                  value: properties.filter((p) => p.status === "approved").length,
                  icon: Building2,
                },
                {
                  label: admin ? "Awaiting approval" : "Pending settlements",
                  value: admin
                    ? state.applications.filter((a) => a.status === "pending").length
                    : bookings.filter((b) => b.settlementStatus === "pending").length,
                  icon: TrendingUp,
                },
              ].map((k) => (
                <article className="kpi-card" key={k.label}>
                  <div>
                    <span>{k.label}</span>
                    <k.icon size={18} />
                  </div>
                  <strong>{k.value}</strong>
                  <small>From shared demo data</small>
                </article>
              ))}
            </div>
            <div className="dashboard-charts">
              <article className="panel">
                <div className="section-heading">
                  <div>
                    <h3>Earnings overview</h3>
                    <p>
                      {month === null
                        ? "Select a month to explore"
                        : `${chart[month]!.label}: ${money(chart[month]!.value)}`}
                    </p>
                  </div>
                  <span className="pill">Last 6 months</span>
                </div>
                <div className="earnings-chart">
                  {chart.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setMonth(i)}
                      aria-label={`${c.label} earnings ${money(c.value)}`}
                      aria-pressed={month === i}
                    >
                      <span
                        className={month === i ? "chosen" : ""}
                        style={{
                          height: `${Math.max(3, (c.value / Math.max(1, ...chart.map((x) => x.value))) * 150)}px`,
                        }}
                      />
                      <small>{c.label}</small>
                    </button>
                  ))}
                </div>
              </article>
              <article className="panel activity-panel">
                <span className="eyebrow">A LITTLE ATTENTION GOES A LONG WAY</span>
                <h3>Your next best steps.</h3>
                <button onClick={() => setTab("Properties")}>
                  <Building2 />
                  <span>
                    Keep your listings looking their best
                    <small>{properties.length} properties in your workspace</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => setTab("Bookings")}>
                  <CalendarDays />
                  <span>
                    Give every guest a warm welcome
                    <small>
                      {bookings.filter((b) => b.status === "confirmed").length} confirmed demo
                      bookings
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => setTab(admin ? "Applications" : "Settlements")}>
                  <Check />
                  <span>
                    {admin ? "Review new partner applications" : "Review your settlements"}
                    <small>A few details make all the difference</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              </article>
            </div>
          </>
        )}
        {(tab === "Overview" || tab === "Bookings") && (
          <article className="panel table-panel">
            <div className="section-heading">
              <h3>{tab === "Overview" ? "Recent bookings" : "All bookings"}</h3>
              <input
                placeholder="Search guest or property"
                aria-label="Search bookings"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Guest & booking</th>
                    <th>Property</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter((b) =>
                      `${b.guestName} ${b.propertyName}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .slice(0, tab === "Overview" ? 5 : undefined)
                    .map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.guestName}</strong>
                          <small>{b.id}</small>
                        </td>
                        <td>{b.propertyName}</td>
                        <td>
                          {b.checkIn}
                          <small>to {b.checkOut}</small>
                        </td>
                        <td>{money(b.total)}</td>
                        <td>
                          <span className={`status-badge ${b.status}`}>
                            {b.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>
                          {b.status === "confirmed" && (
                            <button
                              className="table-action"
                              onClick={() => demoActions.setBookingStatus(b.id, "completed")}
                            >
                              Complete
                            </button>
                          )}
                          {admin && b.status === "refund_requested" && (
                            <button
                              className="table-action"
                              onClick={() =>
                                demoActions.setBookingStatus(b.id, "cancelled", "refunded")
                              }
                            >
                              Approve refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p className="empty-state">No bookings in this period.</p>}
            </div>
          </article>
        )}
        {tab === "Properties" && (
          <>
            <div className="section-heading">
              <input
                placeholder="Search properties or status"
                aria-label="Search properties"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="action-row">
                <span>{visibleProperties.length} properties</span>
                {!admin && (
                  <button className="primary-button" onClick={() => setApplication(true)}>
                    <Plus size={16} /> List a new stay
                  </button>
                )}
              </div>
            </div>
            <div className="dashboard-property-grid">
              {visibleProperties.map((p) => (
                <article className="panel" key={p.id}>
                  <img
                    className="dashboard-property-photo"
                    loading="lazy"
                    src={p.images[0]}
                    alt={p.name}
                  />
                  <div className="section-heading">
                    <h3>{p.name}</h3>
                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                  </div>
                  <p className="muted">
                    {p.location} · {p.rooms.length} room types
                  </p>
                  <div className="action-row">
                    <button className="outline-button" onClick={() => setEditing(p)}>
                      Edit listing
                    </button>
                    <a className="text-link" href={`/property/${p.slug}`}>
                      Preview <ArrowUpRight size={14} />
                    </a>
                    {admin && (
                      <>
                        <button
                          className="table-action"
                          onClick={() => demoActions.setPropertyStatus(p.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="table-action"
                          onClick={() => setRejection({ id: p.id, application: false })}
                        >
                          Reject
                        </button>
                        <button
                          className="table-action"
                          onClick={() =>
                            demoActions.setPropertyStatus(
                              p.id,
                              p.status === "disabled" ? "approved" : "disabled",
                            )
                          }
                        >
                          {p.status === "disabled" ? "Enable" : "Disable"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="room-management">
                    {p.rooms.map((r) => (
                      <div key={r.id}>
                        <span>
                          {r.name}
                          <small>
                            {money(r.pricePerNight)} · {r.inventory} available
                          </small>
                        </span>
                        <button
                          className="table-action"
                          onClick={() => setRoomEdit({ property: p, room: r })}
                        >
                          Edit room
                        </button>
                      </div>
                    ))}
                    <button className="text-link" onClick={() => setRoomEdit({ property: p })}>
                      <Plus size={15} /> Add room type
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        {tab === "Applications" && (
          <div className="booking-list">
            {state.applications.map((a) => (
              <article className="panel" key={a.id}>
                <span className={`status-badge ${a.status}`}>{a.status}</span>
                <h3>{a.propertyName}</h3>
                <p>
                  {a.ownerName} · {a.email} · {a.location}
                </p>
                <p>{a.description}</p>
                {a.status === "pending" && (
                  <div className="action-row">
                    <button
                      className="primary-button"
                      onClick={() => demoActions.approveApplication(a.id)}
                    >
                      Approve & publish demo property
                    </button>
                    <button
                      className="outline-button"
                      onClick={() => setRejection({ id: a.id, application: true })}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
        {tab === "Group enquiries" && (
          <div className="booking-list">
            <span className="eyebrow">STAY & GROUP ENQUIRIES</span>
            {state.enquiries.map((e) => (
              <article className="panel" key={e.id}>
                <span className="pill">{e.status}</span>
                <h3>
                  {e.groupName} · {e.guests} guests
                </h3>
                <p>
                  {e.contactPerson} · {e.email || "Email not provided"} · {e.phone}
                </p>
                <p>
                  {e.preferredLocation} · {e.checkIn || "Dates to be confirmed"}
                  {e.checkOut ? ` → ${e.checkOut}` : ""} · {e.budget}
                </p>
                <p>{e.requirements}</p>
                {e.status === "new" && (
                  <button
                    className="outline-button"
                    onClick={() => demoActions.markEnquiryContacted(e.id)}
                  >
                    Mark contacted
                  </button>
                )}
              </article>
            ))}
            {state.enquiries.length === 0 && (
              <div className="panel empty-state">Group enquiries will appear here.</div>
            )}
          </div>
        )}
        {tab === "Settlements" && (
          <article className="panel table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Property</th>
                  <th>Property share</th>
                  <th>Commission</th>
                  <th>Status</th>
                  {admin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.propertyName}</td>
                    <td>{money(b.propertyShare)}</td>
                    <td>{money(b.commissionAmount)}</td>
                    <td>
                      <span className="pill">{b.settlementStatus}</span>
                    </td>
                    {admin && (
                      <td>
                        <button
                          className="table-action"
                          onClick={() =>
                            demoActions.setSettlementStatus(
                              b.id,
                              b.settlementStatus === "settled" ? "pending" : "settled",
                            )
                          }
                        >
                          {b.settlementStatus === "settled" ? "Mark pending" : "Settle"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        )}
        {tab === "Settings" && (
          <article className="panel">
            <h2>A shared, persistent demo.</h2>
            <p>
              Changes are stored in this browser and shared between marketplace, owner and admin
              views. No real payments or authentication are used.
            </p>
            {admin && (
              <>
                <h3>Property commission rates</h3>
                {properties.map((p) => (
                  <label className="commission-row" key={p.id}>
                    {p.name}
                    <input
                      aria-label={`${p.name} commission percentage`}
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(p.commissionRate * 100)}
                      onChange={(e) =>
                        demoActions.setCommissionRate(
                          p.id,
                          Math.max(0, Math.min(100, Number(e.target.value))) / 100,
                        )
                      }
                    />
                    <span>%</span>
                  </label>
                ))}
              </>
            )}
          </article>
        )}
      </div>
      <Modal
        title="A new place. A warm welcome."
        description="Submit a demo listing for admin review."
        open={application}
        close={() => setApplication(false)}
      >
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const o = state.owners.find((x) => x.id === owner)!;
            demoActions.addApplication({
              ownerName: o.name,
              businessName: o.businessName,
              email: o.email,
              phone: o.phone,
              propertyName: String(f.get("name")),
              propertyType: String(f.get("category")),
              address: String(f.get("address")),
              location: String(f.get("location")),
              roomCount: Number(f.get("rooms")),
              description: String(f.get("description")),
              amenities: [],
              photoNames: [],
            });
            setApplication(false);
          }}
        >
          <label>
            Property name
            <input name="name" required />
          </label>
          <label>
            Category
            <select name="category">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <select name="location">
              {DESTINATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Address
            <input required name="address" />
          </label>
          <label>
            Number of rooms
            <input name="rooms" type="number" min="1" max="1000" defaultValue="5" required />
          </label>
          <label>
            Describe your property
            <textarea required name="description" />
          </label>
          <p className="muted">
            Approved demo listings use sample photography. No files are uploaded.
          </p>
          <button className="primary-button">
            Send for approval <ArrowRight size={16} />
          </button>
        </form>
      </Modal>
      <Modal title="Refine your listing" open={!!editing} close={() => setEditing(null)}>
        {editing && (
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              demoActions.updateOwnedProperty(editing.id, {
                name: String(f.get("name")),
                description: String(f.get("description")),
                address: String(f.get("address")),
              });
              setEditing(null);
            }}
          >
            <label>
              Property name
              <input name="name" required defaultValue={editing.name} />
            </label>
            <label>
              Address
              <input name="address" required defaultValue={editing.address} />
            </label>
            <label>
              Description
              <textarea name="description" required defaultValue={editing.description} />
            </label>
            <button className="primary-button">Save listing</button>
          </form>
        )}
      </Modal>
      <Modal
        title={roomEdit?.room ? "Room settings" : "Add a room type"}
        open={!!roomEdit}
        close={() => setRoomEdit(null)}
      >
        {roomEdit && (
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const patch = {
                name: String(f.get("name")),
                pricePerNight: Number(f.get("price")),
                inventory: Number(f.get("inventory")),
                maxOccupancy: Number(f.get("capacity")),
                description: String(f.get("description")),
              };
              if (roomEdit.room)
                demoActions.updateRoom(roomEdit.property.id, roomEdit.room.id, patch);
              else
                demoActions.addOwnedRoom(roomEdit.property.id, {
                  ...patch,
                  image: roomEdit.property.images[0] ?? "",
                  amenities: roomEdit.property.amenities,
                });
              setRoomEdit(null);
            }}
          >
            <label>
              Room name
              <input required name="name" defaultValue={roomEdit.room?.name} />
            </label>
            <div className="form-columns">
              <label>
                Price / night
                <input
                  required
                  type="number"
                  min="1"
                  name="price"
                  defaultValue={roomEdit.room?.pricePerNight ?? 1500}
                />
              </label>
              <label>
                Inventory
                <input
                  required
                  type="number"
                  min="0"
                  name="inventory"
                  defaultValue={roomEdit.room?.inventory ?? 1}
                />
              </label>
            </div>
            <label>
              Guests per room
              <input
                required
                type="number"
                min="1"
                max="100"
                name="capacity"
                defaultValue={roomEdit.room?.maxOccupancy ?? 2}
              />
            </label>
            <label>
              Description
              <textarea name="description" defaultValue={roomEdit.room?.description} />
            </label>
            {roomEdit.room && (
              <label>
                Toggle unavailable date
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value)
                      demoActions.toggleRoomBlockedDate(
                        roomEdit.property.id,
                        roomEdit.room!.id,
                        e.target.value,
                      );
                  }}
                />
                <small>
                  Blocked:{" "}
                  {state.properties
                    .find((p) => p.id === roomEdit.property.id)
                    ?.rooms.find((r) => r.id === roomEdit.room?.id)
                    ?.blockedDates.join(", ") || "None"}
                </small>
              </label>
            )}
            <button className="primary-button">Save room</button>
          </form>
        )}
      </Modal>
      <Modal title="Reason for rejection" open={!!rejection} close={() => setRejection(null)}>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const reason = String(new FormData(e.currentTarget).get("reason"));
            if (rejection?.application) demoActions.rejectApplication(rejection.id, reason);
            else if (rejection) demoActions.setPropertyStatus(rejection.id, "rejected", reason);
            setRejection(null);
          }}
        >
          <label>
            Help the partner understand
            <textarea required name="reason" minLength={5} />
          </label>
          <button className="primary-button">Save decision</button>
        </form>
      </Modal>
    </div>
  );
}
function ShieldIcon() {
  return <Check className="sidebar-check" size={22} />;
}
