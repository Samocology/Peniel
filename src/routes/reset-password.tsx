import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: z.object({
    resetToken: z.string().optional(),
    returnTo: z.string().optional(),
  }),
  head: () => ({
    meta: [{ title: "Reset your password - Peniel" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { resetToken, returnTo } = Route.useSearch();
  const navigate = useNavigate({ from: "/reset-password" });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!resetToken) {
      setError("No reset token found. Please start over.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.resetPasswordWithToken({
        resetToken,
        password,
      });
      if (!result.ok) {
        setError(result.error ?? "Could not reset the password. Please try again.");
        return;
      }
      toast.success("Password reset successfully.");
      const destination = returnTo ?? "/";
      void navigate({ to: destination, search: { mode: "login" } });
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#F7F8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[410px]">
        <Link
          to="/auth"
          search={{ returnTo }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#858D84] mb-6"
        >
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>

        <div className="mb-7 sm:mb-8">
          <h2 className="font-display text-[34px] leading-[1.08] font-semibold tracking-tight text-[#203027] sm:text-[42px] mb-1">
            Reset your password
          </h2>
          <p className="text-sm leading-6 text-[#777F76]">Enter your new password below.</p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
            >
              New password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9AA399]" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                className="h-11 rounded-xl border-[#E2E7DF] bg-white pl-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#969F95] transition-colors hover:text-[#294431]"
              >
                {showPassword ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
            >
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              className="h-11 rounded-xl border-[#E2E7DF] bg-white pl-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || password.length < 8 || password !== confirmPassword}
            className="group h-12 w-full rounded-xl bg-[#294331] text-[13px] font-semibold text-white shadow-none transition-all hover:bg-[#38563F] sm:h-[50px]"
          >
            {isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
