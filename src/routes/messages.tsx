import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/site-header";
import { ChatView } from "@/components/chat/chat-view";
import { app, useApp } from "@/lib/peniel-store";

export const Route = createFileRoute("/messages")({
  validateSearch: z.object({ v: z.string().optional(), t: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Messages - Peniel" },
      { name: "description", content: "Chat privately with businesses on Peniel to negotiate prices, custom orders and bookings." },
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
  const s = useApp();

  useEffect(() => {
    if (v) navigate({ search: { t: app.openThread(v) }, replace: true });
  }, [v, navigate]);

  const mine = s.threads.filter((x) => x.customer === s.customer.name);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <h1 className="mb-3 font-display text-2xl font-bold">Messages</h1>
        <ChatView side="customer" threads={mine} activeId={t} onSelect={(id) => navigate({ search: id ? { t: id } : {} })} />
      </main>
    </div>
  );
}
