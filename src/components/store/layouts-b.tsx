import { useState } from "react";

import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  Clock,
  Coffee,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Heart,
  ShoppingBag,
  Users,
  Wifi,
} from "lucide-react";

import type { Vendor } from "@/lib/data";
import { ItemArt, ItemLink, Price } from "./store-kit";

export function ReservationStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");

  const today = (() => {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  })();

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(`${checkOut}T12:00:00`).getTime() -
              new Date(`${checkIn}T12:00:00`).getTime()) /
              86400000,
          ),
        )
      : 0;

  const formatDate = (date: string) => {
    if (!date) return "Add date";

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
    (p) => !serviceProducts.some((service) => service.id === p.id),
  );

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      setBookingMessage("Please select both your check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setBookingMessage("Your check-out date must be after check-in.");
      return;
    }

    setBookingMessage(
      `${nights} night${nights === 1 ? "" : "s"} · ${adults} guest${adults === 1 ? "" : "s"} · ${rooms} room${rooms === 1 ? "" : "s"}. Explore the accommodation options below to continue.`,
    );

    document.getElementById("hotel-rooms")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const changeGuests = (value: number) => {
    setAdults(Math.max(1, Math.min(12, value)));
  };

  const changeRooms = (value: number) => {
    setRooms(Math.max(1, Math.min(8, value)));
  };

  return (
    <div
      className="overflow-hidden"
      style={{
        background: t.bg,
        color: t.ink,
      }}
    >
      {/* HERO */}
      <section className="relative isolate min-h-[570px] overflow-hidden bg-[#101814] sm:min-h-[620px] lg:min-h-[660px]">
        <img
          src={vendor.cover}
          alt={vendor.name}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          width={2000}
          height={1200}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101814]/95 via-[#101814]/65 to-[#101814]/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101814]/75 via-transparent to-[#101814]/15" />

        <div className="mx-auto flex min-h-[570px] max-w-[1440px] items-center px-5 pb-20 pt-20 sm:min-h-[620px] sm:px-10 lg:min-h-[660px] lg:px-16">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold tracking-[0.17em] text-white/90 uppercase backdrop-blur-md">
                <Sparkles className="size-3.5 text-amber-300" />
                Hospitality & accommodation
              </span>

              <span className="flex items-center gap-1.5 text-xs text-white/85">
                <Star className="size-3.5 fill-amber-300 text-amber-300" />
                <strong className="text-white">{vendor.rating.toFixed(1)}</strong>
                {vendor.reviews} guest reviews
              </span>
            </div>

            <p className="mt-9 text-[10px] font-semibold tracking-[0.28em] text-white/60 uppercase">
              An exceptional stay awaits
            </p>

            <h1 className="mt-4 max-w-2xl text-[clamp(3.2rem,7vw,6.4rem)] font-medium leading-[0.94] tracking-[-0.065em]">
              Rest well.
              <br />
              <span className="font-normal text-white/65">Stay beautifully.</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
              {vendor.about}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#hotel-rooms"
                className="inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3 text-xs font-bold transition hover:-translate-y-0.5 hover:opacity-90 sm:text-sm"
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
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/30 bg-white/5 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/15 sm:text-sm"
                style={{ borderRadius: t.radius }}
              >
                Discover the hotel
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/20 pt-6">
              {[
                { icon: BedDouble, label: "42 rooms & suites" },
                { icon: Coffee, label: "Breakfast included" },
                { icon: Wifi, label: "High-speed Wi-Fi" },
                { icon: MapPin, label: "Victoria Island, Lagos" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-[11px] text-white/75"
                >
                  <Icon className="size-4 text-amber-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-6 hidden items-center gap-3 text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase lg:flex">
          <span className="h-px w-12 bg-white/40" />
          Discover your next stay
        </div>
      </section>

      {/* BOOKING SEARCH */}
      <section className="relative z-10 mx-auto -mt-7 max-w-[1320px] px-3 sm:-mt-12 sm:px-8 lg:px-12">
        <div
          className="border p-4 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.3)] sm:p-7 lg:p-8"
          style={{
            background: t.bg,
            borderColor: t.line,
            borderRadius: t.radius,
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <div className="min-w-0">
              <p
                className="text-[9px] font-bold tracking-[0.16em] uppercase sm:text-[10px] sm:tracking-[0.2em]"
                style={{ color: t.accent }}
              >
                Your stay starts here
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:mt-2 sm:text-2xl">
                Find your perfect stay
              </h2>
              <p className="mt-1 max-w-[28rem] text-xs leading-5 opacity-55 sm:leading-6">
                Tell us when you're visiting and who is coming along.
              </p>
            </div>

            <div
              title="Secure booking enquiry"
              className="inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-2 sm:gap-2 sm:px-3.5"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.soft,
              }}
            >
              <ShieldCheck className="size-3.5 sm:size-4" style={{ color: t.accent }} />
              <span className="text-[9px] font-semibold opacity-65 sm:text-[10px]">
                Secure<span className="hidden sm:inline"> booking enquiry</span>
              </span>
            </div>
          </div>

          <div className="grid gap-3 min-[380px]:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_180px] lg:items-end">
            <div className="min-w-0">
              <label
                htmlFor="hotel-checkin"
                className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase opacity-60"
              >
                <CalendarDays className="size-3.5" style={{ color: t.accent }} />
                Check-in
              </label>
              <input
                id="hotel-checkin"
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
                className="h-13 w-full min-w-0 border px-3 text-xs font-medium outline-none transition focus:ring-2 focus:ring-offset-1 sm:h-12"
                style={{
                  background: t.soft,
                  color: t.ink,
                  borderColor: t.line,
                  borderRadius: t.radius,
                  colorScheme: "light",
                }}
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="hotel-checkout"
                className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase opacity-60"
              >
                <CalendarDays className="size-3.5" style={{ color: t.accent }} />
                Check-out
              </label>
              <input
                id="hotel-checkout"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setBookingMessage("");
                }}
                className="h-13 w-full min-w-0 border px-3 text-xs font-medium outline-none transition focus:ring-2 focus:ring-offset-1 sm:h-12"
                style={{
                  background: t.soft,
                  color: t.ink,
                  borderColor: t.line,
                  borderRadius: t.radius,
                  colorScheme: "light",
                }}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase opacity-60">
                <Users className="size-3.5" style={{ color: t.accent }} />
                Adults
              </label>

              <div
                className="flex h-13 items-center justify-between border px-2 sm:h-12 sm:px-3"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: t.soft,
                }}
              >
                <button
                  type="button"
                  aria-label="Remove adult"
                  disabled={adults <= 1}
                  onClick={() => changeGuests(adults - 1)}
                  className="grid size-9 place-items-center rounded-full transition hover:bg-black/5 disabled:opacity-25 sm:size-8"
                >
                  <Minus className="size-3.5" />
                </button>

                <span aria-live="polite" className="text-sm font-semibold tabular-nums">
                  {adults}
                </span>

                <button
                  type="button"
                  aria-label="Add adult"
                  disabled={adults >= 12}
                  onClick={() => changeGuests(adults + 1)}
                  className="grid size-9 place-items-center rounded-full transition hover:bg-black/5 disabled:opacity-25 sm:size-8"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase opacity-60">
                <BedDouble className="size-3.5" style={{ color: t.accent }} />
                Rooms
              </label>

              <div
                className="flex h-13 items-center justify-between border px-2 sm:h-12 sm:px-3"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: t.soft,
                }}
              >
                <button
                  type="button"
                  aria-label="Remove room"
                  disabled={rooms <= 1}
                  onClick={() => changeRooms(rooms - 1)}
                  className="grid size-9 place-items-center rounded-full transition hover:bg-black/5 disabled:opacity-25 sm:size-8"
                >
                  <Minus className="size-3.5" />
                </button>

                <span aria-live="polite" className="text-sm font-semibold tabular-nums">
                  {rooms}
                </span>

                <button
                  type="button"
                  aria-label="Add room"
                  disabled={rooms >= 8}
                  onClick={() => changeRooms(rooms + 1)}
                  className="grid size-9 place-items-center rounded-full transition hover:bg-black/5 disabled:opacity-25 sm:size-8"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              className="flex h-13 items-center justify-center gap-2 px-5 text-xs font-bold transition hover:-translate-y-0.5 hover:opacity-90 min-[380px]:col-span-2 lg:col-span-1"
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
            <div
              role="status"
              className="mt-4 flex items-start gap-2 border p-3 text-xs leading-5"
              style={{
                borderColor: t.line,
                background: t.soft,
                borderRadius: t.radius,
              }}
            >
              <Check className="mt-0.5 size-4 shrink-0" style={{ color: t.accent }} />
              {bookingMessage}
            </div>
          )}

          <div
            className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4 text-[10px] opacity-65 sm:mt-5"
            style={{ borderColor: t.line }}
          >
            <span
              className="inline-flex min-h-8 items-center gap-1.5 border px-2.5"
              style={{ borderColor: t.line, borderRadius: t.radius }}
            >
              <CalendarDays className="size-3" style={{ color: t.accent }} />
              {formatDate(checkIn)} – {formatDate(checkOut)}
            </span>
            <span
              className="inline-flex min-h-8 items-center border px-2.5"
              style={{ borderColor: t.line, borderRadius: t.radius }}
            >
              {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "Duration not selected"}
            </span>
            <span
              className="inline-flex min-h-8 items-center border px-2.5"
              style={{ borderColor: t.line, borderRadius: t.radius }}
            >
              {adults} adults · {rooms} rooms
            </span>
          </div>
        </div>
      </section>

      {/* HOTEL INTRODUCTION */}
      <section
        id="hotel-experience"
        className="mx-auto grid max-w-[1320px] scroll-mt-20 gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-end lg:px-12"
      >
        <div>
          <p
            className="text-[10px] font-bold tracking-[0.24em] uppercase"
            style={{ color: t.accent }}
          >
            The art of hospitality
          </p>

          <h2 className="mt-5 max-w-2xl text-3xl leading-[1.15] font-medium tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Thoughtfully designed for rest, comfort and everything in between.
          </h2>
        </div>

        <div className="lg:pl-12">
          <p className="max-w-lg text-sm leading-8 opacity-60">
            Discover a stay that brings together welcoming service, considered spaces and the little
            details that make every visit memorable.
          </p>

          <div className="mt-6 h-px w-full" style={{ background: t.line }} />

          <div className="mt-5 flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-full"
              style={{
                background: t.soft,
                color: t.accent,
              }}
            >
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold">A considered guest experience</p>
              <p className="mt-1 text-[10px] opacity-50">
                Comfort, convenience and attentive service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              icon: BedDouble,
              title: "Beautiful spaces",
              description: "Thoughtful accommodation",
            },
            {
              icon: Coffee,
              title: "Breakfast",
              description: "Start the day comfortably",
            },
            {
              icon: Wifi,
              title: "Stay connected",
              description: "Fast Wi-Fi access",
            },
            {
              icon: Clock,
              title: "Always available",
              description: "24-hour reception",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.soft,
              }}
            >
              <div
                className="grid size-11 place-items-center"
                style={{
                  background: t.bg,
                  color: t.accent,
                  borderRadius: t.radius,
                }}
              >
                <Icon className="size-5" />
              </div>

              <h3 className="mt-5 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-[11px] leading-5 opacity-50">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROOMS */}
      <section id="hotel-rooms" className="scroll-mt-20" style={{ background: t.soft }}>
        <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.24em] uppercase"
                style={{ color: t.accent }}
              >
                Find your space
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                Rooms & accommodation
              </h2>

              <p className="mt-3 text-sm opacity-55">A comfortable space for every kind of stay.</p>
            </div>

            <span className="text-xs opacity-50">{roomProducts.length} accommodation options</span>
          </div>

          {roomProducts.length === 0 ? (
            <div
              className="mt-10 border p-12 text-center"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.bg,
              }}
            >
              <BedDouble className="mx-auto size-9 opacity-40" />
              <p className="mt-4 text-sm font-semibold">Accommodation coming soon</p>
              <p className="mt-2 text-xs opacity-50">Contact the property for room enquiries.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {roomProducts.map((p, i) => (
                <ItemLink
                  key={p.id}
                  vendor={vendor}
                  product={p}
                  className="group flex min-w-0 flex-col overflow-hidden border transition duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                      className="h-56 w-full transition-transform duration-700 group-hover:scale-105 sm:h-64"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

                    {p.tag && (
                      <span
                        className="absolute left-4 top-4 px-3 py-2 text-[9px] font-bold tracking-[0.12em] uppercase"
                        style={{
                          background: t.accent,
                          color: t.accentInk,
                          borderRadius: t.radius,
                        }}
                      >
                        {p.tag}
                      </span>
                    )}

                    <span className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-medium text-white">
                      <Star className="size-3 fill-amber-300 text-amber-300" />
                      Guest favourite
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                        <p className="mt-1 text-[11px] opacity-50">{p.meta || "Accommodation"}</p>
                      </div>

                      <BedDouble className="mt-1 size-5 shrink-0" style={{ color: t.accent }} />
                    </div>

                    <p className="mt-4 line-clamp-3 text-xs leading-6 opacity-60">{p.desc}</p>

                    <div
                      className="mt-6 flex items-end justify-between gap-3 border-t pt-5"
                      style={{ borderColor: t.line }}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] opacity-45">Price per night</p>
                        <div className="mt-1">
                          <Price value={p.price} vendor={vendor} />
                        </div>
                      </div>

                      <span
                        className="inline-flex shrink-0 items-center gap-2 px-4 py-3 text-[11px] font-bold transition group-hover:opacity-80"
                        style={{
                          background: t.accent,
                          color: t.accentInk,
                          borderRadius: t.radius,
                        }}
                      >
                        View room
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
        <section className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.24em] uppercase"
                style={{ color: t.accent }}
              >
                Beyond accommodation
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                Thoughtful extras.
              </h2>

              <p className="mt-3 text-sm opacity-55">
                Make every part of your visit a little easier.
              </p>
            </div>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {serviceProducts.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="group flex min-w-0 flex-col overflow-hidden border transition hover:-translate-y-1 hover:shadow-lg sm:flex-row"
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: t.soft,
                }}
              >
                <div className="h-48 shrink-0 overflow-hidden sm:h-auto sm:w-40 lg:w-48">
                  <ItemArt
                    vendor={vendor}
                    seed={roomProducts.length + i}
                    label={p.name}
                    className="h-full min-h-40 w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-base font-semibold">{p.name}</p>
                    <p className="mt-2 text-xs leading-6 opacity-55">{p.desc}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Price value={p.price} vendor={vendor} />

                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: t.accent }}
                    >
                      Explore
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </ItemLink>
            ))}
          </div>
        </section>
      )}

      {/* PROPERTY INFORMATION */}
      <section className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
        <div
          className="grid overflow-hidden border lg:grid-cols-2"
          style={{
            borderColor: t.line,
            borderRadius: t.radius,
            background: t.soft,
          }}
        >
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <p
              className="text-[10px] font-bold tracking-[0.24em] uppercase"
              style={{ color: t.accent }}
            >
              Plan your visit
            </p>

            <h2 className="mt-5 max-w-md text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">
              We look forward to welcoming you.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 opacity-60">
              Have a question about a room, a special request or your upcoming visit? Get in touch
              with the property before making your reservation.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  icon: MapPin,
                  title: "Find your way",
                  description: "View the property's location and contact information.",
                },
                {
                  icon: Clock,
                  title: "Flexible arrangements",
                  description: "Confirm check-in and check-out arrangements with the property.",
                },
                {
                  icon: ShieldCheck,
                  title: "Book with confidence",
                  description: "Confirm reservation terms directly before booking.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="grid size-10 shrink-0 place-items-center"
                    style={{
                      background: t.bg,
                      color: t.accent,
                      borderRadius: t.radius,
                    }}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="mt-1 max-w-sm text-[11px] leading-5 opacity-55">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[430px]">
            <img
              src={vendor.cover}
              alt={`${vendor.name} property`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-white/65 uppercase">
                Your next destination
              </p>

              <h3 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                {vendor.name}
              </h3>

              <p className="mt-3 max-w-sm text-xs leading-6 text-white/70">
                Experience comfort, convenience and thoughtful hospitality.
              </p>

              <a
                href="#hotel-rooms"
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold transition hover:gap-3"
              >
                Discover accommodation
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section
        className="px-5 py-16 text-center sm:px-8 sm:py-20"
        style={{
          background: t.soft,
          borderTop: `1px solid ${t.line}`,
        }}
      >
        <p
          className="text-[10px] font-bold tracking-[0.25em] uppercase"
          style={{ color: t.accent }}
        >
          An experience worth returning to
        </p>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
          Make room for a better stay.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 opacity-55">
          Explore our accommodation and discover a space that feels just right.
        </p>

        <a
          href="#hotel-rooms"
          className="mt-8 inline-flex min-h-12 items-center gap-3 px-7 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-85"
          style={{
            background: t.accent,
            color: t.accentInk,
            borderRadius: t.radius,
          }}
        >
          Explore available rooms
          <ArrowRight className="size-4" />
        </a>
      </section>
    </div>
  );
}
