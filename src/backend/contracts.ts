export type AccountRole = "customer" | "vendor" | "admin" | "super_admin";
export type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type OrderStatus =
  | "pending_payment"
  | "payment_processing"
  | "paid"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded"
  | "failed";

export type PublicProfile = {
  id: string;
  role: AccountRole;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

export type VendorBusiness = {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  businessType: string;
  address: string;
  location: string;
  phone: string | null;
  whatsappNumber: string | null;
  verificationStatus: VerificationStatus;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Storefront = {
  id: string;
  vendorId: string;
  templateId: string;
  layout: string;
  theme: Record<string, string>;
  logoObjectKey: string | null;
  coverObjectKey: string | null;
  openingHours: Record<string, string>;
  deliverySettings: Record<string, unknown>;
  seo: Record<string, string>;
  publishedAt: string | null;
};

export type CatalogProduct = {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  categoryId: string | null;
  priceMinor: number;
  compareAtPriceMinor: number | null;
  currency: "NGN";
  sku: string | null;
  stockQuantity: number | null;
  published: boolean;
  archivedAt: string | null;
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type OrderRequestLine = {
  productId: string;
  quantity: number;
  variantId?: string;
  addonIds?: string[];
};

export type CheckoutRequest = {
  idempotencyKey: string;
  lines: OrderRequestLine[];
  addressId?: string;
  deliveryInstructions?: string;
  promoCode?: string;
};

export type CheckoutResult = {
  orderId: string;
  orderReference: string;
  amountMinor: number;
  currency: "NGN";
  paymentUrl: string;
};

export type PaymentState =
  "initialized" | "pending" | "successful" | "failed" | "refunded" | "partially_refunded";

export type LedgerEntry = {
  id: string;
  vendorId: string;
  orderId: string;
  type: "sale" | "commission" | "refund" | "payout" | "adjustment";
  amountMinor: number;
  currency: "NGN";
  sourceReference: string;
  createdAt: string;
};
