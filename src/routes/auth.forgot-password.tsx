import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, LockKeyhole, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";

export const Route = createFileRoute("/auth/forgot-password")({
  validateSearch: z.object({
    returnTo: z.string().optional(),
  }),
  head: () => ({
    meta: [{ title: "Forgot your password? - Peniel" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate({ from: "/auth/forgot-password" });

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      if (!result.ok) {
        setError(result.error ?? "Could not send reset code. Please try again.");
        return;
      }
      setCodeSent(true);
      toast.success("Reset code sent to your email.");
    } catch {
      setError("The authentication service is unavailable. Please try again.");
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
        {!codeSent ? (
          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9AA399]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  className="h-11 rounded-xl border-[#E2E7DF] bg-white pl-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
                />
              </div>
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
              disabled={isSubmitting || !email}
              className="group h-12 w-full rounded-xl bg-[#294331] text-[13px] font-semibold text-white shadow-none transition-all hover:bg-[#38563F] sm:h-[50px]"
            >
              {isSubmitting ? "Sending…" : "Send reset code"}
            </Button>

            <p className="text-center text-[10px] leading-5 text-[#777F76]">
              A 6-digit code will be sent to your inbox. It expires in 10 minutes.
            </p>

            <p className="mt-3 text-center">
              <Link
                to="/auth"
                search={{ returnTo }}
                className="text-xs font-semibold text-[#294431] underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EDF3EA] mx-auto mb-4">
              <CheckCircle2 className="size-6 text-[#557358]" />
            </div>
            <h2 className="font-display text-[34px] leading-[1.08] font-semibold tracking-tight text-[#203027] mb-3">
              Code sent
            </h2>
            <p className="text-sm leading-6 text-[#777F76] mb-6">
              A 6-digit reset code has been sent to <strong>{email}</strong>. {codeSent ? "" : ""}
            </p>
            <Button
              onClick={() => navigate({ to: "/auth/verify-otp", search: { email, returnTo } })}
              size="lg"
              className="w-full rounded-xl bg-[#294331] text-[13px] font-semibold text-white shadow-none transition-all hover:bg-[#38563F] sm:h-[50px]"
            >
              Enter reset code
            </Button>
            <p className="mt-4 text-center text-[10px] leading-5 text-[#777F76]">
              <Link
                to="/auth"
                search={{ returnTo }}
                className="text-xs font-semibold text-[#294431] underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
