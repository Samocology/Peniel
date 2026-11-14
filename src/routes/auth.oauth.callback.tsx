import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api-client";

export const Route = createFileRoute("/auth/oauth/callback")({
  validateSearch: z.object({
    error: z.string().optional(),
    role: z.enum(["customer", "vendor"]).optional(),
  }),
  component: OAuthCallback,
});

function OAuthCallback() {
  const { error, role } = Route.useSearch();
  const navigate = useNavigate({ from: "/auth/oauth/callback" });

  useEffect(() => {
    if (error) {
      void navigate({ to: "/auth", search: { mode: "login", error: "oauth_failed" } });
      return;
    }

    // Check session to get user role, then redirect
    authApi
      .session()
      .then((result) => {
        if (result.ok && result.data.authenticated && result.data.user) {
          const userRole = role ?? "customer";
          const destination = userRole === "vendor" ? "/vendor/onboarding" : "/";
          void navigate({ to: destination, replace: true });
        } else {
          // Fallback to role from URL param
          const destination = role === "vendor" ? "/vendor/onboarding" : "/";
          void navigate({ to: destination, replace: true });
        }
      })
      .catch(() => {
        const destination = role === "vendor" ? "/vendor/onboarding" : "/";
        void navigate({ to: destination, replace: true });
      });
  }, [navigate, role, error]);

  return (
    <div className="min-h-dvh bg-[#F7F8F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

import { z } from "zod";
