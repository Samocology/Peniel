import { app, useCurrentVendor } from "@/lib/peniel-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { TemplatePicker } from "@/components/store/template-picker";
import { ArrowLeft, ArrowRight, Check, Copy, ImagePlus, PartyPopper, Store } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { categories, naira, type BusinessType } from "@/lib/data";
import { toast } from "sonner";
import { useState } from "react";

const steps = [
  "Business name",
  "Business category",
  "Location",
  "Branding",
  "Storefront design",
  "Products or services",
  "Pricing",
  "Delivery & booking",
  "Preview storefront",
  "Publish",
];

export const Route = createFileRoute("/vendor/onboarding")({
  validateSearch: z.object({ step: z.number().int().min(1).max(10).default(1) }),
  head: () => ({
    meta: [
      { title: "Create your storefront - Peniel onboarding" },
      { name: "description", content: "Nine guided steps from business name to a live storefront link. No developer, no code, no payment setup." },
      { property: "og:title", content: "Create your storefront - Peniel" },
      { property: "og:description", content: "Set up your business and get your own storefront link in minutes." },
    ],
  }),
  component: Onboarding,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";
const categoryTypes: Record<string, BusinessType> = {
  restaurants: "restaurant",
  bars: "restaurant",
  grocery: "fresh-food",
  "fresh-food": "fresh-food",
  fashion: "fashion",
  beauty: "beauty",
  salons: "beauty",
  bakeries: "bakery",
  electronics: "electronics",
  gifts: "fashion",
  hotels: "hotel",
  "home-services": "beauty",
  events: "hotel",
};

function Onboarding() {
  const { step } = Route.useSearch();
  const { vendor } = useCurrentVendor();
  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("restaurant");
  const [businessFulfilment, setBusinessFulfilment] = useState<typeof vendor.fulfilment>("order");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [savingVendor, setSavingVendor] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);
  const pct = Math.round((step / steps.length) * 100);
  const selectedCategory = categories.findIndex((category) => category.slug === categorySlug);
  const submitVendor = async () => {
    if (savingVendor || vendorSubmitted) return;
    if (
      businessName.trim().length < 2 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(businessSlug) ||
      !categorySlug ||
      address.trim().length < 5 ||
      !city.trim() ||
      !region.trim()
    ) {
      toast.error("Complete your business name, URL, category and location before submitting.");
      return;
    }
    setSavingVendor(true);
    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          slug: businessSlug,
          description: businessDescription,
          businessType,
          categorySlug,
          location: [city, region].filter(Boolean).join(", "),
          address,
          fulfilment: businessFulfilment,
          layout: vendor.layout,
          templateId: vendor.layout,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Could not submit your storefront for review.");
      }
      const selectedCategoryInfo = categories.find((item) => item.slug === categorySlug);
      app.addCustomVendor({
        ...vendor,
        slug: businessSlug,
        name: businessName.trim(),
        tagline: businessDescription.trim(),
        about: businessDescription.trim(),
        type: businessType,
        categorySlug,
        categoryLabel: selectedCategoryInfo?.name ?? categorySlug,
        fulfilment: businessFulfilment,
        location: [city.trim(), region.trim()].join(", "),
        phone: "",
        email: "",
        verified: false,
        featured: false,
        rating: 0,
        reviews: 0,
        orders: "New on Peniel",
        products: [],
        groups: [],
      });
      setVendorSubmitted(true);
      toast.success("Storefront submitted for review.");
    } catch (error) {
      console.error("Could not save vendor onboarding", error);
      toast.error(error instanceof Error ? error.message : "Could not save your storefront.");
    } finally {
      setSavingVendor(false);
    }
  };
  const setupChoices =
    vendor.fulfilment === "order"
      ? [
          ["Fulfilment", [vendor.delivery, "Customer pickup", "Delivery and pickup"]],
          ["Preparation time", ["Under 30 mins", "30-60 mins", "Same day", "48 hours notice"]],
        ]
      : vendor.fulfilment === "booking"
        ? [
            ["Appointment hours", [vendor.hours]],
            ["Service options", [vendor.delivery, "In-person appointments"]],
          ]
        : [
            ["Reservation hours", [vendor.hours]],
            ["Guest information", [vendor.delivery, "Check-in details"]],
          ];

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Logo />
          <Link to="/" className="text-xs font-semibold text-muted-foreground">
            Save & exit
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              Step {step} of {steps.length}
            </p>
            <h1 className="mt-1 truncate font-display text-2xl font-bold sm:text-3xl">{steps[step - 1]}</h1>
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted-foreground">{pct}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">This is the name customers will see on your storefront.</p>
              <div>
                <span className={label}>Business name</span>
                <input
                  className={field}
                  value={businessName}
                  maxLength={120}
                  onChange={(event) => {
                    const value = event.target.value;
                    setBusinessName(value);
                    setBusinessSlug(
                      value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                    );
                  }}
                />
              </div>
              <div>
                <span className={label}>Storefront link</span>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
                  <span className="truncate text-muted-foreground">peniel.com.ng/store/</span>
                  <input
                    className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
                    aria-label="Storefront URL"
                    value={businessSlug}
                    maxLength={80}
                    onChange={(event) =>
                      setBusinessSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                  />
                  <Check className="size-4 shrink-0 text-success" />
                </div>
                <p className="mt-1.5 text-xs text-success">This link is available</p>
              </div>
              <div>
                <span className={label}>One-line description</span>
                <input
                  className={field}
                  value={businessDescription}
                  maxLength={4000}
                  onChange={(event) => setBusinessDescription(event.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-muted-foreground">
                Your category decides which tools you get - menus, variants, appointments or rooms.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c, i) => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      setCategorySlug(c.slug);
                      setBusinessType(categoryTypes[c.slug] ?? "restaurant");
                      setBusinessFulfilment(
                        c.slug === "hotels" || c.slug === "events"
                          ? "reservation"
                          : c.slug === "beauty" || c.slug === "salons" || c.slug === "home-services"
                            ? "booking"
                            : "order",
                      );
                    }}
                    className={
                      "rounded-xl border p-4 text-left transition " +
                      (i === selectedCategory ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40")
                    }
                    type="button"
                  >
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>Street address</span>
                <input className={field} value={address} onChange={(event) => setAddress(event.target.value)} />
              </div>
              <div>
                <span className={label}>City</span>
                <input className={field} value={city} onChange={(event) => setCity(event.target.value)} />
              </div>
              <div>
                <span className={label}>State</span>
                <input className={field} value={region} onChange={(event) => setRegion(event.target.value)} />
              </div>
              <div className="sm:col-span-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                We use your location for discovery, delivery estimates and “popular near you”.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {["Logo", "Cover image"].map((t) => (
                <div key={t}>
                  <span className={label}>{t}</span>
                  <div className="grid h-40 place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-center">
                    <div>
                      <ImagePlus className="mx-auto size-6 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">Upload {t.toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="sm:col-span-2">
                <span className={label}>Brand colour</span>
                <div className="flex gap-2">
                  {["#14532d", "#7c2d12", "#1e3a5f", "#c2410c", "#4c1d95"].map((c, i) => (
                    <span
                      key={c}
                      className={"size-9 rounded-full " + (i === 0 ? "ring-2 ring-primary ring-offset-2" : "")}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pick how your storefront looks. We start you on a default that fits your category. On the free plan you
                can choose once; paid plans can switch any time.
              </p>
              <CurrentPicker />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Add your first few items. You can add more any time.</p>
              {vendor.products.slice(0, 2).map((product) => (
                <div key={product.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <input className={field} defaultValue={product.name} />
                  <input className={field} defaultValue={String(product.price)} />
                </div>
              ))}
              <Link to="/vendor/products/new" className="inline-block rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-primary">
                + Add another item
              </Link>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-4 text-sm">
                <p className="font-semibold">Payments are handled securely by Peniel</p>
                <p className="mt-1 text-muted-foreground">
                  No API keys, no gateway setup. Peniel collects on your behalf and pays you out.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={label}>Currency</span>
                  <input className={field} defaultValue="Nigerian Naira (₦)" />
                </div>
                <div>
                  <span className={label}>Platform fee</span>
                  <input className={field} defaultValue="2% per transaction" readOnly />
                </div>
                <div>
                  <span className={label}>Payout account</span>
                  <input className={field} defaultValue="Not connected in this demo" readOnly />
                </div>
                <div>
                  <span className={label}>Payout schedule</span>
                  <input className={field} defaultValue="Not scheduled in this demo" readOnly />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Example: a {naira(vendor.products[0]?.price ?? 15000)} {vendor.fulfilment === "order" ? "order" : vendor.fulfilment === "booking" ? "appointment" : "reservation"} is charged a 2% platform fee.
              </p>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              {setupChoices.map(([l, opts]) => (
                <div key={l as string}>
                  <span className={label}>{l as string}</span>
                  <div className="flex flex-wrap gap-2">
                    {(opts as string[]).map((o, i) => (
                      <span
                        key={o}
                        className={
                          "rounded-full border px-4 py-2 text-sm " +
                          (i === 0 ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted-foreground")
                        }
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 9 && (
            <div>
              <p className="text-sm text-muted-foreground">This is what your customers will see.</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
                  <Store className="size-3.5" /> peniel.com.ng/store/{businessSlug}
                </div>
                <div className="bg-primary-soft p-6">
                  <div className="h-28 rounded-xl bg-primary/20" />
                  <p className="mt-4 font-display text-xl font-bold">{businessName}</p>
                  <p className="text-sm text-muted-foreground">{businessDescription}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-xl bg-card p-3">
                        <div className="h-16 rounded-lg bg-muted" />
                        <p className="mt-2 text-xs font-semibold">{vendor.products[i]?.name ?? "Listing"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Link to="/store/$slug" params={{ slug: businessSlug }} className="mt-4 inline-block text-sm font-semibold text-primary">
                Open full preview →
              </Link>
            </div>
          )}

          {step === 10 && (
            <div className="text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/12">
                <PartyPopper className="size-7 text-success" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">
                {vendorSubmitted ? "Store submitted for review" : "Ready to submit your store"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                {vendorSubmitted
                  ? "Your storefront is saved as pending review. Customers will be able to visit it after approval."
                  : "Submit your storefront for review before it becomes visible to customers."}
              </p>
              <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold">peniel.com.ng/store/{businessSlug}</span>
                <button type="button" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/store/${businessSlug}`).then(() => toast.success("Link copied"))} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                  <Copy className="size-3.5" /> Copy
                </button>
              </div>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                {!vendorSubmitted && (
                  <button
                    type="button"
                    onClick={() => void submitVendor()}
                    disabled={savingVendor}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {savingVendor ? "Submitting…" : "Submit for review"}
                  </button>
                )}
                {vendorSubmitted && (
                  <Link to="/vendor" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
                    Go to dashboard
                  </Link>
                )}
                <Link
                  to="/vendor/onboarding"
                  search={{ step: 9 }}
                  className="rounded-xl border border-border px-6 py-3 text-sm font-semibold"
                >
                  Preview storefront
                </Link>
              </div>
            </div>
          )}
        </div>

        {step < 10 && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              to="/vendor/onboarding"
              search={{ step: Math.max(1, step - 1) }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>
            <Link
              to="/vendor/onboarding"
              search={{ step: step + 1 }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Continue <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CurrentPicker() {
  const { base } = useCurrentVendor();
  return <TemplatePicker vendor={base} />;
}
