import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";
import { toast } from "sonner";
import { MessagesSquare, RefreshCcw } from "lucide-react";
import { DashShell } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { ChatView } from "@/components/chat/chat-view";
import { type ChatMsg, type Thread } from "@/lib/peniel-store";
import { useCurrentVendor } from "@/lib/peniel-store";
import { useVendorId, useVendorConversations, useConversationMessages } from "@/lib/vendor-hooks";
import { messagesApi, type ConversationRecord, type MessageRecord } from "@/lib/api-client";

export const Route = createFileRoute("/vendor/messages")({
  validateSearch: z.object({ t: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Customer chats - Peniel business console" },
      {
        name: "description",
        content: "Reply to customers, negotiate custom orders and confirm bookings inside Peniel.",
      },
      { property: "og:title", content: "Customer chats - Peniel business console" },
      { property: "og:description", content: "Private in-app chat with your customers." },
    ],
  }),
  component: VendorMessages,
});

function mapConversationToThread(
  conv: ConversationRecord,
  messagesByConversation: Record<string, MessageRecord[]>,
  activeId: string | null | undefined,
): Thread {
  const customerName = conv.profiles?.full_name || "Customer";
  const vendorSlug = conv.vendors?.slug || "";
  const convMessages = activeId === conv.id ? (messagesByConversation[conv.id] ?? []) : [];
  return {
    id: conv.id,
    vendorSlug,
    customer: customerName,
    messages: convMessages.map((m) => ({
      from: m.profiles?.full_name === customerName ? ("customer" as const) : ("vendor" as const),
      text: m.body,
      at: new Date(m.created_at).getTime(),
    })),
    readC: 0,
    readV: 0,
  };
}

function VendorMessages() {
  const { t } = Route.useSearch();
  const navigate = useNavigate({ from: "/vendor/messages" });
  const { vendor } = useCurrentVendor();
  const vendorId = useVendorId(vendor.slug);
  const convState = useVendorConversations(vendorId);
  const activeId: string | null = t ?? (convState.data?.length ? convState.data[0]!.id : null);
  const msgState = useConversationMessages(activeId);

  const messagesByConversation = useMemo(() => {
    const allMessages: MessageRecord[] = msgState.data ?? [];
    const map: Record<string, MessageRecord[]> = {};
    for (const m of allMessages) {
      const key = m.conversation_id;
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [msgState.data]);

  const threads: Thread[] = useMemo(() => {
    const conversations: ConversationRecord[] = convState.data ?? [];
    return conversations.map((conv) =>
      mapConversationToThread(conv, messagesByConversation, activeId),
    );
  }, [convState.data, messagesByConversation, activeId]);

  const onSend = async (threadId: string, text: string) => {
    const result = await messagesApi.send(threadId, text);
    if (!result.ok) {
      toast.error(result.error || "Failed to send message.");
      return;
    }
    void msgState.reload();
  };

  const onMarkRead = async (threadId: string) => {
    await messagesApi.markRead(threadId);
  };

  if (convState.loading) {
    return (
      <DashShell
        nav={vendorNav}
        kicker="Business console"
        title="Chats"
        subtitle="Customer contact details stay private on both sides"
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <MessagesSquare className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading chats…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (convState.error) {
    return (
      <DashShell
        nav={vendorNav}
        kicker="Business console"
        title="Chats"
        subtitle="Customer contact details stay private on both sides"
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{convState.error}</p>
          <button
            type="button"
            onClick={() => convState.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <RefreshCcw className="size-3.5" /> Retry
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Chats"
      subtitle="Customer contact details stay private on both sides"
    >
      <ChatView
        side="vendor"
        threads={threads}
        activeId={activeId ?? undefined}
        onSelect={(id) => navigate({ search: id ? { t: id } : {} })}
        onSend={onSend}
        onMarkRead={onMarkRead}
      />
    </DashShell>
  );
}
