import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LockKeyhole,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  Sparkles,
  Users,
  TrendingUp,
  Globe2,
  KeyRound,
} from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";
import { app } from "@/lib/peniel-store";

export const Route = createFileRoute("/admin/login")({
  validateSearch: z.object({
    returnTo: z.string().optional(),
    email: z.string().email().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Admin Sign In | Peniel" },
      {
        name: "description",
        content: "Securely access the Peniel administration console.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { returnTo, email: searchEmail } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/login" });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(searchEmail ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    return "";
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) nextErrors["email"] = emailError;
    if (passwordError) nextErrors["password"] = passwordError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getSafeDestination = () => {
    if (
      returnTo &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.includes("\\")
    ) {
      return returnTo;
    }
    return "/admin";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    const emailValue = email.trim().toLowerCase();

    try {
      const result = await authApi.login({ email: emailValue, password });

      if (!result.ok) {
        const errorResult = result as {
          ok: false;
          error: string;
          code?: string;
        };
        if (errorResult.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Please verify your email address first.");
          await navigate({
            to: "/verify-otp",
            search: { email: emailValue, returnTo: "/admin" },
          });
          return;
        }

        if (errorResult.code === "INVALID_CREDENTIALS") {
          setErrors({
            password: "The email or password you entered is incorrect.",
          });
          return;
        }

        toast.error(result.error ?? "Unable to sign in. Please try again.");
        return;
      }

      if (!result.data?.user) {
        toast.error("We couldn't verify your account. Please try again.");
        return;
      }

      toast.success("Welcome back.");
      const userRole = result.data.user.role ?? "customer";
      if (userRole !== "admin" && userRole !== "super_admin") {
        toast.error("You do not have administrator access to this console.");
        return;
      }
      app.signIn(
        result.data.user.name,
        result.data.user.email,
        userRole,
      );
      await navigate({ to: getSafeDestination(), replace: true });
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors["email"]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next["email"];
        return next;
      });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors["password"]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next["password"];
        return next;
      });
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#080B12] flex items-center justify-center p-5">
        <div className="w-full max-w-[440px] animate-pulse">
          <div className="h-10 w-32 rounded-lg bg-white/10 mx-auto mb-12" />
          <div className="rounded-2xl border border-white/10 bg-[#0F1623] p-8 space-y-6">
            <div className="h-8 w-48 rounded bg-white/10 mx-auto" />
            <div className="h-4 w-64 rounded bg-white/10 mx-auto" />
            <div className="h-12 rounded-xl bg-white/10 mt-8" />
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080B12] selection:bg-[#C9A227]/30">
      {/* Global ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(201,162,39,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(37,99,235,0.08),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ============ LEFT: Brand Story Panel ============ */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-white/[0.06] p-10 xl:p-14">
          {/* Local glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute -left-32 top-1/4 size-[520px] rounded-full bg-[#C9A227]/[0.07] blur-3xl" />
            <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-blue-600/[0.06] blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(8,11,18,0.9)_100%)]" />
          </div>

          {/* Top: Logo */}
          <div className="relative z-10">
            <Link
              to="/"
              aria-label="Peniel home"
              className="inline-flex items-center"
            >
              <Logo />
            </Link>
          </div>

          {/* Middle: Value proposition */}
          <div className="relative z-10 max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/[0.07] px-3.5 py-1.5">
              <Sparkles className="size-3.5 text-[#D8B64C]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8B64C]">
                Admin Console
              </span>
            </div>

            <h1 className="text-4xl xl:text-[44px] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
              Command center for
              <span className="block bg-gradient-to-r from-[#D8B64C] via-[#E2C45B] to-[#C9A227] bg-clip-text text-transparent">
                the Peniel marketplace.
              </span>
            </h1>

            <p className="mt-5 text-[15px] leading-7 text-slate-400">
              Oversee vendors, monitor orders, and keep the marketplace running
              — all from one secure, unified control plane built for
              administrators.
            </p>

            {/* Feature list */}
            <ul className="mt-9 space-y-4">
              {[
                {
                  icon: Users,
                  title: "Vendor & user oversight",
                  desc: "Approve, audit, and manage accounts in real time.",
                },
                {
                  icon: TrendingUp,
                  title: "Live marketplace metrics",
                  desc: "Track orders, revenue, and activity at a glance.",
                },
                {
                  icon: Globe2,
                  title: "Full operational control",
                  desc: "Configure categories, payouts, and platform rules.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <Icon className="size-[17px] text-[#D8B64C]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom: trust footer */}
          <div className="relative z-10 flex items-center gap-6 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-emerald-500/70" />
              SOC 2 aligned
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="size-3.5 text-emerald-500/70" />
              Encrypted sessions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500/70" />
              99.9% uptime
            </div>
          </div>
        </aside>

        {/* ============ RIGHT: Login Form Panel ============ */}
        <section className="relative flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            {/* Mobile brand (hidden on desktop) */}
            <div className="mb-9 flex flex-col items-center text-center lg:hidden">
              <Link to="/" aria-label="Peniel home" className="mb-7">
                <Logo />
              </Link>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/[0.07] px-3.5 py-1.5">
                <ShieldCheck className="size-3.5 text-[#D8B64C]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8B64C]">
                  Secure administration
                </span>
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-white">
                Welcome back
              </h1>
              <p className="mt-2 max-w-[300px] text-sm leading-6 text-slate-400">
                Sign in to manage and oversee your Peniel marketplace.
              </p>
            </div>

            {/* Desktop heading */}
            <div className="mb-8 hidden lg:block">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/[0.07] px-3.5 py-1.5">
                <ShieldCheck className="size-3.5 text-[#D8B64C]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8B64C]">
                  Authorized access only
                </span>
              </div>
              <h1 className="text-[32px] font-semibold tracking-[-0.045em] text-white">
                Sign in to console
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter your administrator credentials to continue.
              </p>
            </div>

            {/* Card */}
            <div className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#0F1623]/90 shadow-[0_32px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl">
              {/* Card header strip */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-[#C9A227]/20 bg-[#C9A227]/[0.08]">
                    <Fingerprint className="size-[18px] text-[#D8B64C]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      Administrator sign in
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-slate-500">
                      Authorized personnel only
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Protected
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 px-6 py-7"
                noValidate
              >
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-[10.5px] font-semibold uppercase tracking-[0.13em] text-slate-400"
                  >
                    Email address
                  </label>
                  <div className="group relative">
                    <Mail
                      className={`absolute left-4 top-1/2 size-[18px] -translate-y-1/2 transition-colors ${
                        errors["email"]
                          ? "text-rose-400"
                          : "text-slate-500 group-focus-within:text-[#D8B64C]"
                      }`}
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={email}
                      onChange={(event) =>
                        handleEmailChange(event.target.value)
                      }
                      onBlur={() => {
                        const error = validateEmail(email);
                        setErrors((previous) => ({
                          ...previous,
                          ...(error ? { email: error } : {}),
                        }));
                      }}
                      placeholder="admin@company.com"
                      className={`h-[50px] rounded-xl border bg-[#0A0F19] pl-11 pr-4 text-sm text-white placeholder:text-slate-600 transition-all focus-visible:ring-2 focus-visible:ring-[#C9A227]/20 focus-visible:ring-offset-0 ${
                        errors["email"]
                          ? "border-rose-500/50 focus-visible:border-rose-400"
                          : "border-white/[0.09] focus-visible:border-[#C9A227]/60"
                      }`}
                      required
                      disabled={isSubmitting}
                      aria-invalid={!!errors["email"]}
                      aria-describedby={
                        errors["email"] ? "email-error" : undefined
                      }
                    />
                  </div>
                  {errors["email"] && (
                    <p
                      id="email-error"
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-rose-400"
                    >
                      <AlertCircle className="size-3.5 shrink-0" />
                      {errors["email"]}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-slate-400"
                    >
                      Password
                    </label>
                  </div>
                  <div className="group relative">
                    <LockKeyhole
                      className={`absolute left-4 top-1/2 size-[18px] -translate-y-1/2 transition-colors ${
                        errors["password"]
                          ? "text-rose-400"
                          : "text-slate-500 group-focus-within:text-[#D8B64C]"
                      }`}
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        handlePasswordChange(event.target.value)
                      }
                      onBlur={() => {
                        const error = validatePassword(password);
                        setErrors((previous) => ({
                          ...previous,
                          ...(error ? { password: error } : {}),
                        }));
                      }}
                      placeholder="Enter your password"
                      className={`h-[50px] rounded-xl border bg-[#0A0F19] pl-11 pr-12 text-sm text-white placeholder:text-slate-600 transition-all focus-visible:ring-2 focus-visible:ring-[#C9A227]/20 focus-visible:ring-offset-0 ${
                        errors["password"]
                          ? "border-rose-500/50 focus-visible:border-rose-400"
                          : "border-white/[0.09] focus-visible:border-[#C9A227]/60"
                      }`}
                      required
                      disabled={isSubmitting}
                      aria-invalid={!!errors["password"]}
                      aria-describedby={
                        errors["password"] ? "password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/50"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="size-[17px]" />
                      ) : (
                        <Eye className="size-[17px]" />
                      )}
                    </button>
                  </div>
                  {errors["password"] && (
                    <p
                      id="password-error"
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-rose-400"
                    >
                      <AlertCircle className="size-3.5 shrink-0" />
                      {errors["password"]}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex h-[50px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#E2C45B]/30 bg-gradient-to-r from-[#B38B20] via-[#C9A227] to-[#D8B64C] text-sm font-semibold text-[#17140A] shadow-[0_8px_24px_-10px_rgba(201,162,39,0.55)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_12px_30px_-10px_rgba(201,162,39,0.65)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-[#17140A]/30 border-t-[#17140A]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to console</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <CheckCircle2 className="size-3.5 text-slate-500" />
                  <p className="text-[10.5px] text-slate-500">
                    Your session is protected with secure authentication.
                  </p>
                </div>
              </form>

              {/* Alternative access */}
              <div className="border-t border-white/[0.07] bg-[#0A0F19]/60 px-6 py-4 text-center">
                <p className="text-[11.5px] text-slate-500">
                  Not an administrator?{" "}
                  <Link
                    to="/auth"
                    search={{ mode: "login" }}
                    className="font-semibold text-slate-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#D8B64C] hover:decoration-[#D8B64C]/50"
                  >
                    Customer or vendor sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-7 flex flex-col items-center gap-2.5 text-center">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600">
                <ShieldCheck className="size-3.5" />
                Peniel Administration Console
              </div>
              <p className="text-[11px] text-slate-700">
                © {new Date().getFullYear()} Peniel. All rights reserved.
              </p>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}