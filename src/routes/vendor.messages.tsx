import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { DashShell } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { ChatView } from "@/components/chat/chat-view";
import { useApp } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/messages")({
  validateSearch: z.object({ t: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Customer chats - Peniel business console" },
      { name: "description", content: "Reply to customers, negotiate custom orders and confirm bookings inside Peniel." },
      { property: "og:title", content: "Customer chats - Peniel business console" },
      { property: "og:description", content: "Private in-app chat with your customers." },
    ],
  }),
  component: VendorMessages,
});

function VendorMessages() {
  const { t } = Route.useSearch();
  const navigate = useNavigate({ from: "/vendor/messages" });
  const s = useApp();
  const mine = s.threads.filter((x) => x.vendorSlug === s.vendorSlug);
  return (
    <DashShell nav={vendorNav} kicker="Business console" title="Chats" subtitle="Customer contact details stay private on both sides">
      <ChatView side="vendor" threads={mine} activeId={t} onSelect={(id) => navigate({ search: id ? { t: id } : {} })} />
    </DashShell>
  );
}
