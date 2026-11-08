import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { BottomBar } from "@/components/site/bottom-nav";
import { app, unreadFor, useApp, useCurrentVendor } from "@/lib/peniel-store";
import { vendorNavFor } from "./vendor-nav";
import { toast } from "sonner";

export type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  badge?: string | undefined;
  primary?: boolean;
};

/** Shared dashboard chrome for the vendor console and platform admin. */
export function DashShell({
  nav,
  title,
  subtitle,
  kicker,
  actions,
  children,
  storeLink,
}: {
  nav: NavItem[];
  title: string;
  subtitle?: string;
  kicker: string;
  actions?: ReactNode;
  children: ReactNode;
  storeLink?: { label: string; slug: string };
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const isVendor = kicker === "Business console";
  const st = useApp();
  const { vendor: me, account } = useCurrentVendor();
  if (isVendor && storeLink) storeLink = { ...storeLink, slug: me.slug };
  const live: Record<string, number> = isVendor
    ? {
        "/vendor/orders": st.orders.filter((o) => o.status === "New").length,
        "/vendor/messages": st.threads
          .filter((t) => t.vendorSlug === me.slug)
          .reduce((a, t) => a + unreadFor(t, "vendor"), 0),
      }
    : {};
  const displayNav = (isVendor ? vendorNavFor(me) : nav).map((n) =>
    n.to in live ? { ...n, badge: live[n.to] ? String(live[n.to]) : undefined } : n,
  );
  const matchingNav = displayNav.filter((item) =>
    item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
  );
  const primaryItems = displayNav.filter(
    (n) => n.primary && (!isVendor || n.to !== "/vendor/profile"),
  );
  const primary = isVendor
    ? [...primaryItems.slice(0, 4), ...displayNav.filter((n) => n.to === "/vendor/profile")]
    : primaryItems.slice(0, 5);
  const secondary = displayNav.filter((n) => !primary.includes(n));
  const menuNav = isVendor
    ? [...secondary, ...displayNav.filter((n) => n.to === "/vendor/profile")]
    : secondary;
  const initials = isVendor ? me.monogram : "VA";
  const notifications = isVendor
    ? [
        { label: `${live["/vendor/orders"] ?? 0} new orders`, to: "/vendor/orders" },
        { label: `${live["/vendor/messages"] ?? 0} unread conversations`, to: "/vendor/messages" },
      ]
    : [
        { label: "12 verification applications waiting", to: "/admin/verification" },
        { label: "4 open disputes", to: "/admin/disputes" },
        { label: "8 payouts awaiting release", to: "/admin/payouts" },
      ];

  const signOut = async () => {
    try {
      const providerSessionRevoked = await app.signOut();
      if (!providerSessionRevoked) {
        toast.warning(
          "You’re signed out in this browser, but the provider did not confirm token revocation.",
        );
      }
      setMenu(false);
      void navigate({ to: "/auth", search: { mode: "login" } });
    } catch (error) {
      console.error("Could not sign out", error);
      toast.error("Could not sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-[1400px]">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
          <div className="flex h-16 items-center border-b border-border px-5">
            <Logo />
          </div>
          <p className="px-5 pt-5 pb-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
            {kicker}
          </p>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
            {displayNav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition " +
                    (active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted")
                  }
                >
                  <span className="shrink-0">{n.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{n.label}</span>
                  {n.badge && (
                    <span
                      className={
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                        (active ? "bg-primary-foreground/20" : "bg-gold/20 text-gold-foreground")
                      }
                    >
                      {n.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-1 border-t border-border p-3">
            {isVendor && (
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            )}
            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted"
            >
              ← Back to Peniel
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* topbar */}
          <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label="Open menu"
                  onClick={() => setMenu(true)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-border lg:hidden"
                >
                  <Menu className="size-4" />
                </button>
                <span className="min-w-0 lg:hidden">
                  <Logo />
                </span>
                <div className="relative hidden min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 md:flex">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    aria-label="Find a dashboard page"
                    value={navQuery}
                    onChange={(event) => setNavQuery(event.target.value)}
                    placeholder="Find a page…"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                  {navQuery.trim() && (
                    <ul className="absolute top-[calc(100%+0.5rem)] left-0 z-30 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lift">
                      {matchingNav.length ? (
                        matchingNav.map((item) => (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              onClick={() => setNavQuery("")}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-muted-foreground">
                          No dashboard pages found.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {storeLink && (
                  <Link
                    to="/store/$slug"
                    params={{ slug: storeLink.slug }}
                    className="hidden rounded-lg border border-border px-3 py-2 text-xs font-semibold sm:block"
                  >
                    {storeLink.label}
                  </Link>
                )}
                <button
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative grid size-9 place-items-center rounded-lg border border-border"
                >
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
                </button>
                <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </span>
              </div>
            </div>
            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute top-[calc(100%+0.5rem)] right-3 z-30 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-border bg-card p-4 shadow-lift sm:right-6"
              >
                <p className="font-display text-sm font-bold">Needs your attention</p>
                <ul className="mt-3 space-y-2">
                  {notifications.map((notification) => (
                    <li key={notification.to}>
                      <Link
                        to={notification.to}
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-primary-soft"
                      >
                        <span className="min-w-0 truncate">{notification.label}</span>
                        <span className="shrink-0 text-xs font-semibold text-primary">Open</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </header>

          {menu && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
              <button
                aria-label="Close menu"
                className="absolute inset-0 bg-foreground/40"
                onClick={() => setMenu(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-card shadow-2xl">
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                  <Logo />
                  <button
                    aria-label="Close menu"
                    onClick={() => setMenu(false)}
                    className="grid size-9 place-items-center rounded-lg border border-border"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  {isVendor
                    ? `${me.name} · ${account.plan === "starter" ? "Free plan" : account.plan + " plan"}`
                    : kicker}
                </p>
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
                  {menuNav.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setMenu(false)}
                      className={
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm " +
                        (pathname === n.to
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "text-foreground hover:bg-muted")
                      }
                    >
                      {n.icon}
                      <span className="min-w-0 flex-1 truncate">{n.label}</span>
                      {n.badge && (
                        <span className="rounded-full bg-gold/20 px-1.5 text-[10px] font-bold">
                          {n.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
                <div className="space-y-1 border-t border-border p-3">
                  {isVendor && (
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-destructive/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  )}
                  {storeLink && (
                    <Link
                      to="/store/$slug"
                      params={{ slug: storeLink.slug }}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      {storeLink.label}
                    </Link>
                  )}
                  <Link
                    to="/"
                    className="block rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                  >
                    ← Back to Peniel
                  </Link>
                </div>
              </div>
            </div>
          )}

          <main className="px-3 pt-5 pb-28 sm:px-6 sm:pt-6 lg:pb-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>

      {st.user && (
        <BottomBar
          className="lg:hidden"
          items={primary.map((n) => ({
            to: n.to,
            label: n.label,
            icon: n.icon,
            badge: n.badge ? Number(n.badge) || undefined : undefined,
            exact: n.to === "/vendor" || n.to === "/admin",
          }))}
        />
      )}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"rounded-2xl border border-border bg-card " + className}>
      {title && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-3.5">
          <h2 className="truncate font-display text-base font-bold">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {head.map((h) => (
              <th
                key={h}
                className="pb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="py-3.5 pr-4 align-middle">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
