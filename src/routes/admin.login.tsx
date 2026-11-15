import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LockKeyhole,
  Mail,
  Shield,
  UserRound,
  Eye,
  EyeOff,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/login")({
  validateSearch: z.object({
    returnTo: z.string().optional(),
    email: z.string().email().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Admin sign in - Peniel" },
      {
        name: "description",
        content: "Sign in to the Peniel administration console to manage the marketplace.",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const emailValue = email.trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await authApi.login({ email: emailValue, password });

      if (!result.ok) {
        if (result.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Please verify your email address first.");
          void navigate({
            to: "/verify-otp",
            search: { email: emailValue, mode: "login", returnTo: "/admin" },
          });
          setIsSubmitting(false);
          return;
        }
        if (result.code === "INVALID_CREDENTIALS") {
          setErrors({ password: "Invalid email or password" });
        } else {
          toast.error(result.error ?? "Authentication failed. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      if (!result.data?.user) {
        toast.error("No user data returned.");
        setIsSubmitting(false);
        return;
      }

      const destination = returnTo ?? "/admin";
      void navigate({ to: destination, replace: true });
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handlePasswordChange = () => {
    if (errors.password) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 sm:p-10 animate-pulse">
            <div className="h-12 w-32 mx-auto rounded-lg bg-slate-800 mb-8" />
            <div className="h-6 w-48 mx-auto rounded bg-slate-800 mb-4" />
            <div className="h-4 w-64 mx-auto rounded bg-slate-800 mb-8" />
            <div className="space-y-5">
              <div className="h-11 rounded-xl bg-slate-800" />
              <div className="h-11 rounded-xl bg-slate-800" />
              <div className="h-11 rounded-xl bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-slate-900/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center mb-7"
            aria-label="Peniel - Home"
          >
            <Logo className="h-11 w-auto text-white" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-white">
            Administration
          </h1>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            Secure access to the Peniel platform console
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/95 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                <Shield className="size-4.5 text-slate-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Administrator Access</p>
                <p className="text-xs text-slate-500">Restricted to authorized personnel only</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-400 mb-2 tracking-wide uppercase"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-500 transition-colors"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={validateForm}
                  placeholder="admin@company.com"
                  className="pl-11 pr-4 h-12 bg-slate-900 border-slate-700 focus:border-primary focus:ring-0 focus:outline-none text-white placeholder-slate-600 transition-colors"
                  required
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 text-xs text-rose-500 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-400 mb-2 tracking-wide uppercase"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  search={{ email, returnTo: "/admin" }}
                  className="text-xs text-slate-500 hover:text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-500 transition-colors"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  onChange={handlePasswordChange}
                  onBlur={validateForm}
                  placeholder="Enter your password"
                  className="pl-11 pr-13 h-12 bg-slate-900 border-slate-700 focus:border-primary focus:ring-0 focus:outline-none text-white placeholder-slate-600 transition-colors"
                  required
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs text-rose-500 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 active:bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_rgba(201,162,39,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="size-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in to console"
              )}
            </Button>
          </form>

          <div className="px-6 py-5 border-t border-slate-800 bg-slate-950/50">
            <p className="text-center text-xs text-slate-500">
              Need customer or vendor access?{" "}
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="text-slate-400 hover:text-primary font-medium transition-colors underline underline-offset-2"
              >
                Sign in as customer or vendor
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600 tracking-wide uppercase">
          Peniel Administration Console &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
