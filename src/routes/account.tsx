import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CreditCard,
  Heart,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { app, useApp } from "@/lib/peniel-store";
import {
  authApi,
  customersApi,
  ordersApi,
  type CustomerAddress,
  type CustomerProfile,
  type CustomerReview,
  type CustomerWallet,
  type OrderRecord,
  type UpdateCustomerProfileInput,
  type VendorRecord,
  vendorsApi,
} from "@/lib/api-client";
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
  const [session, setSession] = useState<{
    authenticated: boolean;
    user: { id: string; email: string; name: string } | null;
  } | null>(null);
  const [myOrders, setMyOrders] = useState<OrderRecord[]>([]);
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);
  const [topUpError, setTopUpError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      authApi.session(),
      ordersApi.myOrders(),
      customersApi.profile(),
      customersApi.wallet(),
      customersApi.addresses(),
      customersApi.reviews(),
      vendorsApi.public(),
    ]).then(
      ([
        sessionResult,
        ordersResult,
        profileResult,
        walletResult,
        addressesResult,
        reviewsResult,
        vendorsResult,
      ]) => {
        if (!active) return;
        if (sessionResult.ok) setSession(sessionResult.data);
        if (ordersResult.ok) setMyOrders(ordersResult.data);
        if (profileResult.ok) setProfile(profileResult.data);
        if (walletResult.ok) setWallet(walletResult.data);
        if (addressesResult.ok) setAddresses(addressesResult.data);
        if (reviewsResult.ok) setReviews(reviewsResult.data);
        if (vendorsResult.ok) setVendors(vendorsResult.data);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const sessionUser = session?.user;
  const displayName = profile?.full_name ?? sessionUser?.name ?? state.customer.name;
  const userEmail = sessionUser?.email ?? profile?.email ?? state.user?.email;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const balance = wallet?.balanceMinor ?? 0;

  const favourites = vendors.filter((vendor) => state.favorites.includes(vendor.slug));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-sm">
              {initials || "—"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
                Loading profile…
              </h1>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

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
                {userEmail ?? "Your Peniel profile"} · {state.customer.city}
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

        <div className="mt-6 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <div
            key="wallet"
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 transition-all hover:shadow-sm hover:border-primary/30"
          >
            <div className="absolute top-3 right-3 size-6 rounded-full bg-emerald-500/10 backdrop-blur-sm">
              <Wallet className="size-3.5 text-emerald-600" />
            </div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-emerald-500" /> Wallet balance
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">
              {naira(balance)}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Available to spend</p>
          </div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-primary/40"
          >
            <Plus className="size-4" /> Fund wallet
          </button>

          <div
            key="reviews"
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 transition-all hover:shadow-sm hover:border-amber-200/60"
          >
            <div className="absolute top-3 right-3 size-6 rounded-full bg-amber-500/10 backdrop-blur-sm">
              <Star className="size-3.5 text-amber-500" />
            </div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-amber-500" /> Reviews written
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">
              {String(reviews.length)}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Customer feedback</p>
          </div>

          <div
            key="saved"
            className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 p-4 sm:p-5 transition-all hover:shadow-sm hover:border-primary/20"
          >
            <div className="absolute top-3 right-3 size-6 rounded-full bg-primary/10 backdrop-blur-sm">
              <Heart className="size-3.5 text-primary" />
            </div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-primary" /> Saved businesses
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">
              {String(favourites.length)}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Your favourites</p>
          </div>
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
                {myOrders.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    to="/orders/$id"
                    params={{ id: o.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {o.vendor_orders[0]?.vendors?.name ?? "Order"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.vendor_orders.length} items ·{" "}
                        {new Date(o.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <StatusPill status={o.status} />
                      <span className="mt-1.5 block font-display font-bold">
                        {naira(o.total_minor / 100)}
                      </span>
                    </span>
                  </Link>
                ))}
                {myOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                )}
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
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-sm">
                      {v.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{v.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {v.categories?.name ?? v.business_type}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-lg font-bold">Addresses</p>
              <ul className="mt-3 space-y-3 text-sm">
                {addresses.map(({ id, label, address }) => (
                  <li key={id} className="flex min-w-0 items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{address}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${label} address`}
                      onClick={() => {
                        void customersApi
                          .deleteAddress(id)
                          .then(async (result) => {
                            if (result.ok) {
                              const refreshed = await customersApi.addresses();
                              if (refreshed.ok) setAddresses(refreshed.data);
                              toast.success("Address removed");
                            } else {
                              toast.error(result.error ?? "Could not remove address.");
                            }
                          })
                          .catch(() => toast.error("Could not remove address."));
                      }}
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
              const name = String(form.get("name") ?? "").trim();
              const city = String(form.get("city") ?? "").trim();
              if (!name) {
                toast.error("Name is required.");
                return;
              }
              void customersApi
                .updateProfile({ full_name: name })
                .then(async (result) => {
                  if (result.ok) {
                    setProfile({ ...(profile ?? result.data), full_name: name });
                    app.saveCustomer({ ...state.customer, name, city });
                    toast.success("Profile updated");
                  } else {
                    toast.error(result.error ?? "Could not update profile.");
                  }
                })
                .catch(() => toast.error("Could not update profile."));
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
              const label = String(form.get("label") ?? "").trim();
              const address = String(form.get("address") ?? "").trim();
              const city = String(form.get("city") ?? "").trim();
              const state = String(form.get("state") ?? "").trim();
              const instructions = String(form.get("delivery_instructions") ?? "").trim();
              if (!label || !address || !city || !state) {
                toast.error("Label, address, city and state are required.");
                return;
              }
              void customersApi
                .createAddress({ label, address, city, state, delivery_instructions: instructions })
                .then(async (result) => {
                  if (result.ok) {
                    toast.success("Address saved");
                    const refreshed = await customersApi.addresses();
                    if (refreshed.ok) setAddresses(refreshed.data);
                  } else {
                    toast.error(result.error ?? "Could not save address.");
                  }
                })
                .catch(() => toast.error("Could not save address."));
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
                placeholder="Street, area, landmark"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                City
                <input
                  required
                  name="city"
                  placeholder="Lagos"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="block text-sm font-medium">
                State
                <input
                  required
                  name="state"
                  placeholder="Lagos State"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Delivery instructions (optional)
              <textarea
                name="delivery_instructions"
                rows={2}
                placeholder="Gate code, floor, etc."
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
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund your wallet</DialogTitle>
            <DialogDescription>
              Add money to your Peniel Wallet to pay for orders instantly.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const amountRaw = String(form.get("amount") ?? "").trim();
              const amountNaira = Number(amountRaw);
              if (!amountNaira || amountNaira < 100) {
                setTopUpError("Minimum top-up is ₦100.");
                return;
              }
              if (!Number.isFinite(amountNaira)) {
                setTopUpError("Enter a valid amount.");
                return;
              }
              setToppingUp(true);
              setTopUpError("");
              const idempotencyKey = globalThis.crypto?.randomUUID?.() ?? `topup-${Date.now()}`;
              void customersApi
                .walletTopup({ amount_minor: Math.round(amountNaira * 100), idempotencyKey })
                .then(async (result) => {
                  setToppingUp(false);
                  if (!result.ok) {
                    setTopUpError(result.error ?? "Could not initialize top-up.");
                    return;
                  }
                  if (result.data?.walletTopup && result.data?.paymentUrl) {
                    setTopUpOpen(false);
                    window.location.assign(result.data.paymentUrl);
                    return;
                  }
                  setTopUpError("No payment URL returned.");
                })
                .catch(() => {
                  setToppingUp(false);
                  setTopUpError("Could not initialize top-up. Please retry.");
                });
            }}
          >
            <label className="block text-sm font-medium">
              Amount to add
              <span className="ml-1 text-xs text-muted-foreground">(minimum ₦100)</span>
            </label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
              <span className="text-muted-foreground">₦</span>
              <input
                required
                name="amount"
                type="number"
                min="100"
                step="100"
                className="w-full bg-transparent outline-none"
              />
            </div>
            {topUpError && <p className="text-sm text-destructive">{topUpError}</p>}
            <button
              type="submit"
              disabled={toppingUp}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition disabled:opacity-50 disabled:pointer-events-none"
            >
              {toppingUp ? "Starting payment…" : "Continue to payment"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
