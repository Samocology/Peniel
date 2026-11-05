
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Globe2,
  Image as ImageIcon,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { app, useCurrentVendor } from "@/lib/peniel-store";
import { TemplatePicker } from "@/components/store/template-picker";

export const Route = createFileRoute("/vendor/settings")({
  head: () => ({
    meta: [
      { title: "Store settings - Peniel business console" },
      {
        name: "description",
        content:
          "Update your business details, branding, opening hours, delivery zones and storefront link.",
      },
      {
        property: "og:title",
        content: "Store settings - Peniel business console",
      },
      {
        property: "og:description",
        content: "Control how your storefront looks and works.",
      },
    ],
  }),
  component: VendorSettings,
});

const field =
  "w-full min-w-0 rounded-lg border border-input bg-background px-3.5 py-2.5 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground/60 hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

const label =
  "mb-1.5 block text-[11px] font-semibold tracking-wide text-foreground";

const palettes = [
  "#14532d",
  "#7c2d12",
  "#1e3a5f",
  "#c2410c",
  "#4c1d95",
];

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function SettingLabel({ children }: { children: React.ReactNode }) {
  return <span className={label}>{children}</span>;
}

function StatusToggle({
  name,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  title: string;
  description?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-foreground">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
            {description}
          </span>
        )}
      </span>

      <span className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="block h-[22px] w-10 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-[3px] top-[3px] size-4 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-[18px]" />
      </span>
    </label>
  );
}

function VendorSettings() {
  const { vendor, base, account } = useCurrentVendor();
  const p = account.profile;

  const [brandColor, setBrandColor] = useState(
    p.brandColor ?? base.theme.accent,
  );

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();

    app.saveProfile({
      name: g("name"),
      tagline: g("tagline"),
      about: g("about"),
      location: g("location"),
      hours: g("hours"),
      delivery: g("delivery"),
      deliveryFee: Number(g("deliveryFee")) || 0,
      freeAbove: Number(g("freeAbove")) || 0,
      brandColor,
      published: f.get("published") === "on",
      ...(vendor.fulfilment === "order"
        ? { acceptingOrders: f.get("acceptingOrders") === "on" }
        : { acceptingBookings: f.get("acceptingBookings") === "on" }),
      paused: f.get("paused") === "on",
    });

    toast.success("Store settings saved successfully");
  };

  const copyStoreLink = () => {
    navigator.clipboard
      .writeText(
        window.location.origin + "/store/" + base.slug,
      )
      .then(() => toast.success("Store link copied"))
      .catch(() =>
        toast.error("Could not copy the link. Please copy it from the address bar."),
      );
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Store settings"
      subtitle="Manage your business information, storefront appearance and preferences."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button
          type="submit"
          form="store-settings"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:h-10 sm:px-5 sm:text-sm"
        >
          <Check className="size-3.5" />
          Save changes
        </button>
      }
    >
      <form
        id="store-settings"
        key={base.slug}
        onSubmit={save}
        className="mx-auto w-full max-w-[1400px]"
      >
        {/* Page introduction */}
        <div className="mb-6 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Business preferences
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Changes you make here will be reflected across your storefront.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Settings workspace
            </span>
          </div>
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_310px] 2xl:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main settings */}
          <div className="min-w-0 space-y-5">
            {/* Business details */}
            <Panel title="Business information">
              <SectionHeader
                icon={Store}
                title="Your business identity"
                description="The information customers see when they visit your store."
              />

              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <SettingLabel>Business name</SettingLabel>
                  <input
                    name="name"
                    required
                    className={field}
                    defaultValue={vendor.name}
                    placeholder="Enter your business name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <SettingLabel>Tagline</SettingLabel>
                  <input
                    name="tagline"
                    className={field}
                    defaultValue={vendor.tagline}
                    placeholder="A short description of your business"
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Keep it short and memorable.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <SettingLabel>About your business</SettingLabel>
                  <textarea
                    name="about"
                    rows={4}
                    className={`${field} resize-y leading-6`}
                    defaultValue={vendor.about}
                    placeholder="Tell customers about your business, products or services..."
                  />
                </div>

                <div>
                  <SettingLabel>Phone number</SettingLabel>
                  <div className="relative">
                    <input
                      className={`${field} bg-muted/40 pr-9 text-muted-foreground`}
                      defaultValue={base.phone}
                      readOnly
                    />
                    <LockKeyhole className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Private account information.
                  </p>
                </div>

                <div>
                  <SettingLabel>Email address</SettingLabel>
                  <div className="relative">
                    <input
                      className={`${field} bg-muted/40 pr-9 text-muted-foreground`}
                      defaultValue={base.email}
                      readOnly
                    />
                    <LockKeyhole className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Your account email.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <SettingLabel>Business address / location</SettingLabel>
                  <div className="relative">
                    <input
                      name="location"
                      className={`${field} pl-9`}
                      defaultValue={vendor.location}
                      placeholder="Enter your business location"
                    />
                    <Globe2 className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Panel>

            {/* Branding */}
            <Panel title="Brand identity">
              <SectionHeader
                icon={Palette}
                title="Your storefront appearance"
                description="Keep your storefront consistent with your brand."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <SettingLabel>Business logo</SettingLabel>
                  <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
                    <div
                      className="grid size-[68px] place-items-center rounded-2xl font-display text-xl font-bold text-white shadow-md"
                      style={{ backgroundColor: brandColor }}
                    >
                      {vendor.monogram}
                    </div>

                    <span className="absolute bottom-2.5 left-2.5 rounded-md border border-border/60 bg-card/95 px-2 py-1 text-[9px] font-medium text-muted-foreground">
                      Current logo
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <SettingLabel>Store cover image</SettingLabel>
                  <div className="relative h-36 overflow-hidden rounded-xl border border-border bg-muted/30">
                    {vendor.cover ? (
                      <img
                        src={vendor.cover}
                        alt={`${vendor.name} storefront cover`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="size-6" />
                        <span className="text-[10px]">No cover image</span>
                      </div>
                    )}

                    <span className="absolute bottom-2.5 left-2.5 rounded-md border border-border/60 bg-card/95 px-2 py-1 text-[9px] font-medium text-muted-foreground">
                      Current cover
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-border/70 pt-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold">
                      Brand colour
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Choose a colour that represents your business.
                    </p>
                  </div>

                  <span className="flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
                    <span
                      className="size-4 rounded-full border border-black/10"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {brandColor}
                    </span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {palettes.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Set brand colour ${color}`}
                      aria-pressed={brandColor === color}
                      onClick={() => setBrandColor(color)}
                      className={`grid size-9 place-items-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        brandColor === color
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {brandColor === color && (
                        <Check className="size-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Storefront template */}
            <Panel title="Storefront design">
              <SectionHeader
                icon={Eye}
                title="Choose your storefront layout"
                description="Select a presentation that best suits your business."
              />
              <TemplatePicker vendor={base} />
            </Panel>

            {/* Opening hours */}
            <Panel title="Business hours">
              <SectionHeader
                icon={Store}
                title="Opening hours"
                description="Let customers know when your business is available."
              />

              <SettingLabel>Hours displayed on your storefront</SettingLabel>
              <textarea
                id="business-hours"
                name="hours"
                rows={3}
                className={`${field} resize-y leading-6`}
                defaultValue={vendor.hours}
                placeholder="e.g. Monday - Saturday, 9:00 AM - 6:00 PM"
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Customers can use this information to plan their visits or orders.
              </p>
            </Panel>

            {/* Fulfilment */}
            {vendor.fulfilment === "order" ? (
              <Panel title="Delivery and fulfilment">
                <SectionHeader
                  icon={Truck}
                  title="Delivery preferences"
                  description="Configure delivery charges and information for customers."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <SettingLabel>Delivery fee (₦)</SettingLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        ₦
                      </span>
                      <input
                        name="deliveryFee"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        className={`${field} pl-7`}
                        defaultValue={p.deliveryFee ?? 2500}
                      />
                    </div>
                  </div>

                  <div>
                    <SettingLabel>Free delivery above (₦)</SettingLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        ₦
                      </span>
                      <input
                        name="freeAbove"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        className={`${field} pl-7`}
                        defaultValue={p.freeAbove ?? 50000}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <SettingLabel>Delivery information</SettingLabel>
                    <textarea
                      id="delivery-details"
                      name="delivery"
                      rows={3}
                      className={`${field} resize-y leading-6`}
                      defaultValue={vendor.delivery}
                      placeholder="Describe your delivery areas, estimated times and other delivery information..."
                    />
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel
                title={
                  vendor.fulfilment === "reservation"
                    ? "Reservations"
                    : "Service preferences"
                }
              >
                <SectionHeader
                  icon={Truck}
                  title={
                    vendor.fulfilment === "reservation"
                      ? "Guest information"
                      : "Service area"
                  }
                  description="Provide customers with the information they need before making a booking."
                />

                <SettingLabel>
                  {vendor.fulfilment === "reservation"
                    ? "Reservation details"
                    : "In-person and home service details"}
                </SettingLabel>

                <textarea
                  id="delivery-details"
                  name="delivery"
                  rows={4}
                  className={`${field} resize-y leading-6`}
                  defaultValue={vendor.delivery}
                  placeholder="Add your booking, reservation or service information..."
                />
              </Panel>
            )}
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-5 xl:sticky xl:top-5 xl:self-start">
            {/* Storefront link */}
            <Panel title="Storefront link">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                  <Globe2 className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    Your public storefront
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Your shareable business link
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
                  peniel.com.ng/store/{base.slug}
                </span>

                <button
                  type="button"
                  onClick={copyStoreLink}
                  aria-label="Copy storefront link"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-card px-2.5 py-2 text-[10px] font-semibold text-primary shadow-sm transition hover:bg-primary hover:text-primary-foreground"
                >
                  <Copy className="size-3" />
                  Copy
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                Your Peniel storefront link is permanent and can be shared
                with customers.
              </p>

              <a
                href={`/store/${base.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary transition hover:gap-2.5"
              >
                Preview storefront
                <ExternalLink className="size-3" />
              </a>
            </Panel>

            {/* Payment information */}
            <Panel title="Payments">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                  <Wallet className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    Peniel Pay
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Integrated payment infrastructure
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.045] p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Managed by Peniel
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                  No payment gateway keys or technical configuration needed.
                </p>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                Payout estimates and bank account details are managed under
                your Finance section.
              </p>
            </Panel>

            {/* Store status */}
            <Panel title="Store availability">
              <div className="mb-3">
                <p className="text-xs font-semibold">
                  Control your storefront
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Choose how customers can interact with your business.
                </p>
              </div>

              <div className="divide-y divide-border/70">
                <StatusToggle
                  name="published"
                  title="Publish storefront"
                  description="Make your store visible to customers."
                  defaultChecked={p.published ?? true}
                />

                {vendor.fulfilment === "order" ? (
                  <StatusToggle
                    name="acceptingOrders"
                    title="Accepting orders"
                    description="Allow customers to place orders."
                    defaultChecked={p.acceptingOrders ?? true}
                  />
                ) : (
                  <StatusToggle
                    name="acceptingBookings"
                    title={
                      vendor.fulfilment === "reservation"
                        ? "Accept reservations"
                        : "Accept appointments"
                    }
                    description="Allow customers to make bookings."
                    defaultChecked={p.acceptingBookings ?? true}
                  />
                )}

                <StatusToggle
                  name="paused"
                  title="Pause store temporarily"
                  description="Temporarily stop normal store operations."
                  defaultChecked={p.paused ?? false}
                />
              </div>
            </Panel>

            {/* Security / trust */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <p className="text-xs font-semibold">
                  Your business is protected
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                Your account information and business preferences are managed
                through your Peniel business workspace.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-primary" />
                Business settings
                <span className="mx-1 text-border">·</span>
                Secure workspace
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile-friendly save area */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-5 text-muted-foreground">
            Remember to save your changes before leaving this page.
          </p>

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99] sm:w-auto"
          >
            <Check className="size-3.5" />
            Save all changes
          </button>
        </div>
      </form>
    </DashShell>
  );
}
