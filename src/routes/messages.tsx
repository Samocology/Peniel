import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/site-header";
import { ChatView } from "@/components/chat/chat-view";
import { type ChatMsg, type Thread } from "@/lib/peniel-store";
import { toast } from "sonner";
import { messagesApi } from "@/lib/api-client";

export const Route = createFileRoute("/messages")({
  validateSearch: z.object({ v: z.string().optional(), t: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Messages - Peniel" },
      {
        name: "description",
        content:
          "Chat privately with businesses on Peniel to negotiate prices, custom orders and bookings.",
      },
      { property: "og:title", content: "Messages - Peniel" },
      { property: "og:description", content: "Private in-app chat with Peniel businesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { v, t } = Route.useSearch();
  const navigate = useNavigate({ from: "/messages" });
  const [conversations, setConversations] = useState<Thread[]>([]);
  const [customerIds, setCustomerIds] = useState<Record<string, string>>({});
  const [activeMessages, setActiveMessages] = useState<Record<string, ChatMsg[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    messagesApi.conversations().then((result) => {
      if (!active) return;
      if (result.ok) {
        const threads: Thread[] = result.data.map((c) => ({
          id: c.id,
          vendorSlug: c.vendors?.slug ?? "",
          customer: c.profiles?.full_name ?? "Customer",
          messages: [],
          readC: 0,
          readV: 0,
        }));
        setConversations(threads);
        setCustomerIds(
          result.data.reduce(
            (acc, c) => ({ ...acc, [c.id]: c.customer_id }),
            {} as Record<string, string>,
          ),
        );
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (v) {
      navigate({ search: { t: v }, replace: true });
    }
  }, [v, navigate]);

  const activeThreadId = t;
  const threadsWithMessages = useMemo(
    () =>
      conversations.map((c) => ({
        ...c,
        messages: activeMessages[c.id] ?? [],
      })),
    [conversations, activeMessages],
  );
  const activeCustomerId = activeThreadId ? customerIds[activeThreadId] : "";

  useEffect(() => {
    if (activeThreadId && !activeMessages[activeThreadId]) {
      messagesApi.messages(activeThreadId).then((result) => {
        if (result.ok) {
          const msgs: ChatMsg[] = result.data.map((m) => ({
            from: m.sender_id === activeCustomerId ? "customer" : "vendor",
            text: m.body,
            at: new Date(m.created_at).getTime(),
          }));
          setActiveMessages((current) => ({ ...current, [activeThreadId]: msgs }));
        }
      });
    }
  }, [activeThreadId, activeCustomerId, activeMessages]);

  const handleSend = async (threadId: string, text: string) => {
    const result = await messagesApi.send(threadId, text);
    if (result.ok) {
      const msg: ChatMsg = {
        from: "customer",
        text,
        at: Date.now(),
      };
      setActiveMessages((current) => ({
        ...current,
        [threadId]: [...(current[threadId] ?? []), msg],
      }));
    } else {
      toast.error(result.error || "Failed to send message.");
    }
  };

  const handleMarkRead = async (threadId: string) => {
    const result = await messagesApi.markRead(threadId);
    if (!result.ok) {
      toast.error(result.error || "Failed to mark as read.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
          <h1 className="mb-3 font-display text-2xl font-bold">Messages</h1>
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Loading conversations…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <h1 className="mb-3 font-display text-2xl font-bold">Messages</h1>
        <ChatView
          side="customer"
          threads={threadsWithMessages}
          activeId={activeThreadId}
          onSelect={(id) => navigate({ search: id ? { t: id } : {} })}
          onSend={handleSend}
          onMarkRead={handleMarkRead}
        />
      </main>
    </div>
  );
}
