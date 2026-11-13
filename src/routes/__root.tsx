import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  type ErrorComponentProps,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { CustomerBottomNav } from "../components/site/bottom-nav";
import { Toaster } from "../components/ui/sonner";
import { useApp, app } from "../lib/peniel-store";
import { authApi } from "../lib/api-client";
import "../lib/supabase";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Peniel - A multi-business platform" },
      {
        name: "description",
        content:
          "Branded storefronts, central payments and marketplace discovery for Nigerian businesses.",
      },
      { property: "og:title", content: "Peniel" },
      {
        property: "og:description",
        content: "Your business. Your storefront. Your customers. One platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Space+Grotesk:wght@500;700&family=Bebas+Neue&family=Fraunces:wght@600;800&family=Archivo+Black&family=Cormorant+Garamond:wght@500;700&family=DM+Serif+Display&family=Syne:wght@600;800&family=JetBrains+Mono:wght@500;700&family=Caveat:wght@600;700&display=swap",
      },
      { rel: "icon", href: "/p-logo.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const state = useApp();
  const navigate = useNavigate();
  const [sessionValidated, setSessionValidated] = useState(false);
  const [authenticated, setAuthenticated] = useState(!!state.user);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("peniel.onboarded")) return;
    if (
      pathname === "/onboarding" ||
      pathname === "/auth" ||
      pathname === "/verify-otp" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password"
    )
      return;
    navigate({ to: "/onboarding" });
  }, [pathname, navigate]);

  // Validate the session with the backend so the local store stays in sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let active = true;
    authApi
      .session()
      .then((result) => {
        if (!active) return;
        const authed = result.ok && result.data.authenticated === true;
        setAuthenticated(authed);
        setSessionValidated(true);
        if (authed && result.data.user) {
          app.signIn(result.data.user.name, result.data.user.email, state.user?.role ?? "customer");
        } else if (!authed && state.user) {
          void app.signOut().catch(() => {});
        }
      })
      .catch(() => {
        setSessionValidated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const protectedPrefixes = ["/account", "/checkout", "/vendor", "/admin"];
  const authPrefixes = ["/auth", "/verify-otp", "/forgot-password", "/reset-password"];
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuth = authPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (!sessionValidated) return;
    if (isProtected && !authenticated) {
      void navigate({ to: "/auth", search: { mode: "login", returnTo: pathname } });
      return;
    }
    if (isAuth && authenticated) {
      void navigate({ to: "/" });
    }
  }, [isProtected, isAuth, authenticated, sessionValidated, navigate]);

  const needsCustomerNavSpace =
    state.user?.role === "customer" &&
    !pathname.startsWith("/vendor") &&
    !pathname.startsWith("/admin") &&
    pathname !== "/auth";

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={
          needsCustomerNavSpace ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0" : ""
        }
      >
        <Outlet />
      </div>
      <CustomerBottomNav />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
