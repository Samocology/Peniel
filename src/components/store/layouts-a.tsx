
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { type Vendor } from "@/lib/data";
import { ItemArt, ItemLink, Price, StoreBadges } from "./store-kit";

export function StoreSidebar({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  return (
    <aside
      className="h-fit border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
      style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}
    >
      <StoreBadges vendor={vendor} />
      <h2 className="mt-4 text-lg font-semibold">{vendor.name}</h2>
      <p className="mt-2 text-sm leading-relaxed opacity-65">{vendor.about}</p>
      <p className="mt-4 text-xs leading-relaxed opacity-60">
        {vendor.location}
        <span className="mx-2 opacity-40">·</span>
        {vendor.delivery}
      </p>
      <Link
        to="/messages"
        search={{ v: vendor.slug }}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
        style={{ color: t.accent }}
      >
        Chat with {vendor.name}
        <ArrowRight className="size-4" />
      </Link>
    </aside>
  );
}

export function BuilderStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  const palette = {
    forest: "#214B36",
    forestDark: "#142D21",
    sage: "#E5EDE3",
    sageLight: "#F5F7F2",
    cream: "#F8F7F2",
    paper: "#FFFFFF",
    ink: "#202820",
    muted: "#69756A",
    line: "#E1E7DE",
    accent: "#B99558",
  };

  const dishes = [
    { name: "Egusi Soup", description: "Rich, hearty and traditional" },
    { name: "Efo Riro", description: "Fresh greens, bold flavour" },
    { name: "Jollof Rice", description: "A Nigerian favourite" },
    { name: "Banga Soup", description: "Authentic palm-fruit flavour" },
  ] as const;

  const proteins = [
    { name: "Goat meat", description: "Rich and flavourful" },
    { name: "Beef", description: "Classic, tender cuts" },
    { name: "Chicken", description: "Fresh, quality portions" },
    { name: "Assorted", description: "A mix of choice cuts" },
    { name: "None", description: "Vegetarian-style kit" },
  ] as const;

  const [dish, setDish] = useState<(typeof dishes)[number]["name"]>("Egusi Soup");
  const [people, setPeople] = useState(6);
  const [protein, setProtein] = useState<(typeof proteins)[number]["name"]>(
    "Goat meat",
  );

  const ingredientsByDish: Record<(typeof dishes)[number]["name"], string[]> = {
    "Egusi Soup": [
      "Ground egusi",
      "Fresh ugu leaves",
      "Premium palm oil",
      "Ground crayfish",
      "Fresh pepper mix",
      "Traditional seasoning",
    ],
    "Efo Riro": [
      "Fresh leafy vegetables",
      "Locust beans (iru)",
      "Fresh pepper mix",
      "Premium palm oil",
      "Ground crayfish",
      "Traditional seasoning",
    ],
    "Jollof Rice": [
      "Long-grain rice",
      "Fresh blended stew base",
      "Tomatoes and peppers",
      "Premium cooking oil",
      "Jollof spice blend",
      "Traditional seasoning",
    ],
    "Banga Soup": [
      "Banga palm-fruit extract",
      "Fresh pepper mix",
      "Ground crayfish",
      "Scent leaves",
      "Traditional spice blend",
      "Seasoning",
    ],
  };

  const basePrices: Record<(typeof dishes)[number]["name"], number> = {
    "Egusi Soup": 12500,
    "Efo Riro": 10800,
    "Jollof Rice": 15900,
    "Banga Soup": 13500,
  };

  const proteinPrices: Record<(typeof proteins)[number]["name"], number> = {
    "Goat meat": 12000,
    Beef: 9000,
    Chicken: 8000,
    Assorted: 13000,
    None: 0,
  };

  const scale = people / 6;
  const total = Math.round(
    (basePrices[dish] + proteinPrices[protein]) * scale,
  );

  const formatPrice = (amount: number) =>
    `₦${amount.toLocaleString("en-NG")}`;

  const categories = [
    { name: "Meal Kits", icon: "01" },
    { name: "Farm Boxes", icon: "02" },
    { name: "Fresh Produce", icon: "03" },
    { name: "Proteins", icon: "04" },
    { name: "Prepped & Cleaned", icon: "05" },
  ];

  return (
    <div
      className="min-h-screen overflow-hidden antialiased selection:bg-[#E5EDE3] selection:text-[#142D21]"
      style={{
        background: palette.cream,
        color: palette.ink,
      }}
    >
      {/* Announcement bar */}
      <div
        className="px-4 py-3 text-center text-[9px] font-semibold tracking-[0.16em] sm:text-[11px]"
        style={{
          background: palette.forestDark,
          color: "#F7F5EC",
        }}
      >
        FARM-FRESH GOODNESS, DELIVERED ACROSS LAGOS
        <span className="mx-2 opacity-40">·</span>
        FRESHNESS YOU CAN TASTE
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="max-w-xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{
              background: palette.sageLight,
              borderColor: palette.line,
              color: palette.forest,
            }}
          >
            <Sparkles className="size-3.5" />
            Fresh from the farm
          </div>

          <h1
            className="mt-7 text-[42px] leading-[1.06] font-semibold tracking-[-0.05em] sm:text-6xl lg:text-[70px]"
            style={{ color: palette.forestDark }}
          >
            Good food
            <br />
            starts with
            <br />
            <span
              style={{
                color: palette.forest,
                fontFamily: "var(--font-script, Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              good ingredients.
            </span>
          </h1>

          <p
            className="mt-6 max-w-md text-[14px] leading-7 sm:text-base sm:leading-8"
            style={{ color: palette.muted }}
          >
            From the farm to your kitchen, we bring you fresh produce,
            carefully prepared ingredients and thoughtfully measured meal
            kits. Tell us what is cooking. We will handle the preparation.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/cart"
              className="group inline-flex items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md sm:px-7"
              style={{
                background: palette.forest,
                color: "#FFFFFF",
              }}
            >
              Build your meal kit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#collection"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-4 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:bg-white"
              style={{
                borderColor: palette.line,
                color: palette.forest,
              }}
            >
              Explore products
            </a>
          </div>

          <div
            className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-6"
            style={{ borderColor: palette.line }}
          >
            <StoreBadges vendor={vendor} />

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: palette.muted }}
            >
              <Truck className="size-4" style={{ color: palette.forest }} />
              Next-day delivery
            </div>
          </div>
        </div>

        {/* Hero photography */}
        <div className="relative mx-auto w-full max-w-xl">
          <div
            className="absolute -inset-3 rounded-[2.25rem] sm:-inset-5"
            style={{ background: palette.sage }}
          />

          <div className="relative overflow-hidden rounded-[1.8rem] shadow-2xl shadow-[#142D21]/10">
            <img
              src={vendor.cover}
              alt={`${vendor.name} farm-fresh ingredients`}
              width={1200}
              height={1400}
              fetchPriority="high"
              className="h-[360px] w-full object-cover sm:h-[500px] lg:h-[590px]"
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 45%, rgba(20,42,28,0.75) 100%)",
              }}
            />

            <div className="absolute right-5 bottom-5 left-5 text-white sm:right-7 sm:bottom-7 sm:left-7">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/75">
                From our farm to your table
              </p>
              <p className="mt-2 max-w-sm text-2xl leading-tight font-medium sm:text-3xl">
                Better ingredients.
                <br />
                Better meals.
              </p>
            </div>
          </div>

          <div
            className="absolute top-5 -left-2 flex items-center gap-3 rounded-2xl border p-3.5 shadow-xl shadow-[#142D21]/10 sm:-left-8 sm:p-4"
            style={{
              background: palette.paper,
              borderColor: palette.line,
            }}
          >
            <div
              className="grid size-10 place-items-center rounded-xl"
              style={{
                background: palette.sage,
                color: palette.forest,
              }}
            >
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Freshly prepared</p>
              <p className="mt-0.5 text-[11px]" style={{ color: palette.muted }}>
                Ready for your kitchen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section
        className="border-y"
        style={{
          borderColor: palette.line,
          background: palette.paper,
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-5 sm:px-8 md:grid-cols-4">
          {[
            {
              icon: Sparkles,
              title: "Farm-fresh produce",
              text: "Carefully selected",
            },
            {
              icon: Users,
              title: "Measured for you",
              text: "Portions made simple",
            },
            {
              icon: Clock,
              title: "Less preparation",
              text: "More time to enjoy",
            },
            {
              icon: Truck,
              title: "Lagos delivery",
              text: "Farm to your doorstep",
            },
          ].map((benefit, i) => (
            <div
              key={benefit.title}
              className="flex items-start gap-3 border-b px-2 py-6 sm:px-4 md:border-r md:border-b-0 md:py-8"
              style={{
                borderColor: palette.line,
              }}
            >
              <benefit.icon
                className="mt-0.5 size-5 shrink-0"
                strokeWidth={1.7}
                style={{ color: palette.forest }}
              />
              <div>
                <p className="text-xs font-semibold sm:text-sm">
                  {benefit.title}
                </p>
                <p
                  className="mt-1 text-[10px] sm:text-xs"
                  style={{ color: palette.muted }}
                >
                  {benefit.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meal kit builder */}
      <section
        id="meal-builder"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mb-9 max-w-xl">
          <p
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: palette.forest }}
          >
            Your kitchen, simplified
          </p>
          <h2
            className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
            style={{ color: palette.forestDark }}
          >
            Your meal, your way.
          </h2>
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: palette.muted }}
          >
            Choose your favourite dish, set your portions and select your
            protein. We will prepare the ingredients for you.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          {/* Selection panel */}
          <div
            className="rounded-[1.75rem] border p-5 shadow-sm sm:p-8"
            style={{
              background: palette.paper,
              borderColor: palette.line,
            }}
          >
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
                style={{
                  background: palette.sage,
                  color: palette.forest,
                }}
              >
                1
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">What are we cooking?</h3>
                <p
                  className="mt-1 text-xs leading-5"
                  style={{ color: palette.muted }}
                >
                  Pick a dish to get started.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {dishes.map((item) => {
                    const selected = dish === item.name;

                    return (
                      <button
                        key={item.name}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDish(item.name)}
                        className="flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all hover:border-[#244C38]"
                        style={{
                          borderColor: selected
                            ? palette.forest
                            : palette.line,
                          background: selected
                            ? palette.sageLight
                            : palette.paper,
                        }}
                      >
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p
                            className="mt-1 text-[11px]"
                            style={{ color: palette.muted }}
                          >
                            {item.description}
                          </p>
                        </div>

                        <span
                          className="grid size-5 shrink-0 place-items-center rounded-full border"
                          style={{
                            borderColor: selected
                              ? palette.forest
                              : palette.line,
                            background: selected
                              ? palette.forest
                              : "transparent",
                            color: "#FFFFFF",
                          }}
                        >
                          {selected && (
                            <span className="text-[11px]">✓</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="my-7 border-t"
              style={{ borderColor: palette.line }}
            />

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
                style={{
                  background: palette.sage,
                  color: palette.forest,
                }}
              >
                2
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">How many people?</h3>
                <p
                  className="mt-1 text-xs leading-5"
                  style={{ color: palette.muted }}
                >
                  We will adjust the portions to suit your table.
                </p>

                <div
                  className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5"
                  style={{ borderColor: palette.line }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-11 place-items-center rounded-xl"
                      style={{
                        background: palette.sageLight,
                        color: palette.forest,
                      }}
                    >
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {people} {people === 1 ? "person" : "people"}
                      </p>
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: palette.muted }}
                      >
                        Meal portions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Reduce number of people"
                      disabled={people <= 1}
                      onClick={() => setPeople((n) => Math.max(1, n - 1))}
                      className="grid size-10 place-items-center rounded-full border transition hover:bg-[#F3F6F0] disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ borderColor: palette.line }}
                    >
                      <Minus className="size-4" />
                    </button>

                    <span className="w-5 text-center text-lg font-semibold tabular-nums">
                      {people}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase number of people"
                      disabled={people >= 30}
                      onClick={() => setPeople((n) => Math.min(30, n + 1))}
                      className="grid size-10 place-items-center rounded-full transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                      style={{
                        background: palette.forest,
                        color: "#FFFFFF",
                      }}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="my-7 border-t"
              style={{ borderColor: palette.line }}
            />

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
                style={{
                  background: palette.sage,
                  color: palette.forest,
                }}
              >
                3
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">Choose your protein</h3>
                <p
                  className="mt-1 text-xs leading-5"
                  style={{ color: palette.muted }}
                >
                  Make it your own with your preferred protein.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {proteins.map((item) => {
                    const selected = protein === item.name;

                    return (
                      <button
                        key={item.name}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setProtein(item.name)}
                        className="rounded-full border px-4 py-2.5 text-xs font-medium transition-all hover:border-[#244C38] sm:text-sm"
                        style={{
                          background: selected
                            ? palette.forest
                            : palette.paper,
                          color: selected ? "#FFFFFF" : palette.ink,
                          borderColor: selected
                            ? palette.forest
                            : palette.line,
                        }}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside
            className="overflow-hidden rounded-[1.75rem] border shadow-lg shadow-[#142D21]/5 lg:sticky lg:top-24"
            style={{
              background: palette.paper,
              borderColor: palette.line,
            }}
          >
            <div
              className="px-6 py-6 sm:px-7"
              style={{
                background: palette.forest,
                color: "#FFFFFF",
              }}
            >
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/65">
                Made for your table
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Your meal kit
              </h3>
              <p className="mt-1 text-xs text-white/70">
                {dish} · {people} {people === 1 ? "person" : "people"}
              </p>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Ingredients included</p>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    background: palette.sage,
                    color: palette.forest,
                  }}
                >
                  {ingredientsByDish[dish].length} items
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {ingredientsByDish[dish].map((ingredient) => (
                  <li
                    key={ingredient}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span
                      className="grid size-5 shrink-0 place-items-center rounded-full"
                      style={{
                        background: palette.sage,
                        color: palette.forest,
                      }}
                    >
                      ✓
                    </span>
                    <span>{ingredient}</span>
                  </li>
                ))}

                {protein !== "None" && (
                  <li className="flex items-center gap-3 text-xs">
                    <span
                      className="grid size-5 shrink-0 place-items-center rounded-full"
                      style={{
                        background: palette.sage,
                        color: palette.forest,
                      }}
                    >
                      ✓
                    </span>
                    <span>{protein}</span>
                  </li>
                )}
              </ul>

              <div
                className="mt-6 rounded-2xl p-4"
                style={{ background: palette.sageLight }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs" style={{ color: palette.muted }}>
                    Base meal kit
                  </span>
                  <span className="text-xs font-medium tabular-nums">
                    {formatPrice(
                      Math.round(basePrices[dish] * scale),
                    )}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs" style={{ color: palette.muted }}>
                    {protein} protein
                  </span>
                  <span className="text-xs font-medium tabular-nums">
                    {formatPrice(
                      Math.round(proteinPrices[protein] * scale),
                    )}
                  </span>
                </div>

                <div
                  className="mt-4 border-t pt-4"
                  style={{ borderColor: palette.line }}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs" style={{ color: palette.muted }}>
                        Estimated total
                      </p>
                      <p
                        className="mt-1 text-2xl font-bold tracking-tight tabular-nums"
                        style={{ color: palette.forest }}
                      >
                        {formatPrice(total)}
                      </p>
                    </div>
                    <p
                      className="pb-1 text-[10px]"
                      style={{ color: palette.muted }}
                    >
                      For {people} {people === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/cart"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md"
                style={{
                  background: palette.forest,
                  color: "#FFFFFF",
                }}
              >
                Add to cart
                <ArrowRight className="size-4" />
              </Link>

              <p
                className="mt-4 text-center text-[10px] leading-5"
                style={{ color: palette.muted }}
              >
                Cooking instructions included.
                <br />
                Fresh ingredients, ready for your kitchen.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Category navigation */}
      <section
        id="collection"
        className="border-y"
        style={{
          borderColor: palette.line,
          background: palette.paper,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: palette.forest }}
              >
                Shop the farm
              </p>
              <h2
                className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: palette.forestDark }}
              >
                Good things, grown well.
              </h2>
            </div>
            <p
              className="max-w-sm text-sm leading-6"
              style={{ color: palette.muted }}
            >
              Everything you need to make everyday cooking a little easier.
            </p>
          </div>

          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`#category-${category.icon}`}
                className="flex min-w-max items-center gap-3 rounded-full border px-4 py-3 text-xs font-medium transition hover:border-[#244C38] hover:bg-[#F3F6F0]"
                style={{
                  background: palette.cream,
                  borderColor: palette.line,
                }}
              >
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: palette.forest }}
                >
                  {category.icon}
                </span>
                {category.name}
                <ArrowRight className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Product catalog */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="space-y-20">
          {categories.map((category) => {
            const group = vendor.groups.find(
              (g) =>
                g.toLowerCase().trim() ===
                category.name.toLowerCase().trim(),
            );

            const items = group
              ? vendor.products.filter((p) => p.group === group)
              : [];

            if (!items.length) return null;

            return (
              <div
                key={category.name}
                id={`category-${category.icon}`}
                className="scroll-mt-24"
              >
                <div
                  className="mb-6 flex items-end justify-between gap-4 border-b pb-5"
                  style={{ borderColor: palette.line }}
                >
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-[0.2em] uppercase"
                      style={{ color: palette.forest }}
                    >
                      Collection {category.icon}
                    </p>
                    <h2
                      className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                      style={{ color: palette.forestDark }}
                    >
                      {category.name}
                    </h2>
                  </div>
                  <span
                    className="shrink-0 text-xs"
                    style={{ color: palette.muted }}
                  >
                    {items.length} {items.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {items.map((p, i) => (
                    <ItemLink
                      key={p.id}
                      vendor={vendor}
                      product={p}
                      className="group min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#142D21]/8"
                      style={{
                        background: palette.paper,
                        borderColor: palette.line,
                      }}
                    >
                      <div className="relative overflow-hidden">
                        <ItemArt
                          vendor={vendor}
                          seed={i}
                          label={p.name}
                          className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105"
                        />

                        {p.tag && (
                          <span
                            className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide"
                            style={{
                              background: palette.forest,
                              color: "#FFFFFF",
                            }}
                          >
                            {p.tag}
                          </span>
                        )}

                        <span
                          className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full shadow-md transition-transform group-hover:scale-110"
                          style={{
                            background: palette.paper,
                            color: palette.forest,
                          }}
                        >
                          <Plus className="size-4" />
                        </span>
                      </div>

                      <div className="p-4 sm:p-5">
                        <h3 className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
                          {p.name}
                        </h3>

                        <p
                          className="mt-2 line-clamp-2 text-[11px] leading-5 sm:text-xs"
                          style={{ color: palette.muted }}
                        >
                          {p.desc}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4"
                          style={{ borderColor: palette.line }}
                        >
                          <Price value={p.price} vendor={vendor} />
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: palette.forest }}
                          >
                            View details
                          </span>
                        </div>
                      </div>
                    </ItemLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Delivery and fulfilment */}
      <section
        className="border-y"
        style={{
          borderColor: palette.line,
          background: palette.sageLight,
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: palette.forest }}
            >
              From our farm to your home
            </p>

            <h2
              className="mt-4 max-w-lg text-3xl leading-tight font-semibold tracking-tight sm:text-5xl"
              style={{ color: palette.forestDark }}
            >
              More time enjoying food. Less time preparing it.
            </h2>

            <p
              className="mt-5 max-w-lg text-sm leading-7"
              style={{ color: palette.muted }}
            >
              Spend less time sorting, washing and measuring. Let us help
              you get the ingredients ready so you can focus on the people
              around your table.
            </p>

            <Link
              to="/messages"
              search={{ v: vendor.slug }}
              className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:opacity-90"
              style={{
                background: palette.forest,
                color: "#FFFFFF",
              }}
            >
              Chat with our team
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: MapPin,
                title: "Local farm hub",
                body: vendor.location,
              },
              {
                icon: Clock,
                title: "We're open",
                body: vendor.hours,
              },
              {
                icon: Truck,
                title: "Reliable delivery",
                body: vendor.delivery,
              },
              {
                icon: Sparkles,
                title: "Fresh preparation",
                body: "Carefully prepared ingredients for your everyday meals.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
                style={{
                  background: palette.paper,
                  borderColor: palette.line,
                }}
              >
                <item.icon
                  className="size-5"
                  strokeWidth={1.7}
                  style={{ color: palette.forest }}
                />
                <h3 className="mt-5 text-sm font-semibold">{item.title}</h3>
                <p
                  className="mt-2 text-xs leading-6"
                  style={{ color: palette.muted }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About and trust */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div
          className="grid gap-10 rounded-[2rem] p-6 shadow-xl shadow-[#142D21]/10 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-14"
          style={{
            background: palette.forestDark,
            color: "#FFFFFF",
          }}
        >
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/60 uppercase">
              A little about us
            </p>

            <h2 className="mt-4 max-w-lg text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Freshness you can feel good about.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">
              {vendor.about}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/messages"
                search={{ v: vendor.slug }}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                style={{
                  background: "#FFFFFF",
                  color: palette.forestDark,
                }}
              >
                Chat with us
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5">
            <div className="flex items-start gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Delivery across Lagos</p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Island and mainland fulfilment, as available.
                </p>
              </div>
            </div>

            <div className="h-px bg-white/15" />

            <div className="flex items-start gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">A simpler way to cook</p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Meal kits and prepared ingredients to make cooking easier.
                </p>
              </div>
            </div>

            <div className="h-px bg-white/15" />

            <div className="flex items-start gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Personal service</p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Contact the team privately through Peniel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t"
        style={{
          borderColor: palette.line,
          background: palette.paper,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p
              className="text-lg font-semibold tracking-tight"
              style={{ color: palette.forest }}
            >
              {vendor.name}
            </p>
            <p
              className="mt-1 max-w-sm text-xs leading-5"
              style={{ color: palette.muted }}
            >
              Fresh ingredients, thoughtful preparation, better meals.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs">
            <a
              href="#collection"
              className="transition hover:opacity-60"
              style={{ color: palette.muted }}
            >
              Shop
            </a>
            <a
              href="#meal-builder"
              className="transition hover:opacity-60"
              style={{ color: palette.muted }}
            >
              Build a meal kit
            </a>
            <Link
              to="/messages"
              search={{ v: vendor.slug }}
              className="transition hover:opacity-60"
              style={{ color: palette.muted }}
            >
              Contact
            </Link>
          </div>
        </div>

        <div
          className="border-t px-5 py-4 sm:px-8"
          style={{ borderColor: palette.line }}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[10px] sm:flex-row sm:items-center sm:justify-between"
            style={{ color: palette.muted }}
          >
            <p>
              © {new Date().getFullYear()} {vendor.name}. All rights reserved.
            </p>
            <Link to="/" className="transition hover:opacity-70">
              Powered by Peniel · Payments secured by Peniel Pay
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
