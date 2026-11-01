
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  ShieldCheck,
  Globe2,
  Check,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { app, useApp } from "@/lib/peniel-store";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    mode: z.enum(["login", "signup"]).catch("login"),
    role: z.enum(["customer", "vendor"]).optional(),
    returnTo: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account - Vendra" },
      {
        name: "description",
        content:
          "Sign in to Vendra or create an account to shop and grow your business.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, role: requestedRole, returnTo } = Route.useSearch();
  const state = useApp();
  const navigate = useNavigate({ from: "/auth" });

  const [role, setRole] = useState(
    requestedRole ?? state.user?.role ?? "customer"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const isSignup = mode === "signup";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");

    if (isSignup && password !== formData.get("confirmPassword")) {
      setPasswordError("Passwords do not match. Please try again.");
      return;
    }

    const accountName = isSignup
      ? String(formData.get("name") ?? "").trim()
      : state.user?.email === email
        ? state.user.name
        : (email.split("@")[0] ?? "Vendra user")
            .split(/[._-]/)
            .filter(Boolean)
            .map(
              (part) =>
                part[0]!.toUpperCase() + part.slice(1)
            )
            .join(" ");

    app.signIn(accountName, email, role);

    const destination =
      returnTo === "/vendor/verification"
        ? "/vendor/verification"
        : returnTo === "/vendor/onboarding"
          ? "/vendor/onboarding"
          : role === "vendor"
            ? "/vendor/onboarding"
            : "/marketplace";

    void navigate({ to: destination });
  };

  const authSearch = { role, returnTo };

  const features = [
    {
      icon: Store,
      title: "Your own storefront",
      description: "A beautiful space for your business.",
    },
    {
      icon: BadgeCheck,
      title: "Built on trust",
      description: "Connect with people who value quality.",
    },
    {
      icon: ShoppingBag,
      title: "Discover more",
      description: "Explore products and services.",
    },
    {
      icon: ShieldCheck,
      title: "Simpler commerce",
      description: "Shopping and business, connected.",
    },
  ];

  return (
    <main className="min-h-dvh bg-[#F7F8F5] lg:grid lg:grid-cols-[0.92fr_1.08fr]">

      {/* BRAND PANEL - DESKTOP */}

      <section className="relative hidden min-h-dvh overflow-hidden bg-[#17291F] text-white lg:flex lg:flex-col">

        {/* Decorative background */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-52 -top-52 size-[650px] rounded-full border border-white/[0.055]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 size-[450px] rounded-full border border-white/[0.07]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -right-48 size-[600px] rounded-full bg-[#A7B99E]/10 blur-[100px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/4 size-72 rounded-full bg-[#6E8D70]/10 blur-[100px]"
        />

        {/* Brand header */}

        <header className="relative z-10 flex items-center justify-between px-10 py-7 xl:px-14">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <Logo />
            <span className="font-display text-xl font-semibold tracking-tight">
              Vendra
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>

        </header>

        {/* Brand content */}

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-10 pb-10 xl:px-14">

          <div className="mb-6 flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-[#B6C9AD]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.23em] text-white/55">
              Commerce, connected
            </span>
          </div>

          <h1 className="max-w-xl font-display text-5xl leading-[1.13] font-semibold tracking-tight xl:text-[58px]">
            A better way to
            <span className="block text-[#B6C9AD]">
              shop and grow.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
            Everything comes together on Vendra. Discover great products,
            connect with businesses and create a storefront of your own.
          </p>

          {/* Features */}

          <div className="mt-10 grid grid-cols-2 gap-3">

            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.065]"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-[#B6C9AD]/10 text-[#B6C9AD]">
                  <Icon className="size-[17px]" />
                </div>

                <h3 className="text-[13px] font-semibold text-white">
                  {title}
                </h3>

                <p className="mt-1.5 text-[11px] leading-5 text-white/45">
                  {description}
                </p>
              </div>
            ))}

          </div>

          {/* Trust statement */}

          <div className="mt-9 flex items-center gap-3 border-t border-white/10 pt-6">

            <div className="flex size-9 items-center justify-center rounded-full bg-[#B6C9AD]/10 text-[#B6C9AD]">
              <Globe2 className="size-4" />
            </div>

            <div>
              <p className="text-xs font-medium text-white/85">
                Built for African commerce
              </p>
              <p className="mt-1 text-[10px] text-white/40">
                For businesses and the people who support them.
              </p>
            </div>

          </div>

        </div>

        <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.08] px-10 py-5 text-[10px] text-white/35 xl:px-14">
          <span>© {new Date().getFullYear()} Vendra</span>
          <span>Discover. Connect. Grow.</span>
        </footer>

      </section>

      {/* AUTH PANEL */}

      <section className="relative flex min-h-dvh flex-col px-5 py-4 sm:px-8 sm:py-6 lg:justify-center lg:px-12 lg:py-8 xl:px-20">

        {/* Mobile header */}

        <header className="flex items-center justify-between lg:absolute lg:top-0 lg:right-0 lg:left-0 lg:px-12 lg:py-7 xl:px-20">

          <Link
            to="/"
            className="flex items-center gap-2.5"
          >
            <Logo />
            <span className="font-display text-lg font-semibold tracking-tight text-[#20382A]">
              Vendra
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-[#858D84] transition-colors hover:text-[#263E30]"
          >
            Home
            <ArrowRight className="size-3.5" />
          </Link>

        </header>

        {/* Form container */}

        <div className="mx-auto my-auto w-full max-w-[410px] py-5 sm:py-7 lg:py-0">

          {/* Intro */}

          <div className="mb-7 sm:mb-8">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCE7D8] bg-gradient-to-r from-[#EDF3EA] to-white px-3.5 py-2 shadow-sm shadow-[#20382A]/[0.04]">
              <span className="grid size-5 place-items-center rounded-full bg-[#557358]/10">
                <Sparkles className="size-3 text-[#557358]" />
              </span>
              <span className="text-[9px] font-bold tracking-[0.15em] text-[#526F54]">
                {isSignup ? "YOUR VENDRA JOURNEY STARTS HERE" : "WELCOME BACK"}
              </span>
            </div>

            <h2 className="font-display text-[34px] leading-[1.08] font-semibold tracking-tight text-[#203027] sm:text-[42px]">
              {isSignup ? (
                <>
                  Your Vendra account
                  <span className="mt-1 block text-[#557358]">starts here.</span>
                </>
              ) : (
                "Good to see you."
              )}
            </h2>

            <p className="mt-3 max-w-[350px] text-sm leading-6 text-[#777F76]">
              {isSignup
                ? "Discover great local finds, connect with businesses, or grow your own storefront-all in one place."
                : "Sign in to continue your Vendra experience."}
            </p>

          </div>

          {/* Auth tabs */}

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-[#E7EAE4] bg-[#ECEFEA] p-1">

            <Link
              to="/auth"
              search={{ mode: "login", ...authSearch }}
              aria-current={!isSignup ? "page" : undefined}
              className={`rounded-lg py-2.5 text-center text-xs font-semibold transition-all ${
                !isSignup
                  ? "bg-white text-[#294431] shadow-sm"
                  : "text-[#858D83] hover:text-[#294431]"
              }`}
            >
              Sign in
            </Link>

            <Link
              to="/auth"
              search={{ mode: "signup", ...authSearch }}
              aria-current={isSignup ? "page" : undefined}
              className={`rounded-lg py-2.5 text-center text-xs font-semibold transition-all ${
                isSignup
                  ? "bg-white text-[#294431] shadow-sm"
                  : "text-[#858D83] hover:text-[#294431]"
              }`}
            >
              Create account
            </Link>

          </div>

          {/* Form */}

          <form onSubmit={submit} className="space-y-3.5 sm:space-y-4">

            {/* Name */}

            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9AA399]" />

                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Enter your full name"
                    className="h-11 rounded-xl border-[#E2E7DF] bg-white pl-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
                  />
                </div>
              </div>
            )}

            {/* Email */}

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
                  className="h-11 rounded-xl border-[#E2E7DF] bg-white pl-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9AA399]" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  placeholder="Enter your password"
                  className="h-11 rounded-xl border-[#E2E7DF] bg-white px-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#969F95] transition-colors hover:text-[#294431]"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {isSignup && (
                <p className="mt-1.5 text-[10px] text-[#929A91]">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {/* Confirm password */}

            {isSignup && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-[12px] font-semibold text-[#39443B]"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9AA399]" />

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Enter password again"
                    aria-invalid={Boolean(passwordError)}
                    className="h-11 rounded-xl border-[#E2E7DF] bg-white pl-10 text-[13px] shadow-none placeholder:text-[#A9AFA7] focus-visible:border-[#6B886B] focus-visible:ring-[#6B886B]/15 sm:h-12"
                  />
                </div>
              </div>
            )}

            {/* Account type */}

            <fieldset className="pt-0.5">

              <legend className="mb-2.5 text-[12px] font-semibold text-[#39443B]">
                Continue as
              </legend>

              <div className="grid grid-cols-2 gap-2.5">

                {[
                  {
                    value: "customer" as const,
                    label: "Customer",
                    detail: "Shop and discover",
                    icon: ShoppingBag,
                  },
                  {
                    value: "vendor" as const,
                    label: "Business owner",
                    detail: "Manage your store",
                    icon: Store,
                  },
                ].map(({ value, label, detail, icon: Icon }) => {
                  const selected = role === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRole(value)}
                      className={`relative flex min-h-[65px] items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all sm:min-h-[72px] sm:px-3 ${
                        selected
                          ? "border-[#789477] bg-[#EFF4ED] ring-1 ring-[#789477]/15"
                          : "border-[#E4E8E1] bg-white hover:border-[#B8C7B5]"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-[#DCE8D9] text-[#426747]"
                            : "bg-[#F2F4F0] text-[#8D978B]"
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>

                      <span className="min-w-0">
                        <span
                          className={`block text-[11px] font-semibold sm:text-xs ${
                            selected ? "text-[#34523A]" : "text-[#495149]"
                          }`}
                        >
                          {label}
                        </span>

                        <span className="mt-1 block text-[9px] text-[#939B91] sm:text-[10px]">
                          {detail}
                        </span>
                      </span>

                      {selected && (
                        <span className="absolute top-2 right-2 flex size-3 items-center justify-center rounded-full bg-[#567657] text-white">
                          <Check className="size-2" />
                        </span>
                      )}
                    </button>
                  );
                })}

              </div>

            </fieldset>

            {/* Error */}

            {passwordError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
              >
                {passwordError}
              </p>
            )}

            {/* Demo information */}

            <div className="flex items-center gap-2 rounded-lg bg-[#EFF2EC] px-3 py-2.5">
              <ShieldCheck className="size-3.5 shrink-0 text-[#668066]" />

              <p className="text-[10px] leading-4 text-[#778274]">
                Demo prototype. Profiles are saved in this browser only.
              </p>
            </div>

            {/* Submit button */}

            <Button
              type="submit"
              size="lg"
              className="group h-12 w-full rounded-xl bg-[#294331] text-[13px] font-semibold text-white shadow-none transition-all hover:bg-[#38563F] active:scale-[0.99] sm:h-[50px]"
            >
              {isSignup ? "Create your account" : "Sign in to Vendra"}

              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="relative py-1 text-center">
              <span className="relative z-10 bg-[#F7F8F5] px-3 text-[10px] font-medium text-[#929A91]">
                or continue with
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 border-t border-[#E5E9E2]"
              />
            </div>

            <button
              type="button"
              onClick={() => toast.info("Google sign-in isn't connected in this demo yet.")}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#DFE4DD] bg-white text-[13px] font-semibold text-[#39443B] transition-colors hover:border-[#B9C8B6] hover:bg-[#FBFCFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B886B]"
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[18px]">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.01 46.98 31.84 46.98 24.55Z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" transform="translate(1 0)" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -4)" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-[10px] text-[#929A91]">
              Demo only · Google sign-in isn’t connected
            </p>

          </form>

          {/* Footer */}

          <div className="mt-5 text-center">

            <p className="text-[10px] leading-5 text-[#9AA197]">
              By continuing, you agree to use Vendra respectfully and follow
              our platform guidelines.
            </p>

          </div>

        </div>

        {/* Mobile bottom branding */}

        <footer className="flex items-center justify-center gap-2 py-2 text-[9px] text-[#A1A99F] lg:hidden">
          <Globe2 className="size-3" />
          Commerce, connected.
        </footer>

      </section>

    </main>
  );
}