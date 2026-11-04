import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, MapPin, Pencil, Plus, Star, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { naira, orders, reviews, vendors } from "@/lib/data";
import { app, useApp } from "@/lib/peniel-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account - Peniel" },
      {
        name: "description",
        content:
          "Your Peniel profile: saved businesses, addresses, order history, reviews and wallet balance.",
      },
      { property: "og:title", content: "My account - Peniel" },
      { property: "og:description", content: "Manage your profile, favourites and orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const state = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const favourites = vendors.filter((vendor) => state.favorites.includes(vendor.slug));
  const displayName = state.user?.name ?? state.customer.name;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-sm">
              {initials}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
                {displayName}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {state.user?.email ?? "Your Peniel profile"} · {state.customer.city}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-primary/40"
          >
            <Pencil className="size-4" /> Edit
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            [Wallet, "Wallet balance", naira(18400)],
            [
              Star,
              "Reviews written",
              String(
                reviews.filter((review) => review.name.startsWith(displayName.split(" ")[0] ?? ""))
                  .length,
              ),
            ],
            [Heart, "Saved businesses", String(favourites.length)],
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
                {favourites.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center sm:col-span-2">
                    <Heart className="mx-auto size-6 text-muted-foreground" />
                    <p className="mt-2 text-sm font-semibold">Your favourites will live here</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Save a business from its storefront to find it quickly next time.
                    </p>
                    <Link
                      to="/marketplace"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary"
                    >
                      Explore businesses <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                )}
                {favourites.map((v) => (
                  <Link
                    key={v.slug}
                    to="/store/$slug"
                    params={{ slug: v.slug }}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <img
                      src={v.cover}
                      alt=""
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{v.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {v.categoryLabel}
                      </span>
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
                {(state.addresses ?? []).map(({ id, label, address }) => (
                  <li key={id} className="flex min-w-0 items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{address}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${label} address`}
                      onClick={() => app.removeCustomerAddress(id)}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setAddressOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold transition hover:border-primary/40"
              >
                <Plus className="size-3.5" /> Add address
              </button>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="font-display text-lg font-bold">Sell on Peniel</p>
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit your profile</DialogTitle>
            <DialogDescription>
              Keep your name and location up to date for orders and bookings.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              app.saveCustomer({
                ...state.customer,
                name: String(form.get("name") ?? "").trim(),
                city: String(form.get("city") ?? "").trim(),
              });
              toast.success("Profile updated");
              setEditOpen(false);
            }}
          >
            <label className="block text-sm font-medium">
              Name
              <input
                required
                name="name"
                defaultValue={displayName}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium">
              City
              <input
                required
                name="city"
                defaultValue={state.customer.city}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Save profile
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a delivery address</DialogTitle>
            <DialogDescription>Save an address to make future orders easier.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              app.saveCustomerAddress(
                String(form.get("label") ?? ""),
                String(form.get("address") ?? ""),
              );
              toast.success("Address saved");
              setAddressOpen(false);
            }}
          >
            <label className="block text-sm font-medium">
              Label
              <input
                required
                name="label"
                placeholder="Home, office…"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium">
              Address
              <textarea
                required
                name="address"
                rows={3}
                placeholder="Street, area, city"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Save address
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
