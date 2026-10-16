import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home, Receipt, ShoppingBag, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Explore", icon: Compass },
  { to: "/cart", label: "Cart", icon: ShoppingBag, badge: "4" },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/account", label: "Me", icon: User },
] as const;

/** Mobile bottom navigation for the customer side. */
export function CustomerBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/vendor") || path.startsWith("/admin")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const I = it.icon;
          return (
            <li key={it.to}>
              <Link to={it.to} className={"relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold " + (active ? "text-primary" : "text-muted-foreground")}>
                <span className={"grid h-7 w-12 place-items-center rounded-full transition " + (active ? "bg-primary-soft" : "")}>
                  <I className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                {it.label}
                {"badge" in it && (
                  <span className="absolute top-1 right-[22%] grid size-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-gold-foreground">{it.badge}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
