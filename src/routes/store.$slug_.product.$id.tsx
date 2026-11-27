import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getVendor, naira, type Product } from "@/lib/data";
import {
  customersApi,
  ordersApi,
  reviewsApi,
  type CustomerReview,
  type OrderRecord,
  type ReviewRecord,
} from "@/lib/api-client";
import { fetchBackendVendor } from "@/lib/backend-catalog";
import { app, mergeVendor, useApp } from "@/lib/peniel-store";
import { ItemArt, ItemLink, Price, StoreFooter, StoreTopBar } from "@/components/store/store-kit";

export const Route = createFileRoute("/store/$slug_/product/$id")({
  loader: ({ params }) => {
    const base = getVendor(params.slug);
    const vendor = base ? mergeVendor(base, app.get().accounts[base.slug]) : undefined;
    const product = vendor?.products.find((p: Product) => p.id === params.id);
    return { vendor, product };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.vendor || !loaderData.product) {
      return {
        meta: [{ title: "Item unavailable - Peniel" }, { name: "robots", content: "noindex" }],
      };
    }
    const { vendor, product } = loaderData;
    return {
      meta: [
        { title: `${product.name} - ${vendor.name}` },
        {
          name: "description",
          content: `${product.desc}. ${naira(product.price)} from ${vendor.name} on Peniel.`,
        },
        { property: "og:title", content: `${product.name} - ${vendor.name}` },
        { property: "og:description", content: product.desc },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { vendor: initialVendor, product: initialProduct } = Route.useLoaderData();
  const { slug, id } = Route.useParams();
  const [vendor, setVendor] = useState(initialVendor);
  const [product, setProduct] = useState(initialProduct);
  const [lookupDone, setLookupDone] = useState(false);
  const [sel, setSel] = useState<Record<string, number>>({});
  const [day, setDay] = useState(1);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [liveReviews, setLiveReviews] = useState<ReviewRecord[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const navigate = useNavigate();
  const appState = useApp();

  useEffect(() => {
    let active = true;
    setVendor(initialVendor);
    setProduct(initialProduct);
    setLookupDone(false);
    void fetchBackendVendor(slug)
      .then((liveVendor) => {
        if (!active || !liveVendor) return;
        const liveProduct = liveVendor.products.find((item) => item.id === id);
        if (liveProduct) {
          setVendor(liveVendor);
          setProduct(liveProduct);
        }
      })
      .catch((error) => console.error("Could not load live product", error))
      .finally(() => {
        if (active) setLookupDone(true);
      });
    return () => {
      active = false;
    };
  }, [id, initialProduct, initialVendor, slug]);

  useEffect(() => {
    if (!vendor?.id) {
      setReviewsLoading(false);
      return;
    }
    let active = true;
    setReviewsLoading(true);
    void reviewsApi
      .vendor(vendor.id)
      .then((result) => {
        if (active && result.ok)
          setLiveReviews(result.data.filter((review) => review.moderation_status === "published"));
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [vendor?.id]);

  useEffect(() => {
    let active = true;
    void Promise.all([ordersApi.myOrders(), customersApi.reviews()])
      .then(([orderResult, reviewResult]) => {
        if (!active) return;
        if (orderResult.ok) setOrders(orderResult.data);
        if (reviewResult.ok) setCustomerReviews(reviewResult.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!vendor || !product) {
    return (
      <div className="min-h-screen bg-background px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{lookupDone ? "Item unavailable" : "Loading item…"}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {lookupDone
            ? "This item is not available in a published storefront."
            : "Please wait while we load the item."}
        </p>
      </div>
    );
  }

  const t = vendor.theme;
  const isService = vendor.fulfilment !== "order";
  const account = appState.accounts[vendor.slug];
  const available =
    account?.profile.published !== false &&
    account?.profile.paused !== true &&
    (vendor.fulfilment === "order"
      ? account?.profile.acceptingOrders !== false
      : account?.profile.acceptingBookings !== false);
  const related = vendor.products.filter((p: Product) => p.id !== product.id).slice(0, 4);
  const images = product.images?.filter(Boolean) ?? [];
  const activeProductImage = images[activeImage] ?? images[0];
  const ratingAverage = liveReviews.length
    ? liveReviews.reduce((sum, review) => sum + review.rating, 0) / liveReviews.length
    : vendor.rating;
  const ratingCount = liveReviews.length || vendor.reviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: liveReviews.filter((review) => review.rating === stars).length,
  }));
  const eligibleOrders = orders.flatMap((order) =>
    order.vendor_orders
      .filter(
        (vendorOrder) =>
          vendorOrder.vendors?.slug === vendor.slug &&
          ["completed", "delivered", "fulfilled"].includes(vendorOrder.status.toLowerCase()),
      )
      .filter(
        (vendorOrder) =>
          !customerReviews.some((review) => review.vendor_order_id === vendorOrder.id),
      )
      .map((vendorOrder) => ({
        id: vendorOrder.id,
        reference: order.reference || vendorOrder.orders?.reference || "Completed order",
        date: order.created_at,
      })),
  );

  const optionGroups: [string, string[]][] =
    vendor.type === "restaurant"
      ? [
          ["Size", ["Regular", "Large (Serves 10-15)"]],
          ["Add protein", ["Grilled chicken", "Beef", "Goat meat", "None"]],
        ]
      : vendor.type === "fashion"
        ? [
            ["Size", ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14"]],
            ["Colour", ["Indigo", "Ochre", "Noir"]],
          ]
        : vendor.type === "beauty"
          ? [
              ["Specialist", ["Esther B.", "Joy N.", "Amaka T."]],
              ["Time", ["10:00", "13:00", "14:30", "16:00"]],
            ]
          : vendor.type === "hotel"
            ? [
                ["Guests", ["1 adult", "2 adults", "2 adults + child"]],
                ["Package", ["Room only", "Breakfast included", "Half board"]],
              ]
            : vendor.type === "fresh-food"
              ? [
                  ["Serves", ["4 people", "6 people", "10 people"]],
                  ["Preparation", ["Raw & cleaned", "Pre-cut", "Fully prepped"]],
                ]
              : vendor.type === "bakery"
                ? [
                    ["Size", ['6"', '8"', "Two-tier"]],
                    ["Finish", ["Buttercream", "Fondant", "Ganache"]],
                  ]
                : [
                    ["Condition", ["Brand new", "UK used"]],
                    ["Warranty", ["12 months", "24 months (+₦25,000)"]],
                  ];

  const add = () => {
    if (!available) {
      toast.error(`${vendor.name} is not currently accepting ${isService ? "bookings" : "orders"}`);
      return;
    }
    const meta =
      optionGroups.map(([label, options]) => options[sel[label] ?? 0]).join(" · ") +
      (isService ? ` · ${["Fri 23", "Sat 24", "Sun 25", "Mon 26", "Tue 27"][day]}` : "");
    app.addToCart({
      vendor: vendor.name,
      vendorSlug: vendor.slug,
      item: product.name,
      meta,
      qty,
      price: product.price,
      productId: product.id,
    });
    toast.success(`${product.name} added to cart`, {
      action: { label: "View cart", onClick: () => navigate({ to: "/cart" }) },
    });
  };

  const submitReview = async () => {
    if (!vendor.id || !reviewOrderId || reviewBody.trim().length < 8) {
      setReviewError("Choose a completed order and write at least 8 characters.");
      return;
    }
    setReviewLoading(true);
    setReviewError("");
    const result = await reviewsApi.submit({
      vendorOrderId: reviewOrderId,
      vendorId: vendor.id,
      rating: reviewRating,
      body: reviewBody.trim(),
    });
    setReviewLoading(false);
    if (!result.ok) {
      setReviewError(result.error || "Your review could not be submitted. Please try again.");
      return;
    }
    setReviewSuccess(true);
    setReviewBody("");
    setCustomerReviews((current) => [
      ...current,
      {
        id: `pending-${reviewOrderId}`,
        rating: reviewRating,
        body: reviewBody.trim(),
        moderation_status: "pending",
        created_at: new Date().toISOString(),
        vendor_order_id: reviewOrderId,
        vendor_id: vendor.id!,
      },
    ]);
    toast.success("Thank you. Your review has been submitted for moderation.");
  };

  return (
    <div className="min-h-screen" style={{ background: t.bg, color: t.ink }}>
      <StoreTopBar vendor={vendor} />
      <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/store/$slug"
            params={{ slug: vendor.slug }}
            className="inline-flex items-center gap-2 text-sm font-medium opacity-65 transition hover:opacity-100"
          >
            <ChevronLeft className="size-4" /> Back to {vendor.name}
          </Link>
          <span className="hidden text-xs tracking-[0.16em] uppercase opacity-45 sm:block">
            Product details
          </span>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)] lg:gap-14 xl:gap-20">
          <div className="min-w-0 lg:sticky lg:top-6">
            <div
              className="overflow-hidden border"
              style={{
                borderColor: t.line,
                borderRadius: `calc(${t.radius} + 8px)`,
                background: t.soft,
              }}
            >
              <ItemArt
                vendor={vendor}
                seed={3}
                image={activeProductImage}
                className="aspect-[1/1] w-full sm:aspect-[1.08/1] lg:aspect-[1/1] xl:aspect-[1.08/1]"
                label={product.name}
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-3">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    className="overflow-hidden border-2 transition"
                    style={{
                      borderColor: activeImage === index ? t.accent : t.line,
                      borderRadius: t.radius,
                    }}
                  >
                    <ItemArt
                      vendor={vendor}
                      seed={index}
                      image={image}
                      className="aspect-square w-full"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-5 hidden grid-cols-3 gap-3 lg:grid">
              {[
                [ShieldCheck, "Secure checkout", "Protected payments"],
                [Truck, "Delivery options", vendor.delivery || "See checkout for details"],
                [
                  CheckCircle2,
                  "Trusted storefront",
                  vendor.verified ? "Verified on Peniel" : "Seller information available",
                ],
              ].map(([Icon, title, detail], index) => {
                const I = Icon as typeof ShieldCheck;
                return (
                  <div
                    key={index}
                    className="border p-4"
                    style={{ borderColor: t.line, borderRadius: t.radius }}
                  >
                    <I className="size-5" style={{ color: t.accent }} />
                    <p className="mt-3 text-xs font-semibold">{title as string}</p>
                    <p className="mt-1 text-[11px] leading-5 opacity-60">{detail as string}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <section className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-55">
                {product.group || vendor.categoryLabel}
              </span>
              {vendor.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{ background: t.soft }}
                >
                  <CheckCircle2 className="size-3" style={{ color: t.accent }} /> Verified seller
                </span>
              )}
            </div>
            <h1
              className="mt-3 max-w-2xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-4xl xl:text-[2.75rem]"
              style={{ fontFamily: t.heading }}
            >
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Star className="size-4" style={{ color: t.accent, fill: t.accent }} />
                {ratingAverage.toFixed(1)}
              </span>
              <span className="opacity-55">
                {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
              </span>
              <span className="opacity-35">•</span>
              <a
                href="#customer-reviews"
                className="font-medium underline underline-offset-4 opacity-70 hover:opacity-100"
              >
                Read customer feedback
              </a>
            </div>
            <div
              className="mt-6 flex flex-wrap items-end gap-3 border-b pb-6"
              style={{ borderColor: t.line }}
            >
              <p
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: t.accent }}
              >
                {naira(product.price)}
              </p>
              {product.meta && <span className="pb-1 text-xs opacity-55">{product.meta}</span>}
            </div>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 opacity-70">
              {product.desc || "Contact the store for more information about this item."}
            </p>

            <div className="mt-8 space-y-6">
              {optionGroups.map(([label, options]) => (
                <div key={label}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase opacity-65">
                      {label}
                    </p>
                    <span className="text-xs opacity-45">{options[sel[label] ?? 0]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, index) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => setSel((current) => ({ ...current, [label]: index }))}
                        className="border px-4 py-2.5 text-xs font-medium transition"
                        style={
                          index === (sel[label] ?? 0)
                            ? {
                                background: t.accent,
                                color: t.accentInk,
                                borderColor: t.accent,
                                borderRadius: t.radius,
                              }
                            : { borderColor: t.line, borderRadius: t.radius }
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {isService && (
                <div
                  className="border p-4 sm:p-5"
                  style={{ borderColor: t.line, borderRadius: t.radius }}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="size-4" style={{ color: t.accent }} /> Choose a date
                  </p>
                  <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    {["Fri 23", "Sat 24", "Sun 25", "Mon 26", "Tue 27"].map((date, index) => (
                      <button
                        type="button"
                        onClick={() => setDay(index)}
                        key={date}
                        className="shrink-0 border px-4 py-2.5 text-xs font-medium"
                        style={
                          index === day
                            ? {
                                background: t.accent,
                                color: t.accentInk,
                                borderColor: t.accent,
                                borderRadius: t.radius,
                              }
                            : { borderColor: t.line, borderRadius: t.radius }
                        }
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.12em] uppercase opacity-65">
                  Special request{" "}
                  <span className="font-normal normal-case tracking-normal opacity-60">
                    (optional)
                  </span>
                </p>
                <textarea
                  rows={3}
                  placeholder="Add a note for the seller…"
                  className="w-full resize-y border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  style={{
                    borderColor: t.line,
                    borderRadius: t.radius,
                    background: t.soft,
                    color: t.ink,
                  }}
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div
                className="flex w-fit items-center gap-4 border px-3 py-2.5"
                style={{ borderColor: t.line, borderRadius: t.radius }}
              >
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="grid size-7 place-items-center"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-5 text-center text-sm font-semibold tabular-nums">{qty}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQty(qty + 1)}
                  className="grid size-7 place-items-center"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                onClick={add}
                disabled={!available}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold transition hover:brightness-95 active:scale-[.99] disabled:cursor-not-allowed"
                style={{
                  background: t.accent,
                  color: t.accentInk,
                  borderRadius: t.radius,
                  opacity: available ? 1 : 0.5,
                }}
              >
                {available
                  ? `${isService ? "Add booking to cart" : "Add to cart"} · ${naira(product.price * qty)}`
                  : "Currently unavailable"}
                <ChevronRight className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] opacity-50 sm:text-left">
              Secure checkout · Your order is managed through Peniel
            </p>
          </section>
        </div>

        <section
          id="customer-reviews"
          className="mt-16 scroll-mt-8 border-t pt-10 sm:mt-24 sm:pt-14"
          style={{ borderColor: t.line }}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-50">
                Customer voices
              </p>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ fontFamily: t.heading }}
              >
                Reviews & experiences
              </h2>
              <p className="mt-2 text-sm opacity-60">
                Feedback from customers who have shopped with {vendor.name}.
              </p>
            </div>
            <div
              className="inline-flex items-center gap-2 self-start border px-3 py-2 text-xs"
              style={{ borderColor: t.line, borderRadius: t.radius }}
            >
              <MessageCircle className="size-4" style={{ color: t.accent }} /> Store reviews
            </div>
          </div>
          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(250px,.72fr)_minmax(0,1.5fr)]">
            <div
              className="border p-5 sm:p-6"
              style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}
            >
              <p className="text-5xl font-semibold tracking-tight tabular-nums">
                {ratingAverage.toFixed(1)}
                <span className="ml-1 text-lg opacity-45">/ 5</span>
              </p>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="size-4"
                    style={{
                      color: t.accent,
                      fill: star <= Math.round(ratingAverage) ? t.accent : "transparent",
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs opacity-55">
                Based on {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
              </p>
              <div className="mt-6 space-y-2.5">
                {ratingDistribution.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-3 opacity-65">{stars}</span>
                    <Star className="size-3" style={{ color: t.accent, fill: t.accent }} />
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full"
                      style={{ background: t.line }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${liveReviews.length ? (count / liveReviews.length) * 100 : 0}%`,
                          background: t.accent,
                        }}
                      />
                    </div>
                    <span className="w-5 text-right tabular-nums opacity-55">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {reviewsLoading ? (
                <div
                  className="border p-8 text-center text-sm opacity-60"
                  style={{ borderColor: t.line, borderRadius: t.radius }}
                >
                  Loading customer reviews…
                </div>
              ) : liveReviews.length ? (
                liveReviews.map((review) => (
                  <article
                    key={review.id}
                    className="border p-5 sm:p-6"
                    style={{ borderColor: t.line, borderRadius: t.radius }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {review.profiles?.full_name || "Peniel customer"}
                        </p>
                        <p className="mt-1 text-xs opacity-50">
                          {new Date(review.created_at).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="size-3.5"
                            style={{
                              color: t.accent,
                              fill: star <= review.rating ? t.accent : "transparent",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 opacity-75">{review.body}</p>
                  </article>
                ))
              ) : (
                <div
                  className="border p-8 sm:p-10"
                  style={{ borderColor: t.line, borderRadius: t.radius }}
                >
                  <div className="mx-auto max-w-md text-center">
                    <div
                      className="mx-auto grid size-12 place-items-center rounded-full"
                      style={{ background: t.soft }}
                    >
                      <MessageCircle className="size-5" style={{ color: t.accent }} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">
                      Be the first to share your experience
                    </h3>
                    <p className="mt-2 text-sm leading-6 opacity-60">
                      There are no published written reviews for this store yet. If you have
                      completed an order, your feedback can help other customers shop with
                      confidence.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            className="mt-8 border p-5 sm:p-7"
            style={{ borderColor: t.line, borderRadius: t.radius }}
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <h3 className="text-lg font-semibold">Share your experience</h3>
                <p className="mt-1 text-sm opacity-60">
                  Reviews are available to customers with a completed order from this store.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-medium opacity-60">
                <ShieldCheck className="size-4" /> Verified purchase
              </span>
            </div>
            {reviewSuccess ? (
              <div
                className="mt-5 flex items-start gap-3 rounded-md p-4 text-sm"
                style={{ background: t.soft }}
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" style={{ color: t.accent }} />
                <div>
                  <p className="font-semibold">Review submitted</p>
                  <p className="mt-1 opacity-65">
                    Thanks for taking the time. Your review will appear once it has passed
                    moderation.
                  </p>
                </div>
              </div>
            ) : eligibleOrders.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(200px,.7fr)_minmax(0,1.3fr)]">
                <div>
                  <label className="mb-2 block text-xs font-semibold" htmlFor="review-order">
                    Completed order
                  </label>
                  <select
                    id="review-order"
                    value={reviewOrderId}
                    onChange={(event) => setReviewOrderId(event.target.value)}
                    className="w-full border px-3 py-3 text-sm outline-none"
                    style={{
                      borderColor: t.line,
                      borderRadius: t.radius,
                      background: t.bg,
                      color: t.ink,
                    }}
                  >
                    <option value="">Select an order</option>
                    {eligibleOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.reference} · {new Date(order.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold">Your rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className="size-6"
                            style={{
                              color: t.accent,
                              fill: star <= reviewRating ? t.accent : "transparent",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold" htmlFor="review-body">
                    Your review
                  </label>
                  <textarea
                    id="review-body"
                    rows={4}
                    maxLength={1500}
                    value={reviewBody}
                    onChange={(event) => setReviewBody(event.target.value)}
                    placeholder="What did you think about your experience?"
                    className="w-full resize-y border px-4 py-3 text-sm outline-none"
                    style={{
                      borderColor: t.line,
                      borderRadius: t.radius,
                      background: t.bg,
                      color: t.ink,
                    }}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] opacity-50">
                      {reviewBody.length}/1500 characters
                    </span>
                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={reviewLoading || !reviewOrderId || reviewBody.trim().length < 8}
                      className="px-5 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                      style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}
                    >
                      {reviewLoading ? "Submitting…" : "Submit review"}
                    </button>
                  </div>
                </div>
                {reviewError && <p className="text-xs text-red-600 md:col-span-2">{reviewError}</p>}
              </div>
            ) : (
              <div
                className="mt-5 border p-4 text-sm leading-6 opacity-65"
                style={{ borderColor: t.line, borderRadius: t.radius }}
              >
                To keep feedback trustworthy, only customers with a completed order can submit a
                review. Sign in with the account used for your purchase, and this section will show
                eligible orders when available.
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section
            className="mt-16 border-t pt-10 sm:mt-20 sm:pt-14"
            style={{ borderColor: t.line }}
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-50">
                  Continue exploring
                </p>
                <h2
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{ fontFamily: t.heading }}
                >
                  More from {vendor.name}
                </h2>
              </div>
              <Link
                to="/store/$slug"
                params={{ slug: vendor.slug }}
                className="hidden items-center gap-1 text-xs font-semibold sm:inline-flex"
              >
                View store <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((relatedProduct: Product, index: number) => (
                <ItemLink
                  key={relatedProduct.id}
                  vendor={vendor}
                  product={relatedProduct}
                  className="group min-w-0 overflow-hidden border p-2.5 transition hover:-translate-y-0.5 sm:p-3"
                  style={{ borderColor: t.line, borderRadius: t.radius }}
                >
                  <div className="overflow-hidden" style={{ borderRadius: t.radius }}>
                    <ItemArt
                      vendor={vendor}
                      seed={index + 2}
                      image={relatedProduct.images?.[0]}
                      className="aspect-[1/1] w-full transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold">{relatedProduct.name}</p>
                  <Price value={relatedProduct.price} vendor={vendor} />
                </ItemLink>
              ))}
            </div>
          </section>
        )}
      </main>
      <StoreFooter vendor={vendor} />
    </div>
  );
}
