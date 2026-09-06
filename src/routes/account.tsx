import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Pencil, Star, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { naira, orders, reviews, vendors } from "@/lib/data";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — Vendra" },
      { name: "description", content: "Your Vendra profile: saved businesses, addresses, order history, reviews and wallet balance." },
      { property: "og:title", content: "My account — Vendra" },
      { property: "og:description", content: "Manage your profile, favourites and orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const favourites = vendors.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
              TA
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">Tosin Adeyemi</h1>
              <p className="truncate text-sm text-muted-foreground">tosin@example.com · Lagos</p>
            </div>
          </div>
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
            <Pencil className="size-4" /> Edit
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            [Wallet, "Wallet balance", naira(18400)],
            [Star, "Reviews written", "9"],
            [Heart, "Saved businesses", "12"],
          ].map(([Icon, l, v]) => {
            const I = Icon as typeof Wallet;
            return (
              <div key={l as string} className="rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <I className="size-3.5 text-primary" /> {l as string}
                </p>
                <p className="mt-2 font-display text-2xl font-bold">{v as string}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">Recent orders</h2>
                <Link to="/orders" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {orders.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    to={o.kind === "booking" ? "/bookings/$id" : "/orders/$id"}
                    params={{ id: o.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{o.vendor}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.items} · {o.placed}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <StatusPill status={o.status} />
                      <span className="mt-1.5 block font-display font-bold">{naira(o.total)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Saved businesses</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {favourites.map((v) => (
                  <Link
                    key={v.slug}
                    to="/store/$slug"
                    params={{ slug: v.slug }}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">
                      {v.monogram}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{v.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{v.categoryLabel}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">My reviews</h2>
              <div className="mt-4 space-y-3">
                {reviews.slice(0, 2).map((r) => (
                  <div key={r.text} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold">{r.vendor}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{r.when}</span>
                    </div>
                    <div className="mt-1.5 flex gap-0.5">
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <Star key={i} className="size-3 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-lg font-bold">Addresses</p>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  ["Home", "12 Adeola Odeku St, Victoria Island"],
                  ["Office", "3 Kofo Abayomi St, VI"],
                ].map(([t, a]) => (
                  <li key={t} className="flex gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block font-medium">{t}</span>
                      <span className="block text-xs text-muted-foreground">{a}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-semibold">Add address</button>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="font-display text-lg font-bold">Sell on Vendra</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Turn your business into an online store with its own link.
              </p>
              <Link
                to="/vendor/onboarding"
                search={{ step: 1 }}
                className="mt-4 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
              >
                Create my storefront
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
