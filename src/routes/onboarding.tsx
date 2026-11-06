
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingBag,
  Store,
  ShieldCheck,
  Sparkles,
  Loader2,
  MoveUpRight,
  Package,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const slides = [
  {
    icon: ShoppingBag,
    eyebrow: "DISCOVER SOMETHING NEW",
    title: "Everything you love, all in one place.",
    text: "Explore independent businesses, discover amazing products, and find trusted services that make everyday shopping better.",
    tag: "Discover local businesses",
    number: "01",
  },
  {
    icon: Store,
    eyebrow: "YOUR BUSINESS, YOUR WAY",
    title: "Your business deserves its own space.",
    text: "Launch a beautiful online storefront, showcase your products, manage orders, and grow your business with ease.",
    tag: "Build your storefront",
    number: "02",
  },
  {
    icon: ShieldCheck,
    eyebrow: "SHOP WITH CONFIDENCE",
    title: "A better experience. Every transaction.",
    text: "Enjoy a seamless shopping experience with secure payments and a platform designed to make buying and selling easier.",
    tag: "Secure shopping experience",
    number: "03",
  },
];

function Onboarding() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const current = slides[index];
  if (!current) {
    throw new Error(`Onboarding slide ${index + 1} is unavailable.`);
  }

  const Icon = current.icon;
  const isLast = index === slides.length - 1;

  const finish = () => {
    setLoading(true);

    localStorage.setItem("peniel.onboarded", "1");

    navigate({
      to: "/auth",
      search: { mode: "signup" },
    });
  };

  const skip = () => {
    localStorage.setItem("peniel.onboarded", "1");
    navigate({
      to: "/auth",
      search: { mode: "signup" },
    });
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      setIndex((previous) => previous + 1);
    }
  };

  const previous = () => {
    setIndex((previous) => Math.max(0, previous - 1));
  };

  if (loading) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center gap-4 bg-[#F8F9F6]">
        <div className="h-14 w-14 rounded-2xl bg-[#214B36] flex items-center justify-center shadow-lg">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
        <p className="text-sm font-medium text-[#647067]">
          Preparing your experience...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[#F8F9F6] text-[#18251D] overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5 lg:py-7">
        <Logo />

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-[#89928B]">
            Already have an account?
          </span>

          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="text-sm font-semibold text-[#214B36] hover:text-[#376B4E] transition-colors"
          >
            Sign in <MoveUpRight className="inline h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="min-h-[calc(100svh-88px)] flex items-center justify-center px-5 sm:px-8 lg:px-12 pb-8 lg:pb-12">
        <div className="w-full max-w-[1240px] grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 xl:gap-24 items-center">

          {/* Visual showcase */}
          <div className="hidden lg:flex flex-col">
            <div className="relative min-h-[560px] xl:min-h-[620px] rounded-[28px] overflow-hidden bg-[#214B36] p-10 xl:p-12 flex flex-col justify-between">

              {/* Decorative elements */}
              <div className="absolute -top-28 -right-20 h-80 w-80 rounded-full border border-white/[0.09]" />
              <div className="absolute -top-12 -right-4 h-52 w-52 rounded-full border border-white/[0.09]" />
              <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-[#FFFFFF]/[0.035]" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80 text-xs font-medium tracking-wide">
                  <Sparkles className="h-4 w-4 text-[#C5B58A]" />
                  A BETTER WAY TO SHOP & SELL
                </div>
                <span className="text-white/40 text-xs">PENIEL</span>
              </div>

              <div className="relative z-10 py-10">
                <div className="relative mx-auto max-w-[380px]">
                  {/* Main visual card */}
                  <div className="rounded-[24px] bg-[#F7F7F1] p-5 shadow-2xl shadow-black/20 rotate-[-3deg]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] tracking-widest text-[#89928B] font-semibold">
                          YOUR MARKETPLACE
                        </p>
                        <p className="text-lg font-bold text-[#214B36] mt-1">
                          Explore Peniel.
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#E8EEE7] flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-[#214B36]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#E9EDE4] p-3">
                        <div className="h-24 rounded-xl bg-[#D4DDD0] flex items-center justify-center">
                          <ShoppingBag className="h-9 w-9 text-[#55775E]" />
                        </div>
                        <p className="mt-3 text-xs font-bold text-[#27392D]">
                          Lifestyle
                        </p>
                        <p className="text-[10px] text-[#89928B] mt-1">
                          Discover more
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#F0E9DC] p-3">
                        <div className="h-24 rounded-xl bg-[#E5D9C7] flex items-center justify-center">
                          <Heart className="h-9 w-9 text-[#927B5B]" />
                        </div>
                        <p className="mt-3 text-xs font-bold text-[#27392D]">
                          Beauty & care
                        </p>
                        <p className="text-[10px] text-[#89928B] mt-1">
                          Find your style
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3">
                      <div className="h-10 w-10 rounded-xl bg-[#E8EEE7] flex items-center justify-center">
                        <Store className="h-5 w-5 text-[#214B36]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#27392D]">
                          Your own storefront
                        </p>
                        <p className="text-[10px] text-[#89928B]">
                          Everything your business needs.
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#214B36]" />
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -right-8 top-12 rounded-2xl bg-white p-3 shadow-xl flex items-center gap-2 rotate-[5deg]">
                    <div className="h-9 w-9 rounded-xl bg-[#E8EEE7] flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-[#214B36]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#24392B]">
                        Shop confidently
                      </p>
                      <p className="text-[9px] text-[#89928B]">
                        Secure experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-white text-2xl xl:text-[28px] leading-snug font-semibold tracking-tight max-w-md">
                  Discover. Connect. Grow.
                  <span className="text-[#C5B58A]"> All with Peniel.</span>
                </p>
                <p className="text-sm text-white/55 mt-3 max-w-sm leading-relaxed">
                  One marketplace bringing customers and businesses closer together.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[#9AA39B] mt-5 text-center">
              Your marketplace. Your possibilities.
            </p>
          </div>

          {/* Onboarding content */}
          <div className="w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto flex flex-col">

            {/* Mobile visual */}
            <div className="lg:hidden mb-9">
              <div className="relative overflow-hidden rounded-[24px] bg-[#214B36] min-h-[190px] sm:min-h-[220px] flex items-center justify-between p-6 sm:p-8">
                <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border border-white/10" />
                <div className="absolute -right-2 -bottom-24 h-48 w-48 rounded-full border border-white/10" />

                <div className="relative z-10 max-w-[65%]">
                  <div className="flex items-center gap-2 text-[#C5B58A] text-[10px] font-semibold tracking-widest mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    WELCOME TO PENIEL
                  </div>
                  <h2 className="text-white text-xl sm:text-2xl font-semibold leading-snug">
                    A marketplace built around you.
                  </h2>
                  <p className="text-white/55 text-xs sm:text-sm mt-3 leading-relaxed">
                    Discover businesses. Shop better. Grow together.
                  </p>
                </div>

                <div className="relative z-10 h-[76px] w-[76px] sm:h-24 sm:w-24 shrink-0 rounded-[24px] bg-white/10 border border-white/10 flex items-center justify-center">
                  <ShoppingBag className="h-9 w-9 sm:h-11 sm:w-11 text-[#D8DCCF]" />
                </div>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8 lg:mb-12">
              <div className="flex items-center gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.number}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-9 bg-[#214B36]"
                        : "w-5 bg-[#DCE2DA] hover:bg-[#AAB8AA]"
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs font-medium text-[#929B93] tabular-nums">
                {current.number} / 03
              </span>
            </div>

            {/* Slide content */}
            <div key={index} className="animate-in fade-in slide-in-from-right-3 duration-500">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.17em] text-[#78917D] mb-5">
                {current.eyebrow}
              </p>

              <div className="hidden lg:flex h-14 w-14 rounded-2xl bg-[#E9EFE8] items-center justify-center mb-7">
                <Icon className="h-7 w-7 text-[#214B36]" strokeWidth={1.7} />
              </div>

              <h1 className="text-[30px] sm:text-[36px] lg:text-[42px] xl:text-[46px] leading-[1.15] tracking-[-0.045em] font-semibold text-[#1C2B21]">
                {current.title}
              </h1>

              <p className="text-sm sm:text-[15px] leading-[1.85] text-[#78847A] mt-5 max-w-[420px]">
                {current.text}
              </p>

              <div className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#EDF2EC] px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#547A5C]" />
                <span className="text-xs font-medium text-[#49654F]">
                  {current.tag}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-12 lg:mt-14">
              <div className="flex gap-3">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={previous}
                    className="h-12 sm:h-13 w-12 sm:w-14 shrink-0 rounded-xl border-[#DFE5DC] bg-white text-[#354B3A] hover:bg-[#EFF3ED]"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={next}
                  className="h-12 sm:h-13 flex-1 rounded-xl bg-[#214B36] hover:bg-[#183B29] text-white font-semibold text-sm shadow-lg shadow-[#214B36]/10 transition-all"
                >
                  {isLast ? "Get started" : "Continue"}
                  {isLast ? (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>

              <button
                type="button"
                onClick={skip}
                className="w-full mt-5 py-2 text-xs font-medium text-[#929B93] hover:text-[#214B36] transition-colors"
              >
                Skip introduction
              </button>
            </div>

            <p className="text-[10px] text-center text-[#A0A9A0] mt-8 lg:mt-10">
              By continuing, you're joining a marketplace designed to bring people and businesses together.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
