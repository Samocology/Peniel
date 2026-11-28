import { Skeleton } from "@/components/ui/skeleton";

export function StoreHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden" style={{ background: theme.bg }}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/65 to-black/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
      <div className="mx-auto flex min-h-screen max-w-[1440px] items-center px-5 pb-20 pt-20 sm:px-10 lg:px-16">
        <div className="max-w-3xl text-white animate-pulse">
          <Skeleton className="h-6 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
          <Skeleton className="mt-6 h-12 w-3/4" style={{ background: "rgba(255,255,255,0.15)" }} />
          <Skeleton className="mt-4 h-6 w-1/2" style={{ background: "rgba(255,255,255,0.1)" }} />
          <Skeleton className="mt-5 h-5 w-5/6" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="mt-9 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <Skeleton className="h-12 w-32 rounded-full border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.3)" }} />
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
            <Skeleton className="h-5 w-28" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-32" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-36" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-40" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BuilderHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-16 pt-24 sm:px-8 sm:pb-22 sm:pt-28 lg:pb-28" style={{ background: theme.soft }}>
      <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div className="max-w-3xl animate-pulse">
          <Skeleton className="h-6 w-36 rounded-full border" style={{ borderColor: theme.line }} />
          <Skeleton className="mt-6 h-14 w-3/4" style={{ background: theme.ink }} />
          <Skeleton className="mt-4 h-8 w-1/2" style={{ background: theme.accent }} />
          <Skeleton className="mt-3 h-6 w-5/6" style={{ background: theme.ink }} />
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-10 w-36 rounded-full border" style={{ borderColor: theme.line }} />
            <Skeleton className="h-10 w-28 rounded-full border" style={{ borderColor: theme.line }} />
            <Skeleton className="h-10 w-32 rounded-full border" style={{ borderColor: theme.accent }} />
          </div>
          <Skeleton className="mt-8 h-12 w-44 rounded-full" style={{ background: theme.accent }} />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-80 w-full rounded-2xl border" style={{ borderColor: theme.line }} />
        </div>
      </div>
    </section>
  );
}

export function EditorialHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden" style={{ background: theme.bg }}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/65 to-black/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
      <div className="mx-auto flex min-h-screen max-w-[1440px] items-center px-5 pb-20 pt-20 sm:px-10 lg:px-16">
        <div className="max-w-3xl text-white animate-pulse">
          <Skeleton className="h-6 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
          <Skeleton className="mt-6 h-12 w-3/4" style={{ background: "rgba(255,255,255,0.15)" }} />
          <Skeleton className="mt-4 h-6 w-1/2" style={{ background: "rgba(255,255,255,0.1)" }} />
          <Skeleton className="mt-5 h-5 w-5/6" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="mt-9 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <Skeleton className="h-12 w-32 rounded-full border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.3)" }} />
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
            <Skeleton className="h-5 w-28" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-32" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-36" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-40" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function GalleryHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="relative isolate overflow-hidden" style={{ background: theme.soft }}>
      <div className="aspect-[16/9] max-h-[600px]">
        <Skeleton className="h-full w-full" style={{ background: theme.bg }} />
      </div>
      <div className="mx-auto flex min-h-[300px] max-w-7xl items-end px-5 pb-16 pt-16 sm:px-10 lg:px-16">
        <div className="max-w-3xl animate-pulse">
          <Skeleton className="h-6 w-36 rounded-full" style={{ background: theme.accent }} />
          <Skeleton className="mt-6 h-14 w-3/4" style={{ background: theme.ink }} />
          <Skeleton className="mt-4 h-8 w-1/2" style={{ background: theme.accent }} />
          <Skeleton className="mt-3 h-6 w-5/6" style={{ background: theme.ink }} />
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-10 w-36 rounded-full border" style={{ borderColor: theme.line }} />
            <Skeleton className="h-10 w-28 rounded-full border" style={{ borderColor: theme.line }} />
            <Skeleton className="h-10 w-32 rounded-full border" style={{ borderColor: theme.accent }} />
          </div>
          <Skeleton className="mt-8 h-12 w-44 rounded-full" style={{ background: theme.accent }} />
        </div>
      </div>
    </section>
  );
}

export function PlayfulHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-22 text-center sm:px-6 sm:pb-24 sm:pt-28" style={{ background: theme.soft }}>
      <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl animate-pulse" style={{ background: theme.accent }} />
      <Skeleton className="h-5 w-32 mx-auto" style={{ background: theme.accent }} />
      <Skeleton className="mt-5 h-14 w-3/4 mx-auto" style={{ background: theme.ink }} />
      <Skeleton className="mt-4 h-6 w-1/2 mx-auto" style={{ background: theme.accent }} />
      <div className="mt-7 flex justify-center">
        <Skeleton className="h-10 w-40 rounded-full border" style={{ borderColor: theme.line }} />
      </div>
      <Skeleton className="mt-8 h-12 w-44 rounded-full mx-auto" style={{ background: theme.accent }} />
    </section>
  );
}

export function GridHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="store-hero store-hero-poster relative overflow-hidden pt-12" style={{ background: theme.bg }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid items-stretch gap-0 overflow-hidden rounded-[1.5rem]" style={{ background: theme.soft }}>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14 animate-pulse">
            <Skeleton className="h-6 w-36 rounded-full" style={{ background: theme.accent }} />
            <Skeleton className="mt-4 h-14 w-3/4" style={{ background: theme.ink }} />
            <Skeleton className="mt-3 h-8 w-1/2" style={{ background: theme.accent }} />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-36 rounded-full border" style={{ borderColor: theme.line }} />
              <Skeleton className="h-10 w-32 rounded-full border" style={{ borderColor: theme.accent }} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-12 w-44 rounded-xl" style={{ background: theme.accent }} />
              <Skeleton className="h-12 w-36 rounded-xl border" style={{ borderColor: theme.line }} />
            </div>
          </div>
          <div className="aspect-[4/3]">
            <Skeleton className="h-full w-full" style={{ background: theme.bg }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReservationHeroSkeleton({ theme }: { theme: Vendor["theme"] }) {
  return (
    <section className="relative isolate min-h-[570px] overflow-hidden bg-[#101814] sm:min-h-[620px] lg:min-h-[660px]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101814]/95 via-[#101814]/65 to-[#101814]/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101814]/75 via-transparent to-[#101814]/15" />
      <div className="mx-auto flex min-h-[570px] max-w-[1440px] items-center px-5 pb-20 pt-20 sm:min-h-[620px] sm:px-10 lg:min-h-[660px] lg:px-16">
        <div className="max-w-3xl text-white animate-pulse">
          <Skeleton className="h-6 w-40 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
          <Skeleton className="mt-4 h-12 w-3/4" style={{ background: "rgba(255,255,255,0.15)" }} />
          <Skeleton className="mt-6 h-14 w-3/4" style={{ background: "rgba(255,255,255,0.1)" }} />
          <Skeleton className="mt-6 h-5 w-5/6" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-48 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <Skeleton className="h-12 w-40 rounded-full border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.3)" }} />
          </div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
            <Skeleton className="h-5 w-32" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-28" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-36" style={{ background: "rgba(255,255,255,0.1)" }} />
            <Skeleton className="h-5 w-24" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CatalogueSkeleton({ theme, columns = 3 }: { theme: Vendor["theme"]; columns?: number }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24" style={{ background: theme.soft }}>
      <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-pulse">
        <div>
          <Skeleton className="h-5 w-40" style={{ background: theme.accent }} />
          <Skeleton className="mt-4 h-10 w-1/2" style={{ background: theme.ink }} />
          <Skeleton className="mt-3 h-6 w-3/4" style={{ background: theme.ink }} />
        </div>
        <Skeleton className="h-10 w-32 rounded-full border" style={{ borderColor: theme.line }} />
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border overflow-hidden transition" style={{ borderColor: theme.line, borderRadius: theme.radius, background: theme.bg }}>
            <Skeleton className="aspect-square w-full" style={{ background: theme.soft }} />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" style={{ background: theme.ink }} />
              <Skeleton className="h-4 w-1/2" style={{ background: theme.ink }} />
              <Skeleton className="h-6 w-24" style={{ background: theme.accent }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComposedHeroSkeleton({ theme, variant }: { theme: Vendor["theme"]; variant: string }) {
  const variants: Record<string, React.ReactElement> = {
    centered: (
      <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28" style={{ background: theme.soft }}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 animate-pulse">
          <Skeleton className="h-6 w-36 mx-auto rounded-full" style={{ background: theme.accent }} />
          <Skeleton className="mt-5 h-12 w-3/4 mx-auto" style={{ background: theme.ink }} />
          <Skeleton className="mt-4 h-6 w-1/2 mx-auto" style={{ background: theme.accent }} />
          <div className="mt-8 flex justify-center gap-3">
            <Skeleton className="h-12 w-40 rounded-full" style={{ background: theme.accent }} />
            <Skeleton className="h-12 w-36 rounded-full border" style={{ borderColor: theme.line }} />
          </div>
        </div>
      </section>
    ),
    banner: (
      <section className="relative isolate overflow-hidden" style={{ background: theme.bg }}>
        <div className="aspect-[16/5] max-h-[400px]">
          <Skeleton className="h-full w-full" style={{ background: theme.soft }} />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-12 sm:px-10 lg:px-16">
          <div className="max-w-3xl text-white animate-pulse">
            <Skeleton className="h-6 w-36 rounded-full" style={{ background: theme.accent }} />
            <Skeleton className="mt-5 h-10 w-3/4" style={{ background: "white" }} />
            <Skeleton className="mt-4 h-6 w-1/2" style={{ background: "rgba(255,255,255,0.7)" }} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Skeleton className="h-12 w-40 rounded-full" style={{ background: theme.accent }} />
              <Skeleton className="h-12 w-36 rounded-full border" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        </div>
      </section>
    ),
    poster: (
      <section className="relative isolate overflow-hidden pt-12" style={{ background: theme.bg }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="grid items-stretch gap-0 overflow-hidden rounded-[1.5rem]" style={{ background: theme.soft }}>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14 animate-pulse">
              <Skeleton className="h-6 w-36 rounded-full" style={{ background: theme.accent }} />
              <Skeleton className="mt-4 h-14 w-3/4" style={{ background: theme.ink }} />
              <Skeleton className="mt-3 h-8 w-1/2" style={{ background: theme.accent }} />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Skeleton className="h-10 w-36 rounded-full border" style={{ borderColor: theme.line }} />
                <Skeleton className="h-10 w-32 rounded-full border" style={{ borderColor: theme.accent }} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Skeleton className="h-12 w-44 rounded-xl" style={{ background: theme.accent }} />
                <Skeleton className="h-12 w-36 rounded-xl border" style={{ borderColor: theme.line }} />
              </div>
            </div>
            <div className="aspect-[4/3]">
              <Skeleton className="h-full w-full" style={{ background: theme.bg }} />
            </div>
          </div>
        </div>
      </section>
    ),
    minimal: (
      <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28" style={{ background: theme.bg }}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 animate-pulse">
          <Skeleton className="h-6 w-36 mx-auto rounded-full" style={{ background: theme.accent }} />
          <Skeleton className="mt-5 h-12 w-3/4 mx-auto" style={{ background: theme.ink }} />
          <Skeleton className="mt-4 h-6 w-1/2 mx-auto" style={{ background: theme.accent }} />
          <div className="mt-8 flex justify-center gap-3">
            <Skeleton className="h-12 w-40 rounded-full" style={{ background: theme.accent }} />
            <Skeleton className="h-12 w-36 rounded-full border" style={{ borderColor: theme.line }} />
          </div>
        </div>
      </section>
    ),
    magazine: (
      <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28" style={{ background: theme.bg }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 animate-pulse">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <Skeleton className="h-6 w-36" style={{ background: theme.accent }} />
              <Skeleton className="mt-5 h-14 w-3/4" style={{ background: theme.ink }} />
              <Skeleton className="mt-4 h-6 w-1/2" style={{ background: theme.accent }} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Skeleton className="h-12 w-40 rounded-full" style={{ background: theme.accent }} />
                <Skeleton className="h-12 w-36 rounded-full border" style={{ borderColor: theme.line }} />
              </div>
            </div>
            <div className="aspect-[4/5]">
              <Skeleton className="h-full w-full rounded-[1.5rem]" style={{ background: theme.soft }} />
            </div>
          </div>
        </div>
      </section>
    ),
    marquee: (
      <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28" style={{ background: theme.soft }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 animate-pulse">
          <div className="mb-8 h-6 w-48" style={{ background: theme.accent }} />
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-24 rounded-xl" style={{ background: theme.bg }} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <Skeleton className="h-12 w-3/4" style={{ background: theme.ink }} />
              <Skeleton className="mt-4 h-6 w-1/2" style={{ background: theme.accent }} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Skeleton className="h-12 w-40 rounded-full" style={{ background: theme.accent }} />
                <Skeleton className="h-12 w-36 rounded-full border" style={{ borderColor: theme.line }} />
              </div>
            </div>
            <div className="aspect-square">
              <Skeleton className="h-full w-full rounded-[1.5rem]" style={{ background: theme.bg }} />
            </div>
          </div>
        </div>
      </section>
    ),
    split: (
      <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28" style={{ background: theme.bg }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 animate-pulse">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Skeleton className="h-6 w-36" style={{ background: theme.accent }} />
              <Skeleton className="mt-5 h-14 w-3/4" style={{ background: theme.ink }} />
              <Skeleton className="mt-4 h-6 w-1/2" style={{ background: theme.accent }} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Skeleton className="h-12 w-40 rounded-full" style={{ background: theme.accent }} />
                <Skeleton className="h-12 w-36 rounded-full border" style={{ borderColor: theme.line }} />
              </div>
            </div>
            <div className="aspect-square">
              <Skeleton className="h-full w-full rounded-[1.5rem]" style={{ background: theme.soft }} />
            </div>
          </div>
        </div>
      </section>
    ),
  };

  return variants[variant] || variants["centered"];
}

import type { Vendor } from "@/lib/data";