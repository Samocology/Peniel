import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { authApi } from "@/lib/api-client";
import { app } from "@/lib/peniel-store";

export const Route = createFileRoute("/auth/oauth/callback")({
  validateSearch: z.object({
    error: z.string().optional(),
    role: z.enum(["customer", "vendor"]).optional(),
  }),
  component: OAuthCallback,
});

function OAuthCallback() {
  const { error, role } = Route.useSearch();

  useEffect(() => {
    if (error) {
      window.location.replace(
        `/auth?mode=login${role ? `&role=${role}` : ""}&error=oauth_failed`,
      );
      return;
    }

    authApi
      .session()
      .then((result) => {
        const user = result.ok && result.data.authenticated ? result.data.user : null;
        if (user) {
          const userRole = user.role ?? "customer";
          app.signIn(user.name, user.email, userRole);
          const destination = userRole === "vendor" ? "/vendor/onboarding" : "/";
          window.location.replace(destination);
          return;
        }

        window.location.replace(
          `/auth?mode=login${role ? `&role=${role}` : ""}&error=oauth_session_missing`,
        );
      })
      .catch(() => {
        window.location.replace(
          `/auth?mode=login${role ? `&role=${role}` : ""}&error=oauth_session_check_failed`,
        );
      });
  }, [role, error]);

  return (
    <div className="min-h-dvh bg-[#F7F8F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
