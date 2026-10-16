import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/logo";

export type NavItem = { label: string; to: string; icon: ReactNode; badge?: string; primary?: boolean };

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
  const [menu, setMenu] = useState(false);
  const primary = nav.filter((n) => n.primary).slice(0, 4);

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
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition " +
                    (active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted")
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
          <div className="border-t border-border p-3">
            <Link to="/" className="block rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
              ← Back to Vendra
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* topbar */}
          <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button aria-label="Open menu" onClick={() => setMenu(true)} className="grid size-9 shrink-0 place-items-center rounded-lg border border-border lg:hidden">
                  <Menu className="size-4" />
                </button>
                <span className="min-w-0 lg:hidden">
                  <Logo />
                </span>
                <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 md:flex">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input placeholder="Search…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
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
                <button aria-label="Notifications" className="relative grid size-9 place-items-center rounded-lg border border-border">
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
                </button>
                <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  AK
                </span>
              </div>
            </div>
          </header>

          {menu && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
              <button aria-label="Close menu" className="absolute inset-0 bg-foreground/40" onClick={() => setMenu(false)} />
              <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-card shadow-2xl">
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                  <Logo />
                  <button aria-label="Close menu" onClick={() => setMenu(false)} className="grid size-9 place-items-center rounded-lg border border-border">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">{kicker}</p>
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
                  {nav.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setMenu(false)}
                      className={"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm " + (pathname === n.to ? "bg-primary font-semibold text-primary-foreground" : "text-foreground hover:bg-muted")}
                    >
                      {n.icon}
                      <span className="min-w-0 flex-1 truncate">{n.label}</span>
                      {n.badge && <span className="rounded-full bg-gold/20 px-1.5 text-[10px] font-bold">{n.badge}</span>}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-border p-3">
                  {storeLink && (
                    <Link to="/store/$slug" params={{ slug: storeLink.slug }} className="mb-1 block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted">
                      {storeLink.label}
                    </Link>
                  )}
                  <Link to="/" className="block rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted">← Back to Vendra</Link>
                </div>
              </div>
            </div>
          )}

          <main className="px-4 pt-6 pb-24 sm:px-6 lg:pb-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
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

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="grid grid-cols-5">
          {primary.map((n) => {
            const active = pathname === n.to;
            return (
              <li key={n.to}>
                <Link to={n.to} className={"relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold " + (active ? "text-primary" : "text-muted-foreground")}>
                  <span className={"grid h-7 w-12 place-items-center rounded-full [&_svg]:size-5 " + (active ? "bg-primary-soft" : "")}>{n.icon}</span>
                  <span className="max-w-full truncate px-1">{n.label}</span>
                  {n.badge && <span className="absolute top-1 right-[18%] rounded-full bg-gold px-1 text-[9px] font-bold text-gold-foreground">{n.badge}</span>}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={() => setMenu(true)} className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-muted-foreground">
              <span className="grid h-7 w-12 place-items-center rounded-full"><Menu className="size-5" /></span>
              More
            </button>
          </li>
        </ul>
      </nav>
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
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3.5">
          <h2 className="truncate font-display text-base font-bold">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
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
              <th key={h} className="pb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
