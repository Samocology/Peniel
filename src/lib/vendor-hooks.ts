/**
 * Hooks for fetching live vendor data from the backend API with realtime updates.
 * Falls back gracefully when the backend is not configured or the vendor
 * has not yet been submitted (demo/onboarding state).
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
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

function useRealtimeSubscription<T>(
  vendorId: string | null,
  table: string,
  filter: string,
  onChange: (payload: { new: T; old: T; eventType: string }) => void,
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!vendorId || typeof window === "undefined") return;

    const channelName = `vendor-${vendorId}-${table}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
        (payload) => {
          onChange({
            new: payload.new as T,
            old: payload.old as T,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [vendorId, table, filter, onChange]);
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

/** Live vendor orders from the backend with realtime updates. */
export function useVendorOrders(vendorId: string | null) {
  const [state, setState] = useState<LoadState<VendorOrderRecord[]>>(initial());

  const applyChange = (payload: {
    new: VendorOrderRecord;
    old: VendorOrderRecord;
    eventType: string;
  }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((o) => o.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((o) => o.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(vendorId, "vendor_orders", `vendor_id=eq.${vendorId}`, applyChange);

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

/** Live vendor products from the backend with realtime updates. */
export function useVendorProducts(vendorId: string | null) {
  const [state, setState] = useState<LoadState<ProductRecord[]>>(initial());

  const applyChange = (payload: { new: ProductRecord; old: ProductRecord; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((p) => p.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((p) => p.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(vendorId, "products", `vendor_id=eq.${vendorId}`, applyChange);

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

/** Live vendor reviews from the backend with realtime updates. */
export function useVendorReviews(vendorId: string | null) {
  const [state, setState] = useState<LoadState<ReviewRecord[]>>(initial());

  const applyChange = (payload: { new: ReviewRecord; old: ReviewRecord; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((r) => r.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((r) => r.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(vendorId, "reviews", `vendor_id=eq.${vendorId}`, applyChange);

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

/** Live vendor bookings from the backend with realtime updates. */
export function useVendorBookings(vendorId: string | null, status?: string) {
  const [state, setState] = useState<LoadState<BookingRecord[]>>(initial());

  const applyChange = (payload: { new: BookingRecord; old: BookingRecord; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((b) => b.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((b) => b.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  const filter = status
    ? `vendor_id=eq.${vendorId},status=eq.${status}`
    : `vendor_id=eq.${vendorId}`;
  useRealtimeSubscription(vendorId, "bookings", filter, applyChange);

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

/** Live vendor conversations from the backend with realtime updates. */
export function useVendorConversations(vendorId: string | null) {
  const [state, setState] = useState<LoadState<ConversationRecord[]>>(initial());

  const applyChange = (payload: {
    new: ConversationRecord;
    old: ConversationRecord;
    eventType: string;
  }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((c) => c.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((c) => c.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(vendorId, "conversations", `vendor_id=eq.${vendorId}`, applyChange);

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

/** Live messages for a conversation from the backend with realtime updates. */
export function useConversationMessages(conversationId: string | null) {
  const [state, setState] = useState<LoadState<MessageRecord[]>>(initial());

  const applyChange = (payload: { new: MessageRecord; old: MessageRecord; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.push(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((m) => m.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((m) => m.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(null, "messages", `conversation_id=eq.${conversationId}`, applyChange);

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

/** Live vendor promo codes from the backend with realtime updates. */
export function useVendorPromos(vendorId: string | null) {
  const [state, setState] = useState<LoadState<PromoRecord[]>>(initial());

  const applyChange = (payload: { new: PromoRecord; old: PromoRecord; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((p) => p.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((p) => p.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(vendorId, "promo_codes", `vendor_id=eq.${vendorId}`, applyChange);

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

/** Live vendor customers from the backend with realtime updates. */
export function useVendorCustomers(vendorId: string | null) {
  const [state, setState] = useState<LoadState<VendorCustomerRecord[]>>(initial());

  const applyChange = (payload: {
    new: VendorCustomerRecord;
    old: VendorCustomerRecord;
    eventType: string;
  }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((c) => c.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((c) => c.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useRealtimeSubscription(vendorId, "customers", `vendor_id=eq.${vendorId}`, applyChange);

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

/** Live in-app notifications with realtime updates. */
export function useNotifications(unreadOnly = false) {
  const [state, setState] =
    useState<LoadState<{ notifications: NotificationRecord[]; unreadCount: number }>>(initial());

  const applyChange = (payload: {
    new: NotificationRecord;
    old: NotificationRecord;
    eventType: string;
  }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data.notifications];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((n) => n.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((n) => n.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data: { notifications: data, unreadCount: prev.data.unreadCount } };
    });
  };

  useRealtimeSubscription(null, "notifications", `user_id=eq.current_user`, applyChange);

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
