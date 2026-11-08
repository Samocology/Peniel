/**
 * Hooks for fetching live vendor data from the backend API.
 * Falls back gracefully when the backend is not configured or the vendor
 * has not yet been submitted (demo/onboarding state).
 */

import { useEffect, useState } from "react";
import {
  analyticsApi,
  bookingsApi,
  customersApi,
  messagesApi,
  notificationsApi,
  ordersApi,
  payoutsApi,
  productsApi,
  promosApi,
  reviewsApi,
  vendorsApi,
  type BookingRecord,
  type ConversationRecord,
  type LedgerEntry,
  type MessageRecord,
  type NotificationRecord,
  type OrderRecord,
  type PayoutRecord,
  type ProductRecord,
  type PromoRecord,
  type ReviewRecord,
  type VendorAnalytics,
  type VendorBalance,
  type VendorOrderRecord,
  type VendorRecord,
  type VendorCustomerRecord,
} from "./api-client";

type LoadState<T> = { loading: boolean; data: T | null; error: string | null };

function initial<T>(): LoadState<T> {
  return { loading: true, data: null, error: null };
}

/** Fetch the authenticated user's vendor records from the backend. */
export function useMyVendors() {
  const [state, setState] = useState<LoadState<VendorRecord[]>>(initial());
  useEffect(() => {
    let active = true;
    vendorsApi.mine().then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}

/** Resolve the backend vendor ID for a given slug. */
export function useVendorId(slug: string): string | null {
  const { data } = useMyVendors();
  return data?.find((v) => v.slug === slug)?.id ?? null;
}

/** Live vendor orders from the backend. */
export function useVendorOrders(vendorId: string | null) {
  const [state, setState] = useState<LoadState<VendorOrderRecord[]>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    ordersApi.vendorOrders(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live customer orders from the backend. */
export function useMyOrders() {
  const [state, setState] = useState<LoadState<OrderRecord[]>>(initial());
  useEffect(() => {
    let active = true;
    ordersApi.myOrders().then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}

/** Live vendor analytics from the backend. */
export function useVendorAnalytics(vendorId: string | null) {
  const [state, setState] = useState<LoadState<VendorAnalytics>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    analyticsApi.vendor(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live vendor ledger entries from the backend. */
export function useVendorLedger(vendorId: string | null) {
  const [state, setState] = useState<LoadState<LedgerEntry[]>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    analyticsApi.ledger(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live vendor payout balance from the backend. */
export function useVendorBalance(vendorId: string | null) {
  const [state, setState] = useState<LoadState<VendorBalance>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    payoutsApi.balance(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live vendor payout history from the backend. */
export function useVendorPayouts(vendorId: string | null) {
  const [state, setState] = useState<LoadState<PayoutRecord[]>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    payoutsApi.history(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live vendor products from the backend. */
export function useVendorProducts(vendorId: string | null) {
  const [state, setState] = useState<LoadState<ProductRecord[]>>(initial());
  const reload = () => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    productsApi.list(vendorId).then((result) => {
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
  };
  useEffect(() => {
    let active = true;
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    productsApi.list(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return { ...state, reload };
}

/** Live vendor reviews from the backend. */
export function useVendorReviews(vendorId: string | null) {
  const [state, setState] = useState<LoadState<ReviewRecord[]>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    reviewsApi.vendor(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live vendor bookings from the backend. */
export function useVendorBookings(vendorId: string | null, status?: string) {
  const [state, setState] = useState<LoadState<BookingRecord[]>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    bookingsApi.vendorBookings(vendorId, status).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId, status]);
  return state;
}

/** Live vendor conversations from the backend. */
export function useVendorConversations(vendorId: string | null) {
  const [state, setState] = useState<LoadState<ConversationRecord[]>>(initial());
  const reload = () => {
    if (!vendorId) return;
    setState((s) => ({ ...s, loading: true }));
    messagesApi.conversations(vendorId).then((result) => {
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
  };
  useEffect(() => {
    let active = true;
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    messagesApi.conversations(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return { ...state, reload };
}

/** Live messages for a conversation from the backend. */
export function useConversationMessages(conversationId: string | null) {
  const [state, setState] = useState<LoadState<MessageRecord[]>>(initial());
  const reload = () => {
    if (!conversationId) return;
    setState((s) => ({ ...s, loading: true }));
    messagesApi.messages(conversationId).then((result) => {
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
  };
  useEffect(() => {
    let active = true;
    if (!conversationId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    messagesApi.messages(conversationId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [conversationId]);
  return { ...state, reload };
}

/** Live vendor promo codes from the backend. */
export function useVendorPromos(vendorId: string | null) {
  const [state, setState] = useState<LoadState<PromoRecord[]>>(initial());
  const reload = () => {
    if (!vendorId) return;
    setState((s) => ({ ...s, loading: true }));
    promosApi.list(vendorId).then((result) => {
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
  };
  useEffect(() => {
    let active = true;
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    promosApi.list(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return { ...state, reload };
}

/** Live vendor customers from the backend. */
export function useVendorCustomers(vendorId: string | null) {
  const [state, setState] = useState<LoadState<VendorCustomerRecord[]>>(initial());
  useEffect(() => {
    if (!vendorId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let active = true;
    customersApi.vendorCustomers(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [vendorId]);
  return state;
}

/** Live in-app notifications. */
export function useNotifications(unreadOnly = false) {
  const [state, setState] =
    useState<LoadState<{ notifications: NotificationRecord[]; unreadCount: number }>>(initial());
  const reload = () => {
    setState((s) => ({ ...s, loading: true }));
    notificationsApi.list(unreadOnly).then((result) => {
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
  };
  useEffect(() => {
    let active = true;
    notificationsApi.list(unreadOnly).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [unreadOnly]);
  return { ...state, reload };
}

/** Minor units → formatted naira string. */
export function minorToNaira(minor: number): string {
  return (
    "₦" +
    (minor / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/** Map backend order status to the display label used in the UI. */
export function backendStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "Pending payment",
    payment_processing: "Processing",
    paid: "Paid",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready_for_pickup: "Ready for pickup",
    shipped: "Shipped",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    refund_requested: "Refund requested",
    refunded: "Refunded",
    failed: "Failed",
  };
  return map[status] ?? status;
}
