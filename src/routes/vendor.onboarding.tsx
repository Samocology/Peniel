import { app, useCurrentVendor } from "@/lib/peniel-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { TemplatePicker } from "@/components/store/template-picker";
import { ArrowLeft, ArrowRight, Check, Copy, ImagePlus, PartyPopper, Store } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { categories, naira, type BusinessType } from "@/lib/data";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { vendorsApi, storageApi } from "@/lib/api-client";

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
      {
        name: "description",
        content:
          "Nine guided steps from business name to a live storefront link. No developer, no code, no payment setup.",
      },
      { property: "og:title", content: "Create your storefront - Peniel" },
      {
        property: "og:description",
        content: "Set up your business and get your own storefront link in minutes.",
      },
    ],
  }),
  component: Onboarding,
});

const field =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
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
  const [logoKey, setLogoKey] = useState<string | null>(null);
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: string }>>([
    { id: "1", name: "", price: "" },
    { id: "2", name: "", price: "" },
  ]);

  const [delivery, setDelivery] = useState("");
  const [hours, setHours] = useState("");
  const [prepTime, setPrepTime] = useState("Under 30 mins");
  const [fulfilmentOptions, setFulfilmentOptions] = useState("Delivery and pickup");

  const addProduct = () => {
    setProducts((prev) => [...prev, { id: Date.now().toString(), name: "", price: "" }]);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: "name" | "price", value: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const uploadImage = useCallback(
    async (file: File, purpose: "store-logo" | "store-cover"): Promise<string | null> => {
      if (!vendor) {
        toast.error("Vendor context not loaded");
        return null;
      }
      const uploadResult = await storageApi.getUploadUrl({
        purpose,
        contentType: file.type,
        filename: file.name,
        vendorId: vendor.id,
      });
      if (!uploadResult.ok || !uploadResult.data) {
        toast.error(uploadResult.error || "Failed to get upload URL");
        return null;
      }
      const { uploadUrl, objectKey } = uploadResult.data;
      const putResult = await storageApi.uploadFile(uploadUrl, file);
      if (!putResult.ok) {
        toast.error(putResult.error || "Failed to upload image");
        return null;
      }
      return objectKey;
    },
    [vendor],
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploadingLogo(true);
    try {
      const objectKey = await uploadImage(file, "store-logo");
      if (objectKey) {
        setLogoKey(objectKey);
        toast.success("Logo uploaded successfully");
      }
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploadingCover(true);
    try {
      const objectKey = await uploadImage(file, "store-cover");
      if (objectKey) {
        setCoverKey(objectKey);
        toast.success("Cover image uploaded successfully");
      }
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

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
    const validProducts = products
      .filter((p) => p.name.trim() && p.price.trim())
      .map((p) => ({
        name: p.name.trim(),
        price: Number(p.price),
      }));

    // Build fulfillment-specific data
    const fulfillmentData: Record<string, unknown> = {};
    if (businessFulfilment === "order") {
      fulfillmentData.delivery = delivery;
      fulfillmentData.fulfilment_options = fulfilmentOptions;
      fulfillmentData.prep_time = prepTime;
    } else if (businessFulfilment === "booking") {
      fulfillmentData.hours = hours;
      fulfillmentData.service_options = delivery;
    } else if (businessFulfilment === "reservation") {
      fulfillmentData.hours = hours;
      fulfillmentData.guest_info = delivery;
    }

    setSavingVendor(true);
    try {
      const response = await vendorsApi.create({
        name: businessName,
        slug: businessSlug,
        description: businessDescription,
        businessType,
        categorySlug,
        location: [city, region].filter(Boolean).join(", "),
        address,
        fulfilment: businessFulfilment,
        templateId: vendor.layout,
        layout: vendor.layout,
      });
      if (!response.ok) {
        throw new Error(response.error ?? "Could not submit your storefront for review.");
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
        products: validProducts.map((p, i) => ({
          id: `temp-${i}`,
          name: p.name,
          description: "",
          group: "General",
          price: p.price,
          stock: null,
          published: true,
          attributes: {},
        })),
        groups: [],
        delivery:
          businessFulfilment === "order"
            ? delivery
            : businessFulfilment === "booking"
              ? delivery
              : undefined,
        hours:
          businessFulfilment === "booking" || businessFulfilment === "reservation"
            ? hours
            : undefined,
        prep_time: businessFulfilment === "order" ? prepTime : undefined,
        fulfilment_options: businessFulfilment === "order" ? fulfilmentOptions : undefined,
        service_options: businessFulfilment === "booking" ? delivery : undefined,
        guest_info: businessFulfilment === "reservation" ? delivery : undefined,
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
          [
            "Fulfilment",
            [
              delivery ||
                "Delivery within Lekki, VI, Ikoyi & environs. ₦1,500 fee. Free above ₦20,000.",
              "Customer pickup",
              "Delivery and pickup",
            ],
          ],
          [
            "Preparation time",
            [prepTime || "Under 30 mins", "30-60 mins", "Same day", "48 hours notice"],
          ],
        ]
      : vendor.fulfilment === "booking"
        ? [
            ["Appointment hours", [hours || "Mon–Sat 9am–6pm, Sun closed"]],
            ["Service options", [delivery || "In-store & home service", "In-person appointments"]],
          ]
        : [
            ["Reservation hours", [hours || "Mon–Sat 9am–6pm, Sun closed"]],
            ["Guest information", [delivery || "Check-in from 2pm, checkout by 11am"]],
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
            <h1 className="mt-1 truncate font-display text-2xl font-bold sm:text-3xl">
              {steps[step - 1]}
            </h1>
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted-foreground">{pct}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is the name customers will see on your storefront.
              </p>
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
                      value
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
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
                      (i === selectedCategory
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-primary/40")
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
                <input
                  className={field}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <div>
                <span className={label}>City</span>
                <input
                  className={field}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>
              <div>
                <span className={label}>State</span>
                <input
                  className={field}
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                We use your location for discovery, delivery estimates and “popular near you”.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Logo",
                  key: "logo",
                  uploadKey: logoKey,
                  uploading: uploadingLogo,
                  onUpload: handleLogoUpload,
                  purpose: "store-logo" as const,
                },
                {
                  label: "Cover image",
                  key: "cover",
                  uploadKey: coverKey,
                  uploading: uploadingCover,
                  onUpload: handleCoverUpload,
                  purpose: "store-cover" as const,
                },
              ].map(({ label, key, uploadKey, uploading, onUpload, purpose }) => (
                <div key={key}>
                  <span className={label}>{label}</span>
                  <label className="relative h-32 sm:h-40 overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 cursor-pointer">
                    {uploadKey ? (
                      <img
                        src={`${import.meta.env.VITE_R2_PUBLIC_MEDIA_URL ?? "https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev"}/${uploadKey}`}
                        alt={`${businessName || "Business"} ${label.toLowerCase()}`}
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                        }}
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImagePlus className="size-6" />
                        <span className="text-[10px]">Click to upload {label.toLowerCase()}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onUpload}
                      disabled={uploading}
                      className="sr-only"
                      id={`${key}-upload`}
                    />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                        <span className="text-white text-sm font-medium">Uploading…</span>
                      </div>
                    )}
                  </label>
                </div>
              ))}
              <div className="sm:col-span-2">
                <span className={label}>Brand colour</span>
                <div className="flex gap-2">
                  {["#14532d", "#7c2d12", "#1e3a5f", "#c2410c", "#4c1d95"].map((c, i) => (
                    <span
                      key={c}
                      className={
                        "size-9 rounded-full " +
                        (i === 0 ? "ring-2 ring-primary ring-offset-2" : "")
                      }
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
                Pick how your storefront looks. We start you on a default that fits your category.
                On the free plan you can choose once; paid plans can switch any time.
              </p>
              <CurrentPicker />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add your first few items. You can add more any time.
              </p>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[minmax(0,1fr)_140px_40px]"
                >
                  <input
                    className={field}
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                    placeholder="Product or service name"
                  />
                  <input
                    className={field}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, "price", e.target.value)}
                    placeholder="Price (₦)"
                  />
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="flex items-center justify-center text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Add another item
              </button>
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
                Example: a {naira(vendor.products[0]?.price ?? 15000)}{" "}
                {vendor.fulfilment === "order"
                  ? "order"
                  : vendor.fulfilment === "booking"
                    ? "appointment"
                    : "reservation"}{" "}
                is charged a 2% platform fee.
              </p>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              {vendor.fulfilment === "order" && (
                <>
                  <div>
                    <span className={label}>Delivery areas & fees</span>
                    <textarea
                      className={`${field} resize-y`}
                      rows={3}
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      placeholder="e.g. Delivery within Lekki, VI, Ikoyi. ₦1,500 fee. Free above ₦20,000."
                    />
                  </div>
                  <div>
                    <span className={label}>Fulfilment options</span>
                    <div className="flex flex-wrap gap-2">
                      {["Delivery and pickup", "Customer pickup", "Delivery only"].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                        >
                          <input
                            type="radio"
                            name="fulfilmentOptions"
                            value={opt}
                            checked={fulfilmentOptions === opt}
                            onChange={() => setFulfilmentOptions(opt)}
                            className="sr-only peer"
                          />
                          <span className="peer-checked:text-primary peer-checked:font-semibold border-border text-muted-foreground transition-colors">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={label}>Preparation time</span>
                    <div className="flex flex-wrap gap-2">
                      {["Under 30 mins", "30-60 mins", "Same day", "48 hours notice"].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                        >
                          <input
                            type="radio"
                            name="prepTime"
                            value={opt}
                            checked={prepTime === opt}
                            onChange={() => setPrepTime(opt)}
                            className="sr-only peer"
                          />
                          <span className="peer-checked:text-primary peer-checked:font-semibold border-border text-muted-foreground transition-colors">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {vendor.fulfilment === "booking" && (
                <>
                  <div>
                    <span className={label}>Appointment hours</span>
                    <textarea
                      className={`${field} resize-y`}
                      rows={2}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="e.g. Mon–Sat 9am–6pm, Sun closed"
                    />
                  </div>
                  <div>
                    <span className={label}>Service options</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "In-store & home service",
                        "In-person appointments",
                        "Virtual consultations",
                      ].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                        >
                          <input
                            type="radio"
                            name="serviceOptions"
                            value={opt}
                            checked={delivery === opt}
                            onChange={() => setDelivery(opt)}
                            className="sr-only peer"
                          />
                          <span className="peer-checked:text-primary peer-checked:font-semibold border-border text-muted-foreground transition-colors">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {vendor.fulfilment === "reservation" && (
                <>
                  <div>
                    <span className={label}>Reservation hours</span>
                    <textarea
                      className={`${field} resize-y`}
                      rows={2}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="e.g. Mon–Sat 9am–6pm, Sun closed"
                    />
                  </div>
                  <div>
                    <span className={label}>Guest information</span>
                    <textarea
                      className={`${field} resize-y`}
                      rows={2}
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      placeholder="e.g. Check-in from 2pm, checkout by 11am"
                    />
                  </div>
                </>
              )}
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
                    {products.slice(0, 3).map((product, i) => (
                      <div key={product.id} className="rounded-xl bg-card p-3">
                        <div className="h-16 rounded-lg bg-muted" />
                        <p className="mt-2 text-xs font-semibold">
                          {product.name || `Product ${i + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                to="/store/$slug"
                params={{ slug: businessSlug }}
                className="mt-4 inline-block text-sm font-semibold text-primary"
              >
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
                {vendorSubmitted ? "Store published!" : "Ready to publish your store"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                {vendorSubmitted
                  ? "Your storefront is live. Customers can now visit and order from you."
                  : "Publish your storefront to make it visible to customers instantly."}
              </p>
              <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold">
                  peniel.com.ng/store/{businessSlug}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(`${window.location.origin}/store/${businessSlug}`)
                      .then(() => toast.success("Link copied"))
                  }
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"
                >
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
                    {savingVendor ? "Publishing…" : "Publish store"}
                  </button>
                )}
                {vendorSubmitted && (
                  <Link
                    to="/vendor"
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                  >
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
