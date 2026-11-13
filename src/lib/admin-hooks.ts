/**
 * Hooks for fetching live admin data from the backend API with realtime updates.
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import {
  adminApi,
  type AdminAnalytics,
  type AdminCategory,
  type AdminCustomer,
  type AdminDispute,
  type AdminOrder,
  type AdminPromotion,
  type AdminPayout,
  type AdminReview,
  type AdminVendor,
  type AdminVerification,
} from "./api-client";

type LoadState<T> = { loading: boolean; data: T | null; error: string | null };

function initial<T>(): LoadState<T> {
  return { loading: true, data: null, error: null };
}

function useAdminRealtimeSubscription<T>(
  table: string,
  filter: string,
  onChange: (payload: { new: T; old: T; eventType: string }) => void,
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const channelName = `admin-${table}`;
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
  }, [table, filter, onChange]);
}

/** Live admin analytics from the backend. */
export function useAdminAnalytics() {
  const [state, setState] = useState<LoadState<AdminAnalytics>>(initial());
  useEffect(() => {
    let active = true;
    adminApi.analytics().then((result) => {
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

/** Live admin vendors with realtime updates. */
export function useAdminVendors(status?: string) {
  const [state, setState] = useState<LoadState<AdminVendor[]>>(initial());

  const applyChange = (payload: { new: AdminVendor; old: AdminVendor; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((v) => v.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((v) => v.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  const filter = status ? `status=eq.${status}` : "";
  useAdminRealtimeSubscription("vendors", filter, applyChange);

  useEffect(() => {
    let active = true;
    adminApi.vendors(status).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [status]);
  return state;
}

/** Live admin customers with realtime updates. */
export function useAdminCustomers() {
  const [state, setState] = useState<LoadState<AdminCustomer[]>>(initial());

  const applyChange = (payload: { new: AdminCustomer; old: AdminCustomer; eventType: string }) => {
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

  useAdminRealtimeSubscription("profiles", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.customers().then((result) => {
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

/** Live admin orders with realtime updates. */
export function useAdminOrders(status?: string) {
  const [state, setState] = useState<LoadState<AdminOrder[]>>(initial());

  const applyChange = (payload: { new: AdminOrder; old: AdminOrder; eventType: string }) => {
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

  const filter = status ? `status=eq.${status}` : "";
  useAdminRealtimeSubscription("orders", filter, applyChange);

  useEffect(() => {
    let active = true;
    adminApi.orders(status).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [status]);
  return state;
}

/** Live admin transactions with realtime updates. */
export function useAdminTransactions() {
  const [state, setState] = useState<LoadState<AdminTransaction[]>>(initial());

  const applyChange = (payload: {
    new: AdminTransaction;
    old: AdminTransaction;
    eventType: string;
  }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((t) => t.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((t) => t.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useAdminRealtimeSubscription("transactions", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.transactions().then((result) => {
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

/** Live admin verification applications with realtime updates. */
export function useAdminVerification(status?: string) {
  const [state, setState] = useState<LoadState<AdminVerification[]>>(initial());

  const applyChange = (payload: {
    new: AdminVerification;
    old: AdminVerification;
    eventType: string;
  }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((v) => v.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((v) => v.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  const filter = status ? `status=eq.${status}` : "";
  useAdminRealtimeSubscription("vendor_applications", filter, applyChange);

  useEffect(() => {
    let active = true;
    adminApi.verification(status).then((result) => {
      if (!active) return;
      if (result.ok) setState({ loading: false, data: result.data, error: null });
      else setState({ loading: false, data: null, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [status]);
  return state;
}

/** Live admin reviews with realtime updates. */
export function useAdminReviews() {
  const [state, setState] = useState<LoadState<AdminReview[]>>(initial());

  const applyChange = (payload: { new: AdminReview; old: AdminReview; eventType: string }) => {
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

  useAdminRealtimeSubscription("reviews", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.reviews().then((result) => {
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

/** Live admin categories with realtime updates. */
export function useAdminCategories() {
  const [state, setState] = useState<LoadState<AdminCategory[]>>(initial());

  const applyChange = (payload: { new: AdminCategory; old: AdminCategory; eventType: string }) => {
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

  useAdminRealtimeSubscription("categories", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.categories().then((result) => {
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

/** Live admin promotions with realtime updates. */
export function useAdminPromotions() {
  const [state, setState] = useState<LoadState<AdminPromotion[]>>(initial());

  const applyChange = (payload: {
    new: AdminPromotion;
    old: AdminPromotion;
    eventType: string;
  }) => {
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

  useAdminRealtimeSubscription("promo_codes", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.promotions().then((result) => {
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

/** Live admin payouts with realtime updates. */
export function useAdminPayouts() {
  const [state, setState] = useState<LoadState<AdminPayout[]>>(initial());

  const applyChange = (payload: { new: AdminPayout; old: AdminPayout; eventType: string }) => {
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

  useAdminRealtimeSubscription("payouts", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.payouts().then((result) => {
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

/** Live admin disputes with realtime updates. */
export function useAdminDisputes() {
  const [state, setState] = useState<LoadState<AdminDispute[]>>(initial());

  const applyChange = (payload: { new: AdminDispute; old: AdminDispute; eventType: string }) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const data = [...prev.data];
      if (payload.eventType === "INSERT" && payload.new) {
        data.unshift(payload.new);
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const idx = data.findIndex((d) => d.id === payload.new.id);
        if (idx >= 0) data[idx] = payload.new;
      } else if (payload.eventType === "DELETE" && payload.old) {
        const idx = data.findIndex((d) => d.id === payload.old.id);
        if (idx >= 0) data.splice(idx, 1);
      }
      return { ...prev, data };
    });
  };

  useAdminRealtimeSubscription("disputes", "", applyChange);

  useEffect(() => {
    let active = true;
    adminApi.disputes().then((result) => {
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
