import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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
      <div className="min-h-screen bg-muted/30">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 animate-pulse place-items-center rounded-2xl bg-primary/80 font-display text-lg font-bold text-primary-foreground shadow-sm">
              {initials || "—"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
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
    <div className="min-h-screen overflow-x-hidden bg-muted/30">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-lg shadow-primary/15 sm:size-[4.5rem]">
              {initials || "U"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {displayName}
              </h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {userEmail ?? "Your Peniel profile"}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" /> {state.customer.city || "Location not set"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold shadow-sm transition hover:border-primary/40 hover:bg-muted sm:w-auto"
          >
            <Pencil className="size-4" /> Edit
          </button>
        </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <div
            key="wallet"
            className="relative min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5"
          >
            <div className="absolute top-3 right-3 size-6 rounded-full bg-emerald-500/10 backdrop-blur-sm">
              <Wallet className="size-3.5 text-emerald-600" />
            </div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
              <span className="size-1 rounded-full bg-emerald-500" /> Wallet balance
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {naira(balance)}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Available to spend</p>
          </div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="flex min-h-[118px] flex-col items-start justify-between rounded-2xl border border-primary/20 bg-primary p-4 text-left text-primary-foreground shadow-sm shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-0 sm:p-5"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary-foreground/15"><Plus className="size-4" /></span><span><span className="block text-sm font-bold">Fund wallet</span><span className="mt-0.5 block text-xs text-primary-foreground/75">Add money to your wallet</span></span>
          </button>

          <div
            key="reviews"
            className="relative min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-md sm:p-5"
          >
            <div className="absolute top-3 right-3 size-6 rounded-full bg-amber-500/10 backdrop-blur-sm">
              <Star className="size-3.5 text-amber-500" />
            </div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
              <span className="size-1 rounded-full bg-amber-500" /> Reviews written
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {String(reviews.length)}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Customer feedback</p>
          </div>

          <div
            key="saved"
            className="relative col-span-2 min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:col-span-1 sm:p-5"
          >
            <div className="absolute top-3 right-3 size-6 rounded-full bg-primary/10 backdrop-blur-sm">
              <Heart className="size-3.5 text-primary" />
            </div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
              <span className="size-1 rounded-full bg-primary" /> Saved businesses
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {String(favourites.length)}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Your favourites</p>
          </div>
        </section>

        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="font-display text-xl font-bold tracking-tight">Recent orders</h2><p className="mt-1 text-xs text-muted-foreground">Keep track of your latest purchases</p></div>
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
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md sm:gap-4 sm:p-5"
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
                  <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-9 text-center"><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-muted"><Wallet className="size-5 text-muted-foreground" /></span><p className="mt-3 text-sm font-semibold">No orders yet</p><p className="mt-1 text-xs text-muted-foreground">Your purchases will appear here once you place an order.</p><Link to="/marketplace" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary">Explore businesses <ArrowRight className="size-3.5" /></Link></div>
                )}
              </div>
            </section>

            <section>
              <div><h2 className="font-display text-xl font-bold tracking-tight">Saved businesses</h2><p className="mt-1 text-xs text-muted-foreground">Businesses you want to revisit</p></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {favourites.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center sm:col-span-2">
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
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
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

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="font-display text-lg font-bold">Delivery addresses</p><p className="mt-1 text-xs text-muted-foreground">Manage where your orders arrive</p></div><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><MapPin className="size-4" /></span></div>
              <ul className="mt-5 space-y-4 text-sm">
                {addresses.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border px-4 py-5 text-center">
                    <MapPin className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">No saved addresses</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add an address to make checkout faster.</p>
                  </li>
                )}
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
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:border-primary/40 hover:bg-muted"
              >
                <Plus className="size-3.5" /> Add address
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary-soft p-5 shadow-sm sm:p-6">
              <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 blur-2xl" />
              <p className="relative font-display text-lg font-bold">Grow your business on Peniel</p>
              <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
                Create your own online storefront and make it easier for customers to discover and order from you.
              </p>
              <Link
                to="/vendor/onboarding"
                search={{ step: 1 }}
                className="relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-110"
              >
                Create a storefront <ArrowRight className="size-4" />
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
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block text-sm font-medium">
              City
              <input
                required
                name="city"
                defaultValue={state.customer.city}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block text-sm font-medium">
              Address
              <textarea
                required
                name="address"
                rows={3}
                placeholder="Street, area, landmark"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                City
                <input
                  required
                  name="city"
                  placeholder="Lagos"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="block text-sm font-medium">
                State
                <input
                  required
                  name="state"
                  placeholder="Lagos State"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Delivery instructions (optional)
              <textarea
                name="delivery_instructions"
                rows={2}
                placeholder="Gate code, floor, etc."
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
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
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10">
              <span className="text-muted-foreground">₦</span>
              <input
                required
                name="amount"
                type="number"
                min="100"
                step="100"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground/60"
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
