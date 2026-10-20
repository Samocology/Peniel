import { Link, useRouterState } from "@tanstack/react-router";
import { CircleUserRound, Compass, House, MessagesSquare, ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";
import { unreadFor, useApp } from "@/lib/vendra-store";

export type BarItem = { to: string; label: string; icon: ReactNode; badge?: number | undefined; exact?: boolean };

/** Floating pill bottom bar shared by the customer app and the business console. */
export function BottomBar({ items, className = "md:hidden" }: { items: BarItem[]; className?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className={"fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] " + className}>
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-[1.6rem] border border-border bg-card/95 p-1.5 shadow-lift backdrop-blur-md">
        {items.map((it) => {
          const active = it.exact ? path === it.to || path === it.to + "/" : path.startsWith(it.to);
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={
                  "relative flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold transition-all duration-200 " +
                  (active ? "bg-primary text-primary-foreground" : "text-muted-foreground active:scale-95")
                }
              >
                <span className={"grid place-items-center transition-transform [&_svg]:size-5 " + (active ? "-translate-y-px" : "")}>{it.icon}</span>
                <span className="max-w-full truncate px-0.5">{it.label}</span>
                {!!it.badge && (
                  <span className="absolute top-0.5 right-[20%] grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] leading-4 font-bold text-gold-foreground ring-2 ring-card">
                    {it.badge > 9 ? "9+" : it.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Mobile bottom navigation for the customer side. */
export function CustomerBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const s = useApp();
  if (!s.user || path.startsWith("/vendor") || path.startsWith("/admin") || path === "/auth") return null;
  const cart = s.cart.reduce((a, l) => a + l.qty, 0);
  const unread = s.threads.filter((t) => t.customer === s.customer.name).reduce((a, t) => a + unreadFor(t, "customer"), 0);
  return (
    <BottomBar
      items={[
        { to: "/home", label: "Home", icon: <House />, exact: true },
        { to: "/marketplace", label: "Explore", icon: <Compass /> },
        { to: "/cart", label: "Cart", icon: <ShoppingBasket />, badge: cart },
        { to: "/messages", label: "Chats", icon: <MessagesSquare />, badge: unread },
        { to: "/account", label: "Me", icon: <CircleUserRound /> },
      ]}
    />
  );
}
