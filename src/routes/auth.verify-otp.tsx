import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";

export const Route = createFileRoute("/auth/verify-otp")({
  validateSearch: z.object({
    email: z.string().email().optional(),
    returnTo: z.string().optional(),
    role: z.enum(["customer", "vendor"]).optional(),
    type: z.enum(["signup", "reset"]).optional(),
  }),
  head: () => ({
    meta: [{ title: "Verify your email - Peniel" }],
  }),
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const search = Route.useSearch();
  const emailFromSearch = search.email ?? "";
  const { returnTo, role, type } = search;
  const isSignup = type === "signup";
  const navigate = useNavigate({ from: "/auth/verify-otp" });

  const [email, setEmail] = useState(emailFromSearch);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        code,
        type: isSignup ? "signup" : "reset",
      });
      if (!result.ok) {
        setError(result.error ?? "Invalid or expired code. Please try again.");
        return;
      }

      if (isSignup) {
        toast.success("Email verified. Please sign in to continue.");
        void navigate({
          to: "/auth",
          search: { mode: "login", returnTo, role },
        });
        return;
      }

      toast.success("Code verified.");
      void navigate({
        to: "/auth/reset-password",
        search: { resetToken: result.data.resetToken, returnTo },
      });
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      const result = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      if (!result.ok) {
        setError(result.error ?? "Could not resend code. Please try again.");
        return;
      }
      toast.success("Reset code resent.");
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    }
  };

  return (
    <main className="min-h-dvh bg-[#F7F8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[410px]">
        <Link
          to="/auth"
          search={{ returnTo }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#858D84] mb-8"
        >
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#EDF3EA] mx-auto mb-4">
            <Mail className="size-6 text-[#557358]" />
          </div>
          <h2 className="font-display text-[34px] leading-[1.08] font-semibold tracking-tight text-[#203027] mb-2">
            {isSignup ? "Verify your email" : "Enter your reset code"}
          </h2>
          <p className="text-sm leading-6 text-[#777F76]">
            {isSignup ? (
              <>
                An account has been created for <strong>{email || "your email"}</strong>. A 6-digit
                verification code has been sent to your inbox. Enter it below to activate your
                account.
              </>
            ) : (
              <>
                A 6-digit code was sent to <strong>{email || "your email"}</strong>. Enter it below
                to continue.
              </>
            )}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="h-11 rounded-xl border-[#E2E7DF] bg-white text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
            />
          </div>

          <div className="grid grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <Input
                key={i}
                id={`otp-${i}`}
                name={`otp-${i}`}
                type="text"
                maxLength={1}
                autoComplete="one-time-code"
                inputMode="numeric"
                required
                value={code[i] ?? ""}
                onChange={(e) => {
                  const v = e.currentTarget.value.replace(/\D/g, "");
                  setCode((c) => c.slice(0, i) + v + c.slice(i + 1));
                  const next = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
                  if (v && next) next.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
                    (document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null)?.focus();
                  }
                }}
                className="h-11 rounded-xl border-[#E2E7DF] bg-white text-center text-[13px] font-mono shadow-none focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
              />
            ))}
            <input
              type="text"
              hidden
              tabIndex={-1}
              readOnly
              value={code}
              aria-label="Full OTP code"
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

          <div className="flex items-center justify-between mb-6">
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleResend}
              className="text-xs font-semibold text-[#294431] underline underline-offset-4 hover:bg-[#294431]/5 px-3 py-1.5"
            >
              Resend code
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || code.length < 6}
              className="group h-12 w-full rounded-xl bg-[#294331] text-[13px] font-semibold text-white shadow-none transition-all hover:bg-[#38563F] sm:h-[50px]"
            >
              {isSubmitting ? "Verifying…" : isSignup ? "Verify & activate" : "Verify code"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
