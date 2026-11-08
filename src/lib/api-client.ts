/**
 * Peniel API client — typed fetch wrappers for all backend endpoints.
 * All requests are same-origin with credentials included.
 * Never exposes tokens; auth is handled via HttpOnly cookies.
 */

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      credentials: "same-origin",
      ...init,
      headers: {
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
    const result = (await response.json()) as { ok?: boolean; data?: T; error?: string };
    if (!response.ok || !result.ok) {
      return { ok: false, error: result.error ?? "Request failed." };
    }
    return { ok: true, data: result.data as T };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

function get<T>(path: string) {
  return apiFetch<T>(path);
}

function post<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
}

function patch<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

function del<T>(path: string) {
  return apiFetch<T>(path, { method: "DELETE" });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type VendorRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  business_type: string;
  location: string;
  phone: string | null;
  whatsapp_number: string | null;
  fulfilment: "order" | "booking" | "reservation";
  status: string;
  categories: { slug: string; name: string } | null;
};

export type ProductRecord = {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  group_name: string;
  price_minor: number;
  stock_quantity: number | null;
  published: boolean;
  attributes: Record<string, unknown>;
  created_at: string;
};

export type VendorOrderRecord = {
  id: string;
  order_id: string;
  status: string;
  subtotal_minor: number;
  delivery_minor: number;
  commission_minor: number;
  vendor_net_minor: number;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_snapshot: { name: string; description: string; group: string };
    quantity: number;
    unit_price_minor: number;
    line_total_minor: number;
  }[];
  orders: {
    reference: string;
    status: string;
    delivery_snapshot: Record<string, string>;
    customer_snapshot: Record<string, string>;
    created_at: string;
  };
  vendors: { name: string; slug: string } | null;
};

export type LedgerEntry = {
  id: string;
  entry_type: "sale" | "commission" | "refund" | "payout" | "adjustment";
  amount_minor: number;
  currency: string;
  source_reference: string;
  created_at: string;
};

export type VendorAnalytics = {
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalOrders: number;
};

export type VendorBalance = {
  grossMinor: number;
  deductionsMinor: number;
  netEarnedMinor: number;
  paidOutMinor: number;
  pendingPayoutMinor: number;
  availableMinor: number;
  currency: string;
};

export type PayoutRecord = {
  id: string;
  amount_minor: number;
  currency: string;
  status: string;
  bank_name: string;
  account_last4: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
};

export type ReviewRecord = {
  id: string;
  rating: number;
  body: string;
  moderation_status: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

export type BookingRecord = {
  id: string;
  vendor_id: string;
  service_id: string | null;
  start_at: string;
  end_at: string;
  status: string;
  notes: string;
  customer_snapshot: Record<string, string>;
  created_at: string;
};

export type ConversationRecord = {
  id: string;
  vendor_id: string;
  customer_id: string;
  created_at: string;
  vendors: { name: string; slug: string } | null;
  profiles: { full_name: string } | null;
};

export type MessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  profiles: { full_name: string } | null;
};

export type PromoRecord = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_minor: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

export type NotificationRecord = {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type VendorCustomerRecord = {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  orders: {
    customer_snapshot: Record<string, string>;
    reference: string;
  };
};

export type OrderRecord = {
  id: string;
  reference: string;
  status: string;
  currency: string;
  subtotal_minor: number;
  delivery_minor: number;
  discount_minor: number;
  platform_fee_minor: number;
  total_minor: number;
  created_at: string;
  vendor_orders: VendorOrderRecord[];
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  session: () =>
    get<{ authenticated: boolean; user: { id: string; email: string; name: string } | null }>(
      "/api/auth/session",
    ),
  signup: (body: { name: string; email: string; password: string; intentRole: string }) =>
    post<{ authenticated: boolean; user: { id: string; email: string; name: string } | null }>(
      "/api/auth/signup",
      body,
    ),
  login: (body: { email: string; password: string }) =>
    post<{ authenticated: boolean; user: { id: string; email: string; name: string } | null }>(
      "/api/auth/login",
      body,
    ),
  logout: () => post<{ signedOut: boolean }>("/api/auth/logout", {}),
  resetPassword: (email: string) =>
    post<{ accepted: boolean }>("/api/auth/password/reset", { email }),
};

// ── Vendors ───────────────────────────────────────────────────────────────────

export const vendorsApi = {
  public: (params?: { q?: string; location?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.location) searchParams.set("location", params.location);
    const qs = searchParams.toString();
    return get<VendorRecord[]>(`/api/vendors${qs ? "?" + qs : ""}`);
  },
  mine: () => get<VendorRecord[]>("/api/vendors/mine"),
  create: (body: {
    name: string;
    slug: string;
    description: string;
    businessType: string;
    categorySlug: string;
    location: string;
    address: string;
    fulfilment: string;
    templateId: string;
    layout: string;
  }) => post<{ vendorId: string; status: string }>("/api/vendors", body),
  updateProfile: (
    vendorId: string,
    body: Partial<{
      name: string;
      description: string;
      location: string;
      address: string;
      phone: string;
      whatsappNumber: string;
    }>,
  ) => patch<VendorRecord[]>(`/api/vendor/profile?vendor_id=${vendorId}`, body),
  updateStorefront: (
    vendorId: string,
    body: Partial<{
      templateId: string;
      layout: string;
      theme: Record<string, string>;
      openingHours: Record<string, string>;
      deliverySettings: Record<string, unknown>;
      seo: Record<string, string>;
      publish: boolean;
    }>,
  ) => patch<unknown[]>(`/api/vendor/storefront?vendor_id=${vendorId}`, body),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (vendorId: string) => get<ProductRecord[]>(`/api/products?vendor_id=${vendorId}`),
  create: (body: {
    vendorId: string;
    name: string;
    description: string;
    group: string;
    price: number;
    stockQuantity?: number | null;
    published?: boolean;
    attributes?: Record<string, unknown>;
  }) => post<ProductRecord[]>("/api/products", body),
  update: (
    productId: string,
    body: Partial<{
      name: string;
      description: string;
      group: string;
      price: number;
      stockQuantity: number | null;
      published: boolean;
      attributes: Record<string, unknown>;
    }>,
  ) => patch<ProductRecord[]>(`/api/vendor/products/${productId}`, body),
  archive: (productId: string) => del<{ archived: boolean }>(`/api/vendor/products/${productId}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  // Customer orders
  myOrders: () => get<OrderRecord[]>("/api/orders"),
  // Vendor orders
  vendorOrders: (vendorId: string, limit = 50) =>
    get<VendorOrderRecord[]>(`/api/vendor/orders?vendor_id=${vendorId}&limit=${limit}`),
  updateStatus: (orderId: string, status: string) =>
    patch<VendorOrderRecord[]>(`/api/vendor/orders/${orderId}/status`, { status }),
};

// ── Analytics & Ledger ────────────────────────────────────────────────────────

export const analyticsApi = {
  vendor: (vendorId: string) => get<VendorAnalytics>(`/api/vendor/analytics?vendor_id=${vendorId}`),
  ledger: (vendorId: string, limit = 100) =>
    get<LedgerEntry[]>(`/api/vendor/ledger?vendor_id=${vendorId}&limit=${limit}`),
};

// ── Payouts ───────────────────────────────────────────────────────────────────

export const payoutsApi = {
  balance: (vendorId: string) =>
    get<VendorBalance>(`/api/vendor/payouts/balance?vendor_id=${vendorId}`),
  history: (vendorId: string) => get<PayoutRecord[]>(`/api/vendor/payouts?vendor_id=${vendorId}`),
  request: (body: {
    vendorId: string;
    amountMinor: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    idempotencyKey: string;
  }) => post<PayoutRecord>("/api/vendor/payouts", body),
};

// ── Reviews ───────────────────────────────────────────────────────────────────

export const reviewsApi = {
  vendor: (vendorId: string) => get<ReviewRecord[]>(`/api/vendor/reviews?vendor_id=${vendorId}`),
  submit: (body: { vendorOrderId: string; vendorId: string; rating: number; body: string }) =>
    post<ReviewRecord[]>("/api/vendor/reviews", body),
};

// ── Bookings ──────────────────────────────────────────────────────────────────

export const bookingsApi = {
  myBookings: (status?: string) =>
    get<BookingRecord[]>(`/api/bookings${status ? `?status=${status}` : ""}`),
  vendorBookings: (vendorId: string, status?: string) =>
    get<BookingRecord[]>(
      `/api/vendor/bookings?vendor_id=${vendorId}${status ? `&status=${status}` : ""}`,
    ),
  availability: (vendorId: string, date: string) =>
    get<BookingRecord[]>(`/api/vendor/availability?vendor_id=${vendorId}&date=${date}`),
  create: (body: {
    vendorId: string;
    serviceId?: string;
    startAt: string;
    endAt: string;
    notes?: string;
    customerName?: string;
    customerPhone?: string;
  }) => post<{ booking_id: string; status: string }>("/api/bookings", body),
  updateStatus: (bookingId: string, status: string) =>
    patch<BookingRecord[]>(`/api/bookings/${bookingId}/status`, { status }),
};

// ── Messages ───────────────────────────────────────────────────────────────────

export const messagesApi = {
  conversations: (vendorId?: string) =>
    get<ConversationRecord[]>(
      vendorId
        ? `/api/messages/conversations?vendor_id=${vendorId}`
        : `/api/messages/conversations`,
    ),
  messages: (conversationId: string) =>
    get<MessageRecord[]>(`/api/messages/conversations/${conversationId}/messages`),
  send: (conversationId: string, body: string) =>
    post<MessageRecord>(`/api/messages/conversations/${conversationId}/messages`, { body }),
  markRead: (conversationId: string) =>
    patch<{ markedRead: boolean }>(`/api/messages/conversations/${conversationId}/read`, {}),
};

// ── Promos ────────────────────────────────────────────────────────────────────

export const promosApi = {
  list: (vendorId: string) => get<PromoRecord[]>(`/api/vendor/promos?vendor_id=${vendorId}`),
  create: (body: {
    vendorId: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxUses?: number;
    expiresAt?: string;
    minOrderMinor?: number;
  }) => post<PromoRecord[]>("/api/vendor/promos", body),
  update: (
    promoId: string,
    body: Partial<{ active: boolean; maxUses: number; expiresAt: string }>,
  ) => patch<PromoRecord[]>(`/api/vendor/promos/${promoId}`, body),
  validate: (body: { code: string; vendorId?: string; subtotalMinor: number }) =>
    post<{
      promoId: string;
      code: string;
      discountType: string;
      discountValue: number;
      discountMinor: number;
      description: string;
    }>("/api/promos/validate", body),
};

// ── Customers ─────────────────────────────────────────────────────────────────

export const customersApi = {
  vendorCustomers: (vendorId: string) =>
    get<
      {
        id: string;
        order_id: string;
        status: string;
        created_at: string;
        orders: { customer_snapshot: Record<string, string>; reference: string };
      }[]
    >(`/api/vendor/customers?vendor_id=${vendorId}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (unreadOnly = false) =>
    get<{ notifications: NotificationRecord[]; unreadCount: number }>(
      `/api/notifications${unreadOnly ? "?unread=true" : ""}`,
    ),
  markRead: (id: string) => patch<{ read: boolean }>(`/api/notifications/${id}/read`, {}),
  markAllRead: () => patch<{ markedAll: boolean }>("/api/notifications/read-all", {}),
};

// ── Storage ───────────────────────────────────────────────────────────────────

export const storageApi = {
  getUploadUrl: (body: {
    purpose:
      | "product-image"
      | "store-logo"
      | "store-cover"
      | "store-banner"
      | "verification-doc"
      | "message-attachment";
    contentType: string;
    filename: string;
    vendorId?: string;
  }) =>
    post<{
      uploadUrl: string;
      objectKey: string;
      publicUrl: string | null;
      expiresInSeconds: number;
      maxBytes: number;
      contentType: string;
    }>("/api/storage/upload-url", body),

  /** Upload a file directly to R2 using a presigned URL. */
  uploadFile: async (uploadUrl: string, file: File): Promise<{ ok: boolean; error?: string }> => {
    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      return response.ok ? { ok: true } : { ok: false, error: `Upload failed: ${response.status}` };
    } catch {
      return { ok: false, error: "Upload failed. Check your connection." };
    }
  },
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  vendors: (status?: string) =>
    get<AdminVendor[]>(`/api/admin/vendors${status ? `?status=${status}` : ""}`),
  setVendorStatus: (vendorId: string, status: string, note?: string) =>
    patch<AdminVendor[]>(`/api/admin/vendors/${vendorId}/status`, { status, note }),
  customers: () => get<AdminCustomer[]>("/api/admin/customers"),
  orders: (status?: string) =>
    get<AdminOrder[]>(`/api/admin/orders${status ? `?status=${status}` : ""}`),
  transactions: () => get<AdminTransaction[]>("/api/admin/transactions"),
  verification: (status?: string) =>
    get<AdminVerification[]>(
      `/api/admin/verification${status ? `?status=${status}` : ""}`,
    ),
  reviewVerification: (appId: string, decision: "approved" | "rejected", note?: string) =>
    patch<AdminVerification[]>(`/api/admin/verification/${appId}`, { decision, note }),
  reviews: () => get<AdminReview[]>("/api/admin/reviews"),
  moderateReview: (reviewId: string, status: "published" | "hidden" | "pending") =>
    patch<AdminReview[]>(`/api/admin/reviews/${reviewId}`, { status }),
  categories: () => get<AdminCategory[]>("/api/admin/categories"),
  analytics: () =>
    get<AdminAnalytics>("/api/admin/analytics"),
  settings: () => get<AdminSetting[]>("/api/admin/settings"),
  updateSetting: (key: string, value: unknown) =>
    patch<AdminSetting[]>(`/api/admin/settings/${key}`, { value }),
  disputes: (status?: string) =>
    get<AdminDispute[]>(`/api/admin/disputes${status ? `?status=${status}` : ""}`),
  updateDispute: (disputeId: string, status: "open" | "investigating" | "resolved" | "closed") =>
    patch<AdminDispute[]>(`/api/admin/disputes/${disputeId}`, { status }),
  promotions: () => get<AdminPromotion[]>("/api/admin/promotions"),
  payouts: (status?: string) =>
    get<AdminPayout[]>(`/api/admin/payouts${status ? `?status=${status}` : ""}`),
  updatePayout: (payoutId: string, status: "processing" | "completed" | "failed") =>
    patch<AdminPayout[]>(`/api/admin/payouts/${payoutId}`, { status }),
};

// ── Receipts ──────────────────────────────────────────────────────────────────

// ── Admin types ──────────────────────────────────────────────────────────────

export type AdminVendor = {
  id: string;
  slug: string;
  name: string;
  business_type: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
};

export type AdminCustomer = {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  suspended_at: string | null;
  created_at: string;
};

export type AdminOrder = {
  id: string;
  reference: string;
  status: string;
  currency: string;
  total_minor: number;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

export type AdminTransaction = {
  id: string;
  reference: string;
  provider_transaction_id: string | null;
  amount_minor: number;
  currency: string;
  status: string;
  verified_at: string | null;
  created_at: string;
};

export type AdminVerification = {
  id: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  vendors: { id: string; slug: string; name: string; business_type: string } | null;
  profiles: { full_name: string | null } | null;
};

export type AdminReview = {
  id: string;
  rating: number;
  body: string;
  moderation_status: string;
  created_at: string;
  vendors: { name: string } | null;
  profiles: { full_name: string | null } | null;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  sort_order: number;
};

export type AdminAnalytics = {
  totalVendors: number;
  activeVendors: number;
  totalCustomers: number;
  totalOrders: number;
  completedOrders: number;
  gmvMinor: number;
};

export type AdminSetting = {
  key: string;
  value: unknown;
  updated_at: string;
};

export type AdminDispute = {
  id: string;
  status: string;
  subject: string;
  body: string;
  created_at: string;
  resolved_at: string | null;
  vendors: { name: string; slug: string } | null;
};

export type AdminPromotion = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  vendors: { name: string; slug: string } | null;
};

export type AdminPayout = {
  id: string;
  vendor_id: string;
  amount_minor: number;
  currency: string;
  status: string;
  bank_name: string;
  account_last4: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  vendors?: { name: string; slug: string } | null;
};

export const receiptsApi = {
  /** Returns a URL to open/download the PDF receipt for a paid order. */
  url: (orderReference: string) => `/api/receipts/${orderReference}`,
};
