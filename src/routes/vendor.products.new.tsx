import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Save,
  Store,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { useState, type FormEvent, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { app, useCurrentVendor } from "@/lib/peniel-store";
import { productsApi, storageApi } from "@/lib/api-client";

export const Route = createFileRoute("/vendor/products/new")({
  head: () => ({
    meta: [
      { title: "Add a product - Peniel business console" },
      {
        name: "description",
        content:
          "Create a product with photos, price, options, stock and delivery settings, then publish it to your storefront.",
      },
      { property: "og:title", content: "Add a product - Peniel" },
      {
        property: "og:description",
        content: "Create and publish a new item on your storefront.",
      },
    ],
  }),
  component: NewProduct,
});

const R2_PUBLIC_URL =
  import.meta.env["VITE_R2_PUBLIC_MEDIA_URL"] ??
  "https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev";

const buildR2Url = (objectKey: string | undefined): string | undefined => {
  if (!objectKey || typeof objectKey !== "string") return undefined;
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

const field =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10";

const label = "mb-1.5 block text-xs font-semibold text-foreground";

const card = "rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

type UploadedImage = {
  id: string;
  objectKey: string;
  previewUrl: string;
  file?: File;
  isMain: boolean;
};

function NewProduct() {
  const { vendor, base } = useCurrentVendor();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [group, setGroup] = useState(vendor.groups[0] ?? "General");
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const response = await fetch("/api/vendors/mine", { credentials: "same-origin" });
        const result = await response.json();
        if (result.ok && Array.isArray(result.data)) {
          const owned = result.data.find((v: { slug: string; id: string }) => v.slug === base.slug);
          if (owned?.id) setVendorId(owned.id);
        }
      } catch {
        // Ignore - vendor ID will be fetched at publish time
      }
    };
    fetchVendorId();
  }, [base.slug]);

  const itemLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "menu item"
      : vendor.type === "beauty"
        ? "service"
        : vendor.type === "hotel"
          ? "room"
          : "product";

  const catalogLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "Menu item"
      : vendor.type === "beauty"
        ? "Service"
        : vendor.type === "hotel"
          ? "Room"
          : "Product";

  const detailsPlaceholder =
    vendor.type === "beauty"
      ? "e.g. 60 min"
      : vendor.type === "hotel"
        ? "e.g. per night, sleeps 2"
        : vendor.type === "restaurant" || vendor.type === "bakery"
          ? "e.g. serves 10, 48 hours notice"
          : vendor.type === "fresh-food"
            ? "e.g. 1 kg, cleaned and packed"
            : "e.g. size, colour or warranty";

  const numericPrice = Number(price);
  const validPrice = price.trim() !== "" && Number.isFinite(numericPrice) && numericPrice > 0;
  const hasMainImage = images.some((img) => img.isMain);
  const activePreview = images.length > 0 ? images[activePreviewIndex] : undefined;
  const hasImages = images.length > 0;

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!vendorId) {
        toast.error("Vendor not loaded. Please try again.");
        return null;
      }
      const uploadResult = await storageApi.getUploadUrl({
        purpose: "product-image",
        contentType: file.type,
        filename: file.name,
        vendorId,
      });
      if (!uploadResult.ok) {
        toast.error(uploadResult.error || "Failed to get upload URL");
        return null;
      }
      if (!uploadResult.data) {
        toast.error("Failed to get upload URL");
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
    [vendorId, toast],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (images.length + files.length > MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const validFiles = Array.from(files).filter((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Unsupported format. Use JPEG, PNG, WebP, or HEIC`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: File too large (max 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);
      const newImages: UploadedImage[] = [];

      for (const file of validFiles) {
        const objectKey = await uploadImage(file);
        if (objectKey) {
          const previewUrl = URL.createObjectURL(file);
          newImages.push({
            id: crypto.randomUUID(),
            objectKey,
            previewUrl,
            file,
            isMain: images.length === 0 && newImages.length === 0,
          });
        }
      }

      setImages((prev) => [...prev, ...newImages]);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [images.length, uploadImage, toast],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("border-primary", "bg-primary/5");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary", "bg-primary/5");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("border-primary", "bg-primary/5");
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
      const remaining = prev.filter((img) => img.id !== id);
      if (image?.isMain && remaining.length > 0) {
        return remaining.map((img, idx) => ({ ...img, isMain: idx === 0 }));
      }
      return remaining;
    });
  }, []);

  const setMainImage = useCallback((id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isMain: img.id === id })));
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      if (removed) newImages.splice(toIndex, 0, removed);
      return newImages.map((img, idx) => ({ ...img, isMain: idx === 0 }));
    });
  }, []);

  const moveImage = useCallback(
    (id: string, direction: "left" | "right") => {
      const index = images.findIndex((img) => img.id === id);
      if (direction === "left" && index > 0) reorderImages(index, index - 1);
      if (direction === "right" && index < images.length - 1) reorderImages(index, index + 1);
    },
    [images, reorderImages],
  );

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [images]);

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (publishing) return;

    const productName = name.trim();

    if (!productName) {
      toast.error(`Enter a name for this ${itemLabel}`);
      return;
    }

    if (!validPrice) {
      toast.error("Enter a valid price");
      return;
    }

    if (images.length === 0) {
      toast.error("Add at least one product image");
      return;
    }

    setPublishing(true);

    try {
      const vendorResponse = await fetch("/api/vendors/mine", {
        credentials: "same-origin",
      });
      const vendorResult = await vendorResponse.json();
      if (!vendorResponse.ok || !vendorResult.ok || !Array.isArray(vendorResult.data)) {
        throw new Error(vendorResult.error ?? "Could not load your saved storefronts.");
      }
      const ownedVendor = vendorResult.data.find(
        (item: { slug: string; id: string }) => item.slug === base.slug,
      );
      if (!ownedVendor) {
        throw new Error(
          "This demo storefront is not linked to your account. Complete saved vendor onboarding first.",
        );
      }

      const mainImage = images.find((img) => img.isMain) ?? images[0]!;
      const additionalImages = images
        .filter((img) => img.id !== mainImage.id)
        .map((img) => img.objectKey);

      const productResponse = await fetch("/api/products", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vendorId: ownedVendor.id,
          name: productName,
          description: description.trim(),
          price: numericPrice,
          group: group.trim() || "General",
          published: true,
          attributes: {
            ...(details.trim() ? { meta: details.trim() } : {}),
            ...(sizes.length > 0 ? { sizes } : {}),
            ...(mainImage.objectKey ? { image_object_key: mainImage.objectKey } : {}),
            ...(additionalImages.length > 0 ? { gallery_object_keys: additionalImages } : {}),
          },
        }),
      });
      const productResult = await productResponse.json();
      if (!productResponse.ok || !productResult.ok) {
        throw new Error(productResult.error ?? "Could not save this listing.");
      }
      const savedProduct = productResult.data?.[0];
      if (
        !savedProduct ||
        typeof savedProduct.id !== "string" ||
        typeof savedProduct.name !== "string" ||
        typeof savedProduct.price_minor !== "number"
      ) {
        throw new Error(
          "The product was saved, but its response was incomplete. Refresh your catalogue before retrying.",
        );
      }

      app.addProduct({
        id: savedProduct.id,
        name: savedProduct.name,
        desc: savedProduct.description ?? "",
        group: savedProduct.group_name || group.trim() || "General",
        price: savedProduct.price_minor / 100,
        ...(details.trim() ? { meta: details.trim() } : {}),
        ...(sizes.length > 0 ? { sizes } : {}),
      });
      toast.success(`${productName} saved to your ${itemLabel} catalogue`);
      void navigate({ to: "/vendor/products" });
    } catch (error) {
      console.error("Could not save vendor product", error);
      setPublishing(false);
      toast.error(
        error instanceof Error ? error.message : "Unable to save this item. Please try again.",
      );
    }
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={`Add ${catalogLabel}`}
      subtitle={`Create a new listing for ${vendor.name}.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <>
          <Link
            to="/vendor/products"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </Link>
          <button
            type="submit"
            form="new-product"
            disabled={publishing || uploading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" />
            {publishing ? "Publishing..." : uploading ? "Uploading..." : "Publish item"}
          </button>
        </>
      }
    >
      <form
        id="new-product"
        onSubmit={publish}
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        {/* Main form */}
        <div className="min-w-0 space-y-5">
          {/* Image Gallery Section */}
          <Panel title="Product images">
            <div className="space-y-4">
              {/* Upload Zone */}
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-all ${
                  uploading ? "border-primary/30 bg-primary/5" : "border-border"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="sr-only"
                  id="product-images-upload"
                  disabled={images.length >= MAX_IMAGES}
                />
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted">
                      <ImageIcon className="size-7 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {images.length >= MAX_IMAGES
                          ? `Maximum ${MAX_IMAGES} images added`
                          : `Drag & drop or click to upload`}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {images.length}/{MAX_IMAGES} images · JPEG, PNG, WebP, HEIC · Max 5MB each
                      </p>
                    </div>
                  </div>
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <Plus className="size-3.5" />
                      Add images
                    </button>
                  )}
                </div>
              </div>

              {/* Image Gallery */}
              {hasImages && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Image gallery{" "}
                    {images.length > 1 && (
                      <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                        (First image is main, drag to reorder)
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative shrink-0 flex flex-col items-center gap-2 rounded-xl border-2 transition ${
                          image.isMain ? "border-primary bg-primary/5" : "border-border bg-card"
                        }`}
                        style={{ width: 100 }}
                      >
                        <div className="relative size-[100px] rounded-lg overflow-hidden">
                          <img
                            src={image.previewUrl}
                            alt={`${name.trim() || "Product"} image ${index + 1}`}
                            className="size-full object-cover"
                          />
                          {image.isMain && (
                            <span className="absolute left-2 top-2 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                              Main
                            </span>
                          )}
                          {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="size-5 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 w-full px-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(image.id, "left")}
                              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] font-medium text-foreground transition hover:bg-muted"
                              aria-label="Move left"
                            >
                              <ChevronLeft className="size-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setMainImage(image.id);
                              setActivePreviewIndex(index);
                            }}
                            className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition ${
                              image.isMain
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-foreground hover:bg-muted"
                            }`}
                            aria-label={image.isMain ? "Main image" : "Set as main"}
                          >
                            {image.isMain ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <span>Set main</span>
                            )}
                          </button>
                          {index < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(image.id, "right")}
                              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] font-medium text-foreground transition hover:bg-muted"
                              aria-label="Move right"
                            >
                              <ChevronRight className="size-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 text-destructive transition hover:bg-destructive/10"
                            aria-label="Remove image"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/50 px-4 py-6 transition hover:border-primary/30 hover:bg-primary/5"
                        style={{ width: 100 }}
                      >
                        <Plus className="size-6 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Add more
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Full-size Preview */}
              {activePreview && (
                <div className="relative rounded-2xl border border-border bg-background overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={activePreview.previewUrl}
                      alt={`${name.trim() || "Product"} preview`}
                      className="size-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreviewIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1,
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/90 backdrop-blur text-foreground shadow-lg transition hover:bg-background"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreviewIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/90 backdrop-blur text-foreground shadow-lg transition hover:bg-background"
                          aria-label="Next image"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActivePreviewIndex(idx)}
                              className={`size-2 rounded-full transition ${
                                idx === activePreviewIndex
                                  ? "bg-primary"
                                  : "bg-white/60 hover:bg-white"
                              }`}
                              aria-label={`View image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Item information">
            <div className="space-y-5">
              <div>
                <label htmlFor="product-name" className={label}>
                  {catalogLabel} name <span className="text-destructive">*</span>
                </label>
                <input
                  id="product-name"
                  name="name"
                  required
                  maxLength={100}
                  className={field}
                  placeholder={`Enter ${itemLabel} name`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="off"
                />
                <p className="mt-1.5 flex justify-end">
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {name.length}/100
                  </span>
                </p>
              </div>

              <div>
                <label htmlFor="product-description" className={label}>
                  Description
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  rows={5}
                  maxLength={1000}
                  className={`${field} min-h-28 resize-y`}
                  placeholder={`Describe this ${itemLabel}, including what makes it special, ingredients, materials, or key features...`}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {description.length}/1000
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Pricing & classification">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="product-price" className={label}>
                  Price (₦) <span className="text-destructive">*</span>
                </label>
                <div className="flex h-11 items-center rounded-xl border border-border bg-background px-3.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <span className="mr-2 text-sm font-semibold text-muted-foreground">₦</span>
                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="15,000"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                    inputMode="numeric"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Enter the selling price in Naira.
                </p>
              </div>

              <div>
                <label htmlFor="product-group" className={label}>
                  Category
                </label>
                <select
                  id="product-group"
                  name="group"
                  className={field}
                  value={group}
                  onChange={(event) => setGroup(event.target.value)}
                >
                  <option value="General">General</option>
                  {vendor.groups
                    .filter((item) => item !== "General")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Choose where this item belongs in your catalogue.
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className={label}>
                  Available sizes
                  <span className="ml-1.5 font-normal text-muted-foreground">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "One Size"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSizes((prev) =>
                          prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
                        )
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        sizes.includes(size)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="product-details" className={label}>
                  Additional details
                  <span className="ml-1.5 font-normal text-muted-foreground">(Optional)</span>
                </label>
                <input
                  id="product-details"
                  name="details"
                  className={field}
                  placeholder={detailsPlaceholder}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  maxLength={200}
                />
                <div className="mt-1.5 flex justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Add useful information such as size, duration, quantity or other specifications.
                  </p>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {details.length}/200
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Mobile publishing action */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to publish?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your item will be added to your storefront immediately.
              </p>
            </div>
            <button
              type="submit"
              disabled={publishing || uploading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <CheckCircle2 className="size-4" />
              {publishing ? "Publishing..." : uploading ? "Uploading..." : "Publish item"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-5 xl:sticky xl:top-5 xl:self-start">
          {/* Live Preview Card */}
          <Panel title="Live preview">
            <div className={card}>
              <div className="relative overflow-hidden rounded-xl border border-border bg-background">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {activePreview ? (
                    <img
                      src={activePreview.previewUrl}
                      alt={name.trim() || "Product preview"}
                      className="size-full object-cover transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground">
                      <Package className="size-10 opacity-50" />
                      <span className="text-[11px]">No image uploaded yet</span>
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-border bg-card/95 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur">
                    {group || "General"}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3.5 space-y-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {vendor.name}
                </p>
                <h3 className="break-words text-sm font-semibold text-foreground">
                  {name.trim() || `Your ${itemLabel} name`}
                </h3>
                <p className="line-clamp-3 min-h-10 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                  {description.trim() || "Your description will appear here."}
                </p>
                {details.trim() && <p className="text-[11px] text-muted-foreground">{details}</p>}
                <div className="pt-3 border-t border-border">
                  <p className="text-base font-bold text-primary">
                    {price.trim() && validPrice
                      ? `₦${numericPrice.toLocaleString("en-NG")}`
                      : "Set a price"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-[11px] leading-5 text-muted-foreground">
                  This is a preview of your listing. Your actual storefront appearance may vary
                  depending on its layout and theme.
                </p>
              </div>
            </div>
          </Panel>

          {/* Publishing Details */}
          <Panel title="Publishing details">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">Storefront</p>
                  <p className="mt-0.5 break-words text-xs text-muted-foreground">{vendor.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Package className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Listing status</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    New items are published immediately and visible on your storefront.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ImageIcon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Images</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {images.length}/{MAX_IMAGES} uploaded
                    {images.length > 0 && (
                      <>
                        ·{" "}
                        <span className="font-medium">{images.filter((i) => i.isMain).length}</span>{" "}
                        main image
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          {/* Checklist */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5">
            <p className="text-xs font-semibold text-foreground">Before publishing</p>
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`mt-0.5 size-3.5 shrink-0 ${name.trim() ? "text-success" : "text-muted-foreground"}`}
                />
                Clear, recognisable name {name.trim() && "✓"}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`mt-0.5 size-3.5 shrink-0 ${description.trim() ? "text-success" : "text-muted-foreground"}`}
                />
                Helpful description {description.trim() && "✓"}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`mt-0.5 size-3.5 shrink-0 ${validPrice ? "text-success" : "text-muted-foreground"}`}
                />
                Valid price set {validPrice && "✓"}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`mt-0.5 size-3.5 shrink-0 ${hasImages ? "text-success" : "text-muted-foreground"}`}
                />
                At least one image {hasImages && "✓"}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={`mt-0.5 size-3.5 shrink-0 ${hasMainImage ? "text-success" : "text-muted-foreground"}`}
                />
                Main image selected {hasMainImage && "✓"}
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </DashShell>
  );
}
