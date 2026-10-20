import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, MessagesSquare, SendHorizontal, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getVendor } from "@/lib/data";
import { app, unreadFor, type ChatMsg, type Thread } from "@/lib/vendra-store";

const time = (n: number) => new Date(n).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

/** Two-pane chat used by customers and vendors. Contact details are never shown or allowed. */
export function ChatView({
  side,
  threads,
  activeId,
  onSelect,
}: {
  side: ChatMsg["from"];
  threads: Thread[];
  activeId?: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  const active = threads.find((t) => t.id === activeId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && unreadFor(active, side) > 0) app.markRead(active.id, side);
    endRef.current?.scrollIntoView({ block: "end" });
  }, [active, side]);

  const send = () => {
    if (!active || !text.trim()) return;
    const { blocked } = app.send(active.id, side, text);
    if (blocked) toast.warning("Phone numbers, emails and outside contacts are hidden to keep both sides safe.");
    setText("");
  };

  const titleOf = (t: Thread) => (side === "customer" ? (getVendor(t.vendorSlug)?.name ?? t.vendorSlug) : t.customer);

  return (
    <div className="grid grid-cols-1 h-[calc(100dvh-13rem)] min-h-[420px] overflow-hidden rounded-2xl border border-border bg-card md:h-[calc(100dvh-11rem)] md:grid-cols-[300px_minmax(0,1fr)]">
      <aside className={"min-h-0 flex-col border-r border-border " + (active ? "hidden md:flex" : "flex")}>
        <p className="border-b border-border px-4 py-3 text-sm font-bold">Conversations</p>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              No chats yet.{" "}
              {side === "customer" && (
                <Link to="/marketplace" className="font-semibold text-primary">Find a business</Link>
              )}
            </li>
          )}
          {threads.map((t) => {
            const last = t.messages[t.messages.length - 1];
            const unread = unreadFor(t, side);
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelect(t.id)}
                  className={"flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted " + (t.id === activeId ? "bg-primary-soft" : "")}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {titleOf(t).slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{titleOf(t)}</span>
                    <span className="block truncate text-xs text-muted-foreground">{last?.text ?? "Say hello 👋"}</span>
                  </span>
                  {unread > 0 && (
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">{unread}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className={"min-h-0 flex-col " + (active ? "flex" : "hidden md:flex")}>
        {!active ? (
          <div className="grid flex-1 place-items-center p-8 text-center text-muted-foreground">
            <div>
              <MessagesSquare className="mx-auto size-10 text-primary" />
              <p className="mt-3 font-display font-bold text-foreground">Pick a conversation</p>
              <p className="mt-1 text-sm">Negotiate prices, custom orders and bookings safely.</p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button aria-label="Back" onClick={() => onSelect(undefined)} className="grid size-8 place-items-center rounded-lg border border-border md:hidden">
                <ArrowLeft className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{titleOf(active)}</p>
                {side === "customer" ? (
                  <Link to="/store/$slug" params={{ slug: active.vendorSlug }} className="text-xs font-semibold text-primary">View storefront</Link>
                ) : (
                  <p className="text-xs text-muted-foreground">Customer profile · Lagos</p>
                )}
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
                <Lock className="size-3" /> Contacts private
              </span>
            </header>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4">
              <p className="mx-auto flex max-w-sm items-center justify-center gap-1.5 rounded-xl bg-card px-3 py-2 text-center text-[11px] text-muted-foreground">
                <ShieldAlert className="size-3.5 shrink-0 text-primary" /> Keep payments on Vendra Pay. Phone numbers and emails are hidden automatically.
              </p>
              {active.messages.map((m, i) => {
                const mine = m.from === side;
                return (
                  <div key={i} className={"flex " + (mine ? "justify-end" : "justify-start")}>
                    <div className={"max-w-[80%] rounded-2xl px-3.5 py-2 text-sm " + (mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card")}>
                      <p className="break-words whitespace-pre-wrap">{m.text}</p>
                      <p className="mt-0.5 text-right text-[10px] opacity-60">{time(m.at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message or make an offer…"
                className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button aria-label="Send" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" disabled={!text.trim()}>
                <SendHorizontal className="size-4" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
