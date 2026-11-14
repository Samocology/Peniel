import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";

export const Route = createFileRoute("/verify-otp")({
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
  const otpLength = isSignup ? 8 : 6;

  const navigate = useNavigate({ from: "/verify-otp" });

  const [email, setEmail] = useState(emailFromSearch);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.replace(/\D/g, "");

    if (normalizedCode.length !== otpLength) {
      setError(`Please enter the complete ${otpLength}-digit code.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authApi.verifyOtp({
        email: normalizedEmail,
        code: normalizedCode,
        type: isSignup ? "signup" : "reset",
      });

      if (!result.ok) {
        setError(result.error ?? "Invalid or expired code. Please try again.");
        return;
      }

      if (isSignup) {
        if (role === "vendor") {
          void navigate({ to: "/vendor/onboarding", search: { returnTo } });
        } else {
          toast.success("Email verified. Please sign in to continue.");

          void navigate({
            to: "/auth",
            search: { mode: "login", returnTo, role },
          });
        }

        return;
      }

      toast.success("Code verified.");

      void navigate({
        to: "/reset-password",
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
      const normalizedEmail = email.trim().toLowerCase();

      if (isSignup) {
        const result = await authApi.resendSignupOtp({
          email: normalizedEmail,
        });

        if (!result.ok) {
          setError(result.error ?? "Could not resend verification code. Please try again.");
          return;
        }

        setCode("");
        toast.success("Verification code resent.");
        return;
      }

      const result = await authApi.forgotPassword({
        email: normalizedEmail,
      });

      if (!result.ok) {
        setError(result.error ?? "Could not resend reset code. Please try again.");
        return;
      }

      setCode("");
      toast.success("Password reset code resent.");
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setCode((current) => {
      const next = current.split("");
      next[index] = digit;
      return next.join("").slice(0, otpLength);
    });

    if (digit && index < otpLength - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;

      nextInput?.focus();
    }
  };

  const handleCodePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpLength);

    setCode(pastedCode);

    const nextIndex = Math.min(pastedCode.length, otpLength - 1);

    const nextInput = document.getElementById(`otp-${nextIndex}`) as HTMLInputElement | null;

    nextInput?.focus();
  };

  return (
    <main className="min-h-dvh bg-[#F7F8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[410px]">
        <Link
          to="/auth"
          search={{ returnTo }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#858D84] mb-8"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
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
                An account has been created for <strong>{email || "your email"}</strong>. An{" "}
                {otpLength}-digit verification code has been sent to your inbox. Enter it below to
                activate your account.
              </>
            ) : (
              <>
                An {otpLength}-digit code was sent to <strong>{email || "your email"}</strong>.
                Enter it below to continue.
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

          <div className={`grid ${isSignup ? "grid-cols-8" : "grid-cols-6"} gap-1.5 sm:gap-2`}>
            {Array.from({ length: otpLength }, (_, i) => (
              <Input
                key={i}
                id={`otp-${i}`}
                name={`otp-${i}`}
                type="text"
                maxLength={1}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                inputMode="numeric"
                required
                value={code[i] ?? ""}
                onChange={(e) => handleCodeChange(i, e.currentTarget.value)}
                onPaste={handleCodePaste}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
                    const previousInput = document.getElementById(
                      `otp-${i - 1}`,
                    ) as HTMLInputElement | null;

                    previousInput?.focus();
                  }
                }}
                className="h-11 min-w-0 rounded-xl border-[#E2E7DF] bg-white px-1 text-center text-sm font-mono shadow-none focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
              />
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || code.length !== otpLength}
              className="h-12 w-full rounded-xl bg-[#294331] text-[13px] font-semibold text-white shadow-none transition-all hover:bg-[#38563F] sm:h-[50px]"
            >
              {isSubmitting ? "Verifying..." : isSignup ? "Verify & activate" : "Verify code"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                onClick={handleResend}
                className="text-xs font-semibold text-[#294431] underline underline-offset-4 hover:bg-[#294431]/5 px-3 py-1.5"
              >
                Resend code
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
