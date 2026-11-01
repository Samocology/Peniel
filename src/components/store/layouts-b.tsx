
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Cake,
  Check,
  Clock,
  Coffee,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { naira, type Vendor } from "@/lib/data";
import {
  GroupTabs,
  ItemArt,
  ItemLink,
  Price,
  StoreBadges,
} from "./store-kit";
import { StoreSidebar } from "./layouts-a";

/* ─────────────────────────────────────────────
   5. PLAYFUL - ARTISAN BAKERY
───────────────────────────────────────────── */

export function PlayfulStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  return (
    <div>
      <section className="relative overflow-hidden px-4 pt-16 pb-8 sm:px-6">
        <div
          className="absolute -top-28 -right-20 size-80 rounded-full opacity-70 blur-[1px]"
          style={{ background: t.soft }}
        />

        <div
          className="absolute top-44 -left-24 size-64 rounded-full opacity-50"
          style={{ background: t.accent + "18" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wide"
              style={{ background: t.accent, color: t.accentInk }}
            >
              <Cake className="size-3.5" strokeWidth={2.2} />
              Baked to order in Port Harcourt
            </span>

            <h1 className="mt-6 text-[42px] leading-[1.08] font-bold tracking-tight sm:text-5xl">
              Every celebration
              <br />
              <span style={{ color: t.accent }}>deserves cake.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed opacity-65">
              {vendor.about}
            </p>

            <div className="mt-7">
              <StoreBadges vendor={vendor} />
            </div>
          </div>

          <div
            className="overflow-hidden shadow-2xl"
            style={{ borderRadius: t.radius }}
          >
            <img
              src={vendor.cover}
              alt={vendor.name}
              className="h-72 w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-80"
              width={1600}
              height={900}
            />
          </div>
        </div>
      </section>

      {/* CAKE CONFIGURATOR */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div
          className="grid gap-8 border p-7 shadow-lg sm:p-10 lg:grid-cols-[1.2fr_1fr]"
          style={{
            background: t.soft,
            borderColor: t.line,
            borderRadius: t.radius,
          }}
        >
          <div>
            <p className="text-lg font-bold tracking-tight">
              Design your cake
            </p>

            {[
              ["Size", ['6" (8–10 slices)', '8" (15–20)', "Two-tier (30+)"]],
              ["Flavour", ["Vanilla", "Red velvet", "Chocolate fudge", "Carrot"]],
              ["Finish", ["Buttercream", "Fondant", "Ganache drip"]],
            ].map(([label, opts], gi) => (
              <div key={label as string} className="mt-6">
                <p className="mb-2.5 text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                  {label as string}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(opts as string[]).map((o, i) => (
                    <span
                      key={o}
                      className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                      style={
                        i === gi % 2
                          ? {
                              background: t.accent,
                              color: t.accentInk,
                              borderColor: t.accent,
                            }
                          : {
                              borderColor: t.line,
                              background: "#fff",
                            }
                      }
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6">
              <p className="mb-2.5 text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                Message on cake
              </p>

              <input
                className="w-full border px-4 py-3.5 text-sm outline-none transition focus:ring-1"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: "#fff",
                }}
                placeholder="Happy Birthday Chioma!"
              />
            </div>
          </div>

          <div
            className="flex flex-col justify-between border p-7 shadow-sm"
            style={{
              background: "#fff",
              borderColor: t.line,
              borderRadius: t.radius,
            }}
          >
            <div>
              <p className="text-sm font-bold">Your cake</p>

              <ul className="mt-4 space-y-2.5 text-sm opacity-70">
                {[
                  '8" round · serves 15–20',
                  "Red velvet sponge",
                  "Buttercream finish",
                  "Message piped free",
                  "Pickup or PH delivery",
                ].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <Check
                      className="size-4 shrink-0"
                      strokeWidth={2.5}
                      style={{ color: t.accent }}
                    />
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <p className="text-[11px] opacity-50">Total</p>

              <p
                className="mt-1 text-3xl font-bold tabular-nums"
                style={{ color: t.accent }}
              >
                {naira(48000)}
              </p>

              <Link
                to="/cart"
                className="mt-5 block py-3.5 text-center text-sm font-bold transition hover:opacity-90"
                style={{
                  background: t.accent,
                  color: t.accentInk,
                  borderRadius: t.radius,
                }}
              >
                Add to cart
              </Link>

              <p className="mt-2.5 text-center text-[11px] opacity-45">
                48hrs notice required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BAKERY PRODUCTS */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <GroupTabs vendor={vendor} />

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendor.products.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="group border p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: "#fff",
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{ borderRadius: t.radius }}
                >
                  <ItemArt
                    vendor={vendor}
                    seed={i}
                    className="h-36 w-full transition-transform duration-500 group-hover:scale-105"
                    label={p.name}
                  />
                </div>

                <div className="p-2.5">
                  <p className="font-semibold leading-snug">{p.name}</p>

                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed opacity-60">
                    {p.desc}
                  </p>

                  <div className="mt-3.5 flex items-center justify-between">
                    <Price value={p.price} vendor={vendor} />

                    <span
                      className="grid size-8 place-items-center rounded-full transition-transform group-hover:scale-110"
                      style={{
                        background: t.accent,
                        color: t.accentInk,
                      }}
                    >
                      <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </ItemLink>
            ))}
          </div>
        </div>

        <StoreSidebar vendor={vendor} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   6. RESERVATION - PREMIUM HOTEL
───────────────────────────────────────────── */

export function ReservationStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(`${checkOut}T12:00:00`).getTime() -
              new Date(`${checkIn}T12:00:00`).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const formatDate = (date: string) => {
    if (!date) return "Select date";

    return new Date(`${date}T12:00:00`).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const serviceProducts = vendor.products.filter((p) => {
    const name = p.name.toLowerCase();

    return (
      name.includes("airport pickup") ||
      name.includes("airport transfer") ||
      name.includes("transfer") ||
      name.includes("day office")
    );
  });

  const roomProducts = vendor.products.filter(
    (p) => !serviceProducts.some((service) => service.id === p.id)
  );

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      setBookingMessage("Please select your check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setBookingMessage("Check-out must be after check-in.");
      return;
    }

    setBookingMessage(
      `${nights} night${nights === 1 ? "" : "s"} · ${adults} adult${adults === 1 ? "" : "s"} · ${rooms} room${rooms === 1 ? "" : "s"}. Select an accommodation below to continue.`
    );

    document.getElementById("hotel-rooms")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div style={{ background: t.bg, color: t.ink }}>
      {/* HERO */}
      <section className="relative isolate min-h-[470px] overflow-hidden sm:min-h-[510px]">
        <img
          src={vendor.cover}
          alt={vendor.name}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          width={1800}
          height={1100}
        />

        <div className="absolute inset-0 -z-10 bg-black/35" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080d17]/85 via-[#080d17]/45 to-[#080d17]/10" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080d17]/65 via-transparent to-black/15" />

        <div className="mx-auto flex min-h-[470px] max-w-7xl items-center px-5 pb-12 pt-24 sm:min-h-[510px] sm:px-8 sm:pb-14 lg:px-12">
          <div className="max-w-2xl text-white">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3.5 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur-md">
                <Sparkles className="size-3.5 text-amber-300" />
                Hospitality & accommodation
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/85">
                <Star className="size-3.5 fill-amber-300 text-amber-300" />
                <span className="font-semibold text-white">{vendor.rating.toFixed(1)}</span>
                <span>({vendor.reviews} guest reviews)</span>
              </span>
            </div>

            <h1 className="mt-6 max-w-xl text-[2.65rem] leading-[1.02] font-medium tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Rest well.
              <br />
              <span className="text-white/80">Stay beautifully.</span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              {vendor.about}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#hotel-rooms"
                className="inline-flex min-h-12 items-center gap-3 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-90"
                style={{
                  background: t.accent,
                  color: t.accentInk,
                  borderRadius: t.radius,
                }}
              >
                Explore accommodation
                <ArrowRight className="size-4" />
              </a>

              <a
                href="#hotel-experience"
                className="inline-flex min-h-12 items-center gap-2 border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/10"
                style={{ borderRadius: t.radius }}
              >
                <ShieldCheck className="size-4" />
                Discover this property
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-xs text-white/75">
              <span className="inline-flex items-center gap-2">
                <BedDouble className="size-4 text-amber-300" />
                42 rooms & suites
              </span>
              <span className="inline-flex items-center gap-2">
                <Coffee className="size-4 text-amber-300" />
                Breakfast included
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-amber-300" />
                Victoria Island, Lagos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING PANEL */}
      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-8 lg:px-12">
        <div
          className="border p-4 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.65)] sm:p-6"
          style={{
            background: t.bg,
            borderColor: t.line,
            borderRadius: t.radius,
          }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Plan your stay
              </h2>

              <p className="mt-1 text-xs leading-relaxed opacity-55">
                Select your preferred dates and number of guests.
              </p>
            </div>

            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase"
              style={{
                borderColor: t.line,
                background: t.soft,
                color: t.accent,
              }}
            >
              <CalendarDays className="size-3.5" />
              Booking details
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] lg:items-end">
            {/* CHECK IN */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase opacity-55">
                <CalendarDays className="size-3.5" />
                Check-in
              </label>

              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  const value = e.target.value;

                  setCheckIn(value);

                  if (checkOut && value >= checkOut) {
                    setCheckOut("");
                  }

                  setBookingMessage("");
                }}
                className="w-full border bg-white/5 px-3 py-3.5 text-sm outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  colorScheme: "light",
                }}
              />
            </div>

            {/* CHECK OUT */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase opacity-55">
                <CalendarDays className="size-3.5" />
                Check-out
              </label>

              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setBookingMessage("");
                }}
                className="w-full border bg-white/5 px-3 py-3.5 text-sm outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  colorScheme: "light",
                }}
              />
            </div>

            {/* ADULTS */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase opacity-55">
                <Users className="size-3.5" />
                Adults
              </label>

              <div
                className="flex items-center justify-between border bg-white/5 px-3 py-2.5"
                style={{ borderColor: t.line, borderRadius: t.radius }}
              >
                <button
                  type="button"
                  aria-label="Remove adult"
                  onClick={() => setAdults((v) => Math.max(1, v - 1))}
                  className="grid size-7 place-items-center rounded-full transition hover:opacity-60"
                >
                  <Minus className="size-3.5" />
                </button>

                <span className="text-sm font-semibold tabular-nums">
                  {adults}
                </span>

                <button
                  type="button"
                  aria-label="Add adult"
                  onClick={() => setAdults((v) => Math.min(12, v + 1))}
                  className="grid size-7 place-items-center rounded-full transition hover:opacity-60"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* ROOMS */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase opacity-55">
                <BedDouble className="size-3.5" />
                Rooms
              </label>

              <div
                className="flex items-center justify-between border bg-white/5 px-3 py-2.5"
                style={{ borderColor: t.line, borderRadius: t.radius }}
              >
                <button
                  type="button"
                  aria-label="Remove room"
                  onClick={() => setRooms((v) => Math.max(1, v - 1))}
                  className="grid size-7 place-items-center rounded-full transition hover:opacity-60"
                >
                  <Minus className="size-3.5" />
                </button>

                <span className="text-sm font-semibold tabular-nums">
                  {rooms}
                </span>

                <button
                  type="button"
                  aria-label="Add room"
                  onClick={() => setRooms((v) => Math.min(8, v + 1))}
                  className="grid size-7 place-items-center rounded-full transition hover:opacity-60"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <button
              type="button"
              onClick={handleBooking}
              className="flex min-h-[48px] items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold transition hover:opacity-90"
              style={{
                background: t.accent,
                color: t.accentInk,
                borderRadius: t.radius,
              }}
            >
              Find a room
              <ArrowRight className="size-4" />
            </button>
          </div>

          {bookingMessage && (
            <p
              className="mt-4 border-l-2 pl-3 text-xs leading-relaxed"
              style={{ borderColor: t.accent }}
              role="status"
            >
              {bookingMessage}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] opacity-50">
            <span>{formatDate(checkIn)}</span>
            <span>{formatDate(checkOut)}</span>
            <span>
              {nights > 0
                ? `${nights} night${nights === 1 ? "" : "s"}`
                : "Duration not selected"}
            </span>
            <span>
              {adults} adult{adults === 1 ? "" : "s"}
            </span>
            <span>
              {rooms} room{rooms === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section id="hotel-experience" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:px-12">
        <div>
          <p
            className="text-[10px] font-semibold tracking-[0.24em] uppercase"
            style={{ color: t.accent }}
          >
            The hotel experience
          </p>

          <h2 className="mt-4 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
            Thoughtfully designed for rest, comfort and everything in between.
          </h2>
        </div>

        <p className="max-w-lg text-sm leading-7 opacity-60 lg:justify-self-end">
          Discover a stay that brings together welcoming service, considered
          spaces and the little details that make every visit memorable.
        </p>
      </section>

      {/* EXPERIENCE STRIP */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden border sm:grid-cols-4"
          style={{
            background: t.line,
            borderColor: t.line,
            borderRadius: t.radius,
          }}
        >
          {[
            {
              icon: BedDouble,
              title: "Accommodation",
              detail: "Explore available rooms",
            },
            {
              icon: Coffee,
              title: "Guest experience",
              detail: "Comfort throughout your stay",
            },
            {
              icon: ShieldCheck,
              title: "Peace of mind",
              detail: "Speak with the property",
            },
            {
              icon: Clock,
              title: "Guest support",
              detail: "Enquiries and assistance",
            },
          ].map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="flex items-center gap-3 p-5"
              style={{ background: t.soft }}
            >
              <div
                className="grid size-10 shrink-0 place-items-center rounded-full"
                style={{
                  background: t.accent + "18",
                  color: t.accent,
                }}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold">{title}</p>
                <p className="mt-1 text-[10px] opacity-50">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACCOMMODATION */}
      <section
        id="hotel-rooms"
        className="scroll-mt-24"
        style={{ background: t.soft }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.24em] uppercase"
                style={{ color: t.accent }}
              >
                Find your space
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                Rooms & accommodation
              </h2>

              <p className="mt-2 text-sm opacity-55">
                Choose the space that suits your stay.
              </p>
            </div>

            <span className="text-xs opacity-50">
              {roomProducts.length} accommodation options
            </span>
          </div>

          {roomProducts.length === 0 ? (
            <div
              className="mt-8 border p-10 text-center"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
              }}
            >
              <BedDouble className="mx-auto size-8 opacity-40" />

              <p className="mt-3 text-sm font-semibold">
                No accommodation listed yet
              </p>

              <p className="mt-1 text-xs opacity-50">
                Contact the property for accommodation enquiries.
              </p>
            </div>
          ) : (
            <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {roomProducts.map((p, i) => (
                <ItemLink
                  key={p.id}
                  vendor={vendor}
                  product={p}
                  className="group flex h-full flex-col overflow-hidden border transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    borderColor: t.line,
                    borderRadius: t.radius,
                    background: t.bg,
                  }}
                >
                  <div className="relative overflow-hidden">
                    <ItemArt
                      vendor={vendor}
                      seed={i}
                      label={p.name}
                      className="h-56 w-full transition-transform duration-700 group-hover:scale-105"
                    />

                    {p.tag && (
                      <span
                        className="absolute left-4 top-4 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase"
                        style={{
                          background: t.accent,
                          color: t.accentInk,
                          borderRadius: t.radius,
                        }}
                      >
                        {p.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">
                          {p.name}
                        </p>

                        <p className="mt-1 text-xs opacity-50">
                          {p.meta || "Accommodation"}
                        </p>
                      </div>

                      <BedDouble
                        className="mt-1 size-4 shrink-0"
                        style={{ color: t.accent }}
                      />
                    </div>

                    <p className="mt-4 line-clamp-3 text-xs leading-6 opacity-60">
                      {p.desc}
                    </p>

                    <div
                      className="mt-auto flex items-end justify-between gap-3 border-t pt-5"
                      style={{ borderColor: t.line }}
                    >
                      <div>
                        <p className="text-[10px] opacity-45">
                          Listed price
                        </p>

                        <div className="mt-1">
                          <Price value={p.price} vendor={vendor} />
                        </div>
                      </div>

                      <span
                        className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold transition group-hover:opacity-85"
                        style={{
                          background: t.accent,
                          color: t.accentInk,
                          borderRadius: t.radius,
                        }}
                      >
                        View details
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </ItemLink>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOTEL SERVICES */}
      {serviceProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.24em] uppercase"
              style={{ color: t.accent }}
            >
              More than a room
            </p>

            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Hotel services & experiences
            </h2>

            <p className="mt-2 text-sm opacity-55">
              Explore additional services offered by this property.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {serviceProducts.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="group flex items-center gap-4 border p-4 transition hover:shadow-md sm:p-5"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: t.soft,
                }}
              >
                <div className="h-24 w-28 shrink-0 overflow-hidden sm:w-36">
                  <ItemArt
                    vendor={vendor}
                    seed={roomProducts.length + i}
                    label={p.name}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-55">
                    {p.desc}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <Price value={p.price} vendor={vendor} />

                    <span
                      className="text-xs font-semibold"
                      style={{ color: t.accent }}
                    >
                      Explore
                      <ArrowRight className="ml-1 inline size-3.5" />
                    </span>
                  </div>
                </div>
              </ItemLink>
            ))}
          </div>
        </section>
      )}

      {/* HOTEL INFORMATION */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <div
          className="grid gap-8 border p-6 sm:p-9 lg:grid-cols-2 lg:items-center"
          style={{
            borderColor: t.line,
            borderRadius: t.radius,
            background: t.soft,
          }}
        >
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.24em] uppercase"
              style={{ color: t.accent }}
            >
              Plan your visit
            </p>

            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              We look forward to welcoming you.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 opacity-60">
              Have a question about a room, a special request or your upcoming
              visit? Get in touch with the property before making your
              reservation.
            </p>

            <div className="mt-7 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: t.accent }}
                />

                <span className="opacity-65">
                  View the property's location and contact information.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: t.accent }}
                />

                <span className="opacity-65">
                  Confirm check-in and check-out arrangements with the
                  property.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: t.accent }}
                />

                <span className="opacity-65">
                  Confirm reservation terms directly before booking.
                </span>
              </div>
            </div>
          </div>

          <div
            className="relative min-h-[250px] overflow-hidden sm:min-h-[320px]"
            style={{ borderRadius: t.radius }}
          >
            <img
              src={vendor.cover}
              alt={`${vendor.name} property`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/65">
                Discover
              </p>

              <h3 className="mt-2 text-2xl font-medium">{vendor.name}</h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-white/75">
                Explore the accommodation options and find a stay that works
                for you.
              </p>

              <a
                href="#hotel-rooms"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold"
              >
                Explore rooms
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   7. GRID - ELECTRONICS
───────────────────────────────────────────── */

export function GridStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  return (
    <div>
      <section className="border-b" style={{ borderColor: t.line }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p
              className="font-mono text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: t.accent }}
            >
              Computer Village · Ikeja
            </p>

            <h1 className="mt-5 text-[42px] leading-[1.05] font-bold tracking-tight sm:text-5xl">
              Verified gadgets.
              <br />
              Real warranty.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed opacity-60">
              {vendor.about}
            </p>

            <div className="mt-7">
              <StoreBadges vendor={vendor} />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["12 mo", "Warranty"],
                ["48 hr", "Return window"],
                ["5.6K+", "Devices sold"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="border p-4 text-center transition hover:shadow-sm"
                  style={{
                    borderColor: t.line,
                    borderRadius: t.radius,
                  }}
                >
                  <p
                    className="text-lg font-bold tabular-nums"
                    style={{ color: t.accent }}
                  >
                    {v}
                  </p>

                  <p className="mt-0.5 text-[10px] tracking-wide uppercase opacity-50">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="overflow-hidden shadow-xl"
            style={{ borderRadius: t.radius }}
          >
            <img
              src={vendor.cover}
              alt={vendor.name}
              className="h-64 w-full object-cover transition-transform duration-700 hover:scale-[1.03] lg:h-80"
              width={1600}
              height={900}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-7 self-start lg:sticky lg:top-24">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase opacity-45">
              Departments
            </p>

            <div className="mt-3.5 space-y-1 text-sm">
              {vendor.groups.map((g, i) => (
                <p
                  key={g}
                  className="cursor-pointer rounded-lg px-3.5 py-2.5 transition hover:opacity-80"
                  style={
                    i === 0
                      ? {
                          background: t.accent,
                          color: t.accentInk,
                          borderRadius: t.radius,
                          fontWeight: 600,
                        }
                      : { opacity: 0.65 }
                  }
                >
                  {g}
                </p>
              ))}
            </div>
          </div>

          <div
            className="border p-5 text-sm"
            style={{
              borderColor: t.line,
              borderRadius: t.radius,
              background: t.soft,
            }}
          >
            <p className="font-semibold">Bench repairs</p>

            <p className="mt-1.5 text-xs leading-relaxed opacity-60">
              Screens, batteries, board-level fixes. Same-day for most models.
            </p>

            <Link
              to="/cart"
              className="mt-4 inline-block px-4 py-2.5 text-xs font-bold transition hover:opacity-90"
              style={{
                background: t.accent,
                color: t.accentInk,
                borderRadius: t.radius,
              }}
            >
              Book a repair
            </Link>
          </div>

          <StoreSidebar vendor={vendor} />
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">All products</h2>

            <div className="flex gap-2 font-mono text-[10px]">
              {["In stock", "Price ↑", "Newest"].map((f, i) => (
                <span
                  key={f}
                  className="cursor-pointer rounded border px-3 py-1.5 transition"
                  style={
                    i === 0
                      ? {
                          borderColor: t.accent,
                          color: t.accent,
                        }
                      : {
                          borderColor: t.line,
                          opacity: 0.55,
                        }
                  }
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendor.products.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="group flex flex-col border p-4 transition-all hover:shadow-lg"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: t.soft,
                }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[9px] tracking-[0.14em] uppercase opacity-40">
                    {p.group}
                  </span>

                  {p.tag && (
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold"
                      style={{
                        background: t.accent,
                        color: t.accentInk,
                      }}
                    >
                      {p.tag}
                    </span>
                  )}
                </div>

                <div
                  className="mt-3 overflow-hidden"
                  style={{ borderRadius: t.radius }}
                >
                  <ItemArt
                    vendor={vendor}
                    seed={i}
                    className="h-36 w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <p className="mt-3.5 text-sm font-semibold leading-snug">
                  {p.name}
                </p>

                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed opacity-55">
                  {p.desc}
                </p>

                <div className="mt-auto flex items-center justify-between pt-5">
                  <div>
                    <p className="font-mono text-[9px] opacity-40">
                      {p.meta ?? "In stock"}
                    </p>

                    <Price value={p.price} vendor={vendor} />
                  </div>

                  <span
                    className="flex items-center gap-1 px-3.5 py-2 text-[11px] font-bold transition-transform group-hover:scale-105"
                    style={{
                      background: t.accent,
                      color: t.accentInk,
                      borderRadius: t.radius,
                    }}
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                    Add
                  </span>
                </div>
              </ItemLink>
            ))}
          </div>

          <div
            className="mt-10 flex items-center gap-3.5 border p-5 text-sm"
            style={{
              borderColor: t.line,
              borderRadius: t.radius,
            }}
          >
            <Heart
              className="size-4"
              strokeWidth={2}
              style={{ color: t.accent }}
            />

            <p className="opacity-65">
              Save this store to get restock alerts on the devices you follow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
